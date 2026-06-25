export async function getAllPosts() {
  const API_BASE = "http://localhost:8081";
  const response = await fetch(`${API_BASE}/posts`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Request failed ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.posts) ? data.posts : [];
}
