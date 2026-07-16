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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { initAdmin } from "@/lib/api";
import { GraduationCap } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginStudent, setUser, user } = useAuth();

  const [tab, setTab] = useState("staff");
  const [loading, setLoading] = useState(false);

  // staff
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // student
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolName, setSchoolName] = useState(""); // 🚀 إضافة حقل اسم المدرسة للطلاب

  useEffect(() => {
    const init = async () => {
      try {
        await initAdmin();
      } catch {}
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "teacher") navigate("/teacher");
    else if (user.role === "student") navigate("/student");
  }, [user]);

  // ================= STAFF LOGIN =================
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

  // ================= STUDENT LOGIN =================
  const handleStudentLogin = async (e) => {
    e.preventDefault();

    if (!code || !studentName || !grade) {
      toast.error("الرجاء إكمال جميع البيانات المطلوبة للبدء");
      return;
    }

    setLoading(true);

    try {
      const res = await loginStudent({
        code,
        student_name: studentName,
        grade,
        class_name: "عام", 
        school_name: schoolName || "ثانوية الإمام الجويني", // 🚀 تمرير اسم المدرسة أو الافتراضي
      });

      if (!res?.success) {
        throw new Error(res?.error || "خطأ في تسجيل دخول الطالب");
      }

      toast.success("تم دخول الطالب بنجاح، بالتوفيق!");
      navigate("/student");

    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] p-6" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#3A7D86] mb-4 shadow-sm">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] leading-relaxed">
            منصة ثانوية الإمام الجويني الإلكترونية
            <br />
            <span className="text-[#3A7D86] text-sm font-semibold">لاختبارات القدرات والتحصيلي</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1 border">
          <button
            onClick={() => setTab("staff")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "staff" ? "bg-white shadow text-[#3A7D86]" : "text-gray-500"
            }`}
          >
            مشرف / معلم
          </button>

          <button
            onClick={() => setTab("student")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "student" ? "bg-white shadow text-[#3A7D86]" : "text-gray-500"
            }`}
          >
            طالب
          </button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-xl font-bold text-[#1F2937]">تسجيل الدخول</CardTitle>
            
            <CardDescription className="text-xs text-[#4B5563] mt-2 font-medium bg-gray-50 p-2.5 rounded-md border border-gray-100 leading-relaxed">
              {tab === "staff" ? (
                <span className="text-[#3A7D86] block text-center">
                  💐 مرحباً بك يا قائد التميز، يرجى تسجيل الدخول لإدارة الاختبارات ورصد الدرجات.
                </span>
              ) : (
                <span className="text-[#3A7D86] block text-center">
                  🌟 مرحباً بك يا بطل المستقبل، يرجى إدخال بياناتك لبدء اختبارك والتحليق نحو التميز.
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">

            {/* STAFF LOGIN FORM */}
            {tab === "staff" && (
              <form onSubmit={handleStaffLogin} className="space-y-3">
                <Input
                  placeholder="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white text-center"
                />

                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white text-center"
                />

                <Button className="w-full bg-[#3A7D86] hover:bg-[#2C6169] text-white font-semibold" disabled={loading}>
                  {loading ? "جاري الدخول..." : "دخول"}
                </Button>
              </form>
            )}

            {/* STUDENT LOGIN FORM */}
            {tab === "student" && (
              <form onSubmit={handleStudentLogin} className="space-y-3">
                {/* كود الدخول - ممركز وبخط منسق */}
                <Input
                  placeholder="كود الدخول"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="bg-white font-mono text-center text-lg font-bold"
                />

                {/* اسم الطالب - ممركز وبخط منسق */}
                <Input
                  placeholder="اسم الطالب"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="bg-white text-center text-md"
                />

                {/* اسم المدرسة - حقل اختياري وممركز بالكامل 🚀 */}
                <Input
                  placeholder="اسم المدرسة"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="bg-white text-center text-md"
                />

                {/* المرحلة - قائمة خيارات منسدلة ثلاثية ممركزة ومرتبة بشكل ممتاز */}
                <Select value={grade} onValueChange={(value) => setGrade(value)}>
                  <SelectTrigger className="bg-white text-center text-md justify-center flex items-center gap-1">
                    <SelectValue placeholder="اختر المرحلة الدراسية" />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="text-right">
                    <SelectItem value="اولى ثانوي" className="justify-center text-center">أولى ثانوي</SelectItem>
                    <SelectItem value="ثاني ثانوي" className="justify-center text-center">ثاني ثانوي</SelectItem>
                    <SelectItem value="ثالث ثانوي" className="justify-center text-center">ثالث ثانوي</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="w-full bg-[#3A7D86] hover:bg-[#2C6169] text-white font-semibold mt-4" disabled={loading}>
                  {loading ? "جاري الدخول..." : "دخول الطالب"}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LoginPage;