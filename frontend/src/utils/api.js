// frontend/src/utils/api.js
import { showNotification } from './helpers.js';

/**
 * API Configuration
 */
const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000 // 1 second
};

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * API Error Class
 */
class ApiError extends Error {
    constructor(message, status, code, details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

/**
 * Request interceptor to add common headers
 */
function addRequestHeaders(options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    headers['X-Request-ID'] = crypto.randomUUID?.() || Date.now().toString();

    return { ...options, headers };
}

/**
 * Response interceptor to handle common scenarios
 */
async function handleResponse(response) {
    // Handle different content types
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    // Handle HTTP errors
    if (!response.ok) {
        const errorMessage = data?.error?.message || data?.message || `HTTP ${response.status}`;
        
        // Handle specific status codes
        switch (response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
                // Clear auth token and redirect to login
                localStorage.removeItem('authToken');
                window.dispatchEvent(new CustomEvent('auth:logout'));
                throw new ApiError('Authentication required', response.status, 'UNAUTHORIZED');
                
            case HTTP_STATUS.FORBIDDEN:
                throw new ApiError('Access forbidden', response.status, 'FORBIDDEN');
                
            case HTTP_STATUS.NOT_FOUND:
                throw new ApiError('Resource not found', response.status, 'NOT_FOUND');
                
            case HTTP_STATUS.TOO_MANY_REQUESTS:
                const retryAfter = response.headers.get('Retry-After');
                throw new ApiError(
                    `Rate limit exceeded. Try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}`,
                    response.status,
                    'RATE_LIMITED',
                    { retryAfter }
                );
                
            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                throw new ApiError('Server error occurred', response.status, 'SERVER_ERROR');
                
            default:
                throw new ApiError(errorMessage, response.status, 'API_ERROR', data);
        }
    }

    return data;
}

/**
 * Retry logic for failed requests
 */
async function withRetry(fn, retries = API_CONFIG.retries, delay = API_CONFIG.retryDelay) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0 && isRetryableError(error)) {
            await sleep(delay);
            return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
        }
        throw error;
    }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
    return error.status >= 500 || error.status === 429 || error.name === 'TypeError';
}

/**
 * Sleep utility for retries
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Base fetch wrapper with timeout
 */
async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new ApiError('Request timeout', 408, 'TIMEOUT');
        }
        
        throw error;
    }
}

/**
 * Core API request function
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const requestOptions = addRequestHeaders(options);

    const makeRequest = async () => {
        const response = await fetchWithTimeout(url, requestOptions);
        return handleResponse(response);
    };

    return withRetry(makeRequest);
}

/**
 * HTTP Methods
 */
export const api = {
    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const searchParams = new URLSearchParams(params);
        const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
        
        return apiRequest(url, {
            method: 'GET'
        });
    },

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * PATCH request
     */
    async patch(endpoint, data = {}) {
        return apiRequest(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return apiRequest(endpoint, {
            method: 'DELETE'
        });
    },

    /**
     * Upload file
     */
    async upload(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional data
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        return apiRequest(endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }
};

/**
 * Specific API endpoints
 */
export const regexApi = {
    /**
     * Test regex pattern
     */
    async test(pattern, text, flags = '') {
        try {
            const result = await api.post('/regex/test', {
                pattern,
                text,
                flags
            });
            
            return result;
        } catch (error) {
            console.error('Regex test failed:', error);
            throw error;
        }
    },

    /**
     * Explain regex pattern
     */
    async explain(pattern) {
        try {
            return await api.post('/regex/explain', { pattern });
        } catch (error) {
            console.error('Pattern explanation failed:', error);
            throw error;
        }
    },

    /**
     * Analyze pattern performance
     */
    async analyze(pattern, text, flags = '') {
        try {
            return await api.post('/regex/analyze', {
                pattern,
                text,
                flags
            });
        } catch (error) {
            console.error('Pattern analysis failed:', error);
            throw error;
        }
    }
};

export const patternsApi = {
    /**
     * Get all patterns
     */
    async getAll(category = null, search = null) {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;
        
        return api.get('/patterns', params);
    },

    /**
     * Get pattern by ID
     */
    async getById(id) {
        return api.get(`/patterns/${id}`);
    },

    /**
     * Save new pattern
     */
    async create(pattern) {
        return api.post('/patterns', pattern);
    },

    /**
     * Update pattern
     */
    async update(id, pattern) {
        return api.put(`/patterns/${id}`, pattern);
    },

    /**
     * Delete pattern
     */
    async delete(id) {
        return api.delete(`/patterns/${id}`);
    },

    /**
     * Get user's saved patterns
     */
    async getMine() {
        return api.get('/patterns/mine');
    }
};

export const authApi = {
    /**
     * Login user
     */
    async login(email, password) {
        try {
            const result = await api.post('/auth/login', { email, password });
            
            if (result.token) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                window.dispatchEvent(new CustomEvent('auth:login', {
                    detail: { user: result.user, token: result.token }
                }));
            }
            
            return result;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * Register user
     */
    async register(userData) {
        try {
            const result = await api.post('/auth/register', userData);
            
            if (result.token) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                window.dispatchEvent(new CustomEvent('auth:register', {
                    detail: { user: result.user, token: result.token }
                }));
            }
            
            return result;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    },

    /**
     * Get current user
     */
    async me() {
        return api.get('/auth/me');
    },

    /**
     * Refresh token
     */
    async refresh() {
        try {
            const result = await api.post('/auth/refresh');
            
            if (result.token) {
                localStorage.setItem('authToken', result.token);
            }
            
            return result;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }
};

/**
 * Health check
 */
export const healthApi = {
    async check() {
        return fetch('/health').then(res => res.json());
    }
};

/**
 * Request interceptor for analytics
 */
function trackApiCall(endpoint, method, duration, success) {
    // Track API usage for analytics
    if (window.gtag) {
        window.gtag('event', 'api_call', {
            endpoint,
            method,
            duration,
            success
        });
    }
}

/**
 * Global error handler for API calls
 */
export function handleApiError(error, showToUser = true) {
    console.error('API Error:', error);

    if (showToUser) {
        let message = 'An error occurred';
        
        if (error instanceof ApiError) {
            switch (error.code) {
                case 'UNAUTHORIZED':
                    message = 'Please log in to continue';
                    break;
                case 'FORBIDDEN':
                    message = 'You don\'t have permission to do this';
                    break;
                case 'NOT_FOUND':
                    message = 'The requested resource was not found';
                    break;
                case 'RATE_LIMITED':
                    message = 'Too many requests. Please wait a moment';
                    break;
                case 'TIMEOUT':
                    message = 'Request timed out. Please try again';
                    break;
                default:
                    message = error.message || 'Something went wrong';
            }
        } else {
            message = 'Network error. Please check your connection';
        }

        showNotification(message, 'error');
    }

    return error;
}

/**
 * Setup global error handling
 */
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof ApiError) {
        handleApiError(event.reason, true);
        event.preventDefault();
    }
});

/**
 * Auth state management
 */
export const auth = {
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    },

    getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    getToken() {
        return localStorage.getItem('authToken');
    }
};

console.log('✅ API client initialized');

export default api;