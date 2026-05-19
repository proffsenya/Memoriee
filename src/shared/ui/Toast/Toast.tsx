import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast = ({ id, message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-emerald-900/30 border-emerald-700/50',
    error: 'bg-red-900/30 border-red-700/50',
    info: 'bg-blue-900/30 border-blue-700/50',
  };

  return (
    <div className={`${bgColors[type]} border rounded-xl shadow-lg p-4 pr-10 min-w-[250px] relative animate-slide-in backdrop-blur`}>
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-sm text-gray-200">{message}</span>
      </div>
      <button
        onClick={() => onClose(id)}
        className="absolute text-gray-400 top-3 right-3 hover:text-gray-300 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};