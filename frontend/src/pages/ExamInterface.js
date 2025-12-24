import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  getStudentExam,
  getExam,
  getQuestions,
  submitAnswer,
  moveToNextSection,
  completeExam,
} from "@/lib/api";
import { Clock, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

const ExamInterface = () => {
  const { studentExamId } = useParams();
  const navigate = useNavigate();
  const [studentExam, setStudentExam] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const studentExamRes = await getStudentExam(studentExamId);
      const studentExamData = studentExamRes.data;
      
      if (studentExamData.status === "completed") {
        navigate("/exam/completed");
        return;
      }
      
      setStudentExam(studentExamData);
      
      const examRes = await getExam(studentExamData.exam_id);
      setExam(examRes.data);
      
      const questionsRes = await getQuestions(
        studentExamData.exam_id,
        studentExamData.current_section
      );
      setQuestions(questionsRes.data);
      
      // Calculate time remaining
      const currentSection = examRes.data.sections?.find(
        (s) => s.section_number === studentExamData.current_section
      );
      const sectionStartTime = studentExamData.section_start_times?.[
        String(studentExamData.current_section)
      ];
      
      if (currentSection && sectionStartTime) {
        const startTime = new Date(sectionStartTime).getTime();
        const durationMs = currentSection.duration_minutes * 60 * 1000;
        const endTime = startTime + durationMs;
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
      }
      
      // Find current question index based on answers
      const answeredIds = studentExamData.answers?.map((a) => a.question_id) || [];
      const firstUnanswered = questionsRes.data.findIndex(
        (q) => !answeredIds.includes(q.id)
      );
      setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ في تحميل الاختبار");
      navigate("/student");
    } finally {
      setLoading(false);
    }
  }, [studentExamId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining]);

  const handleTimeUp = async () => {
    toast.warning("انتهى وقت هذا القسم");
    await handleNextSection();
  };

  const handleSelectOption = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) {
      toast.error("الرجاء اختيار إجابة");
      return;
    }

    setSubmitting(true);
    try {
      await submitAnswer({
        student_exam_id: studentExamId,
        question_id: questions[currentQuestionIndex].id,
        selected_option_id: selectedOption,
      });

      // Move to next question or section
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        // End of section
        await handleNextSection();
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("حدث خطأ في حفظ الإجابة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextSection = async () => {
    try {
      const response = await moveToNextSection(studentExamId);
      if (response.data.completed) {
        await completeExam(studentExamId);
        navigate("/exam/completed");
      } else {
        // Refresh data for new section
        setLoading(true);
        await fetchData();
      }
    } catch (error) {
      console.error("Error moving to next section:", error);
      toast.error("حدث خطأ في الانتقال للقسم التالي");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    if (timeRemaining <= 60) return "exam-timer danger";
    if (timeRemaining <= 300) return "exam-timer warning";
    return "exam-timer";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-lg text-[#4B5563]">جاري التحميل...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentSection = exam?.sections?.find(
    (s) => s.section_number === studentExam?.current_section
  );
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Timer */}
      <div className={getTimerClass()} data-testid="exam-timer">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-bold text-xl">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="exam-container py-8">
        {/* Header */}
        <div className="exam-header">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">{exam?.title}</h1>
          <p className="text-[#4B5563]">{currentSection?.title}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#4B5563]">
              السؤال {currentQuestionIndex + 1} من {questions.length}
            </span>
            <span className="text-sm text-[#4B5563]">
              القسم {studentExam?.current_section} من 5
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Section Progress Dots */}
        <div className="exam-progress mb-8">
          {[1, 2, 3, 4, 5].map((section) => (
            <div
              key={section}
              className={`progress-dot ${
                section < studentExam?.current_section
                  ? "completed"
                  : section === studentExam?.current_section
                  ? "current"
                  : "pending"
              }`}
            >
              {section < studentExam?.current_section ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                section
              )}
            </div>
          ))}
        </div>

        {/* Question Card */}
        {currentQuestion ? (
          <Card className="question-card animate-fade-in">
            <CardContent className="pt-6">
              <div className="question-number">سؤال {currentQuestionIndex + 1}</div>
              <p className="question-text">{currentQuestion.text}</p>

              <div className="options-grid">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={option.id}
                    data-testid={`option-${index}`}
                    onClick={() => handleSelectOption(option.id)}
                    className={`question-option ${
                      selectedOption === option.id ? "selected" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                          selectedOption === option.id
                            ? "border-[#3A7D86] bg-[#3A7D86] text-white"
                            : "border-[#9CA3AF] text-[#4B5563]"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-[#1F2937]">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mt-8">
                <div className="text-sm text-[#4B5563]">
                  {timeRemaining <= 60 && (
                    <span className="flex items-center gap-1 text-[#EF4444]">
                      <AlertTriangle className="w-4 h-4" />
                      الوقت على وشك الانتهاء!
                    </span>
                  )}
                </div>
                <Button
                  data-testid="submit-answer-btn"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || submitting}
                  className="bg-[#3A7D86] hover:bg-[#2C6169] px-8"
                >
                  {submitting ? (
                    "جاري الحفظ..."
                  ) : currentQuestionIndex < questions.length - 1 ? (
                    <>
                      السؤال التالي
                      <ArrowLeft className="w-5 h-5 mr-2 rtl-flip" />
                    </>
                  ) : (
                    <>
                      إنهاء القسم
                      <ArrowLeft className="w-5 h-5 mr-2 rtl-flip" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="question-card">
            <CardContent className="py-12 text-center">
              <p className="text-[#4B5563]">لا توجد أسئلة في هذا القسم</p>
              <Button
                onClick={handleNextSection}
                className="mt-4 bg-[#3A7D86] hover:bg-[#2C6169]"
              >
                الانتقال للقسم التالي
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamInterface;
