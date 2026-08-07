import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-sage-200 px-4 py-3 rounded-full shadow-lg flex items-center gap-2 animate-slide-up">
      <CheckCircle2 className="w-5 h-5 text-sage-500" />
      <span className="text-sm font-sans text-[#2C3531] font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 hover:bg-sage-50 p-1 rounded-full text-sage-400 hover:text-sage-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
