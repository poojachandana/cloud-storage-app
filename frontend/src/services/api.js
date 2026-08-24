import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401s globally by logging the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ---- Auth ----
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ---- Folders ----
export const folderApi = {
  create: (data) => api.post('/folders', data),
  get: (id) => api.get(`/folders/${id}`),
  contents: (id) => api.get(id ? `/folders/${id}/contents` : '/folders/root/contents'),
  rename: (id, name) => api.put(`/folders/${id}/rename`, { name }),
  move: (id, folderId) => api.put(`/folders/${id}/move`, { folderId }),
  trash: (id) => api.delete(`/folders/${id}`),
  restore: (id) => api.put(`/folders/${id}/restore`),
  search: (q) => api.get('/folders/search', { params: { q } }),
}

// ---- Files ----
export const fileApi = {
  upload: (file, folderId, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) formData.append('folderId', folderId)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    })
  },
  get: (id) => api.get(`/files/${id}`),
  downloadUrl: (id) => `${API_BASE_URL}/files/${id}/download`,
  rename: (id, name) => api.put(`/files/${id}/rename`, { name }),
  move: (id, folderId) => api.put(`/files/${id}/move`, { folderId }),
  trash: (id) => api.delete(`/files/${id}`),
  restore: (id) => api.put(`/files/${id}/restore`),
  deletePermanently: (id) => api.delete(`/files/${id}/permanent`),
  star: (id) => api.put(`/files/${id}/star`),
  unstar: (id) => api.put(`/files/${id}/unstar`),
  starred: () => api.get('/files/starred'),
  search: (q, type, dateFrom, dateTo) =>
    api.get('/files/search', { params: { q, type, dateFrom, dateTo } }),
}

// ---- Trash ----
export const trashApi = {
  get: () => api.get('/trash'),
}

// ---- Shares ----
export const shareApi = {
  share: (data) => api.post('/shares', data),
  sharedWithMe: () => api.get('/shares/shared-with-me'),
  sharesForFile: (fileId) => api.get(`/shares/file/${fileId}`),
  revoke: (shareId) => api.delete(`/shares/${shareId}`),
}

// ---- Public links ----
export const publicLinkApi = {
  create: (data) => api.post('/public-links', data),
  downloadUrl: (token, password) => {
    const url = `${API_BASE_URL}/public-links/${token}/download`
    return password ? `${url}?password=${encodeURIComponent(password)}` : url
  },
}

// ---- Admin ----
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  setUserStatus: (id, active) => api.put(`/admin/users/${id}/status`, { active }),
  getFiles: () => api.get('/admin/files'),
  deleteFile: (id) => api.delete(`/admin/files/${id}`),
  getStats: () => api.get('/admin/stats'),
}
