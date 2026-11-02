import Dexie from 'dexie';
import type { IndexableType, Table, Transaction } from 'dexie';
import type { LinguaDB, TableName } from './db';
import { toast } from '@/state/ui';

type Row = Record<string, unknown>;
type Change = { table: Table<Row, IndexableType>; key: IndexableType; before?: Row; after?: Row };

// Compare binary content too: a restored backup may have created or replaced an attachment.
function unchanged(a: unknown, b: unknown): boolean | Promise<boolean> {
  if (a === b) return true;
  if (a instanceof Blob || b instanceof Blob) {
    if (!(a instanceof Blob && b instanceof Blob) || a.size !== b.size || a.type !== b.type) return false;
    return (async () => {
      for (let offset = 0; offset < a.size; offset += 1024 * 1024) {
        const [left, right] = await Promise.all([a.slice(offset, offset + 1024 * 1024).arrayBuffer(), b.slice(offset, offset + 1024 * 1024).arrayBuffer()]);
        const bytes = new Uint8Array(right);
        if (new Uint8Array(left).some((value, i) => value !== bytes[i])) return false;
      }
      return true;
    })();
  }
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (!Array.isArray(a) && Object.getPrototypeOf(a) !== Object.prototype && Object.getPrototypeOf(a) !== null) return false;
  const left = a as Row, right = b as Row;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const checks = [...keys].map((key) => unchanged(left[key], right[key]));
  return checks.some((c) => c instanceof Promise) ? Promise.all(checks).then((all) => all.every(Boolean)) : checks.every(Boolean);
}

const active = new WeakSet<IDBTransaction>();
export const removalInProgress = (database: LinguaDB) => Dexie.currentTransaction?.db === database && active.has(Dexie.currentTransaction.idbtrans);

/** Capture removed/updated/created rows in one atomic operation, including nested cascades. */
export async function captureRemoval<T>(database: LinguaDB, names: TableName[], action: () => Promise<T>): Promise<{ value: T; undo: () => Promise<void>; count: number }> {
  const tables = [...new Set(names)].map((name) => database.table<Row, IndexableType>(name));
  const changes = new Map<string, Change>();
  const value = await database.transaction('rw', tables, async (transaction) => {
    active.add(transaction.idbtrans);
    const remember = (table: Table<Row, IndexableType>, key: IndexableType, row: Row | undefined, tx: Transaction) => {
      if (tx.idbtrans !== transaction.idbtrans) return;
      const id = JSON.stringify([table.name, key]);
      if (!changes.has(id)) changes.set(id, { table, key, before: structuredClone(row) });
    };
    const listeners = tables.map((table) => {
      const deleting = (key: IndexableType, row: Row, tx: Transaction) => remember(table, key, row, tx);
      const updating = (_mods: object, key: IndexableType, row: Row, tx: Transaction) => remember(table, key, row, tx);
      const creating = (key: IndexableType, _row: Row, tx: Transaction) => remember(table, key, undefined, tx);
      table.hook('creating', creating);
      table.hook('deleting', deleting);
      table.hook('updating', updating);
      return () => { table.hook.creating.unsubscribe(creating); table.hook.deleting.unsubscribe(deleting); table.hook.updating.unsubscribe(updating); };
    });
    try {
      // Chapter statistics yield to the browser; retain the transaction across those native waits.
      const result = await Dexie.waitFor(action());
      for (const table of tables) {
        const own = [...changes.values()].filter((c) => c.table === table);
        const rows = await table.bulkGet(own.map((c) => c.key));
        own.forEach((c, i) => { c.after = rows[i]; });
      }
      return result;
    } finally { active.delete(transaction.idbtrans); listeners.forEach((off) => off()); }
  });
  let used = false;
  const undo = async () => {
    if (used) return;
    await database.transaction('rw', tables, async () => {
      for (const table of tables) {
        const own = [...changes.values()].filter((c) => c.table === table);
        const current = await table.bulkGet(own.map((c) => c.key));
        for (const [i, change] of own.entries()) {
          const match = unchanged(current[i], change.after);
          if (!(match instanceof Promise ? await Dexie.waitFor(match) : match)) throw new Error('Undo stopped because this content changed again. Your newer changes were kept.');
        }
      }
      for (const table of tables) {
        const own = [...changes.values()].filter((c) => c.table === table);
        await table.bulkDelete(own.filter((c) => !c.before).map((c) => c.key));
        await table.bulkPut(own.flatMap((c) => c.before ? ['updatedAt' in c.before ? { ...c.before, updatedAt: Date.now() + 1 } : c.before] : []));
      }
    });
    used = true;
  };
  return { value, undo, count: changes.size };
}

/** Keep recovery across SPA navigation, until the learner dismisses this message or reloads. */
export function offerRemovalUndo(undo: () => Promise<void>, afterUndo?: () => void | Promise<void>): void {
  toast('Change saved. Undo is available until this message is replaced, dismissed or the app reloads.', { duration: 0, action: { label: 'Undo', onClick: async () => {
    await undo(); await afterUndo?.(); toast('Restored.', { tone: 'success' });
  } } });
}

/** A cascade owns one Undo; nested deletions join its transaction instead of offering partial restores. */
export async function undoableRemoval<T>(database: LinguaDB, names: TableName[], action: () => Promise<T>, afterUndo?: () => void | Promise<void>): Promise<T> {
  if (removalInProgress(database)) return action();
  try {
    const change = await captureRemoval(database, names, action);
    if (change.count) offerRemovalUndo(change.undo, afterUndo);
    return change.value;
  } catch (error) {
    toast(error instanceof Error ? error.message : 'Could not change stored media.', { tone: 'error' });
    throw error;
  }
}
