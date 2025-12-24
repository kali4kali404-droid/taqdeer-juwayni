import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";

const ExamCompletion = () => {
  const navigate = useNavigate();

  return (
    <div className="completion-container bg-[#F9FAFB]">
      <div className="completion-card animate-fade-in">
        <div className="completion-icon">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-[#1F2937] mb-4">
          تم إنهاء الاختبار
        </h1>
        <p className="text-lg text-[#4B5563] mb-2">
          سيتم إشعارك بالنتيجة لاحقًا.
        </p>
        <p className="text-sm text-[#9CA3AF] mb-8">
          شكراً لك على إكمال الاختبار. ستتمكن من مشاهدة نتيجتك بعد أن يقوم المشرف بإصدارها.
        </p>
        <Button
          data-testid="back-to-dashboard-btn"
          onClick={() => navigate("/student")}
          className="bg-[#3A7D86] hover:bg-[#2C6169] px-8"
        >
          <Home className="w-5 h-5 ml-2" />
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
};

export default ExamCompletion;
