// /explora/collection/:id: one collection of free reads (src/core/explora/catalogue.ts), as a page of covers.
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/app/context';
import { collectionById } from '@/core/explora/catalogue';
import { UiText } from '@/design/i18n/UiText';
import { Hand } from '@/design/drawings';
import { CollectionItems } from './components/ExploraShelves';

export default function ExploraCollection() {
  const { language } = useApp();
  const { id } = useParams();
  const collection = collectionById(id);
  if (!collection) return <p className="py-20 text-center text-ink-soft"><UiText source={'That collection isn’t here.'} /></p>;
  return (
    <div className="mx-auto max-w-6xl pb-10">
      <Link to="/explora" className="hit inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={15} aria-hidden /> <UiText source={'Explora'} /></Link>
      <header className="relative mt-4 mb-8 flex items-center overflow-hidden rounded-[28px] p-7 text-white shadow-elev-2 sm:p-9" style={{ background: `linear-gradient(135deg, ${collection.colours[0]}, ${collection.colours[1]})` }}>
        <span aria-hidden className="absolute -right-8 -bottom-10 size-56 rounded-full bg-white/10" />
        <span aria-hidden className="absolute top-1/2 right-8 hidden -translate-y-1/2 rotate-6 sm:block"><Hand name={collection.icon} size={120} className="text-white!" /></span>
        <div className="relative max-w-xl">
          <h1 className="font-serif text-[32px] leading-tight font-bold tracking-tight sm:text-[38px]"><UiText source={collection.title} /></h1>
          <p className="mt-2 text-[15px] leading-snug text-white/85"><UiText source={collection.blurb} /></p>
        </div>
      </header>
      <CollectionItems lang={language.id} id={id} />
    </div>
  );
}
