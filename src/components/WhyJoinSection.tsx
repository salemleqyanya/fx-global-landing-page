import { CheckCircle2, Award } from "lucide-react";

const reasons = [
  "لأننا مش بس بنعلم... إحنا بنمشي معك عمليًا",
  "لأنك بتتعلم على بث مباشر مش فيديوهات مكررة",
  "لأن طلابنا صاروا متداولين واثقين مش مجرد متفرجين",
  "لأنك بتتعلم من ناس فلسطينية فاهمة واقع السوق العربي"
];

export default function WhyJoinSection() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E91E8C]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-[#E91E8C]/30 rounded-full px-6 py-3 mb-6">
              <Award className="w-5 h-5 text-[#E91E8C]" />
              <span className="text-white/90 text-[32px]">المميزات</span>
            </div>
            
            <h2 className="text-white mb-6 leading-tight text-[30px] font-bold">
              ليش الناس بتنضم لـ{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] to-[#6B46C1]">
                FX Global؟
              </span>
            </h2>
          </div>

          {/* Reasons Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Glow on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                
                {/* Card */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-[#E91E8C]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-8 h-8 text-[#E91E8C]" />
                    </div>
                    
                    {/* Text */}
                    <p className="text-white/90 text-lg leading-relaxed">
                      {reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Accent */}
          <div className="mt-16 text-center">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-[#E91E8C]/20 blur-2xl"></div>
              <p className="relative text-white/80 text-xl px-8 py-4 rounded-xl bg-white/5 border border-[#E91E8C]/30 text-[24px]">
                💎 مش مجرد دورة ... هاي رحلة تحول حقيقية
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
