// api/apiService.js
const API_BASE_URL = 'http://localhost:5001/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();

    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();

    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },
};

// Data API calls
export const dataAPI = {
  addTransaction: async (transactionData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to add transaction');
    }

    return response.json();
  },

  deleteTransaction: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('token');
      }
      throw new Error('Failed to delete transaction');
    }

    return response.json();
  },
  updateTransaction: async (id, transactionData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('token');
      }
      throw new Error('Failed to update transaction');
    }

    return response.json();
  },

  getTransactions: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  },

  getBudgets: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to fetch budgets');
    }

    return response.json();
  },

  getDashboardStats: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  getBudgetCategories: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/budget-categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to fetch budget categories');
    }

    return response.json();
  },

  createBudget: async (budgetData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to create budget');
    }

    return response.json();
  },

  updateBudget: async (id, budgetData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to update budget');
    }

    return response.json();
  },

  deleteBudget: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to delete budget');
    }

    return response.json();
  },

  createRecurringTransaction: async (transactionData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/recurring-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to create recurring transaction');
    }

    return response.json();
  },

  getRecurringTransactions: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/recurring-transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to fetch recurring transactions');
    }

    return response.json();
  },

  updateRecurringTransaction: async (id, transactionData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to update recurring transaction');
    }

    return response.json();
  },

  deleteRecurringTransaction: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to delete recurring transaction');
    }

    return response.json();
  },



  createBackup: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/backup`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to create backup');
    }

    // Create a download link for the backup JSON
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = downloadUrl;
    link.setAttribute('download', `budget-buddy-backup-${date}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  restoreData: async (backupData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(backupData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to restore data');
    }

    return response.json();
  },

  searchTransactions: async (searchParams) => {
    const token = getToken();
    let url = `${API_BASE_URL}/transactions/search`;
    const params = new URLSearchParams();

    if (searchParams.search) params.append('search', searchParams.search);
    if (searchParams.category) params.append('category', searchParams.category);
    if (searchParams.type) params.append('type', searchParams.type);
    if (searchParams.startDate) params.append('startDate', searchParams.startDate);
    if (searchParams.endDate) params.append('endDate', searchParams.endDate);
    if (searchParams.sortBy) params.append('sortBy', searchParams.sortBy);
    if (searchParams.sortOrder) params.append('sortOrder', searchParams.sortOrder);
    if (searchParams.page) params.append('page', searchParams.page);
    if (searchParams.limit) params.append('limit', searchParams.limit);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to search transactions');
    }

    return response.json();
  },

  suggestCategory: async (description, type) => {
    const token = getToken();
    let url = `${API_BASE_URL}/transactions/suggest-category`;
    const params = new URLSearchParams();
    params.append('description', description);
    if (type) params.append('type', type);

    url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to suggest category');
    }

    return response.json();
  },

  getProfile: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  updateProfile: async (profileData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to update profile');
    }

    return response.json();
  },

  changePassword: async (passwordData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('budgetBuddyToken');
      }
      throw new Error('Failed to change password');
    }

    return response.json();
  },
};

export default {
  authAPI,
  dataAPI,
};