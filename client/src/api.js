const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.message || "Request failed.");
    error.details = body.errors || {};
    throw error;
  }

  return body;
}

function buildQuery(filters = {}) {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== "All") {
    params.set("category", filters.category);
  }

  if (filters.range) {
    params.set("range", filters.range);
  }

  if (filters.range === "custom") {
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function getCategories() {
  return request("/api/categories");
}

export function getExpenses(filters) {
  return request(`/api/expenses${buildQuery(filters)}`);
}

export function getSummary(filters) {
  return request(`/api/summary${buildQuery(filters)}`);
}

export function createExpense(expense) {
  return request("/api/expenses", {
    method: "POST",
    body: JSON.stringify(expense)
  });
}

export function updateExpense(id, expense) {
  return request(`/api/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(expense)
  });
}

export function deleteExpense(id) {
  return request(`/api/expenses/${id}`, {
    method: "DELETE"
  });
}

export function getBudgets() {
  return request("/api/budgets");
}

export function updateBudget(category, limit) {
  return request(`/api/budgets/${encodeURIComponent(category)}`, {
    method: "PUT",
    body: JSON.stringify({ limit })
  });
}
