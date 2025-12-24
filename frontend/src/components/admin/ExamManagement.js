import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  closeExam,
  updateSectionTime,
} from "@/lib/api";
import {
  Plus,
  Pencil,
  Trash2,
  Play,
  Pause,
  Clock,
  FileText,
  Settings,
} from "lucide-react";

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    sections: [
      { section_number: 1, title: "القسم الأول - كمي", duration_minutes: 20 },
      { section_number: 2, title: "القسم الثاني - لفظي", duration_minutes: 20 },
      { section_number: 3, title: "القسم الثالث - كمي", duration_minutes: 20 },
      { section_number: 4, title: "القسم الرابع - لفظي", duration_minutes: 20 },
      { section_number: 5, title: "القسم الخامس - مختلط", duration_minutes: 20 },
    ],
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await getExams();
      setExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("حدث خطأ في تحميل الاختبارات");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description || "",
        instructions: exam.instructions || "",
        sections: exam.sections || formData.sections,
      });
    } else {
      setEditingExam(null);
      setFormData({
        title: "",
        description: "",
        instructions: "",
        sections: [
          { section_number: 1, title: "القسم الأول - كمي", duration_minutes: 20 },
          { section_number: 2, title: "القسم الثاني - لفظي", duration_minutes: 20 },
          { section_number: 3, title: "القسم الثالث - كمي", duration_minutes: 20 },
          { section_number: 4, title: "القسم الرابع - لفظي", duration_minutes: 20 },
          { section_number: 5, title: "القسم الخامس - مختلط", duration_minutes: 20 },
        ],
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await updateExam(editingExam.id, formData);
        toast.success("تم تحديث الاختبار بنجاح");
      } else {
        await createExam(formData);
        toast.success("تم إنشاء الاختبار بنجاح");
      }
      setShowForm(false);
      fetchExams();
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error("حدث خطأ في حفظ الاختبار");
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الاختبار؟")) return;
    try {
      await deleteExam(examId);
      toast.success("تم حذف الاختبار بنجاح");
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("حدث خطأ في حذف الاختبار");
    }
  };

  const handlePublish = async (examId) => {
    try {
      await publishExam(examId);
      toast.success("تم نشر الاختبار بنجاح");
      fetchExams();
    } catch (error) {
      console.error("Error publishing exam:", error);
      toast.error("حدث خطأ في نشر الاختبار");
    }
  };

  const handleClose = async (examId) => {
    try {
      await closeExam(examId);
      toast.success("تم إغلاق الاختبار بنجاح");
      fetchExams();
    } catch (error) {
      console.error("Error closing exam:", error);
      toast.error("حدث خطأ في إغلاق الاختبار");
    }
  };

  const handleOpenTimeSettings = (exam) => {
    setSelectedExam(exam);
    setShowTimeSettings(true);
  };

  const handleUpdateSectionTime = async (sectionNumber, duration) => {
    try {
      await updateSectionTime({
        exam_id: selectedExam.id,
        section_number: sectionNumber,
        duration_minutes: parseInt(duration),
      });
      toast.success("تم تحديث وقت القسم بنجاح");
      fetchExams();
    } catch (error) {
      console.error("Error updating section time:", error);
      toast.error("حدث خطأ في تحديث وقت القسم");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-[#D1FAE5] text-[#10B981]">منشور</Badge>;
      case "closed":
        return <Badge className="bg-[#FEE2E2] text-[#EF4444]">مغلق</Badge>;
      default:
        return <Badge className="bg-[#F3F4F6] text-[#4B5563]">مسودة</Badge>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">إدارة الاختبارات</h1>
          <p className="text-[#4B5563]">إنشاء وتعديل وإدارة الاختبارات</p>
        </div>
        <Button
          data-testid="create-exam-btn"
          onClick={() => handleOpenForm()}
          className="bg-[#3A7D86] hover:bg-[#2C6169]"
        >
          <Plus className="w-5 h-5 ml-2" />
          إنشاء اختبار جديد
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#4B5563]">جاري التحميل...</div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#4B5563]">لا توجد اختبارات حالياً</p>
            <Button
              onClick={() => handleOpenForm()}
              className="mt-4 bg-[#3A7D86] hover:bg-[#2C6169]"
            >
              إنشاء أول اختبار
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table className="table-rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">عنوان الاختبار</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الأقسام</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{getStatusBadge(exam.status)}</TableCell>
                  <TableCell>{exam.sections?.length || 5} أقسام</TableCell>
                  <TableCell>
                    {new Date(exam.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        data-testid={`edit-exam-${exam.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(exam)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        data-testid={`time-settings-${exam.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenTimeSettings(exam)}
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      {exam.status === "draft" && (
                        <Button
                          data-testid={`publish-exam-${exam.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublish(exam.id)}
                          className="text-[#10B981]"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {exam.status === "published" && (
                        <Button
                          data-testid={`close-exam-${exam.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClose(exam.id)}
                          className="text-[#F59E0B]"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        data-testid={`delete-exam-${exam.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(exam.id)}
                        className="text-[#EF4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Exam Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? "تعديل الاختبار" : "إنشاء اختبار جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الاختبار</Label>
                <Input
                  id="title"
                  data-testid="exam-title-input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="أدخل عنوان الاختبار"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  data-testid="exam-description-input"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="وصف مختصر للاختبار"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">التعليمات</Label>
                <Textarea
                  id="instructions"
                  data-testid="exam-instructions-input"
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  placeholder="تعليمات الاختبار للطلاب"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>أقسام الاختبار</Label>
                <div className="space-y-2">
                  {formData.sections.map((section, index) => (
                    <div
                      key={section.section_number}
                      className="flex items-center gap-4 p-3 bg-[#F3F4F6] rounded-lg"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#3A7D86] text-white flex items-center justify-center font-bold text-sm">
                        {section.section_number}
                      </span>
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const newSections = [...formData.sections];
                          newSections[index].title = e.target.value;
                          setFormData({ ...formData, sections: newSections });
                        }}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={section.duration_minutes}
                          onChange={(e) => {
                            const newSections = [...formData.sections];
                            newSections[index].duration_minutes = parseInt(
                              e.target.value
                            );
                            setFormData({ ...formData, sections: newSections });
                          }}
                          className="w-20"
                          min={1}
                        />
                        <span className="text-sm text-[#4B5563]">دقيقة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                data-testid="save-exam-btn"
                className="bg-[#3A7D86] hover:bg-[#2C6169]"
              >
                {editingExam ? "حفظ التعديلات" : "إنشاء الاختبار"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Time Settings Dialog */}
      <Dialog open={showTimeSettings} onOpenChange={setShowTimeSettings}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إعدادات الوقت - {selectedExam?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedExam?.sections?.map((section) => (
              <div
                key={section.section_number}
                className="flex items-center justify-between p-4 bg-[#F3F4F6] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#3A7D86] text-white flex items-center justify-center font-bold text-sm">
                    {section.section_number}
                  </span>
                  <span className="font-medium">{section.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={section.duration_minutes}
                    onChange={(e) =>
                      handleUpdateSectionTime(
                        section.section_number,
                        e.target.value
                      )
                    }
                    className="w-20"
                    min={1}
                  />
                  <span className="text-sm text-[#4B5563]">دقيقة</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowTimeSettings(false)}
              className="bg-[#3A7D86] hover:bg-[#2C6169]"
            >
              تم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamManagement;
