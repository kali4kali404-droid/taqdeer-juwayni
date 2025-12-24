import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getExams,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/api";
import { Plus, Pencil, Trash2, HelpCircle, Filter } from "lucide-react";

const QuestionManagement = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    exam_id: "",
    section_number: 1,
    points: 1,
    options: [
      { id: crypto.randomUUID(), text: "", is_correct: false },
      { id: crypto.randomUUID(), text: "", is_correct: false },
      { id: crypto.randomUUID(), text: "", is_correct: false },
      { id: crypto.randomUUID(), text: "", is_correct: false },
    ],
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam || selectedSection) {
      fetchQuestions();
    } else {
      fetchQuestions();
    }
  }, [selectedExam, selectedSection]);

  const fetchExams = async () => {
    try {
      const response = await getExams();
      setExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await getQuestions(
        selectedExam || undefined,
        selectedSection || undefined
      );
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("حدث خطأ في تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        text: question.text,
        exam_id: question.exam_id,
        section_number: question.section_number,
        points: question.points || 1,
        options: question.options || [
          { id: crypto.randomUUID(), text: "", is_correct: false },
          { id: crypto.randomUUID(), text: "", is_correct: false },
          { id: crypto.randomUUID(), text: "", is_correct: false },
          { id: crypto.randomUUID(), text: "", is_correct: false },
        ],
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        text: "",
        exam_id: selectedExam || "",
        section_number: selectedSection ? parseInt(selectedSection) : 1,
        points: 1,
        options: [
          { id: crypto.randomUUID(), text: "", is_correct: false },
          { id: crypto.randomUUID(), text: "", is_correct: false },
          { id: crypto.randomUUID(), text: "", is_correct: false },
          { id: crypto.randomUUID(), text: "", is_correct: false },
        ],
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one correct option
    const hasCorrect = formData.options.some((opt) => opt.is_correct);
    if (!hasCorrect) {
      toast.error("الرجاء تحديد إجابة صحيحة واحدة على الأقل");
      return;
    }

    // Validate all options have text
    const emptyOptions = formData.options.filter((opt) => !opt.text.trim());
    if (emptyOptions.length > 0) {
      toast.error("الرجاء ملء جميع خيارات الإجابة");
      return;
    }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, {
          text: formData.text,
          section_number: formData.section_number,
          points: formData.points,
          options: formData.options,
        });
        toast.success("تم تحديث السؤال بنجاح");
      } else {
        await createQuestion(formData);
        toast.success("تم إنشاء السؤال بنجاح");
      }
      setShowForm(false);
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("حدث خطأ في حفظ السؤال");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await deleteQuestion(questionId);
      toast.success("تم حذف السؤال بنجاح");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("حدث خطأ في حذف السؤال");
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === "is_correct" && value === true) {
      // Only one correct answer
      newOptions.forEach((opt, i) => {
        opt.is_correct = i === index;
      });
    } else {
      newOptions[index][field] = value;
    }
    setFormData({ ...formData, options: newOptions });
  };

  const getExamTitle = (examId) => {
    const exam = exams.find((e) => e.id === examId);
    return exam?.title || "غير محدد";
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">إدارة الأسئلة</h1>
          <p className="text-[#4B5563]">إضافة وتعديل وحذف الأسئلة</p>
        </div>
        <Button
          data-testid="create-question-btn"
          onClick={() => handleOpenForm()}
          className="bg-[#3A7D86] hover:bg-[#2C6169]"
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة سؤال جديد
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-[#4B5563]" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedExam || "all"} onValueChange={(value) => setSelectedExam(value === "all" ? "" : value)}>
                <SelectTrigger data-testid="filter-exam-select">
                  <SelectValue placeholder="جميع الاختبارات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الاختبارات</SelectItem>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger data-testid="filter-section-select">
                  <SelectValue placeholder="جميع الأقسام" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأقسام</SelectItem>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      القسم {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8 text-[#4B5563]">جاري التحميل...</div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#4B5563]">لا توجد أسئلة حالياً</p>
            <Button
              onClick={() => handleOpenForm()}
              className="mt-4 bg-[#3A7D86] hover:bg-[#2C6169]"
            >
              إضافة أول سؤال
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table className="table-rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right w-1/2">السؤال</TableHead>
                <TableHead className="text-right">الاختبار</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الدرجة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">
                    <p className="truncate max-w-md">{question.text}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getExamTitle(question.exam_id)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-[#E0F2F4] text-[#3A7D86]">
                      القسم {question.section_number}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.points || 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        data-testid={`edit-question-${question.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(question)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        data-testid={`delete-question-${question.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
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

      {/* Create/Edit Question Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "تعديل السؤال" : "إضافة سؤال جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاختبار</Label>
                  <Select
                    value={formData.exam_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, exam_id: value })
                    }
                    required
                  >
                    <SelectTrigger data-testid="question-exam-select">
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
                </div>
                <div className="space-y-2">
                  <Label>القسم</Label>
                  <Select
                    value={String(formData.section_number)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, section_number: parseInt(value) })
                    }
                  >
                    <SelectTrigger data-testid="question-section-select">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          القسم {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionText">نص السؤال</Label>
                <Textarea
                  id="questionText"
                  data-testid="question-text-input"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder="أدخل نص السؤال"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>الدرجة</Label>
                <Input
                  type="number"
                  data-testid="question-points-input"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({ ...formData, points: parseInt(e.target.value) })
                  }
                  min={1}
                  className="w-24"
                />
              </div>

              <div className="space-y-2">
                <Label>خيارات الإجابة</Label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                        option.is_correct
                          ? "border-[#10B981] bg-[#D1FAE5]/30"
                          : "border-[#E5E7EB]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          option.is_correct
                            ? "bg-[#10B981] text-white"
                            : "bg-[#F3F4F6] text-[#4B5563]"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        data-testid={`option-${index}-input`}
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(index, "text", e.target.value)
                        }
                        placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          data-testid={`option-${index}-correct`}
                          checked={option.is_correct}
                          onCheckedChange={(checked) =>
                            handleOptionChange(index, "is_correct", checked)
                          }
                        />
                        <Label className="text-sm text-[#4B5563]">صحيح</Label>
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
                data-testid="save-question-btn"
                className="bg-[#3A7D86] hover:bg-[#2C6169]"
              >
                {editingQuestion ? "حفظ التعديلات" : "إضافة السؤال"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionManagement;
