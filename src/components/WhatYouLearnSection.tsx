import { CheckCircle, TrendingUp, Shield, Target, AlertTriangle } from "lucide-react";
import { Card } from "./ui/card";

export default function WhatYouLearnSection() {
  const learningPoints = [
    {
      icon: TrendingUp,
      title: "كيف تحدد الاتجاه العام",
      description: "تعلم قراءة مؤشرات السوق وتحديد الترند الصحيح قبل ما تدخل أي صفقة"
    },
    {
      icon: Target,
      title: "كيف تدخل صفقة بثقة",
      description: "استراتيجيات واضحة ومجربة لاختيار نقاط الدخول والخروج المثالية"
    },
    {
      icon: Shield,
      title: "كيف تحمي رأس مالك",
      description: "إدارة المخاطر الصحيحة اللي تخليك تنام مرتاح حتى لو السوق تحرك ضدك"
    },
    {
      icon: AlertTriangle,
      title: "أكبر خطأ بيعمله 90% من المبتدئين",
      description: "تجنب الأخطاء الشائعة اللي بتخلي معظم المتداولين يخسروا - راح نكشفها كلها"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#6B46C1] via-[#3D2463] to-[#6B46C1] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#E91E8C]/20 border border-[#E91E8C] rounded-full px-6 py-3 mb-6">
              <CheckCircle className="w-5 h-5 text-[#E91E8C]" />
              <span className="text-[#E91E8C]">في البث المجاني</span>
            </div>
            
            <h2 className="text-white mb-4">
              شو راح <span className="text-[#E91E8C]">تتعلم</span> في الجلسة المجانية؟
            </h2>
            
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              جلسة واحدة راح تفتح عينك على أساسيات التداول الصحيح
            </p>
            
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mx-auto mt-6"></div>
          </div>

          {/* Learning Points Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {learningPoints.map((point, index) => (
              <Card 
                key={index}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#E91E8C]/50 transition-all duration-300 p-6 group"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <point.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-white mb-2">
                      ✅ {point.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bonus Section */}
          <div className="bg-gradient-to-r from-[#E91E8C]/20 via-[#6B46C1]/20 to-[#E91E8C]/20 border-2 border-[#E91E8C]/50 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] mb-4">
              <span className="text-3xl">🎁</span>
            </div>
            
            <h3 className="text-white mb-3">مكافأة خاصة للحضور</h3>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              كل من يحضر البث المجاني راح يحصل على <span className="text-[#E91E8C]">دليل المبتدئين PDF</span> مجاناً + إمكانية طرح أسئلتك مباشرة للمدرب
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
