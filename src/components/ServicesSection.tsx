import { BookOpen, Users, TrendingUp, Video, Headphones, Sparkles } from "lucide-react";

const services = [
  {
    icon: BookOpen,
    title: "دورات تدريبية متقدمة",
    description: "تعلّم خطوة بخطوة التحليل الفني، إدارة رأس المال، واستراتيجيات التداول الحديثة من مدربين فلسطينيين محترفين بخبرة حقيقية من السوق.",
    gradient: "from-[#E91E8C] to-[#6B46C1]"
  },
  {
    icon: Users,
    title: "استشارات مالية شخصية",
    description: "بنحلل وضعك المالي وبنساعدك تختار الخطة الأنسب لهدفك: دخل إضافي؟ استثمار طويل المدى؟ إحنا معك.",
    gradient: "from-[#6B46C1] to-[#E91E8C]"
  },
  {
    icon: TrendingUp,
    title: "تحليل يومي + توصيات حية",
    description: "فريق التحليل عندنا بيبث مباشر كل يوم، وبيعطيك الفرص الحقيقية لحظة بلحظة.",
    gradient: "from-[#E91E8C] to-[#6B46C1]"
  },
  {
    icon: Video,
    title: "بث مباشر يومي",
    description: "كل يوم الساعة 3:00 بنكون Live — بتحضر، بتحلل معنا، وبتتعلم من السوق نفسه.",
    gradient: "from-[#6B46C1] to-[#E91E8C]"
  },
  {
    icon: Headphones,
    title: "دعم فني 24/7",
    description: "أي مشكلة، أي وقت، فريقنا معك خطوة بخطوة.",
    gradient: "from-[#E91E8C] to-[#6B46C1]"
  }
];

export default function ServicesSection() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#E91E8C]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6B46C1]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-[#E91E8C]/30 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-[#E91E8C]" />
            <span className="text-white/90 text-[32px]">الخدمات</span>
          </div>
          
          <h2 className="text-white mb-6 leading-tight text-[30px] font-bold">
            شو بنقدملك؟
          </h2>
          
          <p className="text-white/80 text-xl max-w-3xl mx-auto">
            كل اللي بتحتاجه لتبدأ وتربح من الأسواق… بمكان واحد 👇
          </p>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* First Row: 3 Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${service.gradient} rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                
                {/* Card */}
                <div className="relative h-full bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#E91E8C]/50 transition-all duration-300 hover:transform hover:scale-[1.02] flex flex-col">
                  {/* Icon */}
                  <div className="mb-6 flex justify-end">
                    <div className={`inline-flex w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} items-center justify-center shadow-lg shadow-[#E91E8C]/20`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-xl mb-4 text-right">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 leading-relaxed text-right mb-6 flex-grow">
                    {service.description}
                  </p>

                  {/* Decorative Line */}
                  <div className="flex justify-end">
                    <div className={`h-1 w-16 bg-gradient-to-r ${service.gradient} rounded-full`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row: 2 Cards Centered */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.slice(3, 5).map((service, index) => (
              <div
                key={index + 3}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${service.gradient} rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                
                {/* Card */}
                <div className="relative h-full bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#E91E8C]/50 transition-all duration-300 hover:transform hover:scale-[1.02] flex flex-col">
                  {/* Icon */}
                  <div className="mb-6 flex justify-end">
                    <div className={`inline-flex w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} items-center justify-center shadow-lg shadow-[#E91E8C]/20`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-white text-xl mb-4 text-right">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 leading-relaxed text-right mb-6 flex-grow">
                    {service.description}
                  </p>

                  {/* Decorative Line */}
                  <div className="flex justify-end">
                    <div className={`h-1 w-16 bg-gradient-to-r ${service.gradient} rounded-full`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
