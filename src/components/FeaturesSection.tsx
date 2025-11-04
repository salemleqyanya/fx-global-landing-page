import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Radio, Users, TrendingUp, HeartHandshake } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Radio,
      title: "بث مباشر كل يوم",
      subtitle: "الساعة 3:00م",
      description: "انضم لجلسات تداول حية وتعلم من الخبراء مباشرة",
    },
    {
      icon: Users,
      title: "مدربين محترفين",
      subtitle: "فلسطينيين",
      description: "فريق من المدربين المعتمدين اللي بفهموا واقعك وبيساعدوك",
    },
    {
      icon: TrendingUp,
      title: "مجتمع قوي",
      subtitle: "أكثر من 3000 متداول",
      description: "انضم لعائلة من المتداولين الطموحين والناجحين",
    },
    {
      icon: HeartHandshake,
      title: "دعم مباشر",
      subtitle: "خطة تطوير مستمرة",
      description: "مش بس تدريب، إحنا معك في كل خطوة بالطريق",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#3D2463] via-[#6B46C1] to-[#3D2463] relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E91E8C]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E91E8C]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-white mb-4">
            شو يعني تكون جزء من <span className="text-[#E91E8C]">FX GLOBAL</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#E91E8C]/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#E91E8C]/20 p-6 group"
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-white mb-1">{feature.title}</h3>
                <p className="text-[#E91E8C] text-sm mb-3">{feature.subtitle}</p>
                <p className="text-white/70 text-sm flex-grow">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white px-10 py-6 shadow-xl hover:shadow-[#E91E8C]/50 transition-all duration-300"
          >
            احجز مقعدك في البث المجاني اليوم الساعة 3:00
          </Button>
        </div>
      </div>
    </section>
  );
}
