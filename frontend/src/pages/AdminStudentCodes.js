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

// إنشاء اتصال مستقل ومباشر بالباكند لتفادي أي نقص في ملف api.js
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

// تعريف الدوال البرمجية مباشرة داخل الملف لضمان استقراره الكامل
const getStudentCodes = () => API.get("/admin/student-codes");
const createStudentCode = (data) => API.post("/admin/student-code", data);
const updateStudentCode = (id, data) => API.put(`/admin/student-codes/${id}`, data);
const toggleStudentCode = (id) => API.put(`/admin/student-codes/${id}/toggle`);
const deleteStudentCode = (id) => API.delete(`/admin/student-codes/${id}`);

export default function AdminStudentCodes() {
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

  // توليد كود عشوائي بضغطة زر داخل النافذة
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
      toast.error("الرجاء كتابة كود أو النقر على توليد عشوائي");
      return;
    }
    try {
      if (editingCode) {
        await updateStudentCode(editingCode.id, { code: codeValue });
        toast.success("تم تعديل الكود بنجاح");
      } else {
        await createStudentCode({ code: codeValue });
        toast.success("تم حفظ وإنشاء كود الدخول الجديد");
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

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" dir="rtl" style={{ padding: "20px" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 text-right">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">إدارة أكواد الدخول للطلاب</h1>
          <p className="text-[#4B5563] text-sm mt-1">توليد الأكواد تلقائياً، كتابة أكواد مخصصة يدوياً، وتفعيلها أو إيقافها</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCodes} disabled={loading} className="text-gray-700">
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث القائمة
          </Button>
          <Button
            onClick={() => handleOpenForm()}
            className="bg-[#3A7D86] hover:bg-[#2C6169] text-white font-semibold"
          >
            <Plus className="w-5 h-5 ml-2" />
            إنشاء كود (مخصص أو تلقائي)
          </Button>
        </div>
      </div>

      {/* محرك البحث للأكواد */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-[#4B5563]" />
            <Input
              placeholder="ابحث عن كود دخول محدد للطلاب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white text-right"
            />
          </div>
        </CardContent>
      </Card>

      {loading && codes.length === 0 ? (
        <div className="text-center py-8 text-[#4B5563]">جاري تحميل البيانات...</div>
      ) : filteredCodes.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <Key className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#4B5563]">لا توجد أكواد دخول منشأة حالياً أو مطابقة للبحث</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Table className="table-rtl text-right">
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
                    <span className="font-mono bg-gray-100 px-4 py-1.5 rounded border border-gray-200">
                      {codeObj.code}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {codeObj.created_at ? new Date(codeObj.created_at).toLocaleDateString("ar-SA") : "-"}
                  </TableCell>
                  <TableCell>
                    {codeObj.active !== false ? (
                      <Badge className="bg-[#D1FAE5] text-[#10B981] font-bold px-3 py-1 rounded">نشط (متاح للدخول)</Badge>
                    ) : (
                      <Badge className="bg-[#FEE2E2] text-[#EF4444] font-bold px-3 py-1 rounded">معطل (موقوف مؤقتاً)</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-start">
                      {/* تبديل التشغيل والتعطيل بضغطة زر */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(codeObj.id)}
                        className={codeObj.active !== false ? "text-[#EF4444] hover:bg-red-50 font-semibold" : "text-[#10B981] hover:bg-green-50 font-semibold"}
                      >
                        <Power className="w-4 h-4 ml-1" />
                        {codeObj.active !== false ? "تعطيل الكود" : "تنشيط الكود"}
                      </Button>
                      
                      {/* تعديل الكود ليكون أي كلمة أو رقم تختارها يدوياً */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(codeObj)}
                        className="text-gray-700 font-semibold"
                      >
                        <Pencil className="w-4 h-4 ml-1" />
                        تعديل الكود
                      </Button>

                      {/* حذف الكود */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(codeObj.id)}
                        className="text-[#EF4444] hover:bg-red-50 font-semibold"
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* نافذة إنشاء وتعديل الكود المخصصة والتلقائية */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent dir="rtl" className="text-right">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              {editingCode ? "تعديل وتغيير كود الدخول" : "توليد أو إنشاء كود دخول جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codeValue" className="font-semibold text-gray-700">قيمة كود الدخول</Label>
                <div className="flex gap-2">
                  <Input
                    id="codeValue"
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                    placeholder="اكتب كوداً يدوياً مخصصاً (حروف، أرقام، أو الاثنين معاً)"
                    className="flex-1 font-mono uppercase font-bold text-lg text-center"
                  />
                  {!editingCode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                      className="border-[#3A7D86] text-[#3A7D86] hover:bg-[#E0F2F4] font-bold"
                    >
                      توليد تلقائي
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  * **ميزة مخصصة لك:** يمكنك كتابة أي كود ترغب به يدوياً (مثلاً أرقام فقط: `12345` أو حروف فقط: `JOWAYNI` أو كلاهما)، أو انقر على زر **"توليد تلقائي"** ليصنع النظام كوداً عشوائياً.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 justify-start border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-[#3A7D86] hover:bg-[#2C6169] text-white font-semibold">
                {editingCode ? "حفظ التعديل الجديد" : "حفظ الكود ونشره للطلاب"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}