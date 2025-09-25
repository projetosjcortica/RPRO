import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";
import useAuth from './hooks/useAuth';
import { resolvePhotoUrl } from './lib/photoUtils';

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

export const initialFormData = {
  nomeCliente: "",
  ip: "",
  user: "",
  password: "",
  localCSV: "",
  metodoCSV: "", // '1' ou '2'
  habilitarCSV: false,
  serverDB: "",
  database: "",
  userDB: "",
  passwordDB: "",
  mySqlDir: "",
  dumpDir: "",
  batchDumpDir: "",
};

export interface FormData {
  nomeCliente: string;
  ip: string;
  user: string;
  password: string;
  localCSV: string;
  metodoCSV: string;
  habilitarCSV: boolean;
  serverDB: string;
  database: string;
  userDB: string;
  passwordDB: string;
  mySqlDir: string;
  dumpDir: string;
  batchDumpDir: string;
  mockEnabled?: boolean;
}

type FormDataKey = keyof FormData;

// API Service para comunicação HTTP
const configService = {
  async loadConfig(key: string): Promise<FormData | null> {
    try {
      // Request only input fields to keep payload small and match frontend form shape
      const response = await fetch(`/api/config/${encodeURIComponent(key)}?inputs=true`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error("Failed to load config:", error);
      throw error;
    }
  },

  async saveConfig(key: string, data: FormData): Promise<boolean> {
    try {
      // Persist the single topic separately so backend stores one Setting row per topic
      const payload: any = {};
      payload[key] = data;
      const response = await fetch("/api/config/split", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  },

  async saveAllConfigs(): Promise<boolean> {
    try {
      // Known config keys used by the frontend
      const keys = ["general-config", "ihm-config", "db-config", "admin-config"];
      const combined: Record<string, any> = {};

      for (const k of keys) {
        try {
          const res = await fetch(`/api/config/${encodeURIComponent(k)}`);
          if (!res.ok) continue; // skip missing
          const js = await res.json();
          if (js && js.value !== undefined) combined[k] = js.value;
        } catch (e) {
          // ignore individual fetch errors
          console.warn(`Failed to load config for ${k}:`, e);
        }
      }

      // Also include any configs stored in localStorage under 'produtosInfo' or similar if needed
      try {
        const prodInfo = localStorage.getItem('produtosInfo');
        if (prodInfo) combined['produtosInfo'] = JSON.parse(prodInfo);
      } catch (e) {
        // ignore localStorage parse errors
      }

      // If nothing to save, return true
      if (Object.keys(combined).length === 0) return true;

      const response = await fetch('/api/config/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combined),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Failed to save all configs:', error);
      throw error;
    }
  },

  async cleanDB(): Promise<boolean> {
    try {
      // Você precisará implementar este endpoint no backend
      const response = await fetch("/api/database/clean", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error("Failed to clean database:", error);
      throw error;
    }
  },

  async selectFolder(): Promise<string> {
    // Para seleção de pastas/arquivos, você pode:
    // 1. Implementar endpoints específicos no backend
    // 2. Usar input type="file" nativo do browser
    // 3. Implementar um diálogo customizado
    
    // Exemplo simplificado usando input file
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.onchange = (e: any) => {
        if (e.target.files.length > 0) {
          resolve(e.target.files[0].webkitRelativePath.split('/')[0]);
        }
      };
      input.click();
    });
  },

  async selectFile(): Promise<string> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e: any) => {
        if (e.target.files.length > 0) {
          resolve(e.target.files[0].name);
        }
      };
      input.click();
    });
  }
};


// Custom hook to manage form state with persistence via HTTP
export function usePersistentForm(key: string) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoading(true);
        const savedData = await configService.loadConfig(key);
        if (savedData) {
          // Merge savedData onto the initial/default form shape so that any
          // missing fields in the saved payload don't become undefined and
          // cause inputs to flip between uncontrolled and controlled.
          setFormData(prev => ({ ...prev, ...(savedData as any) }));
          setOriginalData(prev => ({ ...prev, ...(savedData as any) }));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load saved data");
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [key]);

  const onChange = (field: FormDataKey, value: FormData[FormDataKey]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onEdit = () => {
    setOriginalData(formData);
    setIsEditing(true);
  };

  const onSave = async () => {
    try {
      const success = await configService.saveConfig(key, formData);
      if (success) {
        setOriginalData(formData);
        setIsEditing(false);
        toast.success("Data saved successfully!");
        // After saving this section, attempt to persist all frontend configs to backend
        try {
          await configService.saveAllConfigs();
        } catch (err) {
          console.warn('Failed to save all configs after section save:', err);
        }
      } else {
        toast.error("Failed to save data");
      }
    } catch (error) {
      console.error("Failed to save data:", error);
      toast.error("Failed to save data");
    }
  };

  const onCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  return {
    formData,
    isEditing,
    isLoading,
    onChange,
    onEdit,
    onSave,
    onCancel
  };
}

