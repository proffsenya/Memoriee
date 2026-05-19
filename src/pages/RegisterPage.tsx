import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { registerUser } from '../features/userSlice/userSlice';
import { Button, Input, Card } from '../shared/ui';
import { UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(registerUser({ name, email, password })).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-5 blur-3xl top-20 -left-40"></div>
        <div className="absolute w-80 h-80 bg-blue-500 rounded-full opacity-5 blur-3xl -bottom-40 -right-40"></div>
      </div>

      <Card className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600">
          <UserPlus size={24} className="text-white" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-center text-white">Регистрация</h2>
        <p className="mb-6 text-center text-gray-400 text-sm">Создайте аккаунт, чтобы начать использовать Memoriee</p>
        {error && <div className="p-3 mb-4 text-red-200 bg-red-900/30 border border-red-700/50 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
            Войти
          </Link>
        </p>
      </Card>
    </div>
  );
};