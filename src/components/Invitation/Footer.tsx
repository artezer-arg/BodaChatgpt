import { motion } from 'framer-motion';

interface FooterProps {
  finalMessage: string;
}

export function Footer({ finalMessage }: FooterProps) {
  const lines = finalMessage.split('\n');

  return (
    <footer className="closing section">
      {/* Botanical frame decoration (Bottom) */}
      <div className="botanical botanical-bottom" />
      
      <motion.p
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="script"
      >
        {lines[0]}
        {lines[1] && (
          <>
            <br />
            {lines[1]}
          </>
        )}
      </motion.p>
      
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        ♥
      </motion.span>
      
      <a href="/admin" id="btn-admin-link">
        Administrar invitación
      </a>
    </footer>
  );
}
