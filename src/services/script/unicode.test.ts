import { afterEach, describe, expect, it, vi } from 'vitest';

const index = { version: '17.0.0', blocks: [[0, 127, 'Basic Latin']], scripts: [[65, 90, 'Latin']], ranges: [], names: [], confusables: [], files: ['Latin', 'Unknown'] };
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe('lazy Unicode assets', () => {
  it('loads from an existing cache while offline without requesting the network', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('Offline'));
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match: vi.fn().mockResolvedValue(new Response(JSON.stringify(index))) }) });
    const { loadUnicodeIndex } = await import('./unicode');
    expect(await loadUnicodeIndex()).toEqual({ data: index, offline: true });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('stores valid data for offline use and shares concurrent loads', async () => {
    const put = vi.fn().mockResolvedValue(undefined), fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(index)));
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match: vi.fn().mockResolvedValue(undefined), put }) });
    const { loadUnicodeIndex } = await import('./unicode');
    const [a, b] = await Promise.all([loadUnicodeIndex(), loadUnicodeIndex()]);
    expect(a).toEqual({ data: index, offline: true }); expect(b).toBe(a);
    expect(fetch).toHaveBeenCalledOnce(); expect(put).toHaveBeenCalledOnce();
  });
  it('retries failed requests, refuses bad data and never claims failed storage is offline-ready', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 503 })).mockResolvedValueOnce(new Response(JSON.stringify({ ...index, blocks: [[-1, 2000000, 'bad']] }))).mockResolvedValueOnce(new Response(JSON.stringify(index)));
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ match: vi.fn().mockResolvedValue(undefined), put: vi.fn().mockRejectedValue(new Error('Quota')) }) });
    const { loadUnicodeIndex, loadUnicodeScript } = await import('./unicode');
    await expect(loadUnicodeIndex()).rejects.toThrow('could not be loaded');
    await expect(loadUnicodeIndex()).rejects.toThrow('unexpected format');
    expect(await loadUnicodeIndex()).toEqual({ data: index, offline: false });
    await expect(loadUnicodeScript('../Latin')).rejects.toThrow('Invalid script');
  });
});
