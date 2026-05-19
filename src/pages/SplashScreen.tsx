import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full opacity-5 blur-3xl -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl -bottom-20 -right-20 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo area with animation */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-2xl animate-bounce">
          <Camera size={40} className="text-white" />
        </div>

        {/* App name */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Memoriee</h1>
          <p className="text-gray-300 text-lg font-light">Ваши воспоминания, навсегда</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};
