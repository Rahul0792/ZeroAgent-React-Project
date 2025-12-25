// Admin API service for making requests to the backend
const API_BASE_URL = 'http://localhost:8080/api/admin';

// Helper function to get user data from localStorage
const getUserData = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
  }
  return null;
};

// Helper function to check if user is admin
const isAdmin = () => {
  const user = getUserData();
  if (user) {
    // Handle both string and enum representations of the role
    return user.role === 'ADMIN' || user.role === 'Role.ADMIN';
  }
  return false;
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Check if user is admin
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Get user data
  const userData = getUserData();

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userData.token}`,
    },
    credentials: 'include', // Include credentials in the request
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
    
    if (!response.ok) {
      // If it's a 403 error, try to re-authenticate
      if (response.status === 403) {
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Access denied. Please log in as admin.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    // Handle network errors or other issues
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

// Admin Users API
export const adminUsersApi = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await apiRequest('/users');
      console.log('API Response:', response); // Debug log
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Get user by ID
  getUserById: (id: number) => apiRequest(`/users/${id}`),
  
  // Update user
  updateUser: (id: number, userData: any) => 
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  
  // Delete user
  deleteUser: (id: number) => 
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Admin Properties API
export const adminPropertiesApi = {
  // Get all properties
  getAllProperties: () => apiRequest('/properties'),
  
  // Get pending properties
  getPendingProperties: () => apiRequest('/properties/pending'),
  
  // Get flagged properties
  getFlaggedProperties: () => apiRequest('/properties/flagged'),
  
  // Get property by ID
  getPropertyById: (id: number) => apiRequest(`/properties/${id}`),
  
  // Update property
  updateProperty: (id: number, propertyData: any) => 
    apiRequest(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    }),
  
  // Delete property
  deleteProperty: (id: number) => 
    apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    }),
  
  // Approve property
  approveProperty: (id: number) => 
    apiRequest(`/properties/${id}/approve`, {
      method: 'POST',
    }),
  
  // Reject property
  rejectProperty: (id: number) => 
    apiRequest(`/properties/${id}/reject`, {
      method: 'POST',
    }),
  
  // Flag property
  flagProperty: (id: number) => 
    apiRequest(`/properties/${id}/flag`, {
      method: 'POST',
    }),
  
  // Unflag property
  unflagProperty: (id: number) => 
    apiRequest(`/properties/${id}/unflag`, {
      method: 'POST',
    }),
};

// Admin Statistics API
export const adminStatisticsApi = {
  // Get dashboard statistics
  getDashboardStatistics: () => apiRequest('/statistics/dashboard'),
};