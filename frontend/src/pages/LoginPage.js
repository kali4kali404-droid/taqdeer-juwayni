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
import { GraduationCap } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginStudent, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // student inputs
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role === "student") navigate("/student");
  }, [user, navigate]);

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
        school_name: schoolName || "ثانوية الإمام الجويني",
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

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div 
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3A7D86] mb-4 shadow-md shadow-[#3A7D86]/20 cursor-pointer hover:scale-105 transition-all"
            onClick={() => navigate("/")}
            title="العودة للصفحة الرئيسية"
          >
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] leading-relaxed">
            منصة ثانوية الإمام الجويني الإلكترونية
            <br />
            <span className="text-[#3A7D86] text-sm font-semibold">بوابة دخول الطلاب للاختبارات</span>
          </h1>
        </div>

        <Card className="shadow-sm border-gray-100 rounded-2xl">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-xl font-bold text-[#1F2937]">تسجيل دخول الطالب</CardTitle>
            <CardDescription className="text-xs text-[#4B5563] mt-2 font-medium bg-[#E0F2F4]/30 p-2.5 rounded-xl border border-[#3A7D86]/20 leading-relaxed text-[#3A7D86]">
              🌟 مرحباً بك يا بطل المستقبل، يرجى إدخال بياناتك لبدء اختبارك والتحليق نحو التميز.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <form onSubmit={handleStudentLogin} className="space-y-3">
              <Input
                placeholder="كود الدخول "
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="bg-white font-mono text-center text-lg font-bold rounded-xl"
              />

              <Input
                placeholder="اسم الطالب الكامل"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="bg-white text-center text-md rounded-xl"
              />

              <Input
                placeholder="اسم المدرسة "
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="bg-white text-center text-md rounded-xl"
              />

              <Select value={grade} onValueChange={(value) => setGrade(value)}>
                <SelectTrigger className="bg-white text-center text-md justify-center flex items-center gap-1 rounded-xl">
                  <SelectValue placeholder="اختر المرحلة الدراسية" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="text-right">
                  <SelectItem value="اولى ثانوي" className="justify-center text-center">أولى ثانوي</SelectItem>
                  <SelectItem value="ثاني ثانوي" className="justify-center text-center">ثاني ثانوي</SelectItem>
                  <SelectItem value="ثالث ثانوي" className="justify-center text-center">ثالث ثانوي</SelectItem>
                </SelectContent>
              </Select>

              <Button className="w-full bg-[#3A7D86] hover:bg-[#2C6169] text-white font-semibold py-5 rounded-xl shadow-md mt-4 transition-all" disabled={loading}>
                {loading ? "جاري الدخول..." : "بدء الدخول والاختبار"}
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

export default LoginPage;