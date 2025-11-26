import { useEffect, useState } from 'react';
import useAuth from './hooks/useAuth';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

export default function DbConfig() {
  const [dbConfig, setDbConfig] = useState<{ serverDB: string; port: number; userDB?: string; passwordDB?: string; database?: string }>({ serverDB: '', port: 3306, userDB: '', passwordDB: '', database: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/config/db-config?inputs=true');
        if (!res.ok) return;
        const j = await res.json();
        const v = j?.value || {};
        setDbConfig({
          serverDB: String(v.serverDB ?? v.host ?? ''),
          port: Number(v.port ?? 3306),
          userDB: String(v.userDB ?? v.user ?? ''),
          passwordDB: String(v.passwordDB ?? v.password ?? ''),
          database: String(v.database ?? ''),
        });
        // Also fetch the full setting to discover whether a password is stored (server will not return password itself)
        try {
          const r2 = await fetch('/api/config/db-config');
          if (r2.ok) {
            const j2 = await r2.json();
            const pwFlag = !!(j2?.value?.passwordSet);
            setPasswordSet(pwFlag);
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Failed to load db-config', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      // Use /api/config/split to persist as top-level settings and update runtime store
      const dbToSave: any = { ...dbConfig };
      if (!user?.isAdmin) delete dbToSave.passwordDB;
      const payload: any = { 'db-config': dbToSave };
      const res = await fetch('/api/config/split', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('failed');
      toast.success('Configuração do banco salva para todos os usuários');
      // Try to apply immediately by requesting reconnect
      try {
        const r2 = await fetch('/api/db/reconnect', { method: 'POST' });
        if (r2.ok) {
          toast.success('Reconexão ao banco iniciada com as novas configurações');
        } else {
          const txt = await r2.text().catch(() => '');
          toast.warn('Reconexão falhou: ' + (txt || r2.status));
        }
      } catch (err) {
        console.warn('reconnect failed', err);
        toast.warn('Erro ao solicitar reconexão do banco');
      }
    } catch (e) {
      console.error('save db-config failed', e);
      toast.error('Falha ao salvar configuração do banco');
    } finally {
      setSaving(false);
      // Refresh passwordSet flag after saving
      try {
        const r = await fetch('/api/config/db-config');
        if (r.ok) {
          const j = await r.json();
          setPasswordSet(!!(j?.value?.passwordSet));
        }
      } catch (err) {}
    }
  };

  const test = async () => {
    try {
      toast.info('Testando conexão...');
      const res = await fetch('/api/db/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dbConfig) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'test failed');
      }
      toast.success('Conexão com DB OK');
    } catch (e: any) {
      console.error('test db failed', e);
      toast.error('Falha na conexão: ' + (String(e?.message || e)));
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Conexão MySQL (DB)</h2>
      {loading ? (
        <div className="text-sm text-gray-500">Carregando...</div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <Label className="w-36">Host / IP</Label>
            <Input value={dbConfig.serverDB || ''} onChange={(e) => setDbConfig({ ...dbConfig, serverDB: e.target.value })} />
          </div>
          <div className="flex gap-2 items-center">
            <Label className="w-36">Porta</Label>
            <Input type="number" value={dbConfig.port ?? 3306} onChange={(e) => setDbConfig({ ...dbConfig, port: Number(e.target.value || 0) })} />
          </div>
          <div className="flex gap-2 items-center">
            <Label className="w-36">Database</Label>
            <Input value={dbConfig.database || ''} onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })} />
          </div>
          <div className="flex gap-2 items-center">
            <Label className="w-36">Usuário DB</Label>
            <Input value={dbConfig.userDB || ''} onChange={(e) => setDbConfig({ ...dbConfig, userDB: e.target.value })} />
          </div>
          <div className="flex gap-2 items-center">
            <Label className="w-36">Senha DB</Label>
            {user?.isAdmin ? (
              <Input type="password" value={dbConfig.passwordDB || ''} onChange={(e) => setDbConfig({ ...dbConfig, passwordDB: e.target.value })} />
            ) : (
              <div className="text-sm text-gray-600">{passwordSet ? 'Senha configurada (requer admin para alterar)' : 'Nenhuma senha configurada'}</div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={test} className="bg-gray-600 hover:bg-gray-700" disabled={saving}>{/* test button */} Testar</Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>{saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Salvando...</span> : 'Salvar DB'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
