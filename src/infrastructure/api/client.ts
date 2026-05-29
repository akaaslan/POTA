// ─── POTA API Client ──────────────────────────────────────────────────────────
// Backend entegrasyon rehberi:
//   1. BASE_URL'i gerçek API adresiyle güncelleyin
//   2. MOCK_MODE'u false yapın
//   3. Tüm servis metodları otomatik olarak gerçek API'ye yönlenecektir
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MODE = false;
const BASE_URL  = 'https://api.pota.app/v1'; // TODO: Gerçek API endpoint'i

interface ApiError extends Error {
  status?: number;
  data?:   unknown;
}

let _authToken: string | null = null;

export function setAuthToken(token: string): void {
  _authToken = token;
}

export function clearAuthToken(): void {
  _authToken = null;
}

async function _request<T>(method: string, path: string, body: unknown | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  };
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }
  const config: RequestInit = { method, headers };
  if (body !== null && body !== undefined) {
    config.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, config);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({})) as { message?: string };
    const msg = errorData.message ?? `API Hatası ${res.status}: ${path}`;
    const err  = new Error(msg) as ApiError;
    err.status = res.status;
    err.data   = errorData;
    throw err;
  }
  return res.json() as Promise<T>;
}

export const api = {
  isMock: (): boolean                      => MOCK_MODE,
  get:    <T>(path: string)                => _request<T>('GET',    path, null),
  post:   <T>(path: string, body: unknown) => _request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown) => _request<T>('PUT',    path, body),
  patch:  <T>(path: string, body: unknown) => _request<T>('PATCH',  path, body),
  del:    <T>(path: string)                => _request<T>('DELETE', path, null),
} as const;
