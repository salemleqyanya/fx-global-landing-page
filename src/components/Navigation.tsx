import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-[#E91E8C]/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo Text */}
          <div className="text-white">
            <span className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] bg-clip-text text-transparent text-[32px] font-bold">FX GLOBAL</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-white/80 hover:text-[#E91E8C] transition-colors"
            >
              الرئيسية
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="text-white/80 hover:text-[#E91E8C] transition-colors"
            >
              الخدمات
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-white/80 hover:text-[#E91E8C] transition-colors"
            >
              قصص النجاح
            </button>
            <button 
              onClick={() => scrollToSection('register')}
              className="text-white/80 hover:text-[#E91E8C] transition-colors"
            >
              التسجيل
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              onClick={() => scrollToSection('register')}
              className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white shadow-lg shadow-[#E91E8C]/30 text-[20px]"
            >
              سجل الآن مجاناً 🔥
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E91E8C]/20">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('hero')}
                className="text-white/80 hover:text-[#E91E8C] transition-colors text-right py-2"
              >
                الرئيسية
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-white/80 hover:text-[#E91E8C] transition-colors text-right py-2"
              >
                الخدمات
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-white/80 hover:text-[#E91E8C] transition-colors text-right py-2"
              >
                قصص النجاح
              </button>
              <button 
                onClick={() => scrollToSection('register')}
                className="text-white/80 hover:text-[#E91E8C] transition-colors text-right py-2"
              >
                التسجيل
              </button>
              <Button 
                onClick={() => scrollToSection('register')}
                className="bg-gradient-to-r from-[#E91E8C] to-[#6B46C1] hover:from-[#6B46C1] hover:to-[#E91E8C] text-white w-full"
              >
                سجل الآن مجاناً 🔥
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
