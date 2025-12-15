// Production'da relative path kullan (Nginx üzerinden backend'e yönlendirilir)
// Development'da localhost kullan
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Auth token'ı localStorage'dan al
const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// API istekleri için yardımcı fonksiyon
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token geçersiz, logout yap
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Sunucuya bağlanılamıyor. Backend server\'ın çalıştığından emin olun.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
  
  verify: async () => {
    const response = await apiRequest('/auth/verify');
    return response.json();
  },
};

// Volunteers API
export const volunteersAPI = {
  getAll: async () => {
    const response = await apiRequest('/volunteers');
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest(`/volunteers/${id}`);
    return response.json();
  },
  
  create: async (data: any) => {
    const response = await apiRequest('/volunteers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: number, data: any) => {
    const response = await apiRequest(`/volunteers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: number) => {
    const response = await apiRequest(`/volunteers/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// SMS API
export const smsAPI = {
  send: async (data: { volunteer_id?: number; phone: string; message: string; link_url?: string }) => {
    const response = await apiRequest('/sms/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  sendBulk: async (data: { volunteer_ids: number[]; message: string; link_url?: string }) => {
    const response = await apiRequest('/sms/send-bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getHistory: async (volunteer_id?: number, limit: number = 50) => {
    const query = volunteer_id ? `?volunteer_id=${volunteer_id}&limit=${limit}` : `?limit=${limit}`;
    const response = await apiRequest(`/sms/history${query}`);
    return response.json();
  },
};

// WhatsApp API
export const whatsappAPI = {
  getStatus: async () => {
    const response = await apiRequest('/whatsapp/status');
    return response.json();
  },
  
  connect: async () => {
    const response = await apiRequest('/whatsapp/connect', {
      method: 'POST',
    });
    return response.json();
  },
  
  disconnect: async () => {
    const response = await apiRequest('/whatsapp/disconnect', {
      method: 'POST',
    });
    return response.json();
  },
  
  send: async (data: { volunteer_id?: number; phone: string; message: string; link_url?: string }) => {
    const response = await apiRequest('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  sendBulk: async (data: { volunteer_ids: number[]; message: string; link_url?: string }) => {
    const response = await apiRequest('/whatsapp/send-bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getHistory: async (volunteer_id?: number, limit: number = 50) => {
    const query = volunteer_id ? `?volunteer_id=${volunteer_id}&limit=${limit}` : `?limit=${limit}`;
    const response = await apiRequest(`/whatsapp/history${query}`);
    return response.json();
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },
  
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },
  
  getAllImages: async () => {
    const response = await apiRequest('/upload/images');
    return response.json();
  },
  
  deleteImage: async (id: number) => {
    const response = await apiRequest(`/upload/image/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Students API
export const studentsAPI = {
  getAll: async () => {
    const response = await apiRequest('/students');
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest(`/students/${id}`);
    return response.json();
  },
  
  create: async (data: any) => {
    const response = await apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: number, data: any) => {
    const response = await apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: number) => {
    const response = await apiRequest(`/students/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  pairWithVolunteer: async (studentId: number, volunteerId: number) => {
    const response = await apiRequest(`/students/${studentId}/pair`, {
      method: 'POST',
      body: JSON.stringify({ volunteer_id: volunteerId }),
    });
    return response.json();
  },
};

// Trees API
export const treesAPI = {
  getAll: async () => {
    const response = await apiRequest('/trees');
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest(`/trees/${id}`);
    return response.json();
  },
  
  create: async (data: any) => {
    const response = await apiRequest('/trees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: number, data: any) => {
    const response = await apiRequest(`/trees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: number) => {
    const response = await apiRequest(`/trees/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  addCareActivity: async (treeId: number, data: any) => {
    const response = await apiRequest(`/trees/${treeId}/care`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Link Content API
export const linkContentAPI = {
  create: async (data: { title: string; description?: string; image_ids?: number[] }) => {
    const response = await apiRequest('/link-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/link-content/${id}`);
    return response.json();
  },
  
  getAll: async () => {
    const response = await apiRequest('/link-content');
    return response.json();
  },
};

// Activities API
export const activitiesAPI = {
  getAll: async (params?: { volunteer_id?: number; start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.volunteer_id) queryParams.append('volunteer_id', params.volunteer_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest(`/activities${query}`);
    return response.json();
  },
  
  getByVolunteerId: async (volunteerId: number, params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    // Public endpoint - auth gerekmez
    const response = await fetch(`${API_BASE_URL}/activities/volunteer/${volunteerId}${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    return response.json();
  },
  
  getGallery: async () => {
    // Public endpoint - auth gerekmez
    const response = await fetch(`${API_BASE_URL}/activities/public/gallery`);
    if (!response.ok) {
      throw new Error('Failed to fetch gallery activities');
    }
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest(`/activities/${id}`);
    return response.json();
  },
  
  create: async (data: {
    volunteer_id: number;
    title: string;
    description?: string;
    activity_date: string;
    activity_time?: string;
    location?: string;
  }) => {
    const response = await apiRequest('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  createBulk: async (data: {
    volunteer_ids: number[];
    title: string;
    description?: string;
    activity_date: string;
    activity_time?: string;
    location?: string;
  }) => {
    const response = await apiRequest('/activities/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: number, data: {
    title?: string;
    description?: string;
    activity_date?: string;
    activity_time?: string;
    location?: string;
  }) => {
    const response = await apiRequest(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: number) => {
    const response = await apiRequest(`/activities/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Process Steps API
export const processStepsAPI = {
  getAll: async () => {
    // Public endpoint - auth gerekmez
    const response = await fetch(`${API_BASE_URL}/process-steps`);
    if (!response.ok) {
      throw new Error('Failed to fetch process steps');
    }
    return response.json();
  },
  
  getByStepNumber: async (stepNumber: number) => {
    // Public endpoint - auth gerekmez
    const response = await fetch(`${API_BASE_URL}/process-steps/${stepNumber}`);
    if (!response.ok) {
      throw new Error('Failed to fetch process step');
    }
    return response.json();
  },
  
  // Admin endpoints
  getAllAdmin: async () => {
    const response = await apiRequest('/process-steps/admin/all');
    return response.json();
  },
  
  getByStepNumberAdmin: async (stepNumber: number) => {
    const response = await apiRequest(`/process-steps/admin/step/${stepNumber}`);
    return response.json();
  },
  
  create: async (data: {
    step_number: number;
    image_id: number;
    title?: string;
    description?: string;
    display_order?: number;
  }) => {
    const response = await apiRequest('/process-steps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: number, data: {
    title?: string;
    description?: string;
    display_order?: number;
  }) => {
    const response = await apiRequest(`/process-steps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: number) => {
    const response = await apiRequest(`/process-steps/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

