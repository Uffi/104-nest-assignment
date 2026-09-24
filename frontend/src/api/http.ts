const API_URL = 'http://localhost:3000';

function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', data.user.role);

    return true;
  } catch {
    return false;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const request = () => {
    const accessToken = localStorage.getItem('accessToken');

    const headers = new Headers(options.headers);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  };

  let response = await request();

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    clearAuth();
    window.location.href = '/login';

    return response;
  }

  response = await request();

  return response;
}
