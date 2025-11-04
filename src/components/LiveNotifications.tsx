import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

// Import all flags
import palestineFlag from './flags/palestine';
import lebanonFlag from './flags/lebanon';
import jordanFlag from './flags/jordan';
import syriaFlag from './flags/syria';
import qatarFlag from './flags/qatar';
import bahrainFlag from './flags/bahrain';
import moroccoFlag from './flags/morocco';
import algeriaFlag from './flags/algeria';
import omanFlag from './flags/oman';
import libyaFlag from './flags/libya';
import tunisiaFlag from './flags/tunisia';
import egyptFlag from './flags/egypt';
import saudiFlag from './flags/saudi-arabia';
import uaeFlag from './flags/uae';
import iraqFlag from './flags/iraq';
import kuwaitFlag from './flags/kuwait';

// Map countries to their flags
const countryFlags: Record<string, string> = {
  'فلسطين': palestineFlag,
  'لبنان': lebanonFlag,
  'الأردن': jordanFlag,
  'سوريا': syriaFlag,
  'قطر': qatarFlag,
  'البحرين': bahrainFlag,
  'المغرب': moroccoFlag,
  'الجزائر': algeriaFlag,
  'عُمان': omanFlag,
  'ليبيا': libyaFlag,
  'تونس': tunisiaFlag,
  'مصر': egyptFlag,
  'السعودية': saudiFlag,
  'الإمارات': uaeFlag,
  'العراق': iraqFlag,
  'الكويت': kuwaitFlag,
};

interface Notification {
  id: number;
  name: string;
  country: string;
  action: string;
}

const notifications = [
  { name: "محمد مرسي", country: "لبنان", action: "حجز مقعده وقام بشراء العضوية" },
  { name: "أحمد الخطيب", country: "فلسطين", action: "انضم للأكاديمية للتو" },
  { name: "فاطمة السعدي", country: "الأردن", action: "اشترى الدورة الكاملة" },
  { name: "عمر العلي", country: "الإمارات", action: "حجز مكانه في البث المباشر" },
  { name: "سارة المصري", country: "مصر", action: "انضمت وبدأت رحلة التداول" },
  { name: "خالد النجار", country: "السعودية", action: "اشترك في العضوية الذهبية" },
  { name: "ليلى الحسن", country: "سوريا", action: "حجزت مقعدها الآن" },
  { name: "يوسف القاسم", country: "العراق", action: "انضم للأكاديمية" },
  { name: "رنا العبدالله", country: "الكويت", action: "سجلت في الدورة المباشرة" },
  { name: "طارق السلمان", country: "قطر", action: "انضم وبدأ التعلم" },
  { name: "هدى الشامي", country: "لبنان", action: "حجزت مكانها في الأكاديمية" },
  { name: "كريم الفلسطيني", country: "فلسطين", action: "اشترك في العضوية الشاملة" },
  { name: "عبدالله البحريني", country: "البحرين", action: "حجز مقعده وبدأ التداول" },
  { name: "منى التونسية", country: "تونس", action: "انضمت للأكاديمية" },
  { name: "فريد العماني", country: "عُمان", action: "سجل في الدورة الشاملة" },
  { name: "نور المغربية", country: "المغرب", action: "حجزت مقعدها في البث المباشر" },
  { name: "حسام الجزائري", country: "الجزائر", action: "اشترك في العضوية الذهبية" },
  { name: "علي الليبي", country: "ليبيا", action: "انضم وبدأ التداول" },
];

export default function LiveNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [notificationId, setNotificationId] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const showNotification = () => {
      // Get random notification
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      
      setCurrentNotification({
        ...randomNotification,
        id: Date.now(),
      });

      // Hide notification after 5 seconds
      setTimeout(() => {
        setCurrentNotification(null);
      }, 5000);

      // Schedule next notification with random interval (15-30 seconds)
      const nextDelay = Math.random() * 15000 + 15000;
      timeoutId = setTimeout(showNotification, nextDelay);
    };

    // Show first notification after 3 seconds
    const firstTimeout = setTimeout(showNotification, 3000);

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleClose = () => {
    setCurrentNotification(null);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {currentNotification && (
          <motion.div
            key={currentNotification.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="pointer-events-auto"
          >
            <div className="bg-[#1a1f3a] rounded-lg shadow-2xl min-w-[320px] max-w-[380px] relative border border-white/10">
              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="absolute top-3 left-3 text-white/60 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-4 pt-3">
                {/* Header with title and flag */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <p className="text-[#E91E8C] text-sm mb-1">عضو جديد قام بشراء الدورة</p>
                    <p className="text-white/90">
                      <span className="font-semibold">{currentNotification.name}</span>
                      <span className="text-white/70"> من {currentNotification.country}</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-white/20">
                    <img 
                      src={countryFlags[currentNotification.country]} 
                      alt={`علم ${currentNotification.country}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Verified badge */}
                <div className="flex items-center gap-1.5 mt-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500 text-xs">Verified by FX GLOBALS</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
