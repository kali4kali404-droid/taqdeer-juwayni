import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getDashboardStats } from "@/lib/api";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  LogOut,
  GraduationCap,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import ExamManagement from "@/components/admin/ExamManagement";
import QuestionManagement from "@/components/admin/QuestionManagement";
import ExamMonitoring from "@/components/admin/ExamMonitoring";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const navItems = [
    { path: "/teacher", label: "لوحة التحكم", icon: LayoutDashboard },
    { path: "/teacher/exams", label: "إدارة الاختبارات", icon: FileText },
    { path: "/teacher/questions", label: "إدارة الأسئلة", icon: HelpCircle },
    { path: "/teacher/monitoring", label: "مراقبة الاختبارات", icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === "/teacher") {
      return location.pathname === "/teacher";
    }
    return location.pathname.startsWith(path);
  };

  const DashboardHome = () => (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F2937]">مرحباً، {user?.full_name}</h1>
        <p className="text-[#4B5563] mt-1">لوحة تحكم المعلم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="stats-card border-t-4 border-t-[#3A7D86]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">الاختبارات المنشورة</p>
                <p className="text-3xl font-bold text-[#1F2937]">{stats?.published_exams || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#E0F2F4] flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#3A7D86]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card border-t-4 border-t-[#F59E0B]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">قيد التنفيذ</p>
                <p className="text-3xl font-bold text-[#1F2937]">{stats?.in_progress || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#F59E0B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card border-t-4 border-t-[#10B981]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">مكتملة</p>
                <p className="text-3xl font-bold text-[#1F2937]">{stats?.completed_submissions || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1F2937]">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            data-testid="teacher-quick-exams-btn"
            onClick={() => navigate("/teacher/exams")}
            className="justify-start bg-[#3A7D86] hover:bg-[#2C6169] h-auto py-4"
          >
            <FileText className="w-5 h-5 ml-2" />
            <div className="text-right">
              <p className="font-medium">إدارة الاختبارات</p>
              <p className="text-xs opacity-80">إنشاء وتعديل الاختبارات</p>
            </div>
          </Button>
          <Button
            data-testid="teacher-quick-questions-btn"
            onClick={() => navigate("/teacher/questions")}
            variant="outline"
            className="justify-start border-[#3A7D86] text-[#3A7D86] hover:bg-[#E0F2F4] h-auto py-4"
          >
            <HelpCircle className="w-5 h-5 ml-2" />
            <div className="text-right">
              <p className="font-medium">إدارة الأسئلة</p>
              <p className="text-xs opacity-70">إضافة وتعديل الأسئلة</p>
            </div>
          </Button>
          <Button
            data-testid="teacher-quick-monitoring-btn"
            onClick={() => navigate("/teacher/monitoring")}
            variant="outline"
            className="justify-start border-[#D4A373] text-[#D4A373] hover:bg-[#FDF3E7] h-auto py-4"
          >
            <BarChart3 className="w-5 h-5 ml-2" />
            <div className="text-right">
              <p className="font-medium">مراقبة الاختبارات</p>
              <p className="text-xs opacity-70">متابعة تقدم الطلاب</p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">منصة ثانوية الإمام الجويني</h2>
            <p className="text-sm opacity-80">لوحة المعلم</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              data-testid={`teacher-nav-${item.path.split("/").pop() || "dashboard"}`}
              onClick={() => navigate(item.path)}
              className={`nav-item w-full ${isActive(item.path) ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg font-bold">{user?.full_name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-sm opacity-80">معلم</p>
            </div>
          </div>
          <button
            data-testid="teacher-logout-btn"
            onClick={handleLogout}
            className="nav-item w-full text-red-200 hover:bg-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="exams/*" element={<ExamManagement />} />
          <Route path="questions/*" element={<QuestionManagement />} />
          <Route path="monitoring/*" element={<ExamMonitoring />} />
        </Routes>
      </main>
    </div>
  );
};

export default TeacherDashboard;
