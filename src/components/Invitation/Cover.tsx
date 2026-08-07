import { motion } from 'framer-motion';

interface CoverProps {
  brideName: string;
  groomName: string;
  title: string;
  introText: string;
}

export function Cover({ brideName, groomName, title, introText }: CoverProps) {
  const introLines = introText.split('\n');

  return (
    <section className="hero section">
      <motion.p
        initial={{ opacity: 0, y: 9 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="eyebrow"
      >
        {title}
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, y: 9 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.25 }}
        className="names"
      >
        <span>{brideName}</span>
        <b>&amp;</b>
        <span>{groomName}</span>
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="fine-line"
      />
      
      <motion.p
        initial={{ opacity: 0, y: 9 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.65 }}
        className="intro"
      >
        {introLines.map((line, idx) => (
          <span key={idx}>
            {line}
            {idx < introLines.length - 1 && <br />}
          </span>
        ))}
      </motion.p>
    </section>
  );
}
