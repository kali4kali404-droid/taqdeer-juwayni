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
  getExamProgress,
  assignGrade,
  releaseGrade,
  calculateGrade,
} from "@/lib/api";
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Award,
  Eye,
  Calculator,
  Send,
  RefreshCw,
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

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchExamProgress();
      // Auto-refresh every 30 seconds
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
      const response = await getExamProgress(selectedExam);
      setExamProgress(response.data);
    } catch (error) {
      console.error("Error fetching exam progress:", error);
      toast.error("حدث خطأ في تحميل بيانات التقدم");
    } finally {
      setRefreshing(false);
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

  const handleReleaseGrade = async (submissionId) => {
    try {
      await releaseGrade(submissionId);
      toast.success("تم إصدار النتيجة للطالب");
      fetchExamProgress();
    } catch (error) {
      console.error("Error releasing grade:", error);
      toast.error("حدث خطأ في إصدار النتيجة");
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">مراقبة الاختبارات</h1>
          <p className="text-[#4B5563]">متابعة تقدم الطلاب وإدارة الدرجات</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger data-testid="select-exam-monitor" className="w-64">
              <SelectValue placeholder="اختر الاختبار" />
            </SelectTrigger>
            <SelectContent>
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
            disabled={refreshing}
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
            <p className="text-[#4B5563]">اختر اختباراً لعرض التقدم</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
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

          {/* Progress Bar */}
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

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل المشاركين</CardTitle>
            </CardHeader>
            <CardContent>
              {!examProgress?.submissions?.length ? (
                <div className="text-center py-8 text-[#4B5563]">
                  لا توجد مشاركات حتى الآن
                </div>
              ) : (
                <Table className="table-rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الطالب</TableHead>
                      <TableHead className="text-right">القسم الحالي</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الدرجة</TableHead>
                      <TableHead className="text-right">النتيجة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examProgress.submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.student_name}
                        </TableCell>
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
                          {submission.grade_released ? (
                            <Badge className="bg-[#D1FAE5] text-[#10B981]">صدرت</Badge>
                          ) : (
                            <Badge className="bg-[#F3F4F6] text-[#4B5563]">لم تصدر</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {submission.status === "completed" && (
                              <>
                                <Button
                                  data-testid={`calculate-grade-${submission.id}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCalculateGrade(submission)}
                                  title="حساب الدرجة آلياً"
                                >
                                  <Calculator className="w-4 h-4" />
                                </Button>
                                <Button
                                  data-testid={`assign-grade-${submission.id}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenGradeDialog(submission)}
                                  title="تعيين الدرجة يدوياً"
                                >
                                  <Award className="w-4 h-4" />
                                </Button>
                                {submission.score !== null && !submission.grade_released && (
                                  <Button
                                    data-testid={`release-grade-${submission.id}`}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReleaseGrade(submission.id)}
                                    title="إصدار النتيجة"
                                    className="text-[#10B981]"
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                )}
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

      {/* Grade Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعيين الدرجة</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#4B5563] mb-4">
              الطالب: <strong>{selectedSubmission?.student_name}</strong>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">الدرجة (من 100)</label>
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
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>
              إلغاء
            </Button>
            <Button
              data-testid="confirm-grade-btn"
              onClick={handleAssignGrade}
              className="bg-[#3A7D86] hover:bg-[#2C6169]"
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
