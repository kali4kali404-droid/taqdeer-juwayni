import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getExam, startStudentExam } from "@/lib/api";
import {
  AlertCircle,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Timer,
  FileText,
  GraduationCap,
} from "lucide-react";

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState(user?.full_name || "");
  const [studentPhone, setStudentPhone] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await getExam(examId);
      setExam(response.data);
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast.error("حدث خطأ في تحميل الاختبار");
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!studentName.trim()) {
      toast.error("الرجاء إدخال اسمك الكامل");
      return;
    }

    setStarting(true);
    try {
      const response = await startStudentExam({
        exam_id: examId,
        student_name: studentName,
        student_phone: studentPhone,
      });
      toast.success("تم بدء الاختبار بنجاح");
      navigate(`/exam/${response.data.id}/take`);
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error(error.response?.data?.detail || "حدث خطأ في بدء الاختبار");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-lg text-[#4B5563]">جاري التحميل...</div>
      </div>
    );
  }

  const totalDuration = exam?.sections?.reduce((acc, s) => acc + s.duration_minutes, 0) || 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-[#3A7D86] text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">تقدير</h1>
            <p className="text-sm opacity-80">ثانوية الإمام الجويني</p>
          </div>
        </div>
      </header>

      <main className="instructions-container py-8">
        <div className="animate-fade-in">
          {/* Exam Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">{exam?.title}</h1>
            <p className="text-[#4B5563]">{exam?.description}</p>
          </div>

          {/* Instructions Card */}
          <Card className="instructions-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1F2937]">
                <AlertCircle className="w-6 h-6 text-[#3A7D86]" />
                تعليمات الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exam?.instructions ? (
                <div className="arabic-text text-[#4B5563] leading-loose whitespace-pre-line">
                  {exam.instructions}
                </div>
              ) : (
                <ul className="instructions-list">
                  <li>
                    <div className="instruction-icon">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F2937]">عدد الأقسام</p>
                      <p className="text-[#4B5563]">يتكون الاختبار من {exam?.sections?.length || 5} أقسام</p>
                    </div>
                  </li>
                  <li>
                    <div className="instruction-icon">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F2937]">الوقت المحدد</p>
                      <p className="text-[#4B5563]">المدة الإجمالية للاختبار {totalDuration} دقيقة</p>
                    </div>
                  </li>
                  <li>
                    <div className="instruction-icon">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F2937]">توقيت كل قسم</p>
                      <p className="text-[#4B5563]">لكل قسم وقت محدد، وسيتم الانتقال تلقائياً عند انتهاء الوقت</p>
                    </div>
                  </li>
                  <li>
                    <div className="instruction-icon">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F2937]">لا يمكن العودة</p>
                      <p className="text-[#4B5563]">لا يمكنك العودة للأسئلة السابقة بعد الانتقال منها</p>
                    </div>
                  </li>
                  <li>
                    <div className="instruction-icon">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1F2937]">اختيار واحد</p>
                      <p className="text-[#4B5563]">كل سؤال له إجابة واحدة صحيحة فقط</p>
                    </div>
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Sections Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-[#1F2937]">أقسام الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {exam?.sections?.map((section, index) => (
                  <div
                    key={section.section_number}
                    className="flex items-center justify-between p-4 bg-[#F3F4F6] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3A7D86] text-white flex items-center justify-center font-bold">
                        {section.section_number}
                      </div>
                      <span className="font-medium text-[#1F2937]">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Clock className="w-4 h-4" />
                      <span>{section.duration_minutes} دقيقة</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Info Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-[#1F2937]">بيانات الطالب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-[#1F2937]">
                  الاسم الكامل <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="studentName"
                  data-testid="student-name-input"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="text-right"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentPhone" className="text-[#1F2937]">
                  رقم الهاتف (اختياري)
                </Label>
                <Input
                  id="studentPhone"
                  data-testid="student-phone-input"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="أدخل رقم هاتفك"
                  className="text-right"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              data-testid="back-to-dashboard-btn"
              variant="outline"
              onClick={() => navigate("/student")}
              className="border-[#3A7D86] text-[#3A7D86]"
            >
              العودة للقائمة
            </Button>
            <Button
              data-testid="start-exam-btn"
              onClick={handleStartExam}
              disabled={starting || !studentName.trim()}
              className="bg-[#3A7D86] hover:bg-[#2C6169] px-8"
            >
              {starting ? (
                "جاري البدء..."
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5 ml-2 rtl-flip" />
                  بدء الاختبار
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamInstructions;
