const CONTENT_API_BASE = "";
const AUTH_API_BASE = "";
const TOKEN_KEY = "auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function loginAndStoreToken(email, password) {
  const response = await fetch(`${AUTH_API_BASE}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed ${response.status}`);
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error("Login did not return a token");
  }

  setToken(data.token);
  return data.token;
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

export async function getCurrentUser() {
  const response = await apiFetch(`${AUTH_API_BASE}/api/me`, {
    method: "GET",
  });

  if (response.status === 401) {
    clearToken();
    localStorage.removeItem("auth_email");
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Request failed ${response.status}`);
  }

  const data = await response.json();
  return data.user || null;
}

export async function getAllPosts() {
  const response = await apiFetch(`${CONTENT_API_BASE}/api/posts`, {
    method: "GET",
  });

  if (response.status === 401) {
    clearToken();
    localStorage.removeItem("auth_email");
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Request failed ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.posts) ? data.posts : [];
}
