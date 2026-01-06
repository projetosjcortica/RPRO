import { useEffect, useState } from 'react';
import { useRuntimeConfig } from './hooks/useRuntimeConfig';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { toast } from './lib/toastWrapper';
import { Loader2 } from 'lucide-react';

export default function DbConfig() {
  const [dbConfig, setDbConfig] = useState<{ serverDB: string; port: number; userDB?: string; passwordDB?: string; database?: string }>({ serverDB: '', port: 3306, userDB: '', passwordDB: '', database: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);
  const runtime = useRuntimeConfig();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Use the new JSON file endpoint
        const res = await fetch('/api/db/config-file?inputs=true');
        if (!res.ok) return;
        const config = await res.json();
        setDbConfig({
          serverDB: String(config.serverDB ?? ''),
          port: Number(config.port ?? 3306),
          userDB: String(config.userDB ?? ''),
          passwordDB: String(config.passwordDB ?? ''),
          database: String(config.database ?? ''),
        });
        // Check if password is set
        try {
          const r2 = await fetch('/api/db/config-file');
          if (r2.ok) {
            const j2 = await r2.json();
            const pwFlag = !!(j2?.passwordSet);
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
      // Use the new JSON file endpoint - ALWAYS saves, even if connection fails
      const res = await fetch('/api/db/config-file', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(dbConfig) 
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'failed to save');
      }
      
      const result = await res.json();
      
      // Check connection status
      if (result.connectionOk) {
        toast.success('Configuração salva e conexão OK: ' + (result.configPath || 'arquivo local'));
      } else {
        toast.warning('Configuração salva, mas conexão falhou: ' + (result.connectionError || 'erro desconhecido'));
      }
      
      // Update state with saved config
      if (result.config) {
        setDbConfig({
          serverDB: String(result.config.serverDB ?? ''),
          port: Number(result.config.port ?? 3306),
          userDB: String(result.config.userDB ?? ''),
          passwordDB: String(result.config.passwordDB ?? ''),
          database: String(result.config.database ?? ''),
        });
      }
      
      // Try to apply immediately by requesting reconnect (only if connection was OK)
      if (result.connectionOk) {
        try {
          const r2 = await fetch('/api/db/reconnect', { method: 'POST' });
          if (r2.ok) {
            toast.success('Reconexão ao banco iniciada');
          }
        } catch (err) {
          console.warn('reconnect failed', err);
        }
      }
      
      // Reload runtime configs
      try { await runtime.reload(); } catch (e) { /* ignore */ }
    } catch (e: any) {
      console.error('save db-config failed', e);
      toast.error('Falha ao salvar: ' + (String(e?.message || e)));
    } finally {
      setSaving(false);
      // Refresh passwordSet flag after saving
      try {
        const r = await fetch('/api/db/config-file');
        if (r.ok) {
          const j = await r.json();
          setPasswordSet(!!(j?.passwordSet));
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
    <div className="">
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
            <Input 
              type="password" 
              value={dbConfig.passwordDB || ''} 
              onChange={(e) => setDbConfig({ ...dbConfig, passwordDB: e.target.value })} 
              placeholder={passwordSet ? '••••••••' : 'Digite a senha do banco'}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={test} className="bg-gray-600 hover:bg-gray-700" disabled={saving}>{/* test button */} Testar</Button>
            <Button onClick={save} variant='destructive' disabled={saving}>{saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Salvando...</span> : 'Salvar DB'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
