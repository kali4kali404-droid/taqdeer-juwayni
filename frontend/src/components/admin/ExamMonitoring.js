import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getExams,
  getGrades, 
  assignGrade,
  calculateGrade,
  exportGradesExcel, 
  exportGradesPDF,   
  deleteResults,
  getStudentExam, 
  getQuestions,   
} from "@/lib/api";
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Award,
  Calculator,
  RefreshCw,
  FileSpreadsheet, 
  FileText,        
  Trash2,
  Eye, 
} from "lucide-react";

const ExamMonitoring = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [examProgress, setExamProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeValue, setGradeValue] = useState("");

  const [showAnswersDialog, setShowAnswersDialog] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [submissionAnswers, setSubmissionAnswers] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchExamProgress();
      const interval = setInterval(fetchExamProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const response = await getExams();
      setExams(response.data.filter((e) => e.status === "published" || e.status === "closed"));
      if (response.data.length > 0) {
        const publishedExam = response.data.find((e) => e.status === "published");
        if (publishedExam) {
          setSelectedExam(publishedExam.id);
        }
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamProgress = async () => {
    if (!selectedExam) return;
    setRefreshing(true);
    try {
      const response = await getGrades(selectedExam);
      setExamProgress(response.data);
    } catch (error) {
      console.error("Error fetching exam progress:", error);
      toast.error("حدث خطأ في تحميل بيانات التقدم");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewAnswers = async (submission) => {
    setViewingSubmission(submission);
    setLoadingAnswers(true);
    setShowAnswersDialog(true);
    try {
      const sessionRes = await getStudentExam(submission.id);
      setSubmissionAnswers(sessionRes.data.answers || []);

      const questionsRes = await getQuestions(selectedExam);
      setExamQuestions(questionsRes.data || []);
    } catch (error) {
      console.error("Error fetching student answers:", error);
      toast.error("حدث خطأ أثناء تحميل إجابات هذا الطالب");
      setShowAnswersDialog(false);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleCalculateGrade = async (submission) => {
    try {
      const response = await calculateGrade(submission.id);
      toast.success(`تم حساب الدرجة: ${response.data.score.toFixed(1)}%`);
      fetchExamProgress();
    } catch (error) {
      console.error("Error calculating grade:", error);
      toast.error("حدث خطأ في حساب الدرجة");
    }
  };

  const handleOpenGradeDialog = (submission) => {
    setSelectedSubmission(submission);
    setGradeValue(submission.score?.toString() || "");
    setShowGradeDialog(true);
  };

  const handleAssignGrade = async () => {
    if (!gradeValue) {
      toast.error("الرجاء إدخال الدرجة");
      return;
    }
    try {
      await assignGrade({
        student_exam_id: selectedSubmission.id,
        score: parseFloat(gradeValue),
        release_grade: false,
      });
      toast.success("تم تعيين الدرجة بنجاح");
      setShowGradeDialog(false);
      fetchExamProgress();
    } catch (error) {
      console.error("Error assigning grade:", error);
      toast.error("حدث خطأ في تعيين الدرجة");
    }
  };

  const handleExportExcel = () => {
    if (!selectedExam) return;
    try {
      exportGradesExcel(selectedExam);
      toast.success("يتم الآن تحضير وتنزيل ملف Excel للدرجات...");
    } catch (error) {
      console.error("Excel Export Error:", error);
      toast.error("فشل تصدير ملف Excel");
    }
  };

  const handleExportPDF = () => {
    if (!selectedExam) return;
    try {
      exportGradesPDF(selectedExam);
      toast.success("يتم الآن تحضير وتنزيل ملف PDF للدرجات...");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("فشل تصدير ملف PDF");
    }
  };

  const handleDeleteResults = async () => {
    if (!selectedExam) return;
    const confirmDelete = window.confirm(
      "تنبيه هام جداً:\nهل أنت متأكد من رغبتك في حذف جميع نتائج الطلاب لهذا الاختبار بالكامل؟\nهذا الإجراء سيحذف كافة السجلات السابقة ولا يمكن التراجع عنه!"
    );
    if (!confirmDelete) return;

    try {
      await deleteResults(selectedExam);
      toast.success("تم حذف النتائج السابقة بنجاح وتصفير السجلات.");
      fetchExamProgress();
    } catch (error) {
      console.error("Delete Results Error:", error);
      toast.error("حدث خطأ أثناء محاولة حذف النتائج");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-[#D1FAE5] text-[#10B981]">مكتمل</Badge>;
      case "in_progress":
        return <Badge className="bg-[#FEF3C7] text-[#F59E0B]">قيد التنفيذ</Badge>;
      default:
        return <Badge className="bg-[#F3F4F6] text-[#4B5563]">{status}</Badge>;
    }
  };

  const completionRate = examProgress
    ? (examProgress.completed / Math.max(examProgress.total, 1)) * 100
    : 0;

  return (
    <div className="animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">مراقبة الاختبارات</h1>
          <p className="text-[#4B5563]">متابعة تقدم الطلاب وإدارة الدرجات</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedExam || "none"} onValueChange={(value) => setSelectedExam(value === "none" ? "" : value)}>
            <SelectTrigger data-testid="select-exam-monitor" className="w-64">
              <SelectValue placeholder="اختر الاختبار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">اختر الاختبار</SelectItem>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            data-testid="refresh-progress-btn"
            variant="outline"
            onClick={fetchExamProgress}
            disabled={refreshing || !selectedExam}
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
      </div>

      {!selectedExam ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#4B5563]">اختر اختباراً لعرض التقدم وإدارة النتائج</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* قسم الإجراءات الإدارية */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 border rounded-lg items-center">
            <span className="text-sm font-semibold text-[#1F2937] ml-2">أدوات الإدارة والرصد:</span>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5] hover:text-[#047857]"
            >
              <FileSpreadsheet className="w-4 h-4 ml-2" />
              تصدير كـ Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
            >
              <FileText className="w-4 h-4 ml-2" />
              تصدير كـ PDF
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteResults}
              className="bg-red-600 hover:bg-red-700 text-white mr-auto"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف سجلات ونتائج الاختبار الحالي
            </Button>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E0F2F4] flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#3A7D86]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F2937]">
                      {examProgress?.total || 0}
                    </p>
                    <p className="text-sm text-[#4B5563]">إجمالي المشاركين</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F2937]">
                      {examProgress?.in_progress || 0}
                    </p>
                    <p className="text-sm text-[#4B5563]">قيد التنفيذ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F2937]">
                      {examProgress?.completed || 0}
                    </p>
                    <p className="text-sm text-[#4B5563]">مكتمل</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F2937]">
                      {examProgress?.graded || 0}
                    </p>
                    <p className="text-sm text-[#4B5563]">تم التصحيح</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* شريط الإكمال */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">نسبة الإكمال</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#4B5563]">التقدم الإجمالي</span>
                  <span className="font-bold text-[#1F2937]">{completionRate.toFixed(0)}%</span>
                </div>
                <Progress value={completionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* جدول التفاصيل والمشاركين */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل المشاركين</CardTitle>
            </CardHeader>
            <CardContent>
              {!examProgress?.submissions?.length ? (
                <div className="text-center py-8 text-[#4B5563]">
                  لا توجد مشاركات مسجلة لهذا الاختبار حتى الآن.
                </div>
              ) : (
                <Table className="table-rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الطالب</TableHead>
                      <TableHead className="text-right">المدرسة</TableHead>
                      <TableHead className="text-right">المرحلة</TableHead>
                      <TableHead className="text-right">الفصل</TableHead>
                      <TableHead className="text-right">القسم الحالي</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الدرجة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examProgress.submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.student_name}
                        </TableCell>
                        <TableCell>{submission.school_name || "ثانوية الإمام الجويني"}</TableCell>
                        <TableCell>{submission.grade || "-"}</TableCell>
                        <TableCell>{submission.class_name || "-"}</TableCell>
                        <TableCell>
                          {submission.status === "completed"
                            ? "مكتمل"
                            : `القسم ${submission.current_section}`}
                        </TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          {submission.score !== null && submission.score !== undefined ? (
                            <span className="font-bold text-[#3A7D86]">
                              {submission.score.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF]">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-start">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAnswers(submission)}
                              title="عرض إجابات الطالب التفصيلية"
                              className="text-[#3A7D86]"
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              عرض الإجابات
                            </Button>

                            {submission.status === "completed" && (
                              <>
                                <Button
                                  data-testid={`calculate-grade-${submission.id}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCalculateGrade(submission)}
                                  title="حساب الدرجة آلياً"
                                >
                                  <Calculator className="w-4 h-4 ml-1" />
                                  حساب الدرجة
                                </Button>
                                <Button
                                  data-testid={`assign-grade-${submission.id}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenGradeDialog(submission)}
                                  title="تعديل أو تعيين الدرجة يدوياً"
                                >
                                  <Award className="w-4 h-4 ml-1" />
                                  رصد يدوي
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* نافذة عرض إجابات الطالب بالتفصيل */}
      <Dialog open={showAnswersDialog} onOpenChange={setShowAnswersDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1F2937] border-b pb-2">
              عرض تفاصيل إجابات الطالب: {viewingSubmission?.student_name}
            </DialogTitle>
          </DialogHeader>
          
          {loadingAnswers ? (
            <div className="text-center py-12 text-[#4B5563]">جاري تحميل الأسئلة والإجابات...</div>
          ) : examQuestions.length === 0 ? (
            <div className="text-center py-12 text-[#4B5563]">لا توجد أسئلة مسجلة في هذا الاختبار.</div>
          ) : (
            <div className="space-y-6 py-4">
              {examQuestions.map((question, qIdx) => {
                const studentAnswer = submissionAnswers.find(a => a.question_id === question.id);
                const selectedOptId = studentAnswer?.selected_option_id;
                
                const isAnswered = !!selectedOptId;
                const selectedOpt = question.options?.find(o => o.id === selectedOptId);
                const isCorrect = selectedOpt?.is_correct === true;

                return (
                  <div key={question.id} className="p-4 border rounded-lg bg-gray-50/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-[#1F2937]">
                        سؤال {qIdx + 1}: <span className="text-gray-500 font-normal">({question.points || 1} درجات)</span>
                      </span>
                      <span>
                        {!isAnswered ? (
                          <Badge className="bg-gray-100 text-gray-500 border-gray-200">⚠️ لم يحل السؤال (صفر)</Badge>
                        ) : isCorrect ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">✅ إجابة صحيحة</Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-red-700 border-rose-200">❌ إجابة خاطئة</Badge>
                        )}
                      </span>
                    </div>
                    
                    <p className="text-md text-[#1F2937] font-medium pr-2">{question.text}</p>
                    
                    {question.image && (
                      <div className="text-center my-2">
                        <img 
                          src={question.image} 
                          alt="مرفق السؤال" 
                          className="max-h-40 rounded border object-contain bg-white p-1"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                      {question.options?.map((option, oIdx) => {
                        const isSelected = option.id === selectedOptId;
                        const isOptionCorrect = option.is_correct === true;
                        
                        let borderClass = "border-gray-200 bg-white";
                        if (isSelected) {
                          borderClass = isOptionCorrect 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800" 
                            : "border-red-400 bg-rose-50 text-red-800";
                        } else if (isOptionCorrect) {
                          borderClass = "border-emerald-300 bg-emerald-50/40 text-emerald-800";
                        }

                        return (
                          <div 
                            key={option.id} 
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${borderClass}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? "bg-[#3A7D86] text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="flex-1 font-medium">{option.text}</span>
                            {isOptionCorrect && <span className="text-xs font-bold text-emerald-600">(الإجابة الصحيحة)</span>}
                            {isSelected && !isOptionCorrect && <span className="text-xs font-bold text-red-600">(إجابة الطالب)</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <DialogFooter className="justify-start">
            <Button variant="outline" onClick={() => setShowAnswersDialog(false)}>
              إغلاق النافذة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة رصد الدرجة */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>رصد وتعديل الدرجة</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#4B5563] mb-4">
              الطالب: <strong>{selectedSubmission?.student_name}</strong>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">الدرجة النهائية (من 100)</label>
              <Input
                type="number"
                data-testid="grade-input"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                placeholder="أدخل الدرجة"
                min={0}
                max={100}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 justify-start">
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>
              إلغاء
            </Button>
            <Button
              data-testid="confirm-grade-btn"
              onClick={handleAssignGrade}
              className="bg-[#3A7D86] hover:bg-[#2C6169] text-white"
            >
              حفظ الدرجة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamMonitoring;