import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useApp } from '@/app/context';
import { importFirstBook } from '@/services/import/importers';

/** /codex/first (Lemora U1): puts the beginner's first book on the shelf (once) and opens it. */
export default function FirstBook() {
  const { language } = useApp();
  const [to, setTo] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void importFirstBook(language.id).then((id) => alive && setTo(`/codex/read/${id}`), () => alive && setTo('/codex'));
    return () => {
      alive = false;
    };
  }, [language.id]);
  return to ? <Navigate to={to} replace /> : null;
}
