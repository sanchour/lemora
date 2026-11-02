import Dexie from 'dexie';
import type { IndexableType, Table, Transaction } from 'dexie';
import type { LinguaDB, TableName } from './db';
import { toast } from '@/state/ui';

type Row = Record<string, unknown>;
type Change = { table: Table<Row, IndexableType>; key: IndexableType; before: Row; after?: Row };

// Binary rows are restored only into empty keys; never overwrite a newer attachment.
function unchanged(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a instanceof Blob || b instanceof Blob || a instanceof ArrayBuffer || b instanceof ArrayBuffer) return false;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = a as Row, right = b as Row;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].every((key) => unchanged(left[key], right[key]));
}

/** Capture only removed/updated rows in one atomic operation, including nested cascades. */
export async function captureRemoval<T>(database: LinguaDB, names: TableName[], action: () => Promise<T>): Promise<{ value: T; undo: () => Promise<void>; count: number }> {
  const tables = [...new Set(names)].map((name) => database.table<Row, IndexableType>(name));
  const changes = new Map<string, Change>();
  const value = await database.transaction('rw', tables, async (transaction) => {
    const remember = (table: Table<Row, IndexableType>, key: IndexableType, row: Row, tx: Transaction) => {
      if (tx.idbtrans !== transaction.idbtrans) return;
      const id = JSON.stringify([table.name, key]);
      if (!changes.has(id)) changes.set(id, { table, key, before: structuredClone(row) });
    };
    const listeners = tables.map((table) => {
      const deleting = (key: IndexableType, row: Row, tx: Transaction) => remember(table, key, row, tx);
      const updating = (_mods: object, key: IndexableType, row: Row, tx: Transaction) => remember(table, key, row, tx);
      table.hook('deleting', deleting);
      table.hook('updating', updating);
      return () => { table.hook.deleting.unsubscribe(deleting); table.hook.updating.unsubscribe(updating); };
    });
    try {
      const result = await action();
      for (const table of tables) {
        const own = [...changes.values()].filter((c) => c.table === table);
        const rows = await table.bulkGet(own.map((c) => c.key));
        own.forEach((c, i) => { c.after = rows[i]; });
      }
      return result;
    } finally { listeners.forEach((off) => off()); }
  });
  let used = false;
  const undo = async () => {
    if (used) return;
    await database.transaction('rw', tables, async () => {
      for (const table of tables) {
        const own = [...changes.values()].filter((c) => c.table === table);
        const current = await table.bulkGet(own.map((c) => c.key));
        if (own.some((c, i) => !unchanged(current[i], c.after))) throw new Error('Undo stopped because this content changed again. Your newer changes were kept.');
      }
      for (const table of tables) {
        const rows = [...changes.values()].filter((c) => c.table === table).map((c) => 'updatedAt' in c.before ? { ...c.before, updatedAt: Date.now() + 1 } : c.before);
        await table.bulkPut(rows);
      }
    });
    used = true;
  };
  return { value, undo, count: changes.size };
}

/** Keep recovery across SPA navigation, until the learner dismisses this message or reloads. */
export function offerRemovalUndo(undo: () => Promise<void>, afterUndo?: () => void | Promise<void>): void {
  toast('Removed. Undo lasts until your next removal, dismissal or app reload.', { duration: 0, action: { label: 'Undo', onClick: async () => {
    await undo(); await afterUndo?.(); toast('Restored.', { tone: 'success' });
  } } });
}

/** A cascade owns one Undo; nested deletions join its transaction instead of offering partial restores. */
export async function undoableRemoval<T>(database: LinguaDB, names: TableName[], action: () => Promise<T>, afterUndo?: () => void | Promise<void>): Promise<T> {
  if (Dexie.currentTransaction?.db === database) return action();
  const change = await captureRemoval(database, names, action);
  if (change.count) offerRemovalUndo(change.undo, afterUndo);
  return change.value;
}
