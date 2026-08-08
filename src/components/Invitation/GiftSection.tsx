import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../Base/Toast';

interface GiftSectionProps {
  bankAlias: string;
  bankCbu: string;
  bankOwner: string;
  bankName: string;
}

export function GiftSection({ bankAlias, bankCbu, bankOwner, bankName }: GiftSectionProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(bankAlias);
    setCopied(true);
    setToastMessage('Alias copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdminShortcut = () => {
    navigate('/admin');
  };

  const handleTouchStart = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      handleAdminShortcut();
    }
    lastTapRef.current = now;
  };

  return (
    <section className="venue section" style={{ paddingTop: '60px', paddingBottom: '60px', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="sprig"
        style={{ transform: 'none', fontSize: '32px', cursor: 'pointer', userSelect: 'none' }}
        onDoubleClick={handleAdminShortcut}
        onTouchStart={handleTouchStart}
        title="Doble clic para administrar"
      >
        🎁
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="script"
        style={{ fontSize: '58px', marginBottom: '10px' }}
      >
        Regalos
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 9 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{ 
          fontFamily: 'var(--sans)', 
          fontSize: '12px', 
          lineHeight: '1.8', 
          color: 'var(--sage)', 
          maxWidth: '500px', 
          margin: '0 auto 28px', 
          fontWeight: 300, 
          letterSpacing: '0.04em' 
        }}
      >
        Tu presencia es nuestro mejor regalo, pero si deseás hacernos un obsequio, podés realizar una transferencia bancaria a nuestra cuenta:
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3 }}
        style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}
      >
        <div className="bank-card" style={{ border: '1px solid var(--line)', background: '#fff', borderRadius: '12px' }}>
          <div className="bank-row">
            <span className="bank-label">Banco</span>
            <span className="bank-value">{bankName}</span>
          </div>
          
          <div className="bank-row">
            <span className="bank-label">Titular</span>
            <span className="bank-value">{bankOwner}</span>
          </div>
          
          <div className="bank-col">
            <span className="bank-label">CBU / CVU</span>
            <span className="bank-value" style={{ wordBreak: 'break-all', fontSize: '12px' }}>
              {bankCbu}
            </span>
          </div>
          
          <div className="bank-alias-box">
            <span className="bank-alias-label">Alias</span>
            <span className="bank-alias-value">{bankAlias}</span>
          </div>
        </div>

        <button
          onClick={handleCopyAlias}
          className="dark-pill-button"
          id="btn-copiar-alias"
          style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ stroke: 'currentColor', fill: 'none', strokeWidth: '2px', width: '14px', height: '14px' }}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? 'ALIAS COPIADO' : 'COPIAR ALIAS'}
        </button>
      </motion.div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </section>
  );
}
