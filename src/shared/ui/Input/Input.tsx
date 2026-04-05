interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input = ({ label, className, ...props }: InputProps) => (
  <div>
    {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
    <input className={`border border-gray-300 rounded px-3 py-2 w-full ${className}`} {...props} />
  </div>
);