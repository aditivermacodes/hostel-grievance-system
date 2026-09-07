const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('hgs_admin_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('hgs_admin_token', token);
  } else {
    localStorage.removeItem('hgs_admin_token');
  }
}

export function getStoredAdminUser() {
  const data = localStorage.getItem('hgs_admin_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user) {
  if (user) {
    localStorage.setItem('hgs_admin_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('hgs_admin_user');
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  const token = getAuthToken();
  const isAdminEndpoint = endpoint.startsWith('/admin') || endpoint.startsWith('/auth/me');
  if (token && !headers['Authorization'] && isAdminEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred.';
      if (typeof data === 'object' && data !== null) {
        if (data.fieldErrors) {
          const firstErrorKey = Object.keys(data.fieldErrors)[0];
          errorMessage = `${firstErrorKey}: ${data.fieldErrors[firstErrorKey]}`;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status === 401 && endpoint.startsWith('/admin')) {
      setAuthToken(null);
      setStoredAdminUser(null);
      window.dispatchEvent(new CustomEvent('hgs-unauthorized'));
    }
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  
  post: (endpoint, body) => request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),

  patch: (endpoint, body) => request(endpoint, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),

  postMultipart: (endpoint, formData) => request(endpoint, {
    method: 'POST',
    body: formData,
  }),
};
