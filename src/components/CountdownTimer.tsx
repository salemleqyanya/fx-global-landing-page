import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate?: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const getEndOfWeek = () => {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + (7 - now.getDay()));
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = targetDate || getEndOfWeek();
    
    const calculateTimeLeft = () => {
      const difference = target.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 justify-center" dir="ltr">
      {[
        { value: timeLeft.days, label: 'أيام' },
        { value: timeLeft.hours, label: 'ساعات' },
        { value: timeLeft.minutes, label: 'دقائق' },
        { value: timeLeft.seconds, label: 'ثواني' },
      ].map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-[#E91E8C] to-[#6B46C1] rounded-lg p-4 min-w-[70px] shadow-lg">
            <div className="text-white text-center">
              {String(item.value).padStart(2, '0')}
            </div>
          </div>
          <div className="text-white/70 text-xs mt-2">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
