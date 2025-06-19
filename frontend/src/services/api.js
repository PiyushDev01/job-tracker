// Define API base URL based on environment
const API_BASE = import.meta.env.VITE_API_URL || 
                 (window.location.hostname === 'localhost' ? 
                  'http://localhost:5000/api' : 
                  `${window.location.protocol}//${window.location.hostname}/api`);

console.log('Using API URL:', API_BASE);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 
      (response.status === 401 ? 'Invalid credentials' : 
       response.status === 400 ? 'Invalid input data' : 
       response.status === 403 ? 'Not authorized' : 
       response.status === 404 ? 'Resource not found' : 
       response.status === 0 ? 'Network error. This may be caused by ad-blocker.' : 
       'Something went wrong');
    
    throw new Error(errorMessage);
  }
    return response.json().catch(error => {
    console.error('Failed to parse JSON response:', error);
    throw new Error('Failed to parse server response.');
  });
};

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
  },

  verifyToken: async (token) => {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },
};

export const jobsAPI = {
  getJobs: async (filters) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    
    const response = await fetch(`${API_BASE}/jobs?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getJob: async (id) => {
    const response = await fetch(`${API_BASE}/jobs/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createJob: async (jobData) => {
    const response = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  updateJob: async (id, jobData) => {
    const response = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  deleteJob: async (id) => {
    const response = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE}/jobs/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
