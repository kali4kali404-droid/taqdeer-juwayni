import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { initAdmin, initStudentAccount } from "@/lib/api";
import { BookOpen, User, Lock, GraduationCap } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize accounts on first load
    const initAccounts = async () => {
      try {
        await initAdmin();
        await initStudentAccount();
      } catch (error) {
        // Accounts may already exist
      }
    };
    initAccounts();
  }, []);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "student":
          navigate("/student");
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(username, password);

    if (result.success) {
      toast.success("تم تسجيل الدخول بنجاح");
    } else {
      toast.error(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="login-split">
      {/* Left Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-[#F9FAFB]">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3A7D86] mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F2937]">تقدير</h1>
            <p className="text-[#4B5563] mt-2">ثانوية الإمام الجويني</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-semibold text-[#1F2937]">
                تسجيل الدخول
              </CardTitle>
              <CardDescription className="text-[#4B5563]">
                أدخل بيانات الدخول للمتابعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#1F2937]">
                    اسم المستخدم
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <Input
                      id="username"
                      data-testid="login-username-input"
                      type="text"
                      placeholder="أدخل اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pr-10 text-right"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#1F2937]">
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <Input
                      id="password"
                      data-testid="login-password-input"
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 text-right"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  data-testid="login-submit-button"
                  className="w-full bg-[#3A7D86] hover:bg-[#2C6169] text-white rounded-full py-6"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
                </Button>
              </form>

              {/* Default Credentials Info */}
              <div className="mt-6 p-4 bg-[#E0F2F4] rounded-lg">
                <p className="text-sm text-[#3A7D86] font-medium mb-2">بيانات الدخول الافتراضية:</p>
                <div className="space-y-1 text-sm text-[#4B5563]">
                  <p>المشرف: admin / admin123</p>
                  <p>الطالب: student / student123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Image */}
      <div 
        className="login-image relative bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1712366786881-e080e66fbf7e?crop=entropy&cs=srgb&fm=jpg&q=85')`
        }}
      >
        <div className="absolute inset-0 bg-[#3A7D86]/80" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-8">
          <BookOpen className="w-20 h-20 mb-6" />
          <h2 className="text-4xl font-bold mb-4 text-center">نظام الاختبارات الإلكتروني</h2>
          <p className="text-xl text-center opacity-90 max-w-md">
            منصة متكاملة لإدارة وتنفيذ الاختبارات بكفاءة عالية
          </p>
          
          {/* Features */}
          <div className="mt-12 grid gap-4 max-w-md">
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <span>متابعة مباشرة لتقدم الطلاب</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">⏱️</span>
              </div>
              <span>توقيت تلقائي لكل قسم</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <span>تصحيح آلي وفوري</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
