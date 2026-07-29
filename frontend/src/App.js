import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LandingPage from "@/pages/LandingPage"; // استيراد الصفحة التعريفية الجديدة لتفتح أولاً
import LoginPage from "@/pages/LoginPage";
import StaffLoginPage from "@/pages/StaffLoginPage"; // 🚀 استيراد صفحة المشرفين والمعلمين المنفصلة
import AdminDashboard from "@/pages/AdminDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import ExamInstructions from "@/pages/ExamInstructions";
import ExamInterface from "@/pages/ExamInterface";
import ExamCompletion from "@/pages/ExamCompletion";

// 🟢 NEW PAGE (Student Code Admin)
import AdminStudentCodes from "@/pages/AdminStudentCodes";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>جاري التحميل...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>جاري التحميل...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher" replace />;
  if (user.role === "student") return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <div dir="rtl">
        <BrowserRouter>
          <Routes>
            {/* جعل المسار الرئيسي للموقع يفتح الصفحة الترحيبية والتعريفية لثانوية الإمام الجويني */}
            <Route path="/" element={<LandingPage />} />
            
            {/* بوابة الطلاب المستقلة */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🚀 بوابة المعلمين والمشرفين المنفصلة والآمنة تماماً */}
            <Route path="/staff-login" element={<StaffLoginPage />} />

            {/* ADMIN */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 🟢 NEW: Student Codes Page */}
            <Route
              path="/admin/codes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminStudentCodes />
                </ProtectedRoute>
              }
            />

            {/* TEACHER */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            {/* STUDENT */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* EXAMS */}
            <Route
              path="/exam/:examId/instructions"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ExamInstructions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exam/:studentExamId/take"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ExamInterface />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exam/completed"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ExamCompletion />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>

        <Toaster position="top-left" />
      </div>
    </AuthProvider>
  );
}

export default App;