/* ----------------- GERAL ------------------- */

export function GeneralConfig({ configKey = "general-config" }: { configKey?: string }) {
  const { formData, isEditing, isLoading, onChange } = usePersistentForm(configKey);
  const { user, updateUser } = useAuth();

  // local preview state for selected photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.photoPath ? resolvePhotoUrl(user.photoPath) : null);

  useEffect(() => {
    setPreviewUrl(user?.photoPath ? resolvePhotoUrl(user.photoPath) : null);
  }, [user]);

  const saveProfileName = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:3000/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, displayName: formData.nomeCliente }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`update failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      updateUser(data);
      // Also persist into general config formData if needed
      onChange('nomeCliente', data.displayName || formData.nomeCliente);
    } catch (err) {
      console.error('Failed to save profile name from general config', err);
    }
  };

  const uploadProfilePhoto = async () => {
    if (!user) return;
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append('username', user.username);
    fd.append('photo', selectedFile);
    try {
      const res = await fetch('http://localhost:3000/api/auth/photo', { method: 'POST', body: fd });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`upload failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
  updateUser(data);
  setPreviewUrl(data.photoPath ? resolvePhotoUrl(data.photoPath) : previewUrl);
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to upload profile photo from general config', err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <div id="geral" className="flex flex-col gap-4 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configuração Geral</h2>
      
      <Label className="text-lg font-semibold">
        Nome do cliente
        <Input
          placeholder="Nome do cliente"
          type="text"
          value={formData.nomeCliente || ''}
          onChange={(e) => onChange("nomeCliente", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>

      {/* Profile preview + controls inside Geral */}
      <div className="mt-4 border rounded p-3 bg-gray-50">
        <h3 className="font-semibold">Meu perfil</h3>
        <div className="flex items-center gap-4 mt-2">
          <img src={previewUrl || '/public/logo.png'} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          <div className="flex-grow">
            <div className="text-sm font-medium">{user?.displayName || user?.username}</div>
            <div className="text-xs text-gray-500">{user?.username}</div>
            <div className="mt-2 flex gap-2">
              <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              <Button onClick={uploadProfilePhoto} disabled={!selectedFile} className="bg-green-600">Enviar</Button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Label className="font-medium">Usar nome do cliente como meu nome</Label>
          <div className="flex gap-2 mt-2">
            <Button onClick={() => saveProfileName()} disabled={!user} className="bg-blue-600">Sincronizar nome</Button>
          </div>
        </div>
      </div>

      {/* Admin-only: definir nome da granja */}
      {user?.isAdmin && (
        <div className="mt-4 border rounded p-3 bg-white">
          <h3 className="font-semibold">Configurações da granja (Admin)</h3>
          <Label className="mt-2">
            Nome da granja
            <Input
              type="text"
              value={formData.nomeCliente || ''}
              onChange={(e) => onChange('nomeCliente', e.target.value)}
              disabled={!isEditing}
              className="mt-2"
            />
          </Label>
        </div>
      )}

    </div>
  );
}

