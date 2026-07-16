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
  getQuestionHint,
} from "@/lib/api";
import { 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Flag 
} from "lucide-react";

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

  const [flaggedIds, setFlaggedIds] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");

  useEffect(() => {
    const savedFlags = localStorage.getItem(`flagged_${studentExamId}`);
    if (savedFlags) {
      setFlaggedIds(JSON.parse(savedFlags));
    }
  }, [studentExamId]);

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
      setQuestions(questionsRes.data || []);
      
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

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const q = questions[currentQuestionIndex];
      const saved = studentExam?.answers?.find(a => a.question_id === q.id);
      setSelectedOption(saved ? saved.selected_option_id : null);
      setShowHint(false);
      setHintText("");
    }
  }, [currentQuestionIndex, questions, studentExam]);

  // العداد التنازلي التلقائي والنقل الفوري والمقاوم لـ Stale closures
  useEffect(() => {
    if (loading) return;
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.warning("انتهى وقت هذا القسم! يتم نقل الاختبار للقسم التالي تلقائياً...");
          handleNextSection(true); // فرض النقل المباشر وتجاوز قيود الأسئلة
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, loading]);

  const handleTimeUp = async () => {
    toast.warning("انتهى وقت هذا القسم");
    await handleNextSection(true); 
  };

  const handleSelectOption = (optionId) => {
    setSelectedOption(optionId);
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    let updated;
    if (flaggedIds.includes(qId)) {
      updated = flaggedIds.filter(id => id !== qId);
      toast.info("تمت إزالة العلم");
    } else {
      updated = [...flaggedIds, qId];
      toast.success("تم تعليم السؤال بالعلم");
    }
    setFlaggedIds(updated);
    localStorage.setItem(`flagged_${studentExamId}`, JSON.stringify(updated));
  };

  const handleShowHint = async () => {
    if (!currentQuestion) return;
    if (showHint) {
      setShowHint(false);
      return;
    }
    if (hintText) {
      setShowHint(true);
      return;
    }

    try {
      const response = await getQuestionHint(currentQuestion.id);
      if (response.data && response.data.hint) {
        setHintText(response.data.hint);
        setShowHint(true);
      } else {
        toast.info("لا توجد تلميحات مسجلة لهذا السؤال من قبل المشرف.");
      }
    } catch (error) {
      console.error("Error fetching hint:", error);
      toast.error("فشل في تحميل التلميح");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return; 
    
    // إبقاء الزر فعالاً وعرض تنبيه توجيهي بدلاً من قفل الزر لراحة الطالب
    if (!selectedOption) {
      toast.error("الرجاء اختيار إجابة أولاً للسؤال الحالي قبل الانتقال أو الحفظ!");
      return;
    }

    setSubmitting(true);
    try {
      await submitAnswer({
        student_exam_id: studentExamId,
        question_id: currentQuestion.id,
        selected_option_id: selectedOption,
      });

      setStudentExam((prev) => {
        if (!prev) return prev;
        const existingAnswers = prev.answers || [];
        const filtered = existingAnswers.filter((a) => a.question_id !== currentQuestion.id);
        return {
          ...prev,
          answers: [
            ...filtered,
            { question_id: currentQuestion.id, selected_option_id: selectedOption },
          ],
        };
      });

      // 🚀 إزالة العلم تلقائياً وفوراً عند نجاح حفظ الإجابة للسؤال المعلم بالعلم 🚩
      if (flaggedIds.includes(currentQuestion.id)) {
        const updatedFlags = flaggedIds.filter(id => id !== currentQuestion.id);
        setFlaggedIds(updatedFlags);
        localStorage.setItem(`flagged_${studentExamId}`, JSON.stringify(updatedFlags));
        toast.info("تمت إزالة العلم 🚩 تلقائياً لحفظك الإجابة!");
      } else {
        toast.success("تم حفظ الإجابة بنجاح");
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        await handleNextSection(false);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("حدث خطأ في حفظ الإجابة");
    } finally {
      setSubmitting(false);
    }
  };

 const handleNextSection = async (force = false) => {
    // التحقق من وجود أعلام أو أسئلة غير مجابة في حال لم يكن النقل إجبارياً من عداد الوقت
    if (!force && currentQuestion) { 
      // حصر كافة معرفات أسئلة القسم الحالي للتحقق من الأعلام المرفوعة عليها
      const currentSectionQuestionIds = questions.map(q => q.id);
      const activeFlagsInCurrentSection = flaggedIds.filter(qId => currentSectionQuestionIds.includes(qId));
      
      // التنبيه الإجباري: يمنع الطالب من التجاوز تماماً إذا كان لديه أي علم 🚩 نشط في هذا القسم
      if (activeFlagsInCurrentSection.length > 0) {
        toast.error(
          `لا يمكن الانتقال للقسم التالي! لديك أسئلة لا تزال معلمة بعلم 🚩 للمراجعة في هذا القسم. يرجى مراجعتها وإلغاء العلم عنها أولاً لتتمكن من الانتقال.`
        );
        return;
      }

      const answeredIds = studentExam?.answers?.map((a) => a.question_id) || [];
      const currentAnswered = selectedOption 
        ? [...answeredIds, currentQuestion.id] 
        : answeredIds;

      const unanswered = questions.filter(q => !currentAnswered.includes(q.id));
      if (unanswered.length > 0) {
        toast.error(
          `لا يمكن الانتقال للقسم التالي! يرجى الإجابة على جميع الأسئلة أولاً. (متبقي لديك ${unanswered.length} أسئلة غير مجابة)`
        );
        return;
      }
    }

    try {
      const response = await moveToNextSection(studentExamId);
      if (response.data.completed) {
        await completeExam(studentExamId);
        localStorage.removeItem(`flagged_${studentExamId}`);
        navigate("/exam/completed");
      } else {
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
        <div className="text-lg text-[#4B5563]">جاري تحميل محتوى الاختبار...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentSection = exam?.sections?.find(
    (s) => s.section_number === studentExam?.current_section
  );
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB]" dir="rtl">
      {/* العداد */}
      <div className={getTimerClass()} data-testid="exam-timer">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-bold text-xl">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="exam-container py-8">
        {/* معلومات القسم */}
        <div className="exam-header text-right">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">{exam?.title}</h1>
          <p className="text-[#4B5563] font-medium">{currentSection?.title}</p>
        </div>

        {/* شريط التقدم الفردي للقسم */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#4B5563]">
              السؤال {questions.length > 0 ? currentQuestionIndex + 1 : 0} من {questions.length}
            </span>
            <span className="text-sm text-[#4B5563] font-bold">
              القسم {studentExam?.current_section} من 5
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* لوحة أرقام الأسئلة للتنقل السريع */}
        {questions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {questions.map((q, idx) => {
              const isAnswered = studentExam?.answers?.some(a => a.question_id === q.id) || (idx === currentQuestionIndex && selectedOption !== null);
              const isFlagged = flaggedIds.includes(q.id);
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all border relative ${
                    isCurrent 
                      ? "bg-[#3A7D86] text-white border-[#3a7d86] ring-2 ring-offset-2 ring-[#3a7d86]" 
                      : isFlagged
                      ? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                      : isAnswered
                      ? "bg-[#D1FAE5] text-[#10B981] border-[#A7F3D0] hover:bg-[#A7F3D0]"
                      : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* شريط تقدم الأقسام العام */}
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
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                section
              )}
            </div>
          ))}
        </div>

        {/* بطاقة السؤال النشط */}
        {currentQuestion ? (
          <Card className="question-card animate-fade-in text-right">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <div className="question-number text-lg font-bold">سؤال {currentQuestionIndex + 1}</div>
                <div className="flex gap-2">
                  {/* زر المساعدة / اللمبة 💡 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowHint}
                    className={`gap-1 px-3 ${showHint ? "bg-amber-100 border-amber-400 text-amber-700" : "text-gray-600 hover:bg-amber-50"}`}
                  >
                    <Lightbulb className="w-4 h-4 ml-1" />
                    تلميح المساعدة
                  </Button>
                  
                  {/* زر العلم 🚩 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFlag}
                    className={`gap-1 px-3 ${flaggedIds.includes(currentQuestion.id) ? "bg-red-100 border-red-400 text-red-700" : "text-gray-600 hover:bg-red-50"}`}
                  >
                    <Flag className="w-4 h-4 ml-1" />
                    {flaggedIds.includes(currentQuestion.id) ? "إلغاء العلم" : "تعليم السؤال"}
                  </Button>
                </div>
              </div>

              {/* تلميح المساعدة */}
              {showHint && hintText && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-amber-800 text-sm flex items-start gap-2 animate-fade-in">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">تلميح مساعد:</span> {hintText}
                  </div>
                </div>
              )}

              {/* عرض الصورة إن وجدت بالسؤال */}
              {currentQuestion.image && (
                <div className="mb-4 text-center">
                  <img
                    src={currentQuestion.image}
                    alt="مرفق السؤال"
                    className="max-h-60 mx-auto rounded-lg border object-contain bg-white p-2 shadow-sm"
                  />
                </div>
              )}

              <p className="question-text text-xl text-[#1F2937] font-semibold mb-6">{currentQuestion.text}</p>

              <div className="options-grid">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={option.id}
                    data-testid={`option-${index}`}
                    onClick={() => handleSelectOption(option.id)}
                    className={`question-option text-right w-full block transition-all ${
                      selectedOption === option.id ? "selected border-[#3A7D86] bg-[#E0F2F4]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold shrink-0 ${
                          selectedOption === option.id
                            ? "border-[#3A7D86] bg-[#3A7D86] text-white"
                            : "border-[#9CA3AF] text-[#4B5563]"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-[#1F2937] text-md">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mt-8">
                <div className="text-sm text-[#4B5563]">
                  {timeRemaining <= 60 && (
                    <span className="flex items-center gap-1 text-[#EF4444] font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      الوقت على وشك الانتهاء!
                    </span>
                  )}
                </div>
                {/* تم تعديل الزر ليبقى شغالاً لعرض التنبيه والتفاعل بدلاً من قفله */}
                <Button
                  data-testid="submit-answer-btn"
                  onClick={handleSubmitAnswer}
                  disabled={submitting}
                  className="bg-[#3A7D86] hover:bg-[#2C6169] text-white px-8 font-bold"
                >
                  {submitting ? (
                    "جاري الحفظ..."
                  ) : currentQuestionIndex < questions.length - 1 ? (
                    <>
                      حفظ السؤال التالي
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </>
                  ) : (
                    <>
                      حفظ وإنهاء القسم
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="question-card">
            <CardContent className="py-12 text-center">
              <p className="text-[#4B5563] mb-4">لا توجد أسئلة متوفرة في هذا القسم حالياً.</p>
              <Button
                onClick={() => handleNextSection(false)}
                className="bg-[#3A7D86] hover:bg-[#2C6169] text-white"
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