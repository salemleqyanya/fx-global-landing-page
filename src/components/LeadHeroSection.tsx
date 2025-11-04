import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Flame, Users, Video, MessageCircle } from "lucide-react";
import VimeoPlayer from "./VimeoPlayer";
import { api, VideoData } from "../api/client";

export default function LeadHeroSection() {
  const [showDialog, setShowDialog] = useState(false);
  const [heroVideo, setHeroVideo] = useState<VideoData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    city: ""
  });

  useEffect(() => {
    // Fetch hero video from Django API
    api.getHeroVideo().then(setHeroVideo);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.registerCustomer({
        name: formData.name,
        whatsapp: formData.whatsapp,
        city: formData.city,
      });
      alert("تم حجز مقعدك بنجاح! سنتواصل معك قريباً على الواتساب");
      setShowDialog(false);
      setFormData({ name: "", whatsapp: "", city: "" });
    } catch (error) {
      alert("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      console.error("Registration error:", error);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#E91E8C]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#6B46C1]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Headline */}
            <div className="mb-8">
              <h1 className="text-white mb-6 leading-tight text-[34px] font-bold underline">
                أكيد سمعت عن التداول... بس ولا مرة حدا علمك كيف تبدأ صح 💰
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mx-auto mb-6"></div>
              <p className="text-white/90 text-xl md:text-2xl leading-relaxed font-bold no-underline">
                إحنا بـ FX Global رح نعلّمك من الصفر كيف تدخل السوق،<br />
                كيف تحلل بثقة، وكيف تحوّل مهارتك لمصدر دخل حقيقي!
              </p>
            </div>

            {/* Video Placeholder */}
            <div className="mb-8 max-w-3xl mx-auto">
              <div className="relative aspect-video bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#E91E8C]/50 shadow-2xl">
                {heroVideo ? (
                  <VimeoPlayer 
                    videoId={heroVideo.vimeo_id || undefined}
                    videoUrl={heroVideo.video_url || heroVideo.video_file_url || undefined}
                  />
                ) : (
                  <VimeoPlayer videoId="1133539416" />
                )}
              </div>
            </div>

            {/* Main CTA Button */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#E91E8C] blur-2xl opacity-50 rounded-full animate-pulse"></div>
                <Button 
                  size="lg"
                  onClick={() => setShowDialog(true)}
                  className="relative bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white px-16 py-10 text-3xl font-bold shadow-2xl hover:shadow-[#E91E8C]/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  احجز مقعدك في اول محاضرة تفاعلية لتعليم التداول
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#E91E8C]" />
                </div>
                <span className="text-[20px]">✅ أكثر من 3000 متداول فلسطيني</span>
              </div>
              
              <div className="hidden md:block w-[2px] h-8 bg-gradient-to-b from-transparent via-[#E91E8C] to-transparent"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#E91E8C]" />
                </div>
                <span className="text-[20px]">✅ بث مباشر يومي الساعة 3:00</span>
              </div>
              
              <div className="hidden md:block w-[2px] h-8 bg-gradient-to-b from-transparent via-[#E91E8C] to-transparent"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#E91E8C]" />
                </div>
                <span className="text-[20px]">✅ دعم فني 24/7</span>
              </div>
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