/* ----------------- IHM ------------------- */
export function IHMConfig({ configKey = "ihm-config" }: { configKey?: string }) {
  const { formData, isEditing, isLoading, onChange, onEdit, onSave, onCancel } = usePersistentForm(configKey);

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <div id="webCfg" className="flex flex-col gap-4 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configuração IHM</h2>
      
      <Label className="font-medium text-gray-700">
        IP da IHM
        <Input
          type="text"
          value={formData.ip}
          onChange={(e) => onChange("ip", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>
      
      <Label className="font-medium text-gray-700">
        Usuário
        <Input
          type="text"
          value={formData.user}
          onChange={(e) => onChange("user", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>
      
      <Label className="font-medium text-gray-700">
        Senha
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => onChange("password", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>
      
      <Label className="font-medium text-gray-700">
        Upload CSV
        <div className="flex gap-2 mt-2">
          <Input 
            type="text" 
            value={formData.localCSV} 
            readOnly 
            disabled 
            className="flex-1 p-3 border rounded-md bg-gray-100"
          />
          <Button
            onClick={async () => {
              const path = await configService.selectFolder();
              if (path) onChange("localCSV", path);
            }}
            disabled={!isEditing}
            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
          >
            Selecionar pasta
          </Button>
        </div>
      </Label>
      
      <div className="flex gap-2 justify-end mt-6">
        {isEditing ? (
          <>
            <Button 
              id="cancel" 
              onClick={onCancel}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button 
              id="save" 
              onClick={onSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar
            </Button>
          </>
        ) : (
          <Button 
            id="edit" 
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}

/* ----------------- BANCO DE DADOS ------------------- */
export function DatabaseConfig({ configKey = "db-config" }: { configKey?: string }) {
  const { formData, isEditing, isLoading, onChange, onEdit, onSave, onCancel } = usePersistentForm(configKey);

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <div id="dbCfg" className="flex flex-col gap-4 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configuração do Banco de Dados</h2>
      
      <Label className="font-medium text-gray-700">
        Server
        <Input
          type="text"
          value={formData.serverDB}
          onChange={(e) => onChange("serverDB", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>
      
      <Label className="font-medium text-gray-700">
        DataBase
        <Input
          type="text"
          value={formData.database}
          onChange={(e) => onChange("database", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>
      
      <Label className="font-medium text-gray-700">
        User
        <Input
          type="text"
          value={formData.userDB}
          onChange={(e) => onChange("userDB", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>
      
      <Label className="font-medium text-gray-700">
        Senha
        <Input
          type="password"
          value={formData.passwordDB}
          onChange={(e) => onChange("passwordDB", e.target.value)}
          disabled={!isEditing}
          className="mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Label>
     
      <div className="flex gap-2 justify-end mt-6">
        {isEditing ? (
          <>
            <Button 
              id="cancel" 
              onClick={onCancel}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button 
              id="save" 
              onClick={onSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar
            </Button>
          </>
        ) : (
          <Button 
            id="edit" 
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}

/* ----------------- ADMIN ------------------- */
export function AdminConfig({ configKey = "admin-config" }: { configKey?: string }) {
  const { formData, isEditing, isLoading, onChange, onEdit, onSave, onCancel } = usePersistentForm(configKey);

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  return (
    <div id="adm" className="flex flex-col gap-4 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configurações Administrativas</h2>

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
                  const path = await configService.selectFile();
                  if (path) onChange("mySqlDir", path);
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
                  const path = await configService.selectFile();
                  if (path) onChange("dumpDir", path);
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
                  const path = await configService.selectFile();
                  if (path) onChange("batchDumpDir", path);
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
        <div id="sidetxt" className="mb-4">
          <Label className="font-medium text-gray-700">
            Importar dump padrão
            <Button className="w-70 mt-2" disabled={!isEditing}>
              Importar Dump
            </Button>
          </Label>
        </div>

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
                    const sucesso = await configService.cleanDB();
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
       

      
      {/* Container MFC agora está no Geral */}
      <div id="containerMFC" className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border rounded-lg bg-gray-50 mt-4">
        <div id="CsvMethod" className="flex flex-col justify-center items-center border rounded p-4 bg-white w-full md:w-1/3">
          <Label className="mb-2 font-medium text-gray-700">Método CSV</Label>
          <div className="flex gap-4">
            <Label className="flex items-center gap-1">
              <input
                type="radio"
                value="1"
                checked={formData.metodoCSV === "1"}
                onChange={(e) => onChange("metodoCSV", e.target.value)}
                disabled={!isEditing}
                className="rounded-full text-blue-600 focus:ring-blue-500"
              />
              Único
            </Label>
            <Label className="flex items-center gap-1">
              <input
                type="radio"
                value="2"
                checked={formData.metodoCSV === "2"}
                onChange={(e) => onChange("metodoCSV", e.target.value)}
                disabled={!isEditing}
                className="rounded-full text-blue-600 focus:ring-blue-500"
              />
              Mensal
            </Label>
          </div>
        </div>

        <div id="formule" className="flex flex-col justify-center items-center border rounded p-4 bg-white w-full md:w-1/3">
          <Label className="font-medium text-gray-700">Fórmula</Label>
          <Label className="flex items-center gap-2 mt-2">
            <Checkbox
              id="formula"
              checked={formData.habilitarCSV}
              onCheckedChange={(checked) => onChange("habilitarCSV", !!checked)}
              disabled={!isEditing}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            Habilitar
          </Label>
        </div>

        <div id="CsvImport" className="flex flex-col justify-center items-center border rounded p-4 bg-white w-full md:w-1/3">
          <Label className="font-medium text-gray-700">Importar CSV</Label>
          <Button disabled={!isEditing} className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
            Importar
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-6">
        {isEditing ? (
          <>
            <Button 
              id="cancel" 
              onClick={onCancel}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button 
              id="save" 
              onClick={onSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar
            </Button>
          </>
        ) : (
          <Button 
            id="edit" 
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Editar
          </Button>
        )}
      </div>

    </div>
  );
}