import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getDashboardStats,
  getExams,
  getUsers,
} from "@/lib/api";
import {
  LayoutDashboard,
  FileText,
  Users,
  HelpCircle,
  LogOut,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import ExamManagement from "@/components/admin/ExamManagement";
import QuestionManagement from "@/components/admin/QuestionManagement";
import UserManagement from "@/components/admin/UserManagement";
import ExamMonitoring from "@/components/admin/ExamMonitoring";

const AdminDashboard = () => {
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
    { path: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    { path: "/admin/exams", label: "إدارة الاختبارات", icon: FileText },
    { path: "/admin/questions", label: "إدارة الأسئلة", icon: HelpCircle },
    { path: "/admin/users", label: "إدارة المستخدمين", icon: Users },
    { path: "/admin/monitoring", label: "مراقبة الاختبارات", icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const DashboardHome = () => (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F2937]">مرحباً، {user?.full_name}</h1>
        <p className="text-[#4B5563] mt-1">لوحة تحكم المشرف العام</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stats-card border-t-4 border-t-[#3A7D86]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">إجمالي الاختبارات</p>
                <p className="text-3xl font-bold text-[#1F2937]">{stats?.total_exams || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#E0F2F4] flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#3A7D86]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card border-t-4 border-t-[#D4A373]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">الأسئلة</p>
                <p className="text-3xl font-bold text-[#1F2937]">{stats?.total_questions || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FDF3E7] flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-[#D4A373]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card border-t-4 border-t-[#10B981]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">الطلاب</p>
                <p className="text-3xl font-bold text-[#1F2937]">{stats?.total_students || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card border-t-4 border-t-[#3B82F6]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4B5563]">الاختبارات المكتملة</p>
                <p className="text-3xl font-bold text-[#1F2937]">{stats?.completed_submissions || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#3B82F6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#1F2937]">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              data-testid="quick-create-exam-btn"
              onClick={() => navigate("/admin/exams")}
              className="w-full justify-start bg-[#3A7D86] hover:bg-[#2C6169]"
            >
              <FileText className="w-5 h-5 ml-2" />
              إنشاء اختبار جديد
            </Button>
            <Button
              data-testid="quick-add-question-btn"
              onClick={() => navigate("/admin/questions")}
              variant="outline"
              className="w-full justify-start border-[#3A7D86] text-[#3A7D86] hover:bg-[#E0F2F4]"
            >
              <HelpCircle className="w-5 h-5 ml-2" />
              إضافة أسئلة
            </Button>
            <Button
              data-testid="quick-add-user-btn"
              onClick={() => navigate("/admin/users")}
              variant="outline"
              className="w-full justify-start border-[#D4A373] text-[#D4A373] hover:bg-[#FDF3E7]"
            >
              <Users className="w-5 h-5 ml-2" />
              إضافة مستخدم
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#1F2937]">ملخص النشاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#F3F4F6] rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-[#4B5563]">اختبارات قيد التنفيذ</span>
                </div>
                <span className="font-bold text-[#1F2937]">{stats?.in_progress || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F3F4F6] rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#3A7D86]" />
                  <span className="text-[#4B5563]">اختبارات منشورة</span>
                </div>
                <span className="font-bold text-[#1F2937]">{stats?.published_exams || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F3F4F6] rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <span className="text-[#4B5563]">إجمالي التقديمات</span>
                </div>
                <span className="font-bold text-[#1F2937]">{stats?.total_submissions || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
            <h2 className="font-bold text-lg">تقدير</h2>
            <p className="text-sm opacity-80">لوحة المشرف</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              data-testid={`nav-${item.path.split("/").pop() || "dashboard"}`}
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
              <p className="text-sm opacity-80">مشرف</p>
            </div>
          </div>
          <button
            data-testid="logout-btn"
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
          <Route path="users/*" element={<UserManagement />} />
          <Route path="monitoring/*" element={<ExamMonitoring />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
