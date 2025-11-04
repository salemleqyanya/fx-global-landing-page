import { Button } from "./ui/button";
import logoImage from 'figma:asset/949f9ff3e49b50cd73e9efb072f668b246d3262c.png';

interface HeroSectionProps {
  backgroundImage: string;
}

export function HeroSection({ backgroundImage }: HeroSectionProps) {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(233, 30, 140, 0.9) 0%, rgba(107, 70, 193, 0.95) 50%, rgba(61, 36, 99, 0.98) 100%), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Palestine map watermark */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDUwIEwxNTAgMTAwIEwxMjAgMjAwIEw4MCAyMDAgTDUwIDEwMCBaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==')] bg-center bg-no-repeat"></div>
      
      {/* Logo watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img
          src={logoImage}
          alt="FX GLOBAL Logo"
          className="w-96 h-96 object-contain"
        />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Magenta accent line */}
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mx-auto mb-8"></div>
          
          <h1 className="text-white mb-8 leading-relaxed max-w-3xl mx-auto">
            أكيد تعبت من الشغل العادي... نفس الساعات، نفس الراتب، نفس الهمّ.
            <br />
            <span className="text-[#E91E8C]">يمكن جرّبت تدخل مجال التداول،</span> بس حسّيت كل شي معقد، أو خفت تخسر.
          </h1>
          
          <div className="bg-gradient-to-r from-[#E91E8C]/10 to-transparent border-r-4 border-[#E91E8C] p-6 mb-12 rounded-lg backdrop-blur-sm">
            <p className="text-white/90 text-lg">
              بس الحقيقة؟ <span className="text-[#E91E8C]">التداول مش حظ… ومش لعبة.</span>
              <br />
              هو <span className="text-[#E91E8C]">مهارة</span>، ومهارة ممكن تغيّر حياتك لو تعلمتها صح، مع ناس بتفهمك وبتدعمك.
            </p>
          </div>
          
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white px-12 py-6 shadow-2xl hover:shadow-[#E91E8C]/50 transition-all duration-300 hover:scale-105"
          >
            ابدأ مع FX GLOBAL – وتعلّم التداول بالطريقة الصح
          </Button>
          
          {/* Floating particles effect */}
          <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#E91E8C] rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 left-10 w-3 h-3 bg-[#E91E8C]/50 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#3D2463] to-transparent"></div>
    </section>
  );
}
