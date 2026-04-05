import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { loginUser } from '../features/userSlice/userSlice';
import { Button, Input, Card } from '../shared/ui';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/');
    } catch {}
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Вход</h2>
        {error && <div className="p-2 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" disabled={loading} className="w-full">Войти</Button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Нет аккаунта? <Link to="/register" className="text-primary-600">Зарегистрироваться</Link>
        </p>
      </Card>
    </div>
  );
};