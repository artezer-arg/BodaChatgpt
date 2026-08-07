import { motion } from 'framer-motion';

interface CeremonyPartyProps {
  locationName: string;
  locationAddress: string;
  mapsUrl: string;
}

export function CeremonyParty({ locationName, locationAddress, mapsUrl }: CeremonyPartyProps) {
  return (
    <section className="venue section">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="script"
      >
        Ceremonia &amp; Fiesta
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="heart-line"
      >
        <i />
        ♥
        <i />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.1 }}
      >
        {locationName}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        {locationAddress}
      </motion.p>
      
      <motion.a
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="invite-button"
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="btn-ver-ubicacion"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        VER UBICACIÓN
      </motion.a>
    </section>
  );
}
