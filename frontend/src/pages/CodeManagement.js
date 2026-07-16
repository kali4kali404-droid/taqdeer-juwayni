import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Key, RefreshCw, Power } from "lucide-react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getStudentCodes = () => API.get("/admin/student-codes");
const createStudentCode = (data) => API.post("/admin/student-code", data);
const updateStudentCode = (id, data) => API.put(`/admin/student-codes/${id}`, data);
const toggleStudentCode = (id) => API.put(`/admin/student-codes/${id}/toggle`);
const deleteStudentCode = (id) => API.delete(`/admin/student-codes/${id}`);

const CodeManagement = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [codeValue, setCodeValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const response = await getStudentCodes();
      setCodes(response.data || []);
    } catch (error) {
      console.error("Error fetching codes:", error);
      toast.error("حدث خطأ في تحميل أكواد الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (codeObj = null) => {
    if (codeObj) {
      setEditingCode(codeObj);
      setCodeValue(codeObj.code);
    } else {
      setEditingCode(null);
      setCodeValue(""); 
    }
    setShowForm(true);
  };

  // توليد كود عشوائي للسرعة داخل الفورم
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCodeValue(random);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codeValue.trim()) {
      toast.error("الرجاء كتابة كود أو اختيار توليد تلقائي");
      return;
    }
    try {
      if (editingCode) {
        await updateStudentCode(editingCode.id, { code: codeValue });
        toast.success("تم تعديل الكود بنجاح");
      } else {
        await createStudentCode({ code: codeValue });
        toast.success("تم توليد وإنشاء كود دخول جديد");
      }
      setShowForm(false);
      fetchCodes();
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error(error.response?.data?.detail || "حدث خطأ في حفظ الكود");
    }
  };

  const handleToggleActive = async (codeId) => {
    try {
      const response = await toggleStudentCode(codeId);
      toast.success(response.data.message);
      fetchCodes();
    } catch (error) {
      console.error("Error toggling code:", error);
      toast.error("حدث خطأ في تغيير حالة الكود");
    }
  };

  const handleDelete = async (codeId) => {
    if (!window.confirm("تنبيه: هل أنت متأكد من حذف كود دخول الطلاب هذا؟")) return;
    try {
      await deleteStudentCode(codeId);
      toast.success("تم حذف كود الدخول بنجاح");
      fetchCodes();
    } catch (error) {
      console.error("Error deleting code:", error);
      toast.error("حدث خطأ في حذف الكود");
    }
  };

  // فلترة الأكواد بحسب محرك البحث
  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">إدارة أكواد الدخول</h1>
          <p className="text-[#4B5563]">توليد الأكواد للطلاب يدوياً أو تلقائياً، تفعيلها أو تعطيلها</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCodes} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button
            onClick={() => handleOpenForm()}
            className="bg-[#3A7D86] hover:bg-[#2C6169] text-white"
          >
            <Plus className="w-5 h-5 ml-2" />
            إنشاء كود مخصص / تلقائي
          </Button>
        </div>
      </div>

      {/* شريط البحث المترابط */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-[#4B5563]" />
            <Input
              placeholder="ابحث عن كود دخول محدد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {loading && codes.length === 0 ? (
        <div className="text-center py-8 text-[#4B5563]">جاري التحميل...</div>
      ) : filteredCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#4B5563]">لا توجد أكواد دخول مطابقة للبحث</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Table className="table-rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">كود الدخول</TableHead>
                <TableHead className="text-right">تاريخ التوليد</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.map((codeObj) => (
                <TableRow key={codeObj.id}>
                  <TableCell className="font-bold text-lg text-[#1F2937]">
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded border border-gray-200">
                      {codeObj.code}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {codeObj.created_at ? new Date(codeObj.created_at).toLocaleDateString("ar-SA") : "-"}
                  </TableCell>
                  <TableCell>
                    {codeObj.active !== false ? (
                      <Badge className="bg-[#D1FAE5] text-[#10B981] font-semibold">نشط (متاح للدخول)</Badge>
                    ) : (
                      <Badge className="bg-[#FEE2E2] text-[#EF4444] font-semibold">معطل (موقوف مؤقتاً)</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(codeObj.id)}
                        className={codeObj.active !== false ? "text-[#EF4444] hover:bg-red-50" : "text-[#10B981] hover:bg-green-50"}
                      >
                        <Power className="w-4 h-4 ml-1" />
                        {codeObj.active !== false ? "تعطيل الكود" : "تنشيط الكود"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(codeObj)}
                      >
                        <Pencil className="w-4 h-4 ml-1" />
                        تعديل الكود
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(codeObj.id)}
                        className="text-[#EF4444] hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف الكود
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* نافذة إنشاء وتعديل الكود التفاعلية والأنيقة */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingCode ? "تعديل كود الدخول" : "إنشاء كود دخول للطلاب"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codeValue" className="font-semibold text-gray-700">كود الدخول</Label>
                <div className="flex gap-2">
                  <Input
                    id="codeValue"
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                    placeholder="اكتب كوداً يدوياً (أرقام فقط، حروف فقط، أو كلاهما)"
                    className="flex-1 font-mono uppercase font-bold text-lg"
                  />
                  {!editingCode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                      className="border-[#3A7D86] text-[#3A7D86] hover:bg-[#E0F2F4] font-semibold"
                    >
                      توليد عشوائي
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  * ميزة مرنة: يمكنك كتابة أي كود يناسبك أو الضغط على "توليد عشوائي" ليقوم النظام بتوليده.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 justify-start border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-[#3A7D86] hover:bg-[#2C6169] text-white font-semibold">
                {editingCode ? "حفظ التعديل" : "حفظ الكود وإنشاؤه"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodeManagement;