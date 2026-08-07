import { motion } from 'framer-motion';

interface RomancePhraseProps {
  phrase: string;
}

export function RomancePhrase({ phrase }: RomancePhraseProps) {
  const lines = phrase.split('\n');

  return (
    <section className="quote section">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="sprig"
      >
        ❧
      </motion.div>
      
      <motion.blockquote
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        {lines[0]}
        {lines[1] && (
          <>
            <br />
            {lines[1]}
          </>
        )}
      </motion.blockquote>
      
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        ♥
      </motion.span>
    </section>
  );
}
