const DASHES = /[ー―−‐‑‒–—―ｰ]/g;
const SPACES = /[\s\u3000]+/g;

export function toHalfWidth(value: string): string {
  return value
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(DASHES, '-')
    .normalize('NFKC');
}

export function normalizeAddressInput(value: string): string {
  return toHalfWidth(String(value || ''))
    .toLowerCase()
    .replace(SPACES, '')
    .replace(/丁目/g, '-')
    .replace(/番地/g, '-')
    .replace(/番/g, '-')
    .replace(/号/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeZipcode(value: string): string {
  return toHalfWidth(String(value || '')).replace(/\D/g, '').slice(0, 7);
}
