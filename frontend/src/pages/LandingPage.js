import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Clock,
  Award,
  CheckCircle2,
  BookOpen,
  Users,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Globe,
  MessageCircle,
  Twitter,
  Youtube,
  Send,
  MapPin,
  School, // 🚀 استيراد أيقونة المدرسة للشعار العائم
  Headphones, // الإبقاء على سماعة الدعم الفني للفوتر
  FileSpreadsheet
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  // التوجيه مع الفصل التام والآمن للبوابات المستقلة 🚀
  const handleLoginRedirect = (tabType) => {
    if (tabType === "student") {
      navigate("/login"); // الطلاب يذهبون لبوابة الطلاب المستقلة
    } else {
      navigate("/staff-login"); // المعلمون والمشرفون يذهبون لبوابة الكادر الإدارية المستقلة تماماً
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans selection:bg-[#3A7D86] selection:text-white" dir="rtl">
      
      {/* ==================== 1. NAVBAR / HEADER (شريط علوي سادة) ==================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-start">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2C6169] to-[#3A7D86] flex items-center justify-center shadow-md shadow-[#3A7D86]/20 transform hover:rotate-6 transition-all">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#1F2937] leading-tight">
                ثانوية الإمام الجويني
              </h1>
              <p className="text-xs font-semibold text-[#3A7D86]">
                منصة اختبارات القدرات والتحصيلي
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* ==================== 2. HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-[#F9FAFB] to-[#F3F4F6]">
        {/* Background Decorative Blurs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#3A7D86]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#2C6169]/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text Side */}
            <div className="lg:col-span-7 text-center lg:text-right space-y-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A7D86]/10 text-[#3A7D86] text-xs sm:text-sm font-bold border border-[#3A7D86]/20 shadow-sm animate-bounce">
                <Sparkles className="w-4 h-4 text-[#3A7D86]" />
                منظومة الاختبارات الإلكترونية الحديثة لعام 1448 / 2027
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1F2937] leading-tight tracking-tight">
                طريقك نحو <span className="text-[#3A7D86] underline decoration-[#3A7D86]/30 decoration-wavy">الـ 100%</span> في اختبارات القدرات والتحصيلي
              </h1>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                بيئة تفاعلية تحاكي الاختبارات القياسية الرسمية بتميز ودقة متناهية، مُصممة خصيصاً لطلاب **ثانوية الإمام الجويني** لتطوير مهارات الحل السريع وإدارة الوقت بنجاح.
              </p>

              {/* Action Buttons in Hero */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  onClick={() => handleLoginRedirect("student")}
                  className="w-full sm:w-auto bg-[#3A7D86] hover:bg-[#2C6169] text-white text-base font-bold px-8 py-6 rounded-2xl shadow-xl shadow-[#3A7D86]/30 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>ابدأ اختبارك الآن</span>
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Highlights Badge */}
              <div className="pt-6 border-t border-gray-200/60 grid grid-cols-3 gap-4 text-center lg:text-right">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#3A7D86]">100%</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">محاكاة قياس الحقيقية</p>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#3A7D86]">دقة عالية</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">إعداد المؤقت لكل قسم</p>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#3A7D86]">فوري</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">رصد وتقييم النتائج</p>
                </div>
              </div>

            </div>

            {/* Graphic / Interactive Card Side */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Visual Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 relative z-10 transform hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#3A7D86]/10 flex items-center justify-center text-[#3A7D86]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1F2937]">اختبار قدرات</h4>
                        <p className="text-xs text-gray-500">القسم الكمي واللفظي</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                      متاح الآن
                    </span>
                  </div>

                  {/* Mock Exam Status Box */}
                  <div className="space-y-3 bg-[#F9FAFB] p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#3A7D86]" /> العداد التنازلي للقسم:
                      </span>
                      <span className="font-mono font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">18:45 دقيقة</span>
                    </div>

                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#3A7D86] h-full w-2/3 rounded-full"></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                      <span>القسم الأول من 5</span>
                      <span>تم إكمال 12 سؤالاً</span>
                    </div>
                  </div>

                  {/* Buttons inside Mock Card */}
                  <div className="mt-5 space-y-2">
                    <button
                      onClick={() => handleLoginRedirect("student")}
                      className="w-full py-3 bg-[#3A7D86] hover:bg-[#2C6169] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> إدخال كود الطالب والبدء
                    </button>
                  </div>
                </div>

                {/* Floating Floating Badge 1 */}
                <div className="absolute -top-6 -right-6 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 z-20 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">نتائج فورية</p>
                    <p className="text-[10px] text-gray-500">تقارير دقيقة للمعلمين</p>
                  </div>
                </div>

                {/* Floating Badge 2 (تم تغيير الأيقونة هنا إلى School) 🚀 */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 z-20 flex items-center gap-3 hidden sm:flex">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <School className="w-6 h-6" /> {/* هنا تم تغيير الأيقونة 🏫 */}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">خاص بطلاب الإمام الجويني</p>
                    <p className="text-[10px] text-gray-500">منظومة إلكترونية متكاملة</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 3. FEATURES SECTION ==================== */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-[#3A7D86] uppercase tracking-wider mb-2">مميزات المنصة التعليمية</h2>
            <p className="text-2xl sm:text-4xl font-black text-[#1F2937]">لماذا اختيرت هذه المنصة لاختبارات الثانوية؟</p>
            <div className="w-16 h-1 bg-[#3A7D86] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-[#F9FAFB] border border-gray-100 hover:border-[#3A7D86]/30 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#3A7D86]/10 text-[#3A7D86] flex items-center justify-center mb-6 group-hover:bg-[#3A7D86] group-hover:text-white transition-all">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-3">مؤقت محاكي لكل قسم</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                ضبط توقيت دقيق لكل قسم منفصل في اختبارات القدرات والتحصيلي لتعويد الطالب على الانضباط وإدارة الوقت الفعلي للاختبار.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-[#F9FAFB] border border-gray-100 hover:border-[#3A7D86]/30 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#3A7D86]/10 text-[#3A7D86] flex items-center justify-center mb-6 group-hover:bg-[#3A7D86] group-hover:text-white transition-all">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-3">تصدير التقارير بضغطة زر</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                إمكانية استخراج نتائج الطلاب مباشرة مع توضيح الدرجة والنسبة المئوية واسم المدرسة والمرحلة الدراسية.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-[#F9FAFB] border border-gray-100 hover:border-[#3A7D86]/30 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#3A7D86]/10 text-[#3A7D86] flex items-center justify-center mb-6 group-hover:bg-[#3A7D86] group-hover:text-white transition-all">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-3">دخول آمن بأكواد خاصة</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                توليد أكواد دخول مخصصة ومفعلة لكل اختبار لضمان وصول الطلاب المصرح لهم فقط والحفاظ على سرية ونزاهة الاختبارات.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 4. HOW IT WORKS (خطوات استخدام المنصة) ==================== */}
      <section className="py-16 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937]">كيف يبدأ الطالب الاختبار؟</h2>
            <p className="text-gray-500 text-sm mt-2">ثلاث خطوات بسيطة للدخول والبدء في حل الأسئلة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
              <div className="w-12 h-12 bg-[#3A7D86] text-white font-black text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#3A7D86]/20">
                1
              </div>
              <h4 className="font-bold text-lg text-[#1F2937] mb-2">الحصول على الكود</h4>
              <p className="text-gray-500 text-xs leading-relaxed">احصل على كود الاختبار المعتمد من قبل معلم أو مشرف المادة.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
              <div className="w-12 h-12 bg-[#3A7D86] text-white font-black text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#3A7D86]/20">
                2
              </div>
              <h4 className="font-bold text-lg text-[#1F2937] mb-2">إدخال البيانات</h4>
              <p className="text-gray-500 text-xs leading-relaxed">أدخل كود الدخول واسمك الكامل واختيار المرحلة الدراسية بوضوح.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
              <div className="w-12 h-12 bg-[#3A7D86] text-white font-black text-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#3A7D86]/20">
                3
              </div>
              <h4 className="font-bold text-lg text-[#1F2937] mb-2">البدء والتسليم</h4>
              <p className="text-gray-500 text-xs leading-relaxed">أجب عن الأسئلة الموزعة على الأقسام وانتقل بينها حتى إنهاء الاختبار.</p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================== 5. CALL TO ACTION BANNER ==================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#2C6169] to-[#3A7D86] rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-4xl font-black">جاهز لتدريب وتطوير قدراتك الآن؟</h3>
            <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">
              اضغط على التبويب المناسب للوصول المباشر لمنصة الاختبارات الإلكترونية لثانوية الإمام الجويني.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => handleLoginRedirect("student")}
                className="bg-white text-[#3A7D86] hover:bg-gray-100 font-bold text-sm px-8 py-6 rounded-xl shadow-md transition-all"
              >
                بوابة دخول الطلاب
              </Button>
              <Button
                onClick={() => handleLoginRedirect("staff")}
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 font-bold text-sm px-8 py-6 rounded-xl transition-all"
              >
                بوابة دخول المعلمين والمشرفين
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. FOOTER (الفوتر المحدث بـ 3 أعمدة وبسماعة الدعم الفني) ==================== */}
      <footer className="bg-[#1F2937] text-gray-300 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* تقسيم الـ 3 أعمدة المتناسق والجميل بعد حذف "روابط سريعة" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-gray-800">
            
            {/* School Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3A7D86] flex items-center justify-center text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">ثانوية الإمام الجويني</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                المنصة الإلكترونية الرسمية لاختبارات القدرات والتحصيلي بـ ثانوية الإمام الجويني، تهدف لرفع الجاهزية والتميز الأكاديمي لدى الطلاب.
              </p>
            </div>
          
            {/* Support & Contact */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 border-r-2 border-[#3A7D86] pr-2">الدعم والمساندة</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3A7D86]" /> المملكة العربية السعودية - إدارة التعليم غرب الرياض
                </li>
                {/* 🎧 استبدال شعار المدرسة بسماعة الدعم الفني كطلبك بدقة بالغة */}
                <li className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#3A7D86]" /> للدعم الفني يرجى التواصل مع إدارة المدرسة 
                </li>
              </ul>
            </div>

            {/* Social Media Icons */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 border-r-2 border-[#3A7D86] pr-2">تواصل معنا</h4>
              <p className="text-xs text-gray-400 mb-4">تابع آخر تحديثات ومواعيد اختبارات القدرات والتحصيلي:</p>
              
              <div className="flex items-center gap-3">
                {/* X / Twitter */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  title="منصة X"
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-[#3A7D86] text-gray-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                >
                  <Twitter className="w-4 h-4" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noreferrer"
                  title="واتساب"
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                {/* Telegram */}
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  title="تليجرام"
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-sky-500 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  title="يوتيوب"
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Copyrights */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>جميع الحقوق محفوظة © ثانوية الإمام الجويني {new Date().getFullYear()}</p>
            <p className="flex items-center gap-1">
              منصة الاختبارات الإلكترونية - القدرات والتحصيلي
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;