import { motion } from 'framer-motion';

export function AdultsOnly() {
  return (
    <section className="quote section" style={{ paddingTop: '60px', paddingBottom: '60px', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="sprig"
        style={{ transform: 'none', fontSize: '32px' }}
      >
        🌿
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{ 
          fontFamily: 'var(--serif)', 
          fontSize: '20px', 
          letterSpacing: '0.16em', 
          marginTop: '15px', 
          textTransform: 'uppercase', 
          color: 'var(--ink)', 
          fontWeight: 500 
        }}
      >
        Sólo Adultos, Por Favor
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3 }}
        style={{ 
          fontFamily: 'var(--sans)', 
          fontSize: '13px', 
          lineHeight: '1.8', 
          color: 'var(--sage)', 
          maxWidth: '500px', 
          margin: '15px auto 0', 
          fontWeight: 300, 
          letterSpacing: '0.04em' 
        }}
      >
        Esperamos que comprendan que nuestro día especial es una celebración exclusiva para adultos. Queremos que disfruten la noche al máximo.
      </motion.p>
    </section>
  );
}
