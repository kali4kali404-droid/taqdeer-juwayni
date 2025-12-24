import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getExams, getStudentExams, getMyResults } from "@/lib/api";
import {
  GraduationCap,
  LogOut,
  FileText,
  Clock,
  CheckCircle,
  Play,
  Trophy,
} from "lucide-react";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, myExamsRes, resultsRes] = await Promise.all([
        getExams(),
        getStudentExams(),
        getMyResults(),
      ]);
      setExams(examsRes.data);
      setMyExams(myExamsRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const getExamStatus = (exam) => {
    const myExam = myExams.find((e) => e.exam_id === exam.id);
    if (myExam) {
      if (myExam.status === "completed") return "completed";
      return "in_progress";
    }
    return "available";
  };

  const handleStartExam = (exam) => {
    const status = getExamStatus(exam);
    if (status === "completed") {
      toast.info("لقد أكملت هذا الاختبار مسبقاً");
      return;
    }
    if (status === "in_progress") {
      const myExam = myExams.find((e) => e.exam_id === exam.id);
      navigate(`/exam/${myExam.id}/take`);
    } else {
      navigate(`/exam/${exam.id}/instructions`);
    }
  };

  const availableExams = exams.filter((e) => e.status === "published");
  const completedExams = myExams.filter((e) => e.status === "completed");
  const inProgressExams = myExams.filter((e) => e.status === "in_progress");

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-[#3A7D86] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">تقدير</h1>
              <p className="text-sm opacity-80">ثانوية الإمام الجويني</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-sm opacity-80">طالب</p>
            </div>
            <Button
              data-testid="student-logout-btn"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[#1F2937]">مرحباً، {user?.full_name}</h2>
          <p className="text-[#4B5563]">اختر اختباراً للبدء أو تابع اختباراً سابقاً</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-r-4 border-r-[#3A7D86]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E0F2F4] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#3A7D86]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1F2937]">{availableExams.length}</p>
                  <p className="text-sm text-[#4B5563]">اختبارات متاحة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-[#F59E0B]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1F2937]">{inProgressExams.length}</p>
                  <p className="text-sm text-[#4B5563]">قيد التنفيذ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-[#10B981]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1F2937]">{completedExams.length}</p>
                  <p className="text-sm text-[#4B5563]">مكتملة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Exams */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-[#1F2937] mb-4">الاختبارات المتاحة</h3>
          {loading ? (
            <div className="text-center py-8 text-[#4B5563]">جاري التحميل...</div>
          ) : availableExams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                <p className="text-[#4B5563]">لا توجد اختبارات متاحة حالياً</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableExams.map((exam) => {
                const status = getExamStatus(exam);
                return (
                  <Card key={exam.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-[#1F2937]">{exam.title}</CardTitle>
                          <CardDescription className="mt-1">{exam.description}</CardDescription>
                        </div>
                        {status === "completed" && (
                          <Badge className="bg-[#D1FAE5] text-[#10B981]">مكتمل</Badge>
                        )}
                        {status === "in_progress" && (
                          <Badge className="bg-[#FEF3C7] text-[#F59E0B]">قيد التنفيذ</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-[#4B5563] mb-4">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {exam.sections?.length || 5} أقسام
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {exam.sections?.reduce((acc, s) => acc + s.duration_minutes, 0) || 100} دقيقة
                        </span>
                      </div>
                      <Button
                        data-testid={`start-exam-${exam.id}`}
                        onClick={() => handleStartExam(exam)}
                        className={`w-full ${
                          status === "completed"
                            ? "bg-gray-400 cursor-not-allowed"
                            : status === "in_progress"
                            ? "bg-[#F59E0B] hover:bg-[#D97706]"
                            : "bg-[#3A7D86] hover:bg-[#2C6169]"
                        }`}
                        disabled={status === "completed"}
                      >
                        {status === "completed" ? (
                          <>
                            <CheckCircle className="w-5 h-5 ml-2" />
                            تم الإكمال
                          </>
                        ) : status === "in_progress" ? (
                          <>
                            <Play className="w-5 h-5 ml-2" />
                            متابعة الاختبار
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 ml-2" />
                            بدء الاختبار
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Results */}
        {results.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-[#1F2937] mb-4">نتائجي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result) => {
                const exam = exams.find((e) => e.id === result.exam_id);
                return (
                  <Card key={result.id} className="border-r-4 border-r-[#10B981]">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-[#1F2937]">
                            {exam?.title || "اختبار"}
                          </h4>
                          <p className="text-sm text-[#4B5563]">
                            تاريخ الإكمال:{" "}
                            {new Date(result.completed_at).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-[#10B981]" />
                          </div>
                          <p className="text-2xl font-bold text-[#10B981] mt-2">
                            {result.score?.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
