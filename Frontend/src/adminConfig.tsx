import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { getProcessador } from "./Processador";
import { resolvePhotoUrl } from "./lib/photoUtils";
import { Switch } from "./components/ui/switch";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";



// Formulário para as configurações de administrador
export function AdminConfig({ configKey = "admin-config" }: { configKey?: string }) {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState<any>({
    mySqlDir: "",
    dumpDir: "",
    batchDumpDir: "",
  });
  // Estado para controlar se o formulário está em modo de edição
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para features experimentais
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoverResults, setDiscoverResults] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[] | null>(null);
  const [discoverPaths, setDiscoverPaths] = useState<string>('/,/visu,/visu/index.html');

  // Local alias to the Electron preload API. Typed as any so callers don't error when optional.
  const electronAPI: any = (window as any).electronAPI;

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar configurações salvas
        const savedData = electronAPI?.loadData ? await electronAPI.loadData(configKey) : null;
        if (savedData) {
          setFormData(savedData);
        }
        
        // Carregar estado das features experimentais
        const expFeaturesStr = localStorage.getItem('experimental-features');
        if (expFeaturesStr) {
          setExperimentalFeatures(expFeaturesStr === 'true');
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    // When user photos change globally, refresh the users list
  const onPhotosUpdated = () => { fetchUsers(); };
    window.addEventListener('user-photos-updated', onPhotosUpdated);

    loadData();
    return () => window.removeEventListener('user-photos-updated', onPhotosUpdated);
  }, [configKey]);

  // Funções para manipular o formulário
  const handleChange = (field: string, value: any) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const success = electronAPI?.saveData ? await electronAPI.saveData(configKey, formData) : false;
      if (success) {
        toast.success("Configurações salvas com sucesso!");
        setIsEditing(false);
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Ocorreu um erro ao salvar as configurações");
    }
  };

  const handleCancel = () => {
    // Recarregar dados salvos
    if (electronAPI?.loadData) {
      electronAPI.loadData(configKey).then((savedData: any) => {
        if (savedData) {
          setFormData(savedData);
        }
      }).catch(() => {});
    }
    setIsEditing(false);
  };

  const handleToggleExperimental = (checked: boolean) => {
    setExperimentalFeatures(checked);
    localStorage.setItem('experimental-features', String(checked));
    
    // Disparar evento para notificar outras telas
    window.dispatchEvent(new CustomEvent('experimental-features-changed', { 
      detail: { enabled: checked } 
    }));
    
    toast.info(checked 
      ? '🧪 Funcionalidades experimentais ATIVADAS' 
      : '🔒 Funcionalidades experimentais DESATIVADAS'
    );
  };

  // Export handler: triggers XLSX download from backend (no prompts)
  const handleExportExcel = async () => {
    try {
      const backendPort = (window as any).backendPort || 3000;
      const url = `http://localhost:${backendPort}/api/relatorio/exportExcel`;
      const resp = await fetch(url, { method: 'GET' });
      if (!resp.ok) {
        let txt = '';
        try { txt = await resp.text(); } catch {}
        toast.error('Falha ao exportar: ' + (txt || resp.statusText));
        return;
      }
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      
      // Nome do arquivo com data atual (sem filtros em adminConfig)
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      a.download = `relatorio_${dia}-${mes}-${ano}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success('Download iniciado');
    } catch (err) {
      console.error('Erro exportando Excel', err);
      toast.error('Erro ao exportar relatório');
    }
  };

  const handleDiscoverIhms = async () => {
    try {
      setDiscoverResults(null);
      setDiscovering(true);
      toast.info('Iniciando busca de IHM na rede (isso pode demorar)');
      const processador = getProcessador();
  const paths = (discoverPaths || '').split(',').map(p => p.trim()).filter(Boolean);
  const res = await processador.discoverIhms('node', [80,443,502], 1200, paths);
      if (res && res.ok) {
        setDiscoverResults(res.results);
        toast.success(`Busca finalizada. ${res.results?.found?.length ?? 0} encontrados.`);
      } else {
        toast.warn('Busca finalizada com erro. Ver logs do backend.');
        setDiscoverResults(res.results || null);
      }
    } catch (e) {
      console.error('discoverIhms failed', e);
      toast.error('Erro ao buscar IHMs: ' + String(e));
    } finally {
      setDiscovering(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const p = getProcessador();
      const res = await p.getAdminUsers();
      if (res && res.users) {
        setUsersList(res.users);
      }
    } catch (e) {
      console.error('Failed to load users', e);
      setUsersList(null);
    }
  };

  const handleDeleteUser = async (uname: string, id?: number) => {
    try {
      const p = getProcessador();
      const res = await p.deleteUser(uname, id);
      if (res && res.ok) {
        toast.success('Usuário excluído');
        await fetchUsers();
      } else {
        toast.error('Falha ao excluir');
      }
    } catch (e) {
      console.error('delete user', e);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleToggleAdmin = async (uname: string, id: number, isAdmin: boolean) => {
    try {
      const p = getProcessador();
      const res = await p.toggleAdmin(uname, id, isAdmin);
      if (res && res.ok) {
        toast.success(isAdmin ? 'Usuário promovido a admin' : 'Admin revogado');
        await fetchUsers();
      } else {
        toast.error('Falha ao atualizar admin');
      }
    } catch (e) {
      console.error('toggle admin', e);
      toast.error('Erro ao atualizar admin');
    }
  };


  return (
    <div id="adm" className="flex flex-col gap-4 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configurações Administrativas</h2>

      {/* Funcionalidades Experimentais - TOPO */}
      <div className="mb-6 p-4 border-2 border-yellow-400 rounded-lg bg-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium text-gray-900 text-base">
              🧪 Funcionalidades Experimentais
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Habilita recursos em teste (ignorar produtos, botões de reset)
            </p>
          </div>
          <Switch
            checked={experimentalFeatures}
            onCheckedChange={handleToggleExperimental}
            className="data-[state=checked]:bg-yellow-600"
          />
        </div>
      </div>

      <div id="CfgAdvancedDB" className="my-4">
        <div className="dir flex flex-col gap-5">
          <div className="flex-col">
            <Label className="font-medium text-gray-700">Local do SQL</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                type="text" 
                value={formData.mySqlDir} 
                readOnly 
                disabled 
                className="flex-1 p-3 border rounded-md bg-gray-100"
              />
              <Button
                type="button"
                onClick={async () => {
                  const path = electronAPI?.selectFile ? await electronAPI.selectFile() : undefined;
                  if (path) handleChange("mySqlDir", path);
                }}
                disabled={!isEditing}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                Selecionar arquivo
              </Button>
            </div>
          </div>

          <div className="flex-col">
            <Label className="font-medium text-gray-700">Local do DUMP</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                type="text" 
                value={formData.dumpDir} 
                readOnly 
                disabled 
                className="flex-1 p-3 border rounded-md bg-gray-100"
              />
              <Button
                type="button"
                onClick={async () => {
                  const path = electronAPI?.selectFile ? await electronAPI.selectFile() : undefined;
                  if (path) handleChange("dumpDir", path);
                }}
                disabled={!isEditing}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                Selecionar arquivo
              </Button>
            </div>
          </div>

          <div className="flex-col">
            <Label className="font-medium text-gray-700">Local do BATCH</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                type="text" 
                value={formData.batchDumpDir} 
                readOnly 
                disabled 
                className="flex-1 p-3 border rounded-md bg-gray-100"
              />
              <Button
                type="button"
                onClick={async () => {
                  const path = electronAPI?.selectFile ? await electronAPI.selectFile() : undefined;
                  if (path) handleChange("batchDumpDir", path);
                }}
                disabled={!isEditing}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                Selecionar arquivo
              </Button>
            </div>
          </div> 
        </div>
      </div>

        

      <div id="CmdAdvancedDB" className="mb-4">
        {/* <div id="sidetxt" className="mb-4">
          <Label className="font-medium text-gray-700">
            Importar dump padrão
            <Button className="w-70 mt-2" disabled={!isEditing}>
              Importar Dump
            </Button>
          </Label>
        </div> */}
      <p>teste</p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div id="sidetxt">
              <Label className="font-medium text-gray-700">
                Zerar banco de Dados
                <Button className="w-70 mt-2" disabled={!isEditing}>
                  Zerar banco
                </Button>
              </Label>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os dados do banco serão permanentemente deletados
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    const sucesso = electronAPI?.cleanDB ? await electronAPI.cleanDB() : false;
                    if (sucesso) {
                      toast.success("Banco de dados zerado com sucesso!");
                    } else {
                      toast.error("Erro ao zerar banco de dados");
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Ocorreu um erro inesperado");
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div id="IhmDiscovery" className="mb-6 p-4 border rounded-lg bg-gray-50">
        <Label className="font-medium text-gray-800">Descobrir IHMs na rede</Label>
        <p className="text-sm text-gray-600 mt-1">Scan de portas (80,443,502) para encontrar possíveis interfaces HMI.</p>
        <div className="mt-2">
          <Label className="text-sm">Caminhos HTTP a testar (separados por vírgula)</Label>
          <Input type="text" value={discoverPaths} onChange={(e) => setDiscoverPaths((e.target as HTMLInputElement).value)} className="mt-1 w-80" />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button onClick={handleDiscoverIhms} disabled={discovering} className="bg-blue-600 hover:bg-blue-700">
            {discovering ? 'Procurando...' : 'Iniciar descoberta'}
          </Button>
          <Button onClick={async () => { const p = getProcessador(); const res = await p.getIhmDiscoveryLast(); setDiscoverResults(res?.results || null); }} className="bg-gray-200 hover:bg-gray-300">Carregar último</Button>
        </div>
        {discoverResults ? (
          <div className="mt-4">
            <Label className="font-medium">Resultados</Label>
            {discoverResults.found && discoverResults.found.length > 0 ? (
              <ul className="list-disc pl-5 mt-2 text-sm">
                {discoverResults.found.map((f: any) => (
                  <li key={f.ip} className="mb-1">
                    <strong>{f.ip}</strong> — portas: {f.openPorts.join(', ')}
                    {f.http && f.http.length > 0 ? (
                      <div className="mt-1 text-sm text-gray-700">
                        {f.http.map((h: any, idx: number) => (
                          <div key={idx} className="mb-0">
                            <span className="font-medium">{h.path}</span>: {h.title || h.statusCode || 'sem título'}</div>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Nenhum dispositivo encontrado.</p>
            )}
          </div>
        ) : null}
        <div className="mt-6 border-t pt-4">
          <Label className="font-medium">Usuários do Sistema</Label>
          <div className="mt-2">
            <Button onClick={fetchUsers} size="sm" className="mb-2">Carregar usuários</Button>
            {usersList && usersList.length > 0 ? (
              <ul className="text-sm">
                {usersList.map(u => (
                  <li key={u.username} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <img src={u.photoPath ? resolvePhotoUrl(u.photoPath) : ''} alt="avatar" className="h-7 w-7 rounded-full border" />
                      <div>{u.displayName || u.username} {u.isAdmin ? '(ADMIN)' : ''}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleToggleAdmin(u.username, u.id, !u.isAdmin)}>{u.isAdmin ? 'Remover Admin' : 'Tornar Admin'}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.username, u.id)}>Excluir</Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500 mt-1">Nenhum usuário carregado.</div>
            )}
          </div>
        </div>
      </div>
      <div id="excelExport" className="mb-4">
          <Label className="font-medium text-gray-700">
            Exportar relatórios
            <Button onClick={handleExportExcel} className="w-70 mt-2">
              Exportar Relatório (XLSX)
            </Button>  
          </Label>
        </div>
      <div className="flex gap-2 justify-end mt-6">
        {isEditing ? (
          <>
            <Button 
              id="cancel" 
              onClick={handleCancel}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button 
              id="save" 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar
            </Button>
          </>
        ) : (
          <Button 
            id="edit" 
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}