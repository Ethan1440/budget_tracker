const API_BASE = 'http://localhost:3001';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error('Could not reach the budget API. Start the backend and try again.');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return body;
}

export function getCategories() {
  return request('/api/categories');
}

export function createCategory(category) {
  return request('/api/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

export function getIncomeOrExpenses() {
  return request('/api/income-or-expense');
}

export function createIncomeOrExpense(item) {
  return request('/api/income-or-expense', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export function deleteIncomeOrExpense(id) {
  return request(`/api/income-or-expense/${id}`, { method: 'DELETE' });
}

export function toClientItem(row) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    category: row.category_name,
    date: row.item_date,
    recurring: Boolean(row.recurring),
  };
}

export function splitIncomeAndExpenses(rows) {
  const income = [];
  const expenses = [];
  for (const row of rows) {
    const item = toClientItem(row);
    if (row.income_category) {
      income.push(item);
    }
    if (row.expense_category) {
      expenses.push(item);
    }
  }
  return { income, expenses };
}
