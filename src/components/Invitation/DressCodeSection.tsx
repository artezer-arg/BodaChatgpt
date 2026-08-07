import { motion } from 'framer-motion';

interface DressCodeProps {
  title: string; // "Elegante"
  subtitle: string; // "Por favor, evitar los colores bordo y blanco."
}

export function DressCodeSection({ title, subtitle }: DressCodeProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 9 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
      className="dress section"
    >
      <div className="icon-wash">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 7a2.5 2.5 0 1 0-2.5-2.5M12 7v3L3 17h18l-9-7" />
        </svg>
      </div>
      <div>
        <h2>DRESS CODE</h2>
        <strong>{title}</strong>
        <p>{subtitle}</p>
        <div className="swatches">
          <i className="burgundy" />
          <i className="white" />
        </div>
        <small>Estos colores están reservados para los novios y la ambientación.</small>
      </div>
    </motion.section>
  );
}
