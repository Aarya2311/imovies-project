const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const AUTH_TOKEN_STORAGE_KEY = "imovies_auth_token";

function buildApiUrl(path) {
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

async function request(path, options = {}) {
  const url = buildApiUrl(path);
  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && !contentType.includes("+json")) {
    throw new Error(
      `Expected a JSON response from ${url}, but received ${contentType || "an unknown content type"} (HTTP ${response.status}).`
    );
  }
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || `Request failed with status ${response.status}.`);
  }
  return result;
}

export function getMovies({ signal } = {}) {
  return request("/api/movies", { signal });
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function storeAuthToken(token) {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("The authentication response did not include a valid session token.");
  }
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function registerUser(credentials) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logoutUser() {
  return request("/api/auth/logout", { method: "POST" }).then((result) => {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return result;
  });
}

export function createMovie(movie) {
  return request("/api/movies", {
    method: "POST",
    body: JSON.stringify(movie),
  });
}

export function deleteMovie(movieId) {
  return request(`/api/movies/${encodeURIComponent(movieId)}`, {
    method: "DELETE",
  });
}

export function createBooking(booking) {
  return request("/api/bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
}

export function getBookings({ signal } = {}) {
  return request("/api/bookings", { signal });
}

export function getAdminBookings({ signal } = {}) {
  return request("/api/bookings/admin", { signal });
}

export function cancelBooking(bookingId) {
  return request(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "POST",
  });
}

export { API_URL };
