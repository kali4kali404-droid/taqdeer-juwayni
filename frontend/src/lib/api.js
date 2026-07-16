import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= TOKEN =================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ================= AUTH =================
export const initAdmin = () => API.post("/init-admin");
export const login = (data) => API.post("/auth/login", data);
export const me = () => API.get("/auth/me");
export const loginStudent = (data) => API.post("/auth/student-login", data);
export const createStudentCode = () => API.post("/admin/student-code");

// ================= DASHBOARD =================
export const getDashboardStats = () => API.get("/dashboard/stats");

// ================= USERS =================
export const getUsers = () => API.get("/users");
export const getUser = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post("/users", data); 
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// ================= EXAMS =================
export const getExams = () => API.get("/exams");
export const getExam = (id) => API.get(`/exams/${id}`);
export const createExam = (data) => API.post("/exams", data);
export const updateExam = (id, data) => API.put(`/exams/${id}`, data);
export const deleteExam = (id) => API.delete(`/exams/${id}`);
export const publishExam = (id) => API.post(`/exams/${id}/publish`);
export const closeExam = (id) => API.post(`/exams/${id}/close`);
export const updateSectionTime = (data) => API.put("/exams/section-time", data);

// ================= QUESTIONS =================
export const getQuestions = (examId, section) =>
  API.get(`/questions?exam_id=${examId || ""}&section=${section || ""}`);
export const getQuestionHint = (questionId) =>
  API.get(`/questions/${questionId}/hint`);
export const createQuestion = (data) => API.post("/questions", data);
export const updateQuestion = (id, data) => API.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);
export const deleteAllQuestions = (examId) => API.delete("/questions", { params: { exam_id: examId || null } }); 

// ================= STUDENT EXAM =================
export const getStudentExams = () => API.get("/student-exams");
export const getStudentExam = (id) => API.get(`/student-exams/${id}`);
export const startStudentExam = (data) => API.post("/student-exams/start", data);
export const submitAnswer = (data) => API.post("/student-exams/answer", data);
export const moveToNextSection = (id) => API.post(`/student-exams/${id}/next-section`);
export const completeExam = (id) => API.post(`/student-exams/${id}/complete`);
export const submitSection = (data) => API.post("/student/submit-section", data);

// ================= GRADES =================
export const getGrades = (examId) =>
  API.get(`/grades${examId ? `?exam_id=${examId}` : ""}`);

// ميزة التحميل التلقائي الدفاعي والآمن لملفات الإكسل لضمان حل "Not authenticated"
export const exportGradesExcel = (examId) => {
  API.get(`/grades/export/excel${examId ? `?exam_id=${examId}` : ""}`, { responseType: 'blob' })
    .then((res) => {
      const objectUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.setAttribute("download", "grades.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    })
    .catch(err => {
      console.error("Excel download error:", err);
      toast.error("فشل تحميل ملف Excel للدرجات، تأكد من صلاحية الجلسة");
    });
};

// ميزة التحميل التلقائي الدفاعي والآمن لملفات الـ PDF لضمان حل "Not authenticated"
export const exportGradesPDF = (examId) => {
  API.get(`/grades/export/pdf${examId ? `?exam_id=${examId}` : ""}`, { responseType: 'blob' })
    .then((res) => {
      const objectUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.setAttribute("download", "grades.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    })
    .catch(err => {
      console.error("PDF download error:", err);
      toast.error("فشل تحميل ملف PDF للدرجات، تأكد من صلاحية الجلسة");
    });
};

// ================= حذف وتصفير النتائج =================
export const deleteResults = (examId) =>
  API.delete("/results", { data: { exam_id: examId || null } });

// ================= تصفير النظام بالكامل ⚡ =================
export const superResetSystem = () => API.post("/admin/super-reset"); // 🚀 دالة تصفير اللوحة بالكامل المضافة حديثاً

// ================= GRADES (قديم للتوافق) =================
export const assignGrade = (data) => API.post("/grades/assign", data);
export const calculateGrade = (id) => API.post(`/grades/calculate/${id}`);