import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import { toast } from './lib/toastWrapper';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Button } from './components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useNotify } from './hooks/useNotifications';

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const notify = useNotify();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'racao' | 'amendoim'>('racao');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      if (isRegister) {
        await register(username, password, displayName || undefined, userType);
        notify.log('Conta criada', `Novo usuário "${username}" registrado`);
      } else {
        await login(username, password);
        notify.log('Login', `Usuário "${username}" entrou no sistema`);
      }
      navigate('/');
    } catch (err: any) {
      let msg = String(err?.message || err);
      // Map common English errors to Portuguese
      if (msg.includes('Credenciais inválidas')) {
        msg = 'Credenciais inválidas. Verifique usuário e senha.';
      } else if (msg.includes('usuário já existe') || msg.includes('username')) {
        msg = 'Nome de usuário já existe. Escolha outro.';
      }
      setError(msg);
      // Also show a toast for better visibility
      try { toast.error(msg); } catch(e) {}
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full border px-2 py-1 rounded pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium">Confirmar Senha</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full border px-2 py-1 rounded pr-10" 
                  />
                  {/* Optional: duplicate eye icon here or just rely on the main one. 
                      Usually one toggle controls both or each has its own. 
                      Let's keep it simple and have one toggle control both for now, 
                      or add another button. Adding another button is better UX. */}
                   <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Nome</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div className='flex flex-col gap-2'>
                <label className="block text-sm font-medium">Tipo de Fábrica: </label>
                  <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'racao' | 'amendoim')}>
                      <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value="racao"/> 
                      Fábrica de Ração</label>
                      <label className='flex items-center gap-2 cursor-pointer'>
                      <RadioGroupItem value="amendoim"/>  
                      Benefício Amendoim</label>
                  </RadioGroup>
              </div>
            </>
          )}
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer">{isRegister ? 'Registrar' : 'Entrar'}</button>
            <Button type='button' variant="ghost" onClick={() => { setIsRegister(!isRegister); setError(null); }} className="text-sm text-blue-600 rounded cursor-pointer underline hover:no-underline hover:text-black">{isRegister ? 'Já tenho conta' : 'Criar conta'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
