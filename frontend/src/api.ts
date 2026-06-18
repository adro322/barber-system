const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function hdrs(): HeadersInit {
  const t = sessionStorage.getItem('jwt_token');
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
    sessionStorage.clear();
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

export function getAuth() {
  const token = sessionStorage.getItem('jwt_token');
  const rol = sessionStorage.getItem('jwt_rol');
  const nombre = sessionStorage.getItem('jwt_nombre');
  const email = sessionStorage.getItem('jwt_email');
  if (!token || !rol || !nombre || !email) return null;
  return { token, rol, nombre, email };
}

export function setAuth(token: string, rol: string, nombre: string, email: string) {
  sessionStorage.setItem('jwt_token', token);
  sessionStorage.setItem('jwt_rol', rol);
  sessionStorage.setItem('jwt_nombre', nombre);
  sessionStorage.setItem('jwt_email', email);
}

export function clearAuth() {
  ['jwt_token', 'jwt_rol', 'jwt_nombre', 'jwt_email'].forEach(k =>
    sessionStorage.removeItem(k)
  );
}

export async function downloadExcel(desde?: string, hasta?: string) {
  const t = sessionStorage.getItem('jwt_token');
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
