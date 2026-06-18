const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// window.name es verdaderamente aislado por pestaña en todos los navegadores
// y persiste entre recargas de página sin ser compartido entre pestañas.
function tabId(): string {
  if (!window.name || !window.name.startsWith('bv_')) {
    window.name = 'bv_' + Math.random().toString(36).slice(2, 10);
  }
  return window.name;
}

function authKey(): string {
  return 'auth_' + tabId();
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(authKey());
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

function hdrs(): HeadersInit {
  const t = getToken();
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function req<T>(
  method: string,
  path: string,
  params?: Record<string, string>,
  body?: unknown
): Promise<T> {
  const qs = params && Object.keys(params).length ? '?' + new URLSearchParams(params) : '';
  const r = await fetch(`${BASE}${path}${qs}`, {
    method,
    headers: hdrs(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (r.status === 401) {
    clearAuth();
    window.location.reload();
  }
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(txt || `Error ${r.status}`);
  }
  const txt = await r.text();
  if (!txt) return null as unknown as T;
  try {
    return JSON.parse(txt);
  } catch {
    return txt as unknown as T;
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    req<T>('GET', path, params),
  post: <T>(path: string, params?: Record<string, string>, body?: unknown) =>
    req<T>('POST', path, params, body),
  put: <T>(path: string, params?: Record<string, string>, body?: unknown) =>
    req<T>('PUT', path, params, body),
  patch: <T>(path: string, params?: Record<string, string>) =>
    req<T>('PATCH', path, params),
  del: (path: string) => req<void>('DELETE', path),
};

export function getAuth(): { token: string; rol: string; nombre: string; email: string } | null {
  try {
    const raw = localStorage.getItem(authKey());
    if (!raw) return null;
    const { token, rol, nombre, email } = JSON.parse(raw) as Record<string, string>;
    if (!token || !rol || !nombre || !email) return null;
    return { token, rol, nombre, email };
  } catch {
    return null;
  }
}

export function setAuth(token: string, rol: string, nombre: string, email: string) {
  localStorage.setItem(authKey(), JSON.stringify({ token, rol, nombre, email }));
}

export function clearAuth() {
  localStorage.removeItem(authKey());
}

export async function downloadExcel(desde?: string, hasta?: string) {
  const t = getToken();
  const qs = desde ? `?desde=${desde}&hasta=${hasta}` : '';
  const r = await fetch(`${BASE}/api/caja/reporte/excel${qs}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!r.ok) throw new Error(await r.text());
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = desde ? `Reporte_Semanal.xlsx` : 'Cierre_Caja.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
