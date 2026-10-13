const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
    setToken(null);
    setUser(null);
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },

  async getRequests() {
    return apiRequest('/requests');
  },

  async createRequest(payload) {
    return apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async takeAction(requestId, action, rejectionReason = '') {
    return apiRequest(`/requests/${requestId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    });
  },

  async getRoutingPreview(fromDatetime, toDatetime) {
    const params = new URLSearchParams({
      from_datetime: fromDatetime,
      to_datetime: toDatetime,
    });
    return apiRequest(`/requests/routing-preview?${params.toString()}`);
  },

  async getCollegePolicy() {
    return apiRequest('/requests/college-policy');
  },
};
