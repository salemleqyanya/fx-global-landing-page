import { Users, TrendingUp, Star, Quote } from "lucide-react";
import VimeoPlayer from "./VimeoPlayer";

const testimonials = [
  {
    text: "كنت مفكر التداول قمار… اليوم فاهم السوق.",
    author: "أحمد - رام الله",
    result: "أول ربح خلال أسبوعين"
  },
  {
    text: "أول مرة أدخل صفقة وأنا مرتاح نفسياً.",
    author: "محمد - نابلس",
    result: "3 صفقات ناجحة من 4"
  },
  {
    text: "التحليل اليومي غيّر طريقة تفكيري بالسوق كلياً.",
    author: "ليث - الخليل",
    result: "دخل إضافي ثابت شهرياً"
  }
];

export default function SocialProofSection() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#E91E8C]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-[#6B46C1]/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Stats Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-[#E91E8C]/30 rounded-full px-6 py-3 mb-8">
            <Star className="w-5 h-5 text-[#E91E8C]" />
            <span className="text-white/90 text-[32px]">الناس ما بتصدق الحكي… بتصدق النتائج</span>
          </div>

          {/* Big Number */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-[#E91E8C] blur-3xl opacity-30"></div>
              <h2 className="relative text-white text-6xl md:text-7xl mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] to-[#6B46C1]">
                  +3000
                </span>
              </h2>
            </div>
            <p className="text-white/90 text-2xl md:text-3xl">
              متداول فلسطيني بدأوا معنا
            </p>
          </div>

          {/* Achievement Banner */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] rounded-2xl blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-[#E91E8C]/20 to-[#6B46C1]/20 backdrop-blur-sm border border-[#E91E8C]/30 rounded-2xl p-8">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <TrendingUp className="w-10 h-10 text-[#E91E8C]" />
                  <p className="text-white text-xl md:text-2xl">
                    وحققوا أول أرباحهم خلال أول <span className="text-[#E91E8C]">30 يوم</span> من التدريب 🎯
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-white text-center text-2xl mb-12">
            شهادات حقيقية من طلابنا 💬
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                
                {/* Card */}
                <div className="relative h-full bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-[#E91E8C]/50 transition-all duration-300">
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center">
                      <Quote className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-white/90 text-lg mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[#E91E8C] mb-1">{testimonial.author}</p>
                    <p className="text-white/60 text-sm">{testimonial.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video Proof Section */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-white/80">
                <Users className="w-6 h-6 text-[#E91E8C]" />
                <span>مقاطع حقيقية من طلاب جرّبوا FX Global وحكوا تجربتهم بصراحة</span>
              </div>
            </div>
          </div>

          {/* Video Boxes Grid - Winner Podium Style */}
          <div className="mt-16">
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {/* Video Box 2 - Second Place */}
              <div className="group relative md:mt-12 order-1">
                {/* Winner Badge - Silver */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center border-4 border-white/20 shadow-lg shadow-slate-500/50">
                    <span className="text-xl">🥈</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-500/80 px-3 py-0.5 rounded-full text-[10px] text-white whitespace-nowrap">طبيب ناجح 👨‍⚕️</div>
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative h-full bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-slate-400/30 rounded-2xl overflow-hidden hover:border-slate-400/50 transition-all duration-300">
                  {/* Video Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-slate-400/10 to-slate-600/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-white/60 text-sm">شاهد التجربة</p>
                    </div>
                  </div>
                  {/* Video Info */}
                  <div className="p-4">
                    <p className="text-white/80">ضاعف رأس ماله من $1,000</p>
                    <p className="text-slate-400 text-xs mt-1">عائد استثمار 100% ROI 📈</p>
                  </div>
                </div>
              </div>

              {/* Video Box 1 - First Place Winner */}
              <div className="group relative md:mt-0 order-2">
                {/* Winner Badge - Gold Crown */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-white/30 shadow-2xl shadow-yellow-500/60 animate-pulse">
                    <span className="text-3xl">👑</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-1 rounded-full text-xs text-white whitespace-nowrap shadow-lg">وحش الشهر 🔥</div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400 via-[#E91E8C] to-[#6B46C1] rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
                <div className="relative h-full bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border-2 border-yellow-400/50 rounded-2xl overflow-hidden hover:border-yellow-400/80 transition-all duration-300 shadow-2xl shadow-yellow-500/20">
                  {/* Vimeo Video */}
                  <div className="relative aspect-video bg-gradient-to-br from-yellow-400/20 via-[#E91E8C]/10 to-[#6B46C1]/10 overflow-hidden">
                    {/* Sparkle effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-400/5 to-transparent animate-pulse pointer-events-none z-0"></div>
                    <VimeoPlayer videoId="1133564233" />
                  </div>
                  {/* Video Info */}
                  <div className="p-4 bg-gradient-to-br from-yellow-400/5 to-transparent">
                    <p className="text-white/90">حقق +$30,000 من $2,000</p>
                    <p className="text-yellow-400 text-xs mt-1">عائد استثمار 1400%+ 💰</p>
                  </div>
                </div>
              </div>

              {/* Video Box 3 - Third Place */}
              <div className="group relative md:mt-24 order-3">
                {/* Winner Badge - Bronze */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 flex items-center justify-center border-4 border-white/20 shadow-lg shadow-orange-500/50">
                    <span className="text-xl">🥉</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-600/80 px-3 py-0.5 rounded-full text-[10px] text-white whitespace-nowrap">طالب طموح 🎓</div>
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-400 to-orange-700 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative h-full bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-orange-400/30 rounded-2xl overflow-hidden hover:border-orange-400/50 transition-all duration-300">
                  {/* Video Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-orange-400/10 to-orange-700/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-white/60 text-sm">اسمع قصته</p>
                    </div>
                  </div>
                  {/* Video Info */}
                  <div className="p-4">
                    <p className="text-white/80 text-sm">بدأ رحلته وهو طالب</p>
                    <p className="text-orange-400 text-xs mt-1">يتعلم ويربح معاً 💪</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
