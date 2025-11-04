import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "هل التداول حلال؟",
      answer: "نعم، التداول في الأسواق المالية حلال بشرط الالتزام بالضوابط الشرعية. في FX GLOBAL، نحن نركز على التداول الفوري (Spot Trading) ونتجنب المعاملات الربوية. نعمل مع مستشارين شرعيين لضمان توافق استراتيجياتنا مع الشريعة الإسلامية.",
    },
    {
      question: "أنا مبتدئ، من وين أبدأ؟",
      answer: "رحلتك معنا تبدأ ببساطة: أولاً، احضر البث المباشر المجاني يومياً الساعة 3:00 مساءً لتتعرف على الأساسيات. ثانياً، احجز جلسة التوجيه المجانية 1-on-1 حيث سيقوم أحد مدربينا بتقييم مستواك وإعداد خطة تعليمية خاصة بك. ثالثاً، انضم لبرنامجنا التدريبي المتكامل الذي يبدأ من الصفر ويأخذك خطوة بخطوة.",
    },
    {
      question: "شو الفرق بينكم وبين الباقين؟",
      answer: "الفرق الحقيقي في ثلاث نقاط: أولاً، نحن فلسطينيون نفهم واقعك وتحدياتك. ثانياً، نقدم دعماً مباشراً ومستمراً - مش بس كورس وخلاص. ثالثاً، نملك مجتمعاً حقيقياً من 3000+ متداول يشاركون الخبرات ويدعمون بعضهم. إحنا مش بس منعلم التداول، بنبني مجتمع من المتداولين الناجحين.",
    },
  ];

  return (
    <section className="py-20 bg-[#3D2463]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-[#E91E8C]" />
              <h2 className="text-white">الأسئلة المتكررة</h2>
            </div>
            <p className="text-white/70">
              إجابات واضحة لأهم الأسئلة اللي بتدور في بالك
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E91E8C] to-transparent mx-auto mt-4"></div>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-6 hover:border-[#E91E8C]/50 transition-all"
              >
                <AccordionTrigger className="text-white hover:text-[#E91E8C] text-right py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/80 leading-relaxed pb-4">
                  {faq.answer}
                  <div className="mt-4 pt-4 border-t border-[#E91E8C]/20">
                    <p className="text-[#E91E8C] text-sm">
                      💡 كل استفساراتك مهمة، ودعمنا موجود لك على مدار الساعة.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
