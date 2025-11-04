import { Button } from "./ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-32 bg-gradient-to-br from-[#3D2463] via-[#6B46C1] to-[#3D2463] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#E91E8C]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E91E8C]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Palestine flag colors subtle accent */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] mb-8 shadow-2xl shadow-[#E91E8C]/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          {/* Main message */}
          <div className="mb-12">
            <p className="text-white text-2xl md:text-3xl leading-relaxed mb-6">
              في وقت الكل بخاف يخسر… <span className="text-[#E91E8C]">إحنا علمنا الناس كيف يربحوا بعقلهم.</span>
            </p>
            
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-transparent via-white/5 to-transparent p-8 rounded-lg backdrop-blur-sm border border-white/10 mb-8">
              <p className="text-white/90 text-xl leading-relaxed">
                هاي مش مجرد أكاديمية،
                <br />
                <span className="text-[#E91E8C]">هاي حركة، جيل جديد عم يتعلم يعيش بكرامة وثقة.</span>
              </p>
            </div>
            
            <p className="text-white/70 max-w-2xl mx-auto mb-12">
              كل يوم بيمر هو فرصة بتضيع. كل قرار بتأجله، حلم بيبعد.
              <br />
              <span className="text-[#E91E8C]">الوقت المناسب... هو اليوم.</span>
            </p>
          </div>
          
          {/* Final CTA Button */}
          <div className="relative inline-block">
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-[#E91E8C] blur-2xl opacity-50 rounded-full animate-pulse"></div>
            
            <Button 
              size="lg"
              className="relative bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white px-16 py-8 text-xl shadow-2xl hover:shadow-[#E91E8C]/50 transition-all duration-300 hover:scale-105"
            >
              ابدأ اليوم – وكن جزء من جيل ما بخاف
              <ArrowLeft className="mr-3 w-6 h-6" />
            </Button>
          </div>
          
          {/* Supporting text */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E91E8C] rounded-full"></div>
              <span>انضم الآن مجاناً</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E91E8C] rounded-full"></div>
              <span>3000+ طالب معك</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E91E8C] rounded-full"></div>
              <span>مرخص رسمياً</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent opacity-50"></div>
    </section>
  );
}
