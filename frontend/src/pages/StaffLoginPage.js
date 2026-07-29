import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

const StaffLoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "teacher") navigate("/teacher");
  }, [user, navigate]);

  const handleStaffLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("اكتب اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const res = await login({ username, password });

      if (!res?.success) {
        throw new Error(res?.error || "فشل تسجيل الدخول");
      }

      toast.success("تم تسجيل الدخول بنجاح");

    } catch (err) {
      toast.error(err.message || "خطأ في تسجيل الدخول");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] p-6" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div 
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2C6169] to-[#3A7D86] mb-4 shadow-md shadow-[#3A7D86]/20 cursor-pointer hover:scale-105 transition-all"
            onClick={() => navigate("/")}
            title="العودة للصفحة الرئيسية"
          >
            <ShieldAlert className="text-white w-8 h-8" />
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] leading-relaxed">
            منصة ثانوية الإمام الجويني الإلكترونية
            <br />
            <span className="text-[#D4A373] text-sm font-semibold">بوابة المشرفين والكادر التعليمي</span>
          </h1>
        </div>

        <Card className="shadow-sm border-gray-100 rounded-2xl">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-xl font-bold text-[#1F2937]">تسجيل دخول الكادر</CardTitle>
            <CardDescription className="text-xs text-[#4B5563] mt-2 font-medium bg-[#FDF3E7] p-2.5 rounded-xl border border-[#D4A373]/20 leading-relaxed text-[#D4A373]">
              💐 مرحباً بك يا قائد التميز، يرجى تسجيل الدخول بالاسم وكلمة المرور لإدارة وضبط الاختبارات ورصد الدرجات.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <form onSubmit={handleStaffLogin} className="space-y-3">
              <Input
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white text-center rounded-xl"
              />

              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-center rounded-xl"
              />

              <Button className="w-full bg-[#3A7D86] hover:bg-[#2C6169] text-white font-semibold py-5 rounded-xl transition-all shadow-md" disabled={loading}>
                {loading ? "جاري التحميل..." : "دخول لوحة التحكم"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <button 
            onClick={() => navigate("/")} 
            className="text-xs text-gray-500 hover:text-[#3A7D86] font-semibold transition-colors"
          >
            ← العودة للصفحة التعريفية الرئيسية
          </button>
        </div>

      </div>
    </div>
  );
};

export default StaffLoginPage;