import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth APIs
export const initAdmin = () => axios.post(`${API}/init-admin`);
export const initStudentAccount = () => axios.post(`${API}/init-student-account`);

// User APIs
export const getUsers = () => axios.get(`${API}/users`);
export const getUser = (id) => axios.get(`${API}/users/${id}`);
export const createUser = (data) => axios.post(`${API}/auth/register`, data);
export const updateUser = (id, data) => axios.put(`${API}/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`${API}/users/${id}`);

// Exam APIs
export const getExams = () => axios.get(`${API}/exams`);
export const getExam = (id) => axios.get(`${API}/exams/${id}`);
export const createExam = (data) => axios.post(`${API}/exams`, data);
export const updateExam = (id, data) => axios.put(`${API}/exams/${id}`, data);
export const deleteExam = (id) => axios.delete(`${API}/exams/${id}`);
export const publishExam = (id) => axios.post(`${API}/exams/${id}/publish`);
export const closeExam = (id) => axios.post(`${API}/exams/${id}/close`);
export const updateSectionTime = (data) => axios.put(`${API}/exams/section-time`, data);

// Question APIs
export const getQuestions = (examId, section) => {
  const params = new URLSearchParams();
  if (examId) params.append("exam_id", examId);
  if (section) params.append("section", section);
  return axios.get(`${API}/questions?${params.toString()}`);
};
export const getQuestion = (id) => axios.get(`${API}/questions/${id}`);
export const createQuestion = (data) => axios.post(`${API}/questions`, data);
export const updateQuestion = (id, data) => axios.put(`${API}/questions/${id}`, data);
export const deleteQuestion = (id) => axios.delete(`${API}/questions/${id}`);

// Student Exam APIs
export const startStudentExam = (data) => axios.post(`${API}/student-exams/start`, data);
export const submitAnswer = (data) => axios.post(`${API}/student-exams/answer`, data);
export const moveToNextSection = (id) => axios.post(`${API}/student-exams/${id}/next-section`);
export const completeExam = (id) => axios.post(`${API}/student-exams/${id}/complete`);
export const getStudentExam = (id) => axios.get(`${API}/student-exams/${id}`);
export const getStudentExams = (examId) => {
  const params = examId ? `?exam_id=${examId}` : "";
  return axios.get(`${API}/student-exams${params}`);
};
export const getMyResults = () => axios.get(`${API}/student-exams/my/results`);

// Grading APIs
export const assignGrade = (data) => axios.post(`${API}/grades/assign`, data);
export const releaseGrade = (id) => axios.post(`${API}/grades/release/${id}`);
export const calculateGrade = (id) => axios.post(`${API}/grades/calculate/${id}`);

// Dashboard APIs
export const getDashboardStats = () => axios.get(`${API}/dashboard/stats`);
export const getExamProgress = (examId) => axios.get(`${API}/dashboard/exam-progress/${examId}`);
