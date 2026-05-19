interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input = ({ label, className, ...props }: InputProps) => (
  <div>
    {label && <label className="block mb-2 text-sm font-medium text-gray-200">{label}</label>}
    <input className={`bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${className}`} {...props} />
  </div>
);