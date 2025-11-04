import { Button } from "./ui/button";
import { Quote, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function TransformationStory() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    city: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("تم حجز مقعدك بنجاح! سنتواصل معك قريباً على الواتساب");
    setShowDialog(false);
  };

  return (
    <>
      <section className="py-20 bg-[#3D2463] relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-white mb-4">
                من <span className="text-[#E91E8C]">الشك</span> للـ <span className="text-[#E91E8C]">نجاح</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mx-auto"></div>
            </div>

            {/* Story Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12 mb-12 relative overflow-hidden">
              <Quote className="absolute top-8 right-8 w-20 h-20 text-[#E91E8C]/10" />
              
              <div className="relative z-10">
                <div className="space-y-6 text-white/90 text-lg leading-relaxed">
                  <p>
                    "كنت مفكر التداول <span className="text-[#E91E8C]">قمار</span>، بس لما حضرت أول بث مع FX فهمت إنه <span className="text-[#E91E8C]">علم مش حظ</span>."
                  </p>
                  
                  <div className="bg-[#E91E8C]/10 border-r-4 border-[#E91E8C] p-6 rounded-lg">
                    <p className="text-white">
                      بعد أول أسبوع… دخلت أول صفقة ناجحة بحياتي.
                    </p>
                  </div>
                  
                  <p>
                    الفرق كان بسيط: <span className="text-[#E91E8C]">توجيه صح، مدرب حقيقي، مجتمع بدعمك.</span>
                  </p>
                </div>

                {/* Testimonial Author */}
                <div className="mt-8 pt-8 border-t border-[#E91E8C]/30 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center text-white text-2xl">
                    م
                  </div>
                  <div>
                    <p className="text-[#E91E8C]">محمد الأحمد</p>
                    <p className="text-white/50 text-sm">متداول من نابلس - بدأ قبل 6 أشهر</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Mini Stories */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Quote className="w-10 h-10 text-[#E91E8C]/30 mb-4" />
                <p className="text-white/80 mb-4">
                  "أول ما شفت التحليل المباشر فهمت ليش كنت خسران. الموضوع كان بسيط بس محتاج توجيه."
                </p>
                <p className="text-[#E91E8C] text-sm">سارة من رام الله</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Quote className="w-10 h-10 text-[#E91E8C]/30 mb-4" />
                <p className="text-white/80 mb-4">
                  "الدعم المستمر هو اللي خلاني أكمل. كل سؤال عندي لاقيله جواب فوراً."
                </p>
                <p className="text-[#E91E8C] text-sm">أحمد من غزة</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <div className="mb-6">
                <p className="text-white/70 text-lg mb-4">
                  قصتك القادمة ممكن تبدأ اليوم 👇
                </p>
              </div>
              
              <Button 
                size="lg"
                onClick={() => setShowDialog(true)}
                className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white px-12 py-6 shadow-xl hover:shadow-[#E91E8C]/50 transition-all duration-300"
              >
                احضر الجلسة المجانية القادمة
                <ArrowLeft className="mr-3 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#3D2463] border-[#E91E8C]/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-[#E91E8C]">
              احجز مقعدك المجاني الآن 🔥
            </DialogTitle>
            <DialogDescription className="sr-only">
              نموذج التسجيل في البث المباشر المجاني
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <Label htmlFor="name" className="text-white mb-2 block">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp" className="text-white mb-2 block">رقم الواتساب</Label>
              <Input
                id="whatsapp"
                type="tel"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="مثال: 0599123456"
              />
            </div>
            
            <div>
              <Label htmlFor="city" className="text-white mb-2 block">المدينة</Label>
              <Input
                id="city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="مثال: رام الله"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white py-6"
            >
              تأكيد الحجز 🎯
            </Button>
            
            <p className="text-white/60 text-sm text-center">
              بياناتك آمنة معنا 100% ولن يتم مشاركتها مع أي طرف ثالث
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
