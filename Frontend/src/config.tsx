import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";
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
import { IpcRendererEvent } from "electron/utility";
import { getMockStatus, setMockStatus } from "./utils/mockHelper";
import { updateConfig } from "./CFG";

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
  mockEnabled?: boolean; // Nova propriedade para controle de mocks
}

declare global {
  interface Window {
    electronAPI: { 
      onChildStdout: (fn: (evt: IpcRendererEvent, data: { pid: number; data: string }) => void) => void;
      onChildStderr: (fn: (evt: IpcRendererEvent, data: { pid: number; data: string }) => void) => void;
      onChildExit: (fn: (evt: IpcRendererEvent, data: { pid: number; code?: number | null; signal?: string | null }) => void) => void;
      onChildMessage: (fn: (evt: IpcRendererEvent, data: { pid: number; data?: any } | { pid: number; code?: number | null; signal?: string | null }) => void) => void;
      sendToChild: (pid: number, msg: any) => Promise<{ ok: boolean; reason?: string }>;
      startFork(arg0: { script: string; args: never[]; }): unknown;
      loadData: (key: string) => Promise<FormData>;
      saveData: (key: string, data: FormData) => Promise<boolean>;
      selectFolder: () => Promise<string>;
      selectFile: () => Promise<string>;
      cleanDB: () => Promise<boolean>;
    };
  }
}

type FormDataKey = keyof FormData;

// Custom hook to manage form state with persistence
function usePersistentForm(key: string) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<FormData>(initialFormData);

  // Load data on component mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const savedData = await window.electronAPI.loadData(key);
        if (savedData) {
          setFormData(savedData);
          setOriginalData(savedData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load saved data");
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
      const success = await window.electronAPI.saveData(key, formData);
      if (success) {
        setOriginalData(formData);
        setIsEditing(false);
        toast.success("Data saved successfully!");
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
    onChange,
    onEdit,
    onSave,
    onCancel
  };
}

/* ----------------- GERAL ------------------- */

export function GeneralConfig({ configKey = "general-config" }: { configKey?: string }) {
  const { formData, isEditing, onChange, onEdit, onSave, onCancel } = usePersistentForm(configKey);

  return (
    <div id="geral" className="flex flex-col gap-4  bg-white ">
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

/* ----------------- IHM ------------------- */
export function IHMConfig({ configKey = "ihm-config" }: { configKey?: string }) {
  const { formData, isEditing, onChange, onEdit, onSave, onCancel } = usePersistentForm(configKey);

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
              const path = await window.electronAPI.selectFolder();
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
  const { formData, isEditing, onChange, onEdit, onSave, onCancel } = usePersistentForm(configKey);

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
  const { formData, isEditing, onChange, onEdit, onSave, onCancel } = usePersistentForm(configKey);
  const [isMockEnabled, setIsMockEnabled] = useState(false);

  // Carrega o status atual do modo mock ao montar o componente
  useEffect(() => {
    const loadMockStatus = async () => {
      try {
        const status = await getMockStatus();
        setIsMockEnabled(status);
        onChange("mockEnabled", status);
        
        // Atualiza a configuração da aplicação
        updateConfig(status);
      } catch (error) {
        console.error("Erro ao carregar status do mock:", error);
      }
    };

    loadMockStatus();
  }, []);

  // Função para alternar o modo mock
  const handleToggleMock = async (checked: boolean) => {
    try {
      const success = await setMockStatus(checked);
      if (success) {
        setIsMockEnabled(checked);
        onChange("mockEnabled", checked);
        
        // Atualiza a configuração da aplicação
        updateConfig(checked);
        
        toast.success(`Modo mock ${checked ? 'ativado' : 'desativado'} com sucesso`);
      } else {
        toast.error("Falha ao alterar modo mock");
      }
    } catch (error) {
      console.error("Erro ao alternar modo mock:", error);
      toast.error("Erro ao alternar modo mock");
    }
  };

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
                  const path = await window.electronAPI.selectFile();
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
                  const path = await window.electronAPI.selectFile();
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
                  const path = await window.electronAPI.selectFile();
                  if (path) onChange("batchDumpDir", path);
                }}
                disabled={!isEditing}
                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                Selecionar arquivo
              </Button>
            </div>
          </div>
          
          {/* Separador para seção de desenvolvimento */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Configurações de Desenvolvimento</h3>
            
            {/* Controle de Mock */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="mock-toggle" className="font-medium text-gray-700">
                  Modo Mock
                </Label>
                <p className="text-sm text-gray-500">
                  Habilita dados simulados para testes e desenvolvimento
                </p>
              </div>
              {/* O Switch de mock deve estar disponível mesmo quando não estiver em modo de edição */}
              <Switch
                id="mock-toggle"
                checked={isMockEnabled}
                onCheckedChange={handleToggleMock}
              />
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
                    const sucesso = await window.electronAPI.cleanDB();
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