import { Button } from "./ui/button";
import { CountdownTimer } from "./CountdownTimer";
import { Gift, Clock, MessageCircle } from "lucide-react";

export function SpecialOfferSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#3D2463] via-black to-[#3D2463] relative overflow-hidden">
      {/* Glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E91E8C]/20 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#E91E8C]/20 border border-[#E91E8C] rounded-full px-6 py-3 mb-6">
              <Gift className="w-5 h-5 text-[#E91E8C]" />
              <span className="text-[#E91E8C]">عرض خاص لفترة محدودة</span>
            </div>
            
            <h2 className="text-white mb-4">
              فرصة <span className="text-[#E91E8C]">لا تعوّض</span>
            </h2>
            
            <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
              سجل اليوم واحصل على <span className="text-[#E91E8C]">جلسة توجيه مجانية 1-on-1</span> مع أحد مدربي FX GLOBAL.
              <br />
              العرض متاح حتى نهاية الأسبوع فقط.
            </p>
          </div>
          
          {/* Countdown Timer */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-[#E91E8C]" />
              <p className="text-white/70">الوقت المتبقي للعرض:</p>
            </div>
            <CountdownTimer />
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white px-12 py-6 shadow-2xl hover:shadow-[#E91E8C]/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <Gift className="ml-2 w-5 h-5" />
              سجّل الآن وخد أول جلسة مجاناً
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-[#E91E8C] text-[#E91E8C] hover:bg-[#E91E8C]/10 px-10 py-6 w-full sm:w-auto"
            >
              <MessageCircle className="ml-2 w-5 h-5" />
              تواصل عبر واتساب
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E91E8C] rounded-full"></div>
              <span>بدون التزامات مالية</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E91E8C] rounded-full"></div>
              <span>جلسة مجانية 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E91E8C] rounded-full"></div>
              <span>إلغاء مجاني في أي وقت</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
