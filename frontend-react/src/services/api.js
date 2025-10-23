export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = options.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  const resp = await fetch(path, { ...options, headers });
  return resp;
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userRole');
  localStorage.removeItem('username');
}
