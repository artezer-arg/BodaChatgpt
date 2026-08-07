import { motion } from 'framer-motion';

interface DateTimeProps {
  date: string;
  time: string;
}

export function DateTime({ date, time }: DateTimeProps) {
  const parseDate = (dateStr: string, timeStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) {
        return { dayName: 'SÁBADO', dayNum: '24', monthYearLines: ['OCTUBRE', '2026'], time: '17:50 HS' };
      }
      
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      const dateObj = new Date(parseInt(year, 10), monthIdx, day);
      
      const monthsEs = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
      ];
      
      const daysEs = [
        'DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'
      ];
      
      const dayName = daysEs[dateObj.getDay()] || 'SÁBADO';
      const monthName = monthsEs[monthIdx] || 'OCTUBRE';
      const cleanTime = timeStr.slice(0, 5);
      
      return {
        dayName,
        dayNum: day.toString(),
        monthYearLines: [monthName, year],
        time: `${cleanTime} HS`
      };
    } catch (e) {
      return { dayName: 'SÁBADO', dayNum: '24', monthYearLines: ['OCTUBRE', '2026'], time: '17:50 HS' };
    }
  };

  const formatted = parseDate(date, time);

  return (
    <motion.section
      initial={{ opacity: 0, y: 9 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
      className="date-strip section"
      aria-label="Fecha y horario"
    >
      <div><span>{formatted.dayName}</span></div>
      
      <div className="date-main">
        <strong>{formatted.dayNum}</strong>
        <span>
          {formatted.monthYearLines[0]}
          <br />
          {formatted.monthYearLines[1]}
        </span>
      </div>
      
      <div><span>{formatted.time}</span></div>
    </motion.section>
  );
}
