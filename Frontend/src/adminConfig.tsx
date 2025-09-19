import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
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
// import { IpcRendererEvent } from "electron/utility";
import { getMockStatus, setMockStatus } from "./utils/mockHelper";
import { updateConfig } from "./CFG";

// Formulário para as configurações de administrador
export function AdminConfig({ configKey = "admin-config" }: { configKey?: string }) {
  // Estado para controlar se o modo mock está ativado
  const [isMockEnabled, setIsMockEnabled] = useState(false);
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    mySqlDir: "",
    dumpDir: "",
    batchDumpDir: "",
    mockEnabled: false
  });
  // Estado para controlar se o formulário está em modo de edição
  const [isEditing, setIsEditing] = useState(false);

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar configurações salvas
        const savedData = await window.electronAPI.loadData(configKey);
        if (savedData) {
          setFormData(savedData);
        }
        
        // Carregar status do modo mock
        const mockStatus = await getMockStatus();
        setIsMockEnabled(mockStatus);
        setFormData(prev => ({ ...prev, mockEnabled: mockStatus }));
        
        // Atualiza a configuração da aplicação
        updateConfig(mockStatus);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    
    loadData();
  }, [configKey]);

  // Funções para manipular o formulário
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const success = await window.electronAPI.saveData(configKey, formData);
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
    window.electronAPI.loadData(configKey).then(savedData => {
      if (savedData) {
        setFormData(savedData);
      }
    });
    setIsEditing(false);
  };

  // Função para alternar o modo mock
  const handleToggleMock = async (checked: boolean) => {
    try {
      const success = await setMockStatus(checked);
      if (success) {
        setIsMockEnabled(checked);
        handleChange("mockEnabled", checked);
        
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
                  const path = await window.electronAPI.selectFile();
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
                  const path = await window.electronAPI.selectFile();
                  if (path) handleChange("batchDumpDir", path);
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