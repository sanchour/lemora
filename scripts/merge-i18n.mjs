// Resolves cherry-pick conflicts in src/core/i18n/*.json (docs/LINGUA-REINTEGRATION.md): both apps append keys to the same
// end of these files, so git sees a conflict where there is none. Merges each file as data: ours, plus every key the
// picked commit added or changed, minus every key it removed; sources.json lists are united. Run in a conflicted pick:
//   node scripts/merge-i18n.mjs && git add src/core/i18n && git cherry-pick --continue
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });
const conflicted = git('diff', '--name-only', '--diff-filter=U').split('\n').filter((f) => /^src\/core\/i18n\/[a-z]+\.json$/.test(f));
const stage = (n, f) => { try { return JSON.parse(git('show', `:${n}:${f}`)); } catch { return {}; } };
for (const file of conflicted) {
  const [base, ours, theirs] = [1, 2, 3].map((n) => stage(n, file));
  const out = { ...ours };
  for (const [k, v] of Object.entries(theirs)) {
    if (JSON.stringify(base[k]) === JSON.stringify(v)) continue; // the pick did not touch it
    out[k] = Array.isArray(v) && Array.isArray(ours[k]) ? [...new Set([...ours[k], ...v])] : v;
  }
  for (const k of Object.keys(base)) if (!(k in theirs)) delete out[k];
  writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  console.log('merged', file, `(${Object.keys(out).length} keys)`);
}
if (!conflicted.length) console.log('no i18n conflicts');
