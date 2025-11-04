import { Shield, Heart, TrendingUp, Phone } from "lucide-react";
import { Button } from "./ui/button";

export default function TrustSection() {
  const scrollToRegister = () => {
    const element = document.getElementById('register');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Cinematic background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E91E8C]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#6B46C1]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Message */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-[#E91E8C]/30 rounded-full px-6 py-3 mb-8">
              <Shield className="w-5 h-5 text-[#E91E8C]" />
              <span className="text-white/90">الضمان والثقة</span>
            </div>

            <h2 className="text-white mb-8 leading-tight">
              مش راح تندم… لأنك مش داخل دورة نظرية.
            </h2>
            
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-[#E91E8C]/30 blur-2xl"></div>
              <p className="relative text-white/90 text-2xl md:text-3xl px-8 py-6 rounded-2xl bg-gradient-to-r from-[#E91E8C]/20 to-[#6B46C1]/20 border border-[#E91E8C]/30">
                أنت داخل مجتمع فعلي بيشتغل بالسوق كل يوم.
              </p>
            </div>
          </div>

          {/* Trust Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Card 1 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-[#E91E8C]/50 transition-all duration-300">
                <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] items-center justify-center mb-4 shadow-lg shadow-[#E91E8C]/40">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-lg mb-3">مجتمع داعم</h3>
                <p className="text-white/70 text-sm">
                  بتحس إنك مش لحالك، فيه مئات متداولين مثلك بنفس الرحلة
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#6B46C1] to-[#E91E8C] rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-[#E91E8C]/50 transition-all duration-300">
                <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#E91E8C] items-center justify-center mb-4 shadow-lg shadow-[#6B46C1]/40">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-lg mb-3">تطبيق عملي</h3>
                <p className="text-white/70 text-sm">
                  مش نظري! بتشوف الصفقات الحقيقية وبتطبق على طول
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-[#E91E8C]/50 transition-all duration-300">
                <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] items-center justify-center mb-4 shadow-lg shadow-[#E91E8C]/40">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-lg mb-3">دعم مستمر</h3>
                <p className="text-white/70 text-sm">
                  فريق الدعم معك 24/7 لأي استفسار أو مساعدة
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-[#E91E8C] blur-3xl opacity-40"></div>
              <div className="relative">
                <p className="text-white text-xl md:text-2xl mb-6 flex items-center justify-center gap-3">
                  <Phone className="w-6 h-6 text-[#E91E8C]" />
                  <span>ابدأ معنا اليوم</span>
                </p>
                <p className="text-white/80 text-lg mb-8">
                  واستثمر في مهارة رح تضل معك طول حياتك.
                </p>
                
                <Button 
                  onClick={scrollToRegister}
                  size="lg"
                  className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white px-12 py-8 text-xl shadow-2xl hover:shadow-[#E91E8C]/50 transition-all duration-300 hover:scale-105"
                >
                  انضم للبث المجاني الآن 🚀
                </Button>
              </div>
            </div>

            {/* Journey Message */}
            <div className="mt-8 block mx-auto w-fit bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 backdrop-blur-md border border-transparent bg-clip-padding rounded-2xl px-10 py-5 relative overflow-hidden shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6B46C1]/20 via-[#E91E8C]/20 to-[#6B46C1]/20 animate-pulse"></div>
              <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
              <p className="relative bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent text-[28px] animate-shimmer">
                💎 رحلة التحول تبدأ بخطوة واحدة - خليها اليوم
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
