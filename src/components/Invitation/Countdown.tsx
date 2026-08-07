import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownProps {
  targetDate: string; // Format: YYYY-MM-DD
  targetTime: string; // Format: HH:MM or HH:MM:SS
}

export function Countdown({ targetDate, targetTime }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const cleanTime = targetTime.slice(0, 5);
    const targetIso = `${targetDate}T${cleanTime}:00-03:00`;
    const targetTimestamp = new Date(targetIso).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetTimestamp - now;

      if (isNaN(targetTimestamp) || distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return (
    <section className="countdown section">
      <motion.div
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="countdown-box"
      >
        <p className="eyebrow">FALTAN</p>

        {timeLeft.isPast ? (
          <div className="arrived mt-4">¡Llegó nuestro gran día!</div>
        ) : (
          <div className="count-values">
            <div>
              <strong>{timeLeft.days}</strong>
              <span>DÍAS</span>
            </div>
            <div>
              <strong>{timeLeft.hours}</strong>
              <span>HORAS</span>
            </div>
            <div>
              <strong>{timeLeft.minutes}</strong>
              <span>MINUTOS</span>
            </div>
            <div>
              <strong>{timeLeft.seconds}</strong>
              <span>SEGUNDOS</span>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
