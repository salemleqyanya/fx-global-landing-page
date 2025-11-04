import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Quote, Award, Users } from "lucide-react";

interface TestimonialsSectionProps {
  successImage: string;
}

export function TestimonialsSection({ successImage }: TestimonialsSectionProps) {
  const testimonials = [
    {
      quote: "كنت مفكر التداول كذبة… اليوم صار مصدر دخلي.",
      author: "محمد",
      location: "رام الله",
    },
    {
      quote: "المدرب أنقذني من أول خسارة.",
      author: "أحمد",
      location: "نابلس",
    },
    {
      quote: "الفرق بيني قبل وبعد FX Global؟ نفس الشخص… بعقل جديد.",
      author: "سارة",
      location: "القدس",
    },
  ];

  return (
    <section className="py-20 bg-[#3D2463] relative">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${successImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-white mb-4">
            قصص <span className="text-[#E91E8C]">النجاح</span>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            استمع لتجارب من غيّروا حياتهم مع FX GLOBAL
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-white/20 p-6 hover:border-[#E91E8C]/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <Quote className="absolute top-4 left-4 w-12 h-12 text-[#E91E8C]/20" />
              <div className="relative z-10">
                <p className="text-white mb-4 min-h-[80px] flex items-center">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-[#E91E8C]/30 pt-4">
                  <p className="text-[#E91E8C]">{testimonial.author}</p>
                  <p className="text-white/50 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Credentials */}
        <div className="relative">
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mb-8"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-white">مرخصة من وزارة التربية</p>
                <p className="text-[#E91E8C] text-sm">والتعليم الفلسطينية</p>
              </div>
            </div>
            
            <div className="hidden md:block w-[2px] h-12 bg-gradient-to-b from-transparent via-[#E91E8C] to-transparent"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-white">أكثر من ٣٠٠٠ طالب</p>
                <p className="text-[#E91E8C] text-sm">فلسطيني</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
