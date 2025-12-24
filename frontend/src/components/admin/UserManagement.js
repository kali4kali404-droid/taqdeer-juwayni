import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api";
import { Plus, Pencil, Trash2, Users, UserCheck, UserX } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "student",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("حدث خطأ في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        full_name: user.full_name,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        full_name: "",
        role: "student",
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
        });
        toast.success("تم تحديث المستخدم بنجاح");
      } else {
        await createUser(formData);
        toast.success("تم إنشاء المستخدم بنجاح");
      }
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error.response?.data?.detail || "حدث خطأ في حفظ المستخدم");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      await deleteUser(userId);
      toast.success("تم حذف المستخدم بنجاح");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ في حذف المستخدم");
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-[#EDE9FE] text-[#7C3AED]">مشرف</Badge>;
      case "teacher":
        return <Badge className="bg-[#DBEAFE] text-[#3B82F6]">معلم</Badge>;
      default:
        return <Badge className="bg-[#D1FAE5] text-[#10B981]">طالب</Badge>;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "مشرف";
      case "teacher":
        return "معلم";
      default:
        return "طالب";
    }
  };

  const admins = users.filter((u) => u.role === "admin");
  const teachers = users.filter((u) => u.role === "teacher");
  const students = users.filter((u) => u.role === "student");

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">إدارة المستخدمين</h1>
          <p className="text-[#4B5563]">إضافة وإدارة المشرفين والمعلمين والطلاب</p>
        </div>
        <Button
          data-testid="create-user-btn"
          onClick={() => handleOpenForm()}
          className="bg-[#3A7D86] hover:bg-[#2C6169]"
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-r-4 border-r-[#7C3AED]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1F2937]">{admins.length}</p>
                <p className="text-sm text-[#4B5563]">مشرفون</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-[#3B82F6]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1F2937]">{teachers.length}</p>
                <p className="text-sm text-[#4B5563]">معلمون</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-[#10B981]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1F2937]">{students.length}</p>
                <p className="text-sm text-[#4B5563]">طلاب</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#4B5563]">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#4B5563]">لا يوجد مستخدمون حالياً</p>
            <Button
              onClick={() => handleOpenForm()}
              className="mt-4 bg-[#3A7D86] hover:bg-[#2C6169]"
            >
              إضافة أول مستخدم
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table className="table-rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم الكامل</TableHead>
                <TableHead className="text-right">اسم المستخدم</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge className="bg-[#D1FAE5] text-[#10B981]">نشط</Badge>
                    ) : (
                      <Badge className="bg-[#FEE2E2] text-[#EF4444]">معطل</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        data-testid={`edit-user-${user.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        data-testid={`delete-user-${user.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-[#EF4444]"
                        disabled={user.role === "admin" && admins.length <= 1}
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

      {/* Create/Edit User Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  data-testid="user-fullname-input"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="أدخل الاسم الكامل"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  data-testid="user-username-input"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="أدخل اسم المستخدم"
                  required
                  disabled={!!editingUser}
                />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    data-testid="user-password-input"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger data-testid="user-role-select">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مشرف</SelectItem>
                    <SelectItem value="teacher">معلم</SelectItem>
                    <SelectItem value="student">طالب</SelectItem>
                  </SelectContent>
                </Select>
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
                data-testid="save-user-btn"
                className="bg-[#3A7D86] hover:bg-[#2C6169]"
              >
                {editingUser ? "حفظ التعديلات" : "إضافة المستخدم"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
