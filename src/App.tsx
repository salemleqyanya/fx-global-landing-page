import Navigation from "./components/Navigation";
import LeadHeroSection from "./components/LeadHeroSection";
import WhoWeAreSection from "./components/WhoWeAreSection";
import ServicesSection from "./components/ServicesSection";
import WhyJoinSection from "./components/WhyJoinSection";
import SocialProofSection from "./components/SocialProofSection";
import RegistrationFormSection from "./components/RegistrationFormSection";
import TrustSection from "./components/TrustSection";
import LiveNotifications from "./components/LiveNotifications";

export default function App() {
  return (
    <div className="min-h-screen bg-black" dir="rtl">
      {/* Navigation Bar with Logo */}
      <Navigation />
      
      {/* Live Notifications */}
      <LiveNotifications />
      
      {/* Hero Section - "أكيد سمعت عن التداول" */}
      <div id="hero">
        <LeadHeroSection />
      </div>
      
      {/* Who We Are Section - "مين إحنا" */}
      <WhoWeAreSection />
      
      {/* Services Section - "شو بنقدملك؟" */}
      <div id="services">
        <ServicesSection />
      </div>
      
      {/* Why Join Section - "ليش الناس بتنضم" */}
      <WhyJoinSection />
      
      {/* Social Proof Section - الإثبات الاجتماعي */}
      <div id="testimonials">
        <SocialProofSection />
      </div>
      
      {/* Main Registration Form - "احجز مكانك الآن" */}
      <div id="register">
        <RegistrationFormSection />
      </div>
      
      {/* Trust & Final Message Section */}
      <TrustSection />
      
      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-[#E91E8C]/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-[#E91E8C] mb-2">FX GLOBAL</h3>
            <p className="text-white/50 text-sm mb-4">
              أكاديمية التداول الفلسطينية الرائدة
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-white/40">
              <span>بث مباشر يومي الساعة 3:00</span>
              <span>•</span>
              <span>3000+ متداول</span>
              <span>•</span>
              <span>دعم فني 24/7</span>
            </div>
            <div className="mt-6 text-xs text-white/30">
              © 2025 FX GLOBAL Academy. جميع الحقوق محفوظة.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
