import { Target, TrendingUp } from "lucide-react";

export default function WhoWeAreSection() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#6B46C1]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-[#E91E8C]/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-[#E91E8C]/30 rounded-full px-6 py-3 mb-6">
              <Target className="w-5 h-5 text-[#E91E8C]" />
              <span className="text-white/90 text-[32px]">مين إحنا</span>
            </div>
            
            <h2 className="text-white mb-6 leading-tight text-[20px]">
              إحنا مش أكاديمية تقليدية،<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] text-[24px] font-bold">
                إحنا منظومة تداول فلسطينية تجمع الخبرة والتعليم والتطبيق في مكان واحد.
              </span>
            </h2>
          </div>

          {/* Main Content Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] rounded-3xl blur opacity-20"></div>
            
            <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-12">
              {/* Quote Icon */}
              <div className="absolute -top-6 right-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center shadow-lg shadow-[#E91E8C]/30">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Main Message */}
              <div className="text-center">
                <p className="text-white/90 text-xl leading-relaxed mb-8">
                  مجتمع من متداولين ومدربين هدفهم يوصلوك من مرحلة "مش فاهم السوق"<br />
                  لمرحلة "أنا بثق بتحليلي وبدير فلوسي بوعي."
                </p>
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-[#E91E8C]/20 blur-xl"></div>
                  <p className="relative text-white/80 text-lg px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E91E8C]/10 to-[#6B46C1]/10 border border-[#E91E8C]/20">
                    💡 هدفنا إنك تكون الشخص اللي بيفهم السوق مش اللي بتفرّج عليه.
                  </p>
                </div>
              </div>

              {/* Decorative bottom line */}
              <div className="mt-12 flex items-center justify-center gap-3 rounded-[8px]">
                <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-[#E91E8C]"></div>
                <div className="w-2 h-2 rounded-full bg-[#E91E8C]"></div>
                <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-[#6B46C1]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
