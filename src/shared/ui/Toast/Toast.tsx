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
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`${bgColors[type]} border rounded-lg shadow-lg p-3 pr-8 min-w-[200px] relative animate-slide-in`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="text-sm text-gray-800">{message}</span>
      </div>
      <button
        onClick={() => onClose(id)}
        className="absolute text-gray-400 top-2 right-2 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </div>
  );
};