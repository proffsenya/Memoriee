export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-lg p-6 ${className}`}>{children}</div>
);