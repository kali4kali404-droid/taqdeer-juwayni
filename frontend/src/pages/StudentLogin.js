import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // استدعاء نظام الحماية والذاكرة الموحدة للموقع 🚀
import { useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const [code, setCode] = useState("");
  const [student_name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [class_name, setClass] = useState("");

  const navigate = useNavigate();
  // جلب دالة تسجيل دخول الطالب الذكية والموحدة من الـ AuthContext 🚀
  const { loginStudent } = useAuth();

  const handleLogin = async () => {
    if (!code || !student_name || !grade || !class_name) {
      alert("⚠️ الرجاء إكمال جميع البيانات المطلوبة");
      return;
    }

    try {
      // استدعاء الدالة الموحدة لتحديث الذاكرة النشطة وصلاحيات المتصفح في نفس اللحظة
      const res = await loginStudent({
        code,
        student_name,
        grade,
        class_name,
      });

      if (!res?.success) {
        throw new Error(res?.error || "الكود غير صحيح أو غير مفعل");
      }

      // الانتقال الفوري والمباشر دون الحاجة لتحديث الصفحة
      navigate("/student");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }} dir="rtl" className="text-right">
      <h2 className="text-xl font-bold mb-4">دخول الطالب</h2>

      <input
        placeholder="كود الدخول"
        onChange={(e) => setCode(e.target.value)}
        className="border p-2 rounded mb-2 w-full max-w-xs font-mono"
      />
      <br />

      <input
        placeholder="اسم الطالب"
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded mb-2 w-full max-w-xs"
      />
      <br />

      <input
        placeholder="الصف"
        onChange={(e) => setGrade(e.target.value)}
        className="border p-2 rounded mb-2 w-full max-w-xs"
      />
      <br />

      <input
        placeholder="الفصل"
        onChange={(e) => setClass(e.target.value)}
        className="border p-2 rounded mb-4 w-full max-w-xs"
      />
      <br />

      <button 
        onClick={handleLogin}
        style={{
          padding: "8px 24px",
          background: "#3A7D86",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        دخول
      </button>
    </div>
  );
}