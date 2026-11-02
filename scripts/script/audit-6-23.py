"""T0 only: measure cached public data; never writes runtime assets or downloads anything.
Run: python3 scripts/script/audit-6-23.py [--self-test]
Inputs/URLs/hashes: docs/6-23-SOURCES.json; output: stdout JSON.
"""
import collections
import gzip
import hashlib
import json
import pathlib
import re
import sys
import tarfile
import xml.etree.ElementTree as ET
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / 'scripts/.cache/6-23'


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode()


def shards(data, size=256):
    keys = sorted(data)
    result = []
    for start in range(0, len(keys), size):
        part = {k: data[k] for k in keys[start:start + size]}
        zipped = gzip.compress(encoded(part), compresslevel=9, mtime=0)
        assert json.loads(gzip.decompress(zipped)) == part
        result.append(len(zipped))
    return {'characters': len(keys), 'rawJsonBytes': len(encoded(data)), 'shards': len(result), 'gzipBytes': sum(result), 'largestShardBytes': max(result, default=0)}


def records(name):
    with gzip.open(CACHE / (name + '.jsonl.gz'), 'rt') as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def objects(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from objects(child)


def root_letters(value):
    # Explicit spaced roots only; do not infer roots or count every Arabic word in prose.
    return re.findall(r'(?<![\u0621-\u064a])([\u0621-\u064a](?: [\u0621-\u064a]){2,3})(?![\u0621-\u064a])', value)


def self_test():
    assert shards({})['gzipBytes'] == 0
    assert shards({'一': {'p': ['M0 0L1 1']}, 'あ': {'p': []}}, 1)['shards'] == 2
    assert root_letters('From ك ت ب and د ح ر ج.') == ['ك ت ب', 'د ح ر ج']
    assert root_letters('كتاب') == []
    assert [o.get('name') for o in objects({'a': [{'name': 'ko-hanja'}]}) if 'name' in o] == ['ko-hanja']
    assert sum(int(end, 16) - int(start, 16) + 1 for start, end in [('4E00', '4E02')]) == 3


def audit():
    sources = json.loads((ROOT / 'docs/6-23-SOURCES.json').read_text())
    for source in sources:
        path = CACHE / source['name']
        assert path.stat().st_size == source['bytes'], source['name']
        with path.open('rb') as f:
            assert hashlib.file_digest(f, 'sha256').hexdigest() == source['sha256'], source['name']
    out = {'sourceBytes': sum(s['bytes'] for s in sources)}
    assert out['sourceBytes'] <= 1_000_000_000
    # Use the official compiled artifacts as data. No upstream executable is run.
    with zipfile.ZipFile(CACHE / 'opencc-portable.zip') as z, zipfile.ZipFile(CACHE / 'opencc-resources.zip') as text:
        configs = {mode: json.loads(z.read('share/opencc/' + mode + '.json')) for mode in ['s2t', 't2s', 's2tw', 's2twp', 's2hk', 'tw2s', 'hk2s']}
        closure = {mode: sorted({v['file'] for v in objects(config) if v.get('type') == 'ocd2'}) for mode, config in configs.items()}
        names = sorted({n for files in closure.values() for n in files})
        compiled = {n: {'bytes': len(z.read('share/opencc/' + n)), 'gzipBytes': len(gzip.compress(z.read('share/opencc/' + n), mtime=0))} for n in names}
        for n, sizes in compiled.items():
            source = text.read(n.replace('.ocd2', '.txt'))
            sizes['textBytes'] = len(source)
            sizes['entries'] = sum(bool(line) and not line.startswith('#') for line in source.decode().splitlines())
        out['opencc'] = {'configs': closure, 'dictionaries': compiled, 'compiledBytes': sum(v['bytes'] for v in compiled.values()), 'gzipBytes': sum(v['gzipBytes'] for v in compiled.values())}
    lines = (CACHE / 'unicode-data.txt').read_text().splitlines()
    assigned = 0
    first = None
    for line in lines:
        fields = line.split(';')
        if fields[1].endswith(', First>'):
            first = int(fields[0], 16)
        elif fields[1].endswith(', Last>'):
            assert first is not None
            assigned += int(fields[0], 16) - first + 1
            first = None
        else:
            assigned += 1
    out['unicode'] = {'dataRows': len(lines), 'expandedCodepointsIncludingPrivateUseAndSurrogates': assigned}
    for file in ['blocks', 'scripts', 'confusables']:
        data = (CACHE / (file + '.txt')).read_bytes()
        out['unicode'][file] = {'bytes': len(data), 'gzipBytes': len(gzip.compress(data, mtime=0)), 'rows': sum(bool(line.split('#')[0].strip()) for line in data.decode().splitlines())}
    with zipfile.ZipFile(CACHE / 'unihan.zip') as z:
        education, readings, fields = {}, collections.Counter(), collections.Counter()
        for name in z.namelist():
            if not name.endswith('.txt'):
                continue
            for line in z.read(name).decode().splitlines():
                if not line.startswith('U+'):
                    continue
                cp, field, value = line.split('\t', 2)
                fields[field] += 1
                if field == 'kKoreanEducationHanja':
                    education[chr(int(cp[2:], 16))] = value
                if field in ['kHangul', 'kJapaneseOn', 'kJapaneseKun']:
                    readings[field] += 1
        out['unihan'] = {'educationCharacters': len(education), 'educationValues': dict(collections.Counter(education.values())), 'readings': dict(readings), 'koreanFields': {k: v for k, v in fields.items() if 'Korean' in k or 'Hangul' in k}}
    dictionary = {j['character']: j for j in (json.loads(line) for line in (CACHE / 'mmh-dictionary.txt').read_text().splitlines() if line)}
    full, current = {}, {}
    for line in (CACHE / 'mmh-graphics.txt').read_text().splitlines():
        g = json.loads(line)
        ch = g['character']
        d = dictionary[ch]
        assert g['strokes'] and len(g['strokes']) == len(g['medians'])
        full[ch] = {**d, **g}
        parts = ''.join(c for c in d.get('decomposition', '') if 0x2E80 <= ord(c) <= 0x2FDF or 0x3400 <= ord(c) <= 0x9FFF or ord(c) >= 0x20000)
        current[ch] = {'s': g['strokes'], 'm': g['medians'], **({'c': parts} if parts else {}), **({'r': d['radical']} if d.get('radical') else {}), **({'e': d['definition']} if d.get('definition') else {}), **({'h': d['etymology']['hint']} if d.get('etymology') and d['etymology'].get('hint') else {})}
    svg, paths, stroke_types = {}, {}, collections.Counter()
    with zipfile.ZipFile(CACHE / 'kanjivg-main.zip') as z:
        raw_bytes = 0
        for name in z.namelist():
            if not re.fullmatch(r'kanji/[0-9a-f]+\.svg', name):
                continue
            ch = chr(int(pathlib.PurePosixPath(name).stem, 16))
            data = z.read(name)
            tree = ET.fromstring(data)
            strokes = [node for node in tree.iter() if node.tag.endswith('}path') and re.search(r'-s\d+$', node.attrib.get('id', ''))]
            assert strokes, name
            raw_bytes += len(data)
            svg[ch] = data.decode()
            paths[ch] = {'p': [node.attrib['d'] for node in strokes]}
            for node in strokes:
                stroke_types[next((v for k, v in node.attrib.items() if k.endswith('}type')), 'missing')] += 1
    out['strokes'] = {'mmhFull': shards(full), 'mmhCurrentFields': shards(current), 'kanjivgLosslessSvg': shards(svg), 'kanjivgPathsOnly': shards(paths), 'kanjivgSvgBytes': raw_bytes, 'kanjivgStrokeTypes': dict(stroke_types), 'kanaCharacters': sum(0x3040 <= ord(c) <= 0x30FF for c in svg)}
    with gzip.open(CACHE / 'kanjidic2.xml.gz', 'rb') as f:
        kanjidic = ET.parse(f).getroot()
    chars = kanjidic.findall('character')
    out['kanjidic'] = {'header': {c.tag: c.text for c in kanjidic.find('header')}, 'characters': len(chars)}
    for name, xpath in [('grade', './misc/grade'), ('jlptPre2010', './misc/jlpt'), ('frequency', './misc/freq'), ('onKana', './/reading[@r_type="ja_on"]'), ('kunKana', './/reading[@r_type="ja_kun"]'), ('englishMeaning', './/meaning')]:
        out['kanjidic'][name] = sum(any('m_lang' not in item.attrib for item in ch.findall(xpath)) for ch in chars)
    out['kanjidic']['grades'] = dict(collections.Counter(ch.findtext('./misc/grade') for ch in chars))
    cedict = gzip.decompress((CACHE / 'cedict.txt.gz').read_bytes()).decode()
    entries = [line for line in cedict.splitlines() if line and not line.startswith('#')]
    out['cedict'] = {'entries': len(entries), 'withClassifiers': sum('/CL:' in line for line in entries), 'classifierSenses': sum(len(re.findall(r'/CL:', line)) for line in entries), 'header': [line for line in cedict.splitlines() if line.startswith('#!')]}
    for lang in ['ja', 'ko']:
        with gzip.open(ROOT / f'public/packs/{lang}.v8.json.gz', 'rt') as f:
            pack = json.load(f)
        out.setdefault('shippedParadigms', {})[lang] = {'lemmas': len(pack['lemmas']), 'paradigms': len(pack['paradigms']), 'tagSets': pack['tagSets'], 'rowsWithPolitenessTags': sum(any(re.search(r'polite|formal|honorific|humble', pack['tagSets'][row[1]]) for row in p[2]) for p in pack['paradigms'])}
    piper = (ROOT / 'src/core/audio/piper.ts').read_text()
    out['piper'] = re.findall(r"id: '([^']+)', locale: '([^']+)'", piper)
    out['lexicons'] = {}
    dialect_glosses = {}
    with gzip.open(ROOT / 'public/dict/ar.v3.json.gz', 'rt') as f:
        shipped_arabic = {re.sub('[\u064b-\u065f\u0670]', '', row['w']) for row in json.load(f)['words']}
    out['shippedArabicWords'] = len(shipped_arabic)
    for name in ['korean-native', 'korean', 'chinese', 'arabic', 'russian', 'egyptian', 'north-levantine', 'south-levantine', 'gulf', 'moroccan']:
        stats = collections.Counter()
        words, root_words, roots, pairs, hanja_words, glosses, template_root_words = set(), set(), set(), set(), set(), set(), set()
        codes, templates, root_sources, fields = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
        for j in records(name):
            stats['records'] += 1
            codes[j.get('lang_code', '')] += 1
            if name == 'korean-native' and j.get('lang_code') != 'ko':
                continue
            word = j.get('word', '')
            words.add(word)
            stats['senses'] += len(j.get('senses', []))
            for sense in j.get('senses', []):
                glosses.update(g.lower().strip() for g in sense.get('glosses', []))
            if j.get('forms'):
                stats['withForms'] += 1
            if name == 'korean-native':
                texts = ' '.join(j.get('etymology_texts', []))
                stats['hanjaEtymologyRecords'] += bool('한자' in texts and re.search('[\u4e00-\u9fff]', texts))
                stats['etymologyLinksWithHanRecords'] += bool(re.search('[\u4e00-\u9fff]', json.dumps(j.get('etymology_links', []), ensure_ascii=False)))
            hanja = [f.get('form', '') for f in j.get('forms', []) if 'hanja' in f.get('tags', [])]
            if hanja:
                hanja_words.add(word)
                stats['hanjaForms'] += len(hanja)
            if re.search('[\uac00-\ud7a3]', word) and hanja:
                stats['hangulWordsWithHanja'] += 1
            for t in j.get('head_templates', []) + j.get('etymology_templates', []):
                templates[t.get('name', '')] += 1
                if name == 'russian':
                    for key, value in t.get('args', {}).items():
                        if re.fullmatch(r'(?:impf|pf)\d*', key) and isinstance(value, str) and re.search('[а-яА-ЯёЁ]', value):
                            pairs.add((word, re.sub('[\u0300\u0301]', '', value), key))
                if name == 'arabic' and t.get('name') in ['ar-root', 'root', 'ar-rootbox']:
                    stats['rootTemplates'] += 1
                    if any(root_letters(str(value)) for value in t.get('args', {}).values()):
                        template_root_words.add(word)
            if name == 'arabic':
                for field, value in j.items():
                    if field not in ['etymology_templates', 'etymology_text', 'categories', 'senses']:
                        continue
                    # Categories and template expansions can repeat one link; count words and roots separately.
                    found = root_letters(json.dumps(value, ensure_ascii=False))
                    if found:
                        root_sources[field] += 1
                        root_words.add(word)
                        roots.update(found)
            if name == 'chinese':
                if j.get('pos') == 'noun':
                    stats['nounRecords'] += 1
                    if any('classif' in json.dumps(t, ensure_ascii=False).lower() for t in j.get('head_templates', [])):
                        stats['nounHeadTemplatesWithClassifierText'] += 1
                for field, value in j.items():
                    if 'classif' in json.dumps(value, ensure_ascii=False).lower() or 'CL:' in json.dumps(value, ensure_ascii=False):
                        fields[field] += 1
                stats['structuredClassifiers'] += len(j.get('classifiers', []))
                stats['sensesWithClassifiers'] += sum(bool(s.get('classifiers')) for s in j.get('senses', []))
        out['lexicons'][name] = {**dict(stats), 'uniqueWords': len(words), 'langCodes': dict(codes), 'distinctGlosses': len(glosses)}
        if name in ['korean', 'korean-native']:
            out['lexicons'][name].update(hanjaWords=len(hanja_words), hanjaTemplates={k: v for k, v in templates.items() if 'hanja' in k})
        if name == 'arabic':
            out['lexicons'][name].update(rootLinkedWords=len(root_words), distinctExplicitRoots=len(roots), rootSources=dict(root_sources), rootTemplateNames={k: v for k, v in templates.items() if k in ['root', 'ar-root', 'ar-rootbox']}, templateRootWords=len(template_root_words), shippedWordsWithExplicitRoot=len({re.sub('[\u064b-\u065f\u0670]', '', w) for w in root_words} & shipped_arabic))
        if name == 'russian':
            out['lexicons'][name]['explicitAspectLinks'] = len(pairs)
            out['lexicons'][name]['distinctAspectSourceWords'] = len({p[0] for p in pairs})
        if name == 'chinese':
            out['lexicons'][name]['classifierMentionFields'] = dict(fields)
        if name in ['arabic', 'egyptian', 'north-levantine', 'south-levantine', 'gulf', 'moroccan']:
            dialect_glosses[name] = glosses
    candidates = set.intersection(*(dialect_glosses[n] for n in ['arabic', 'egyptian', 'north-levantine', 'gulf', 'moroccan']))
    out['dialectExactGlossCandidatesExcludingMissingIraqi'] = len(candidates)
    out['cldr'] = {lang: {**ET.parse(CACHE / ('cldr-' + lang + '.xml')).find('.//transform').attrib, 'bytes': (CACHE / ('cldr-' + lang + '.xml')).stat().st_size} for lang in ['kazakh', 'mongolian']}
    return out


if __name__ == '__main__':
    self_test()
    if '--self-test' in sys.argv:
        print('T0 audit self-check passed')
    else:
        print(json.dumps(audit(), ensure_ascii=False, indent=2))
