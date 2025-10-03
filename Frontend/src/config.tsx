import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";
import useAuth from "./hooks/useAuth";
import Profile from "./Profile";

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
      const response = await fetch(
        `http://localhost:3000/api/config/${encodeURIComponent(key)}?inputs=true`
      );
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
      const payload: any = {};
      payload[key] = data;
      const response = await fetch("http://localhost:3000/api/config/split", {
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
      const keys = [
        "profile-config",
        "ihm-config",
        "db-config",
        "admin-config",
      ];
      const combined: Record<string, any> = {};

      for (const k of keys) {
        try {
          const res = await fetch(`http://localhost:3000/api/config/${encodeURIComponent(k)}`);
          if (!res.ok) continue;
          const js = await res.json();
          if (js && js.value !== undefined) combined[k] = js.value;
        } catch (e) {
          console.warn(`Failed to load config for ${k}:`, e);
        }
      }

      try {
        const prodInfo = localStorage.getItem("produtosInfo");
        if (prodInfo) combined["produtosInfo"] = JSON.parse(prodInfo);
      } catch (e) {
        // ignore localStorage parse errors
      }

      if (Object.keys(combined).length === 0) return true;

      const response = await fetch("http://localhost:3000/api/config/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(combined),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error("Failed to save all configs:", error);
      throw error;
    }
  },

  async cleanDB(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:3000/api/database/clean", {
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

  async cleanProductionData(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:3000/api/clear/production", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.ok === true;
    } catch (error) {
      console.error("Failed to clean production data:", error);
      throw error;
    }
  },

  async selectFolder(): Promise<string> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;
      input.onchange = (e: any) => {
        if (e.target.files.length > 0) {
          resolve(e.target.files[0].webkitRelativePath.split("/")[0]);
        }
      };
      input.click();
    });
  },

  async selectFile(): Promise<string> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = (e: any) => {
        if (e.target.files.length > 0) {
          resolve(e.target.files[0].name);
        }
      };
      input.click();
    });
  },
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
          setFormData((prev) => ({ ...prev, ...(savedData as any) }));
          setOriginalData((prev) => ({ ...prev, ...(savedData as any) }));
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        try {
          await configService.saveAllConfigs();
        } catch (err) {
          console.warn("Failed to save all configs after section save:", err);
        }
        try {
          if (key === "profile-config") {
            const nome = (formData as any)?.nomeCliente || undefined;
            window.dispatchEvent(
              new CustomEvent("profile-config-updated", {
                detail: { nomeCliente: nome },
              })
            );
          }
        } catch (e) {
          // ignore errors
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
    onCancel,
  };
}

/* ----------------- GERAL ------------------- */

export function ProfileConfig({
  configKey = "profile-config",
}: {
  configKey?: string;
}) {
  // ✅ TODOS OS HOOKS PRIMEIRO, SEM CONDICIONAIS
  const { formData, isLoading, onChange, onSave } = usePersistentForm(configKey);
  const { user } = useAuth();

  // ✅ Loading state - SEM return antecipado
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }

  // ✅ AGORA SIM O RETURN FINAL
  return (
    <div id="geral" className="flex flex-col gap-4 bg-white">
      <Profile />
      
      {user?.isAdmin && (
        <div className="mt-4 border rounded p-3 bg-white">
          <Label className="mt-2">
            Nome da empresa
            <Input
              type="text"
              value={formData.nomeCliente || ""}
              onChange={(e) => onChange("nomeCliente", e.target.value)}
              className="mt-2"
            />
          </Label>
        </div>
      )}
      
      <div className="flex gap-2 justify-end mt-6">
        <Button
          id="save"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700"
        >
          Salvar
        </Button>
      </div>
    </div>
  );
}

/* ----------------- IHM ------------------- */
export function IHMConfig({
  configKey = "ihm-config",
}: {
  configKey?: string;
}) {
  // ✅ HOOKS PRIMEIRO
  const { formData, isEditing, isLoading, onChange, onEdit, onSave, onCancel } =
    usePersistentForm(configKey);

  // ✅ Loading state DEPOIS dos hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }

  // ✅ RETURN FINAL
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
export function DatabaseConfig({
  configKey = "db-config",
}: {
  configKey?: string;
}) {
  // ✅ HOOKS PRIMEIRO
  const { formData, isEditing, isLoading, onChange, onEdit, onSave, onCancel } =
    usePersistentForm(configKey);

  // ✅ Loading state DEPOIS dos hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }

  // ✅ RETURN FINAL
  return (
    <div id="dbCfg" className="flex flex-col gap-4 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Configuração do Banco de Dados
      </h2>

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
export function AdminConfig({
  configKey = "admin-config",
}: {
  configKey?: string;
}) {
  // ✅ HOOKS PRIMEIRO
  const { formData, isEditing, isLoading, onChange, onEdit, onSave, onCancel } =
    usePersistentForm(configKey);

  // ✅ Loading state DEPOIS dos hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }

  // ✅ RETURN FINAL
  return (
    <div id="adm" className="flex flex-col gap-4 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Configurações Administrativas
      </h2>

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
                Resetar Sistema
                <Button className="w-70 mt-2 bg-red-600 hover:bg-red-700" disabled={!isEditing}>
                  Resetar Sistema
                </Button>
              </Label>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resetar sistema completo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá:
                <br />• Limpar todos os dados de produção (relatórios, estoque, movimentações)
                <br />• Resetar matéria prima para produtos padrão (Produto 1-40)
                <br />• Limpar cache SQLite e backups
                <br />• Preservar usuários e configurações do sistema
                <br /><br />
                <strong>Esta ação é irreversível!</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    const sucesso = await configService.cleanProductionData();
                    if (sucesso) {
                      toast.success("Sistema resetado com sucesso! Usuários e configurações preservados.");
                    } else {
                      toast.error("Erro ao resetar sistema");
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Ocorreu um erro inesperado");
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Resetar Sistema
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div
        id="containerMFC"
        className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border rounded-lg bg-gray-50 mt-4"
      >
        <div
          id="CsvMethod"
          className="flex flex-col justify-center items-center border rounded p-4 bg-white w-full md:w-1/3"
        >
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

        <div
          id="formule"
          className="flex flex-col justify-center items-center border rounded p-4 bg-white w-full md:w-1/3"
        >
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

        <div
          id="CsvImport"
          className="flex flex-col justify-center items-center border rounded p-4 bg-white w-full md:w-1/3"
        >
          <Label className="font-medium text-gray-700">Importar CSV</Label>
          <Button
            disabled={!isEditing}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
          >
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