import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // استيراد وسم الـ Checkbox الخاص بشاد سي إن
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getExam, startStudentExam } from "@/lib/api";
import {
  AlertCircle,
  Clock,
  ArrowLeft,
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
  const [starting, setStarting] = useState(false);
  
  // حالة حفظ موافقة الطالب على الإقرار
  const [declared, setDeclared] = useState(false);

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
    // حماية إضافية للتحقق من الإقرار قبل الإرسال للسيرفر
    if (!declared) {
      toast.error("يرجى الموافقة على الإقرار والتعهد أولاً للبدء");
      return;
    }

    setStarting(true);
    try {
      // إرسال معرف الاختبار فقط حيث يتم قراءة بيانات الطالب تلقائياً من جلسته السابقة المسجلة
      const response = await startStudentExam({
        exam_id: examId,
      });
      toast.success("تم بدء الاختبار بنجاح، بالتوفيق!");
      navigate(`/exam/${response.data.id}/take`);
    } catch (error) {
      console.error("Error starting exam:", error);
      
      // برمجة دفاعية آمنة لمنع انهيار الصفحة البيضاء وقراءة أي أخطاء من السيرفر كـ Text [2]
      let errorMsg = "حدث خطأ في بدء الاختبار";
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          errorMsg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // استخراج أول خطأ من مصفوفة أخطاء Pydantic [2]
          errorMsg = error.response.data.detail[0]?.msg || "خطأ في مدخلات البيانات";
          // إذا كان الخطأ يخص الاسم المفقود، نوضح للمشرف أن يعدل الباكند
          if (error.response.data.detail[0]?.loc?.includes("student_name")) {
            errorMsg = "الاسم الكامل مطلوب لبدء الاختبار (يرجى التأكد من تعديل وحفظ ملف server.py في الباكند)";
          }
        }
      }
      toast.error(errorMsg);
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
    <div className="min-h-screen bg-[#F9FAFB]" dir="rtl">
      {/* Header */}
      <header className="bg-[#3A7D86] text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3 justify-start">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h1 className="font-bold text-lg">منصة ثانوية الإمام الجويني الإلكترونية</h1>
            <p className="text-sm opacity-80">لاختبارات القدرات والتحصيلي</p>
          </div>
        </div>
      </header>

      <main className="instructions-container py-8 max-w-4xl mx-auto px-6">
        <div className="animate-fade-in text-right">
          {/* Exam Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">{exam?.title}</h1>
            <p className="text-[#4B5563]">{exam?.description}</p>
          </div>

          {/* Instructions Card */}
          <Card className="instructions-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1F2937] justify-start">
                <AlertCircle className="w-6 h-6 text-[#3A7D86] ml-2" />
                تعليمات الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exam?.instructions ? (
                <div className="arabic-text text-[#4B5563] leading-loose whitespace-pre-line text-right">
                  {exam.instructions}
                </div>
              ) : (
                <ul className="instructions-list space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="instruction-icon bg-[#E0F2F4] p-2 rounded-full text-[#3A7D86] shrink-0 mt-1">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">عدد الأقسام</p>
                      <p className="text-[#4B5563] text-sm">يتكون الاختبار من {exam?.sections?.length || 5} أقسام</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="instruction-icon bg-[#E0F2F4] p-2 rounded-full text-[#3A7D86] shrink-0 mt-1">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">الوقت المحدد</p>
                      <p className="text-[#4B5563] text-sm">المدة الإجمالية للاختبار {totalDuration} دقيقة</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="instruction-icon bg-[#E0F2F4] p-2 rounded-full text-[#3A7D86] shrink-0 mt-1">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">توقيت كل قسم</p>
                      <p className="text-[#4B5563] text-sm">لكل قسم وقت محدد، وسيتم الانتقال تلقائياً للقسم التالي عند انتهاء الوقت</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="instruction-icon bg-[#E0F2F4] p-2 rounded-full text-[#3A7D86] shrink-0 mt-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">لا يمكن العودة للوراء</p>
                      <p className="text-[#4B5563] text-sm">لا يمكنك العودة للأسئلة أو الأقسام السابقة بعد الانتقال وتأكيد الإجابة</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="instruction-icon bg-[#E0F2F4] p-2 rounded-full text-[#3A7D86] shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937]">اختيار إجابة واحدة</p>
                      <p className="text-[#4B5563] text-sm">كل سؤال متعدد الخيارات وله إجابة واحدة صحيحة فقط</p>
                    </div>
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Sections Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-[#1F2937] text-right">أقسام الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {exam?.sections?.map((section) => (
                  <div
                    key={section.section_number}
                    className="flex items-center justify-between p-4 bg-[#F3F4F6] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3A7D86] text-white flex items-center justify-center font-bold">
                        {section.section_number}
                      </div>
                      <span className="font-semibold text-[#1F2937]">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#4B5563]">
                      <Clock className="w-4 h-4 ml-1" />
                      <span>{section.duration_minutes} دقيقة</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* صندوق التعهد والإقرار بالأمانة العلمية 🚀 */}
          <Card className="mb-8 border-amber-200 bg-amber-50/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="declaration"
                  checked={declared}
                  onCheckedChange={(checked) => setDeclared(checked === true)}
                  className="mt-1 border-amber-400 data-[state=checked]:bg-[#3A7D86] data-[state=checked]:border-[#3a7d86]"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="declaration"
                    className="font-bold text-[#1F2937] text-sm cursor-pointer leading-relaxed block text-right"
                  >
                    إقرار وتعهد بأمانة الاختبار وصحة البيانات <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-[#4B5563] leading-relaxed text-right">
                    أقر وأتعهد أنا الطالب المتقدم للاختبار، بأنني قد اطلعت بعناية تامة على كافة تعليمات وضوابط وملاحظات الاختبار الموضحة أعلاه، وألتزم التزاماً كاملاً وشاملاً بعدم الاستعانة بأي وسائل غير مشروعة، وأتحمل المسؤولية الكاملة في حال الإخلال بهذا الميثاق.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              data-testid="back-to-dashboard-btn"
              variant="outline"
              onClick={() => navigate("/student")}
              className="border-[#3A7D86] text-[#3A7D86] hover:bg-[#E0F2F4]"
            >
              العودة للرئيسية
            </Button>
            <Button
              data-testid="start-exam-btn"
              onClick={handleStartExam}
              disabled={starting || !declared} // الزر معطل تلقائياً حتى يوافق الطالب على التعهد 🔒
              className={`px-8 font-semibold text-white transition-all ${
                declared 
                  ? "bg-[#3A7D86] hover:bg-[#2C6169] cursor-pointer" 
                  : "bg-gray-300 cursor-not-allowed text-gray-500 border-gray-200"
              }`}
            >
              {starting ? (
                "جاري تهيئة الاختبار..."
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5 ml-2" />
                  بدء حل الاختبار
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