import api from './axios';

export const processTextNotice = (text) =>
  api.post('/notices/process', { text }).then((r) => r.data);

export const processFileNotice = (file, pastedText) => {
  const form = new FormData();
  form.append('file', file);
  if (pastedText) form.append('text', pastedText);
  return api
    .post('/notices/process', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
};

export const fetchHistory = (search) =>
  api.get('/notices', { params: search ? { search } : {} }).then((r) => r.data);

export const fetchNoticeById = (id) => api.get(`/notices/${id}`).then((r) => r.data);

export const toggleChecklistItem = (id, index, done) =>
  api.patch(`/notices/${id}/checklist/${index}`, { done }).then((r) => r.data);

export const deleteNotice = (id) => api.delete(`/notices/${id}`).then((r) => r.data);

export const createShareLink = (id) => api.post(`/notices/${id}/share`).then((r) => r.data);

export const fetchSharedNotice = (shareId) =>
  api.get(`/notices/share/${shareId}`).then((r) => r.data);

export const calendarDownloadUrl = (id) =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notices/${id}/calendar.ics`;
