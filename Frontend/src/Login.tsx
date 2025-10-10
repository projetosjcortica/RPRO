import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await register(username, password, displayName || undefined);
      } else {
        await login(username, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(String(err?.message || err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">{isRegister ? 'Registrar' : 'Entrar'}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Usuário</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border px-2 py-1 rounded" />
            </div>
          )}
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">{isRegister ? 'Registrar' : 'Entrar'}</button>
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-sm text-blue-600">{isRegister ? 'Já tenho conta' : 'Criar conta'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
