import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useState } from "react";
import { CheckCircle, Rocket, Clock, Shield, Users, Zap } from "lucide-react";
import { api } from "../api/client";

export default function RegistrationFormSection() {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    goal: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api.registerCustomer({
        name: formData.name,
        whatsapp: formData.whatsapp,
        goal: formData.goal || undefined,
      });
      
      alert("تم التسجيل بنجاح! جاري تحويلك لصفحة التأكيد...");
      // Reset form
      setFormData({ name: "", whatsapp: "", goal: "" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.";
      setSubmitError(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E91E8C] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#6B46C1] rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#E91E8C]/10 border border-[#E91E8C]/20 rounded-full px-5 py-2 mb-6">
              <Rocket className="w-4 h-4 text-[#E91E8C]" />
              <span className="text-white/80 text-sm">ابدأ رحلتك الآن</span>
            </div>
            
            <h2 className="text-white mb-4 max-w-3xl mx-auto leading-tight">
              الفرصة مش راح تضل مفتوحة! 🚀
            </h2>
            
            <p className="text-white/70 text-xl max-w-2xl mx-auto">
              احجز مقعدك الآن في التعليم وتعرف كيف تبدأ تداول بثقة
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left Side - Benefits */}
            <div className="lg:col-span-2 space-y-6">
              {/* Urgency Card */}
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-[#2A1A4D] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E91E8C]/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#E91E8C]" />
                    </div>
                    <h3 className="text-white">مقاعد محدودة!</h3>
                  </div>
                  <p className="text-white/80 mb-2">
                    متبقي <span className="text-[#E91E8C] text-xl">37 مقعد فقط</span>
                  </p>
                  <p className="text-white/60 text-sm">
                    في بث هذا الأسبوع ⏱
                  </p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-white mb-4">ليش تنضم الآن؟</h3>
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-[#E91E8C]" />
                  </div>
                  <p className="text-white/70 text-sm">بث مباشر مجاني 100%</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-[#E91E8C]" />
                  </div>
                  <p className="text-white/70 text-sm">شاهد تحليل السوق لحظة بلحظة</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-[#E91E8C]" />
                  </div>
                  <p className="text-white/70 text-sm">تفاعل مباشر مع المدربين</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E91E8C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-[#E91E8C]" />
                  </div>
                  <p className="text-white/70 text-sm">بدون أي التزامات مالية</p>
                </div>
              </div>

              {/* Social Proof Mini */}
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <Users className="w-5 h-5 text-[#E91E8C]" />
                <div>
                  <p className="text-white text-sm">انضم لـ <span className="text-[#E91E8C]">+3000</span> متداول</p>
                  <p className="text-white/50 text-xs">حققوا أول أرباحهم معنا</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
                {/* Form Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-2xl">سجّل الآن</h3>
                    <p className="text-white/60 text-sm">املأ البيانات للحجز</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="text-white/90 text-sm">
                      الاسم الكامل <span className="text-[#E91E8C]">*</span>
                    </Label>
                    <Input
                      id="fullname"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#E91E8C] focus:bg-white/10 transition-all rounded-xl"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  {/* WhatsApp Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/90 text-sm">
                      رقم الواتساب <span className="text-[#E91E8C]">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#E91E8C] focus:bg-white/10 transition-all rounded-xl"
                      placeholder="مثال: 0599123456"
                    />

                  </div>

                  {/* Goal Selection */}
                  <div className="space-y-3">
                    <Label className="text-white/90 text-sm">
                      هدفك من التداول <span className="text-white/40 text-xs">(اختياري)</span>
                    </Label>
                    <RadioGroup 
                      value={formData.goal}
                      onValueChange={(value) => setFormData({...formData, goal: value})}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/10 hover:border-[#E91E8C]/30 transition-all cursor-pointer">
                        <RadioGroupItem value="income" id="income" className="border-white/30 text-[#E91E8C]" />
                        <Label htmlFor="income" className="text-white/80 cursor-pointer flex-grow text-sm">
                          💸 بدي أخلق دخل إضافي ثابت يحسّن وضعي المادي
                        </Label>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/10 hover:border-[#E91E8C]/30 transition-all cursor-pointer">
                        <RadioGroupItem value="career" id="career" className="border-white/30 text-[#E91E8C]" />
                        <Label htmlFor="career" className="text-white/80 cursor-pointer flex-grow text-sm">
                          🚀 هدفي أخليه شغلي الأساسي وأتفرّغ إله
                        </Label>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/10 hover:border-[#E91E8C]/30 transition-all cursor-pointer">
                        <RadioGroupItem value="learn" id="learn" className="border-white/30 text-[#E91E8C]" />
                        <Label htmlFor="learn" className="text-white/80 cursor-pointer flex-grow text-sm">
                          🎯 بدي أتعلم المجال وأفهمه بعمق قبل ما أبدأ فعليًا
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                      {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white shadow-lg shadow-[#E91E8C]/25 hover:shadow-[#E91E8C]/40 transition-all duration-300 hover:scale-[1.02] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2">
                        {isSubmitting ? "جاري التسجيل..." : "احجز مقعدك الآن 🚀"}
                      </span>
                    </Button>
                  </div>

                  {/* Privacy Note */}
                  <div className="pt-2 flex items-start gap-2 text-white/50 text-xs">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>
                      بياناتك آمنة 100% ومحمية. لن نشارك معلوماتك مع أي طرف ثالث.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
