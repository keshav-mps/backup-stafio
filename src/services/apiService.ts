import { apiClient, authClient } from './getServices';
import { setAuthToken, setUserId } from './tokenManager';

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await authClient.post('/auth/login', { email, password });
      if (response.data.token && response.data.user_id) {
        setAuthToken(response.data.token);
        setUserId(response.data.user_id);
        localStorage.setItem('role_id', response.data.role_id);
        localStorage.setItem('user_name', response.data.user_name);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await authClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  forgotPassword: async (email: string) => {
    try {
      const response = await authClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await authClient.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  sendOtp: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/otps', { email });
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },
  
  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await apiClient.post('/auth/verify', { email, otp });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }
};

// Posts API calls
export const postsAPI = {
  getUserPosts: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/post/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  },
  
  getPostById: async (postId: string) => {
    try {
      const response = await apiClient.get(`/api/post/detail/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get post by ID error:', error);
      throw error;
    }
  },
  
  createPost: async (postData: any) => {
    try {
      const response = await apiClient.post('/api/post', postData);
      return response.data;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  },
  
  updatePost: async (postId: string, postData: any) => {
    try {
      const response = await apiClient.put(`/api/post/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  },
  
  deletePost: async (postId: string) => {
    try {
      const response = await apiClient.delete(`/api/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  },
  
  getAllPosts: async () => {
    try {
      const response = await apiClient.get('/posts');
      return response.data;
    } catch (error) {
      console.error('Get all posts error:', error);
      throw error;
    }
  },
  
  getPostDetails: async (postId: string) => {
    try {
      const response = await apiClient.get(`/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get post details error:', error);
      throw error;
    }
  }
};

// Seeker Posts API calls
export const seekerPostsAPI = {
  getAllPosts: async (filters = {}) => {
    try {
      const response = await apiClient.get('/posts', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get all posts error:', error);
      throw error;
    }
  },
  
  getPostById: async (postId: string) => {
    try {
      const response = await apiClient.get(`/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get post by ID error:', error);
      throw error;
    }
  },
  
  searchPosts: async (searchTerm: string) => {
    try {
      const response = await apiClient.get(`/posts/search`, { params: { q: searchTerm } });
      return response.data;
    } catch (error) {
      console.error('Search posts error:', error);
      throw error;
    }
  },
  
  getFilteredPosts: async (filters: any) => {
    try {
      const response = await apiClient.get('/posts/filter', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get filtered posts error:', error);
      throw error;
    }
  },
  
  getRecentPosts: async (limit = 5) => {
    try {
      const response = await apiClient.get('/posts/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Get recent posts error:', error);
      throw error;
    }
  },
  
  getPostsByCategory: async (category: string) => {
    try {
      const response = await apiClient.get(`/posts/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Get posts by category error:', error);
      throw error;
    }
  },
  
  getSavedPosts: async (userId: string) => {
    try {
      const response = await apiClient.get(`/users/${userId}/saved-posts`);
      return response.data;
    } catch (error) {
      console.error('Get saved posts error:', error);
      throw error;
    }
  },
  
  savePost: async (userId: string, postId: string) => {
    try {
      const response = await apiClient.post(`/users/${userId}/saved-posts`, { postId });
      return response.data;
    } catch (error) {
      console.error('Save post error:', error);
      throw error;
    }
  },
  
  unsavePost: async (userId: string, postId: string) => {
    try {
      const response = await apiClient.delete(`/users/${userId}/saved-posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Unsave post error:', error);
      throw error;
    }
  },
  
  getAppliedPosts: async (userId: string) => {
    try {
      const response = await apiClient.get(`/applications/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get applied posts error:', error);
      throw error;
    }
  },
  
  recommendPosts: async (userId: string) => {
    try {
      const response = await apiClient.get(`/users/${userId}/recommended-posts`);
      return response.data;
    } catch (error) {
      console.error('Get recommended posts error:', error);
      throw error;
    }
  }
};

// Applications API calls
export const applicationsAPI = {
  getApplicationsByPost: async (postId: string) => {
    try {
      const response = await apiClient.get(`/api/applications/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get applications by post error:', error);
      throw error;
    }
  },
  
  getApplicationById: async (applicationId: string) => {
    try {
      const response = await apiClient.get(`/api/application/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Get application by ID error:', error);
      throw error;
    }
  },
  
  applyForJob: async (applicationData: any) => {
    try {
      const response = await apiClient.post('/apply', applicationData);
      return response.data;
    } catch (error) {
      console.error('Apply for job error:', error);
      throw error;
    }
  },
  
  updateApplicationStatus: async (applicationId: string, status: string) => {
    try {
      const response = await apiClient.put(`/api/application/${applicationId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  },
  
  getApplicants: async (postId: string) => {
    try {
      const response = await apiClient.get(`/api/applicants/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get applicants error:', error);
      throw error;
    }
  },
  
  getApplicationDetails: async (applicationId: string) => {
    try {
      const response = await apiClient.get(`/api/application/detail/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Get application details error:', error);
      throw error;
    }
  }
};

// Profile API calls
export const profileAPI = {
  getUserProfile: async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },
  
  updateUserProfile: async (userId: string, profileData: any) => {
    try {
      const response = await apiClient.put(`/api/profile/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  },
  
  getUserById: async (userId: string) => {
    try {
      const response = await apiClient.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },
  
  updateUserWithFormData: async (userId: string, formData: FormData) => {
    try {
      const response = await apiClient.post(`/user/${userId}?_method=PUT`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update user with form data error:', error);
      throw error;
    }
  },
  
  uploadProfileImage: async (userId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await apiClient.post(`/user/${userId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload profile image error:', error);
      throw error;
    }
  },
  
  uploadResume: async (userId: string, resumeFile: File) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    
    try {
      const response = await apiClient.post(`/user/${userId}/upload-resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload resume error:', error);
      throw error;
    }
  }
};

// Questions API calls
export const questionsAPI = {
  getQuestions: async (postId: string) => {
    try {
      const response = await apiClient.get(`/api/questions/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get questions error:', error);
      throw error;
    }
  },
  
  addQuestion: async (questionData: any) => {
    try {
      const response = await apiClient.post('/api/questions', questionData);
      return response.data;
    } catch (error) {
      console.error('Add question error:', error);
      throw error;
    }
  },
  
  updateQuestion: async (questionId: string, questionData: any) => {
    try {
      const response = await apiClient.put(`/api/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Update question error:', error);
      throw error;
    }
  },
  
  deleteQuestion: async (questionId: string) => {
    try {
      const response = await apiClient.delete(`/api/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Delete question error:', error);
      throw error;
    }
  },
  
  getQuestionsByPostId: async (postId: string) => {
    try {
      const response = await apiClient.get(`/api/questions/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Get questions by post ID error:', error);
      throw error;
    }
  }
};

// Interview API calls
export const interviewAPI = {
  scheduleInterview: async (interviewData: any) => {
    try {
      const response = await apiClient.post('/api/interviews', interviewData);
      return response.data;
    } catch (error) {
      console.error('Schedule interview error:', error);
      throw error;
    }
  }
};

// LiveKit API calls
export const liveKitAPI = {
  createRoom: async (roomName: string) => {
    try {
      console.log("Creating room with API key:", import.meta.env.VITE_LIVEKIT_API_KEY);
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await apiClient.post(`${baseUrl}/livekit/room`, { 
        room: roomName,
        api_key: import.meta.env.VITE_LIVEKIT_API_KEY,
        api_secret: import.meta.env.VITE_LIVEKIT_API_SECRET
      });
      return response.data;
    } catch (error) {
      console.error('Error creating LiveKit room:', error);
      throw error;
    }
  },
  
  getToken: async (roomName: string, userId: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await apiClient.post(`${baseUrl}/livekit/token`, {
        room: roomName,
        user_id: parseInt(userId, 10),
        api_key: import.meta.env.VITE_LIVEKIT_API_KEY,
        api_secret: import.meta.env.VITE_LIVEKIT_API_SECRET
      });
      return response.data;
    } catch (error) {
      console.error('Error getting LiveKit token:', error);
      throw error;
    }
  }
};

// Chat API calls
export const chatAPI = {
  getMessages: async (senderId: string, receiverId: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await apiClient.get(`${baseUrl}/chat/messages`, {
        params: { sender_id: senderId, receiver_id: receiverId }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  },

  sendMessage: async (messageData: { sender_id: string; receiver_id: string; message: string }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await apiClient.post(`${baseUrl}/chat/send`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }
}; 