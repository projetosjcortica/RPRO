import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { FileUp, Loader2, Plus } from 'lucide-react';
import useAuth from "./hooks/useAuth";
import Profile from "./Profile";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
// Popover and `cn` not used in this file; imports removed to satisfy build
import toastManager from "./lib/toastManager";

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
  // optional second IHM defaults
  duasIHMs: false,
  ip2: "",
  user2: "",
  password2: "",
  metodoCSV2: "",
  localCSV2: "",
  selectedIhm: 1,
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

// Extended optional fields to support two IHM profiles and per-IHM file settings.
export interface FormDataOptional {
  duasIHMs?: boolean;
  // second IHM fields
  ip2?: string;
  user2?: string;
  password2?: string;
  metodoCSV2?: string; // 'mensal' | 'geral' | 'custom'
  localCSV2?: string;
  // optionally remember which IHM tab is active
  selectedIhm?: number;
  // per-IHM file method for first IHM if needed (keeps backward compatibility)
  metodoCSV?: string;
  localCSV?: string;
}

type FormDataKey = keyof FormData;

// Allow keys of optional fields when updating via onChange
type FormDataOptionalKey = keyof FormDataOptional;

// API Service para comunicação HTTP
const configService = {
  async loadConfig(key: string, inputsOnly: boolean = true): Promise<FormData | null> {
    try {
      const url = `http://localhost:3000/api/config/${encodeURIComponent(key)}` + (inputsOnly ? '?inputs=true' : '');
      const response = await fetch(url);
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
  const [formData, setFormData] = useState<FormData & Partial<FormDataOptional>>(initialFormData as any);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoading(true);
        // by default load only inputs (backwards compatible). Callers can pass
        // a custom flag via a second arg on usePersistentForm - but to keep
        // the public signature simple we check for a special key naming
        // convention: if key === 'ihm-config' we load full object to support
        // extended fields (ip2, metodoCSV2, etc.).
        const inputsOnly = key !== 'ihm-config';
        const savedData = await configService.loadConfig(key, inputsOnly);
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

  const onChange = (
    field: FormDataKey | FormDataOptionalKey,
    value: any
  ) => {
    setFormData((prev: any) => ({ ...prev, [field as string]: value }));
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
        toast.success("salvo com sucesso!");
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
  const { user, updateUser, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    user?.photoPath ? resolvePhotoUrl(user.photoPath) : null
    );

  // ✅ Loading state - SEM return antecipado
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }

    const onFileChange = (f: File | null) => {
      setFile(f);
      if (!f) {
        setPreview(user?.photoPath ? resolvePhotoUrl(user.photoPath) : null);
        return;
      }
      const url = URL.createObjectURL(f);
      setPreview(url);
    };
     const uploadPhoto = async () => {
  if (!file) return;
    try {
      const fd = new FormData();
      fd.append("username", user.username);
      fd.append("photo", file);
      const res = await fetch("http://localhost:3000/api/auth/photo", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`upload failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      // backend returns user without password
      updateUser(data as any);
      // Also attempt to set this uploaded photo as default for all users
      try {
        if ((data as any)?.photoPath) {
          const defaultRes = await fetch("http://localhost:3000/api/admin/set-default-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: (data as any).photoPath }),
          });
          if (defaultRes.ok) {
            toast.success("Foto atualizada para todos os usuários");
            const dd = await defaultRes.json().catch(() => ({}));
            // persist default photo path and trigger event so other components can update
            const newPath = dd.path || (data as any).photoPath;
            try { localStorage.setItem('default-user-photo', String(newPath)); } catch (e) {}
            window.dispatchEvent(new CustomEvent('user-photos-updated', { detail: { path: newPath } }));
          }
        }
      } catch (err) {
        // non-fatal: do not block UI if setting default fails
        console.warn('[profile] failed to set default photo for all users', err);
        toast.error("Erro ao atualizar foto para todos os usuários");
      }
      try {
        const blobUrl = URL.createObjectURL(file);
        setPreview(blobUrl);
      } catch {}
      setFile(null);
    } catch (e: any) {
    }
  };

   const useAsReportLogo = async () => {
    try {
      // Resize image using canvas to max height 200, then upload as multipart
      const toBlobFromImage = (dataUrl: string) =>
        new Promise<Blob | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            try {
              const ratio = img.width / img.height;
              const h = Math.min(200, img.height);
              const w = Math.round(h * ratio);
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              if (!ctx) return resolve(null);
              ctx.clearRect(0, 0, w, h);
              ctx.drawImage(img, 0, 0, w, h);
              canvas.toBlob((b) => resolve(b), "image/png", 0.9);
            } catch (err) {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = dataUrl;
        });

      // Build a dataUrl from available source
      let sourceDataUrl: string | null = null;
      if (file) {
        sourceDataUrl = await new Promise<string | null>((res) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result));
          r.onerror = () => res(null);
          r.readAsDataURL(file);
        });
      } else if (preview && preview.startsWith("blob:")) {
        try {
          const r = await fetch(preview);
          const b = await r.blob();
          sourceDataUrl = await new Promise<string | null>((res) => {
            const r2 = new FileReader();
            r2.onload = () => res(String(r2.result));
            r2.onerror = () => res(null);
            r2.readAsDataURL(b);
          });
        } catch (err) {
          sourceDataUrl = null;
        }
      }

      if (!sourceDataUrl) {
        return;
      }

      const blob = await toBlobFromImage(sourceDataUrl);
      if (!blob) {
        return;
      }

      const fd = new FormData();
      fd.append("photo", blob, file?.name || "logo.png");
      const res = await fetch("http://localhost:3000/api/report/logo/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`logo upload failed: ${res.status} ${txt}`);
      }
      
      // Notificar que o logo foi atualizado
      window.dispatchEvent(new Event('report-logo-updated'));
    } catch (e: any) {
    }
  };

  // ✅ AGORA SIM O RETURN FINAL
  return (
    <div id="geral" className="flex flex-col gap-4 bg-white">
  <Profile externalPreview={preview} file={file} onUpload={uploadPhoto} showLogoutButton={false} />
      
      {user?.isAdmin && (
        <div className="mt-4 shadow-xl border border-gray-400 flex flex-col gap-4 rounded-lg p-3 bg-white">
          <Label>
            Nome da empresa
            <Input
              type="text"
              value={formData.nomeCliente || ""}
              onChange={(e) => onChange("nomeCliente", e.target.value)}
              className="mt-2 border border-gray-500"
            />
          </Label>
           <div className="flex flex-row gap-3 items-center justify-between">
            <Label className="mb-2 text-sm font-medium">Foto de perfil </Label>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="profile-upload"
                className="cursor-pointer flex items-center gap-2 px-3 w-85 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Plus className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">
                  Selecionar nova imagem
                </span>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"  
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {file && (
                <div className="text-sm text-gray-700">Arquivo selecionado: {file.name}</div>
              )}
            </div>
          </div>
        
        </div>
      )}

      <div className="flex gap-2 justify-end mt-6">
        <Button variant="destructive" onClick={() => { try { logout(); window.dispatchEvent(new Event('profile-logged-out')); } catch(e){} }}>
          Sair
        </Button>

        <Button
          id="save"
          onClick={async () => {
            try {
              await onSave();
              try {
                window.dispatchEvent(new Event('profile-save-request'));
              } catch (e) {}
              if (file) {
                try {
                  await uploadPhoto();
                } catch (e) {}
                try {
                  await useAsReportLogo();
                } catch (e) {}
              }
            } catch (err) {
              console.error('save failed', err);
            }
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          {user ? 'Salvar' : 'OK'}
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

  // Helper: test currently selected IHM connectivity
  const testIhm = async (specificSel?: number) => {
    // avoid mixing ?? and || — compute explicitly
    let selRaw: any = typeof specificSel !== 'undefined' && specificSel !== null ? specificSel : (formData as any).selectedIhm;
    if (selRaw == null || selRaw === '') selRaw = 1;
    const sel = Number(selRaw);
    const ipKey = sel === 1 ? 'ip' : 'ip2';
    const ipVal = (formData as any)[ipKey];
    if (!ipVal) { toast.error('IP não configurado'); return; }
    try {
      toast.info(`Testando IHM ${sel}...`);
      const res = await fetch('/api/ihm/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: ipVal }) });

      // Try to parse JSON body when available
      let body: any = null;
      try { body = await res.clone().json(); } catch (_) { body = null; }

      if (!res.ok) {
        // Map common backend errors to friendly messages
        if (res.status === 504 || (body && body.error === 'timeout')) {
          toast.error('IHM não encontrada');
          return;
        }
        // Generic unreachable / bad gateway
        if (res.status === 502 || res.status === 503) {
          toast.error('IHM não encontrada');
          return;
        }
        // Fallback: show short error
        const txt = (body && body.error) ? String(body.error) : await res.text().catch(() => '');
        toast.error(txt ? `Falha: ${txt}` : `Falha: ${res.status}`);
        return;
      }

      const j = body || await res.json();
      if (j && j.ok) {
        toast.success('IHM Ok!');
      } else if (j && j.error === 'timeout') {
        toast.error('IHM não encontrada');
      } else {
        toast.error('IHM respondeu com erro');
      }
    } catch (err: any) {
      console.error('[IHM test] error', err);
      toast.error('IHM não encontrada');
    }
  };

  // ✅ Loading state DEPOIS dos hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }

  // ✅ RETURN FINAL
  return (
    <div id="webCfg" className="flex flex-col gap-4 bg-white">
      {/* duasIHMs toggle */}
      <div className="flex items-center justify-between">
        <Label className="font-medium text-gray-700">Usar duas IHMs</Label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 text-red-600 rounded"
            checked={!!(formData as any).duasIHMs}
            disabled={!isEditing}
            onChange={(e) => onChange("duasIHMs", !!e.target.checked)}
          />
        </label>
      </div>



      {/* IHM tab selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("selectedIhm", 1)}
          className={`px-3 py-2 rounded-md border ${((formData as any).selectedIhm || 1) === 1 ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700'}`}
        >
          IHM 1
        </button>
        <button
          type="button"
          disabled={!(formData as any).duasIHMs}
          onClick={() => onChange("selectedIhm", 2)}
          className={`px-3 py-2 rounded-md border ${((formData as any).selectedIhm || 1) === 2 ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700'} ${!(formData as any).duasIHMs ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          IHM 2
        </button>
      </div>

      {/* Selected IHM fields */}
      {(() => {
        const sel = Number((formData as any).selectedIhm || 1);
        const ipKey = sel === 1 ? 'ip' : 'ip2';
        const userKey = sel === 1 ? 'user' : 'user2';
        const passKey = sel === 1 ? 'password' : 'password2';
        const metodoKey = sel === 1 ? 'metodoCSV' : 'metodoCSV2';
        const localKey = sel === 1 ? 'localCSV' : 'localCSV2';

        // generate mensal filename using current date
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const mensalName = `Relatorio_${yyyy}_${mm}.csv`;

        return (
          <div className="flex flex-col gap-3">
            <Label className="font-medium text-gray-700">
              IP da IHM ({sel})
              <Input
                type="text"
                value={(formData as any)[ipKey] ?? ''}
                onChange={(e) => onChange(ipKey as any, e.target.value)}
                disabled={!isEditing}
                className="mt-2 p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </Label>

            <Label className="font-medium text-gray-700">
              Usuário
              <Input
                type="text"
                value={(formData as any)[userKey] ?? ''}
                onChange={(e) => onChange(userKey as any, e.target.value)}
                disabled={!isEditing}
                className="mt-2 p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </Label>

            <Label className="font-medium text-gray-700">
              Senha
              <Input
                type="password"
                value={(formData as any)[passKey] ?? ''}
                onChange={(e) => onChange(passKey as any, e.target.value)}
                disabled={!isEditing}
                className="mt-2 p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </Label>

            <div className="flex flex-col gap-2">
              <Label className="font-medium text-gray-700">Arquivo tipo</Label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`metodo-${sel}`}
                    value="mensal"
                    checked={(formData as any)[metodoKey] === 'mensal'}
                    disabled={!isEditing}
                    onChange={() => onChange(metodoKey as any, 'mensal')}
                  />
                  Mensal
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`metodo-${sel}`}
                    value="geral"
                    checked={(formData as any)[metodoKey] === 'geral'}
                    disabled={!isEditing}
                    onChange={() => onChange(metodoKey as any, 'geral')}
                  />
                  Geral
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`metodo-${sel}`}
                    value="custom"
                    checked={(formData as any)[metodoKey] === 'custom'}
                    disabled={!isEditing}
                    onChange={() => onChange(metodoKey as any, 'custom')}
                  />
                  Customizado
                </label>
              </div>

              {/* show file name depending on selection */}
              <div className="mt-2">
                {((formData as any)[metodoKey] === 'mensal') && (
                  <Input readOnly value={mensalName} />
                )}
                {((formData as any)[metodoKey] === 'geral') && (
                  <Input readOnly value={'Relatorio_1.csv'} />
                )}
                {((formData as any)[metodoKey] === 'custom') && (
                  <div className="flex gap-2">
                    <Input
                      value={(formData as any)[localKey] ?? ''}
                      onChange={(e) => onChange(localKey as any, e.target.value)}
                      disabled={!isEditing}
                    />
                    <Button
                      disabled={!isEditing}
                      onClick={async () => {
                        try {
                          const f = await configService.selectFile();
                          if (f) onChange(localKey as any, f);
                        } catch (err) {
                          console.warn('file select failed', err);
                        }
                      }}
                    >
                      Selecionar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}



      <div className="flex items-center justify-between mt-6">
        <div>
          <Button
            id="test-ihm"
            size="sm"
            onClick={() => testIhm()}
            className="bg-gray-100 text-gray-800 hover:text-white"
          >
            Testar IHM
          </Button>
        </div>

        <div className="flex gap-2">
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
              className="bg-red-600 hover:bg-red-700"
            >
              Editar
            </Button>
          )}
        </div>
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
  
  interface AmendoimRecord {
  id: number;
  tipo: "entrada" | "saida";
  dia: string;
  hora: string;
  codigoProduto: string;
  codigoCaixa: string;
  nomeProduto: string;
  peso: number;
  balanca?: string;
  createdAt: string;
}

interface FiltrosAmendoim {
  dataInicio?: string;
  dataFim?: string;
  codigoProduto?: string;
  nomeProduto?: string;
  tipo?: "entrada" | "saida";
}

interface Estatisticas {
  totalRegistros: number;
  pesoTotal: number;
  produtosUnicos: number;
  caixasUtilizadas: number;
}

  const { isEditing, isLoading, onEdit, onSave, onCancel } =
    usePersistentForm(configKey);
  // Extended products flag (admin control)
  const [enableExtendedProducts, setEnableExtendedProducts] = useState<boolean>(false);

  useEffect(() => {
    try {
      const ext = localStorage.getItem('enable-extended-products');
      if (ext) setEnableExtendedProducts(ext === 'true');
    } catch (e) {}
  }, []);

  const handleToggleExtended = (checked: boolean) => {
    setEnableExtendedProducts(checked);
    try { localStorage.setItem('enable-extended-products', String(checked)); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('extended-products-changed', { detail: { enabled: checked } })); } catch (e) {}
    toast.info(checked ? 'Edição de produtos estendida ATIVADA (1-65)' : 'Edição de produtos estendida DESATIVADA (1-40)');
  };
  // Export state and handler (inline form instead of prompt)
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDataInicio, setExportDataInicio] = useState<string | null>(null);
  const [exportDataFim, setExportDataFim] = useState<string | null>(null);
  const [exportFormula, setExportFormula] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const [filtrosAtivos,] = useState<FiltrosAmendoim>({});
  const [, setRegistros] = useState<AmendoimRecord[]>([]);

  const { user } = useAuth();

  // --- User management (migrated from ProfileAdminModal) ---
  type UserItem = {
    id: number;
    username: string;
    displayName?: string | null;
    photoPath?: string | null;
    isAdmin?: boolean;
    userType?: string | null;
  };

  const [adminUsers, setAdminUsers] = useState<UserItem[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminEditing, setAdminEditing] = useState<Record<number, Partial<UserItem>>>({});
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const fetchAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      setAdminUsers(Array.isArray(j.users) ? j.users : []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar usuários');
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const saveAdminUser = async (u: UserItem) => {
    try {
      if (adminEditing[u.id] && typeof adminEditing[u.id].displayName !== 'undefined') {
        await fetch('/api/auth/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u.username, displayName: adminEditing[u.id].displayName }) });
      }
      if (adminEditing[u.id] && typeof adminEditing[u.id].isAdmin !== 'undefined') {
        await fetch('/api/admin/toggle-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u.username, isAdmin: !!adminEditing[u.id].isAdmin }) });
      }
      toast.success('Usuário salvo');
      fetchAdminUsers();
    } catch (e) {
      console.error(e);
      toast.error('Falha ao salvar usuário');
    }
  };

  const deleteAdminUser = async (u: UserItem) => {
    if (!confirm(`Remover usuário ${u.username}?`)) return;
    try {
      await fetch('/api/admin/delete-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u.username }) });
      toast.success('Usuário removido');
      fetchAdminUsers();
    } catch (e) {
      console.error(e);
      toast.error('Falha ao remover usuário');
    }
  };

  const [page,] = useState(1);
  const [, setTotal] = useState(0);
  const pageSize = 50;

  const [viewMode, ] = useState<"entrada" | "saida" | "comparativo">("entrada");

  const [, setEstatisticas] = useState<Estatisticas | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      console.log(uploading);
  
      setUploading(true);
      setError(null);
  
      try {
      const formData = new FormData();
      formData.append('file', file);
  
        const res = await fetch('http://localhost:3000/api/amendoim/upload', {
          method: 'POST',
          body: formData,
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao processar arquivo');
        }
  
        // Mostrar toast de sucesso
        const mensagemSucesso = `${data.salvos} registro(s) processado(s) com sucesso`;
        try {
          toastManager.updateSuccess('amendoim-upload', mensagemSucesso);
        } catch (e) {
          console.error('Toast error:', e);
        }
  
        // Recarregar registros após upload bem-sucedido
        if (data.salvos > 0) {
          await fetchRegistros();
          await fetchEstatisticas();
        }
      } catch (err: any) {
        // Mostrar toast de erro
        const mensagemErro = err.message || 'Erro ao enviar arquivo';
        try {
          toastManager.updateError('amendoim-upload', mensagemErro);
        } catch (e) {
          console.error('Toast error:', e);
        }
        setError(mensagemErro);
      } finally {
        setUploading(false);
        // Reset input
        event.target.value = '';
      }
    };
    console.log(handleFileUpload);

    const fetchRegistros = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      // Adicionar filtros aos parâmetros
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      if (filtrosAtivos.codigoProduto) params.set('codigoProduto', filtrosAtivos.codigoProduto);
      if (filtrosAtivos.nomeProduto) params.set('nomeProduto', filtrosAtivos.nomeProduto);
      
      // Adicionar tipo se não estiver no modo comparativo
      if (viewMode !== 'comparativo') {
        params.set('tipo', viewMode);
      }

      const res = await fetch(`http://localhost:3000/api/amendoim/registros?${params}`);
      
      if (!res.ok) {
        throw new Error(`Erro ao buscar registros: ${res.status}`);
      }

      const data = await res.json();
      setRegistros(data.rows || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExecute = async () => {
    try {
      const backendPort = (window as any).backendPort || 3000;
      const base = `http://localhost:${backendPort}`;
      const params = new URLSearchParams();
      if (exportDataInicio) params.append('dataInicio', exportDataInicio as string);
      if (exportDataFim) params.append('dataFim', exportDataFim as string);
      if (exportFormula) params.append('formula', exportFormula as string);

      const url = `${base}/api/relatorio/exportExcel?${params.toString()}`;

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
      
      // Gerar nome do arquivo com datas dos filtros
      let fileName = "relatorio";
      if (exportDataInicio) {
        const dataInicio = exportDataInicio.includes('-')
          ? exportDataInicio.split('-').reverse().join('-')
          : exportDataInicio;
        fileName += `_${dataInicio}`;
        if (exportDataFim) {
          const dataFim = exportDataFim.includes('-')
            ? exportDataFim.split('-').reverse().join('-')
            : exportDataFim;
          fileName += `_${dataFim}`;
        }
      } else {
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        fileName += `_${dia}-${mes}-${ano}`;
      }
      a.download = `${fileName}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success('Download iniciado');
      setExportOpen(false);
    } catch (err) {
      console.error('Erro exportando Excel', err);
      toast.error('Erro ao exportar relatório');
    }
  };
  const fetchEstatisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      
      // Adicionar tipo se não estiver no modo comparativo
      if (viewMode !== 'comparativo') {
        params.set('tipo', viewMode);
      }

      const res = await fetch(`http://localhost:3000/api/amendoim/estatisticas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEstatisticas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  // prevent unused variable TS6133 in some build configurations
  void exportOpen;
  void setExportDataInicio;
  void setExportDataFim;
  void setExportFormula;
  void handleExportExecute;

  // ✅ Loading state DEPOIS dos hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }


  // ✅ RETURN FINAL
  return (
    <div id="adm" className="flex flex-col gap-3 h-[70vh] overflow-auto bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Configurações Administrativas
      </h2>

      {/* Funcionalidades Experimentais - TOPO */}
      {/* <div className="mb-6 p-4 border-2 border-yellow-400 rounded-lg bg-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium text-gray-900 text-base">🧪 Funcionalidades Experimentais</Label>
            <p className="text-sm text-gray-600 mt-1">Habilita recursos em teste (ignorar produtos, botões de reset)</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={!!(localStorage.getItem('experimental-features') === 'true')} onCheckedChange={(v) => { try { localStorage.setItem('experimental-features', String(!!v)); window.dispatchEvent(new CustomEvent('experimental-features-changed', { detail: { enabled: !!v } })); toast.info(!!v ? '🧪 Funcionalidades experimentais ATIVADAS' : '🔒 Funcionalidades experimentais DESATIVADAS'); } catch (e) {} }} />
          </div>
        </div>
      </div> */}

      {/* Habilitar edição estendida de produtos (até 65) */}
      <div className=" p-4 border-2 border-sky-400 rounded-lg bg-sky-50">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium text-gray-900 text-base">🧾 Habilitar edição de Produtos (até 65)</Label>
            {/* <p className="text-sm text-gray-600 mt-1">Permite editar e adicionar produtos além do 40 padrão (expande para Produto 41-65).</p> */}
          </div>
          <Switch checked={enableExtendedProducts} onCheckedChange={(v) => handleToggleExtended(!!v)} className="data-[state=checked]:bg-sky-600" />
        </div>
      </div>
      <div id="CfgAdvancedDB" className="">
        <div className="dir flex flex-col gap-5">
          {/* <div className="flex-col">
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
                className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
              >
                Selecionar arquivo
              </Button>
            </div>
          </div> */}

          {/* <div className="flex-col">
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
                className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
              >
                Selecionar arquivo
              </Button>
            </div>
          </div> */}

          {/* <div className="flex-col">
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
                className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
              >
                Selecionar arquivo
              </Button>
            </div>
          </div> */}
        </div>
      </div>

      <div id="CmdAdvancedDB" className=" flex flex-col gap-5">
        {/* Importar Dump */}
        <AlertDialog>
          <AlertDialogTrigger asChild disabled={!isEditing}>
            <div id="sidetxt" className="flex flex-row justify-between items-center">
              <div className="flex-1">
                <Label className="font-medium text-gray-700">
                  Importar Dump SQL
                </Label>
              </div>
              <Button 
                className="w-70 bg-red-600 hover:bg-red-700" 
                disabled={!isEditing}
              >
                Importar
              </Button>
            </div>
          </AlertDialogTrigger>
          {isEditing ? (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Importar Dump SQL</AlertDialogTitle>
                <AlertDialogDescription>
                  Escolha como deseja importar o dump:
                  <br /><br />
                  <strong>Limpar dados antes:</strong>
                  <br />• Remove todos os dados atuais
                  <br />• Recomendado para dump completo
                  <br />• Garante estado limpo do banco
                  <br /><br />
                  <strong>Adicionar aos existentes:</strong>
                  <br />• Mantém dados atuais
                  <br />• Adiciona novos registros
                  <br />• Pode causar duplicatas
                  <br /><br />
                  O sistema detectará automaticamente se o dump usa formato de data legado (DD/MM/YY) e converterá para o formato correto.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                 <AlertDialogAction
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.sql,.dump';
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('dump', file);

                      try {
                        toast.info('Processando dump...');
                        
                        const url = new URL('http://localhost:3000/api/db/import-legacy');
                        url.searchParams.set('clearBefore', 'true');
                        url.searchParams.set('skipCreateTable', 'true');

                        const response = await fetch(url.toString(), {
                          method: 'POST',
                          body: formData,
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          throw new Error(errorData.error || 'Erro ao importar dump');
                        }

                        const result = await response.json();
                        
                        if (result.ok) {
                          let message = `Dump importado com sucesso!\n`;
                          message += `• Statements executados: ${result.result.statementsExecuted}`;
                          if (result.result.statementsFailed > 0) {
                            message += `\n• Statements ignorados: ${result.result.statementsFailed}`;
                          }
                          if (result.dateConversionApplied) {
                            message += `\n• Conversão de datas aplicada (DD/MM/YY → YYYY-MM-DD)`;
                          }
                          toast.success(message);
                        } else {
                          toast.error('Falha ao importar dump');
                        }
                      } catch (err: any) {
                        console.error('Erro ao importar dump:', err);
                        toast.error(err.message || 'Erro ao importar dump');
                      }
                    };
                    input.click();
                  }}
                  className="bg-accent text-accent-foreground hover:border rounded-lg hover:bg-accent/50"
                >
                  Limpar e Importar
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.sql,.dump';
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('dump', file);

                      try {
                        toast.info('Processando dump...');
                        
                        const url = new URL('http://localhost:3000/api/db/import-legacy');
                        url.searchParams.set('clearBefore', 'false');
                        url.searchParams.set('skipCreateTable', 'true');

                        const response = await fetch(url.toString(), {
                          method: 'POST',
                          body: formData,
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          throw new Error(errorData.error || 'Erro ao importar dump');
                        }

                        const result = await response.json();
                        
                        if (result.ok) {
                          let message = `Dump importado com sucesso!\n`;
                          message += `• Statements executados: ${result.result.statementsExecuted}`;
                          if (result.result.statementsFailed > 0) {
                            message += `\n• Statements ignorados: ${result.result.statementsFailed}`;
                          }
                          if (result.dateConversionApplied) {
                            message += `\n• Conversão de datas aplicada (DD/MM/YY → YYYY-MM-DD)`;
                          }
                          toast.success(message);
                        } else {
                          toast.error('Falha ao importar dump');
                        }
                      } catch (err: any) {
                        console.error('Erro ao importar dump:', err);
                        toast.error(err.message || 'Erro ao importar dump');
                      }
                    };
                    input.click();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Adicionar aos Existentes
                </AlertDialogAction>
               
              </AlertDialogFooter>
            </AlertDialogContent>
          ) : null}
        </AlertDialog>

        {/* Exportar Dump */}
        <div id="sidetxt" className="flex flex-row justify-between items-center">

            <Label className="font-medium text-gray-700">
              Exportar Dump SQL
            </Label>
          <Button 
            className="w-70 bg-red-600 hover:bg-red-700" 
            disabled={!isEditing}
            onClick={async () => {
              if (!isEditing) return;
              
              try {
                toast.info('Gerando dump SQL...');
                
                const response = await fetch('http://localhost:3000/api/db/export-sql', {
                  method: 'GET',
                });

                if (!response.ok) {
                  throw new Error('Erro ao exportar dump');
                }

                // Get filename from Content-Disposition header
                const disposition = response.headers.get('Content-Disposition');
                let filename = 'dump.sql';
                if (disposition) {
                  const matches = /filename="(.+)"/.exec(disposition);
                  if (matches) filename = matches[1];
                }

                // Download the file
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                toast.success(`Dump exportado: ${filename}`);
              } catch (err: any) {
                console.error('Erro ao exportar dump:', err);
                toast.error(err.message || 'Erro ao exportar dump');
              }
            }}
          >
            Exportar
          </Button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild disabled={!isEditing}>
            <div id="sidetxt" className="flex flex-row justify-between">
              <Label className="font-medium text-gray-700">Resetar Sistema</Label>
                
                <Button
                  className="w-70 bg-red-600 hover:bg-red-700"
                  disabled={!isEditing} 
                >
                  {resetting ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Resetando...</span>
                  ) : (
                    'Resetar Sistema'
                  )}
                </Button>
              
            </div>
          </AlertDialogTrigger>
            {isEditing ? (<>
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
                  // reuse same behavior as main button (dialog action)
                  if (resetting) return;
                  setResetting(true);
                  try {
                    const processador = getProcessador();
                    const sucesso = await processador.resetProduction();
                    if (sucesso) {
                      toast.success("Sistema resetado com sucesso! Usuários e configurações preservados.");
                      setTimeout(() => window.location.reload(), 800);
                    } else {
                      toast.error("Erro ao resetar sistema");
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Ocorreu um erro inesperado");
                  } finally {
                    setResetting(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                {resetting ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Resetando...</span> : 'Resetar Sistema'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
           </>) : null }
        </AlertDialog>
         
      </div>

      <div
        id="containerMFC"
        className="flex flex-col md:flex-row justify-center items-center gap-4 p-4 shadow-lg border rounded-lg bg-gray-50 mt-4"
      >
        {/* <div
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
                className="rounded-full text-red-600 focus:ring-red-500"
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
                className="rounded-full text-red-600 focus:ring-red-500"
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
              className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
            />
            Habilitar
          </Label>
        </div> */}

        {user?.userType === 'amendoim' && (
        <div
          id="CsvImportAmendoim"
          className="flex flex-col justify-center items-center border rounded p-4 bg-white md:w-1/3"
        >
          <Label className="font-medium text-gray-700">Importar CSV</Label>
          <Button
            disabled={!isEditing}
            className="w-full mt-2 bg-red-600 hover:bg-red-700"
            onClick={async () => {
              if (!isEditing) return;

              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = async (e: any) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const toastId = toast.loading(`Processando ${file.name}...`);

                try {
                  const processador = getProcessador();
                  const result = await processador.uploadAmendoimFile(file);

                  if (result && (result.salvos !== undefined || result.ok)) {
                    const salvos = result.salvos ?? (result.processed?.rowsCount ?? 0) ?? 0;
                    const mensagemSucesso = `${salvos} registro(s) processado(s) com sucesso`;
                    try { toastManager.updateSuccess('amendoim-upload', mensagemSucesso); } catch (e) {}
                    await fetchRegistros();
                    try { await fetchEstatisticas(); } catch (e) {}
                    try { toast.update(toastId, { render: 'Importação concluída', type: 'success', isLoading: false, autoClose: 4000 }); } catch (e) {}
                  } else {
                    const errMsg = result?.error || 'Erro ao processar arquivo';
                    try { toastManager.updateError('amendoim-upload', errMsg); } catch (e) {}
                    try { toast.update(toastId, { render: errMsg, type: 'error', isLoading: false, autoClose: 5000 }); } catch (e) {}
                  }
                } catch (err: any) {
                  const mensagemErro = err?.message || 'Erro ao enviar arquivo';
                  try { toastManager.updateError('amendoim-upload', mensagemErro); } catch (e) {}
                  try { toast.update(toastId, { render: mensagemErro, type: 'error', isLoading: false, autoClose: 5000 }); } catch (e) {}
                }
              };

              input.click();
            }}
          >
            Importar
          </Button>
        </div>
        )}
        
        {user?.userType === 'racao' && (
        <div
          id="CsvImport"
          className="flex flex-col justify-center items-center border rounded p-4 bg-white md:w-1/3"
        >
          <Label className="font-medium text-gray-700">Importar </Label>
          <Button
            disabled={!isEditing}
            className="w-full mt-2 bg-red-600 hover:bg-red-700"
            onClick={async () => {
              if (!isEditing) return;

              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = async (e: any) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const toastId = toast.loading(`Processando ${file.name}...`);

                try {
                  const processador = getProcessador();
                  const result = await processador.uploadCSV(file);

                  if (result.ok) {
                    const perf = (result as any).performance;
                    const isLegacy = (result as any).processed?.isLegacyFormat || false;
                    
                    // Log no console para desenvolvedores
                    if (isLegacy) {
                      console.log('🔄 [CSV Import] Formato legado detectado e convertido automaticamente');
                      console.log('📋 [CSV Import] Conversões aplicadas:');
                      console.log('   • Datas: DD/MM/YY → YYYY-MM-DD');
                      console.log('   • Horários: HH:MM → HH:MM:SS');
                      console.log('   • Delimitadores normalizados');
                    }
                    
                    let message = `✅ CSV importado com sucesso!\n\n`;
                    
                    if (isLegacy) {
                      message += `🔄 Formato legado detectado e convertido automaticamente\n\n`;
                    }
                    
                    message += `📄 Arquivo: ${file.name}\n`;
                    message += `📊 Linhas processadas: ${result.processed.rowsCount || 0}`;
                    
                    if (perf?.totalTimeMs) {
                      const seconds = (perf.totalTimeMs / 1000).toFixed(2);
                      message += `\n⏱️ Tempo total: ${seconds}s`;
                      if (perf.rowsPerSecond) {
                        message += ` (${perf.rowsPerSecond} linhas/s)`;
                      }
                    }

                    toast.update(toastId, {
                      render: message,
                      type: 'success',
                      isLoading: false,
                      autoClose: 5000,
                    });
                  } else {
                    toast.update(toastId, {
                      render: 'Falha ao importar CSV',
                      type: 'error',
                      isLoading: false,
                      autoClose: 3000,
                    });
                  }
                } catch (err: any) {
                  console.error('Erro ao importar CSV:', err);
                  toast.update(toastId, {
                    render: err.message || 'Erro ao importar CSV',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                  });
                }
              };
              input.click();
            }}
          >
            <FileUp />
            Importar
          </Button>
        </div>
        )}
      </div>

      {/* Button to open modal with user management */}
      {/* <div className="mt-6 p-4 border shadow-lg rounded rounded-lg bg-white flex items-center justify-between">
        <div>
          <Label className="font-medium text-gray-900 text-base">Perfis registrados</Label>
          <p className="text-sm text-gray-600">Gerencie usuários, fotos e privilégios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setAdminModalOpen(true); fetchAdminUsers(); }} className="bg-red-500">Gerenciar usuários</Button>
        </div>
      </div> */}

      {/* Admin users modal */}
      <Dialog open={adminModalOpen} onOpenChange={(v) => { setAdminModalOpen(!!v); }}>
        <DialogContent className="max-w-[1100px]">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2 w-full">
              <DialogTitle>Perfis registrados</DialogTitle>
            </div>
            <DialogDescription>Gerencie usuários, fotos e privilégios</DialogDescription>
          </DialogHeader>

          {adminUsersLoading ? (
            <div>Carregando...</div>
          ) : (
            <div className="flex flex-col gap-3 mt-3">
              {adminUsers.map((u) => (
                <div key={u.id} className="flex flex-col md:flex-row items-start md:items-center gap-3 border rounded p-3">
                  <div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{(u.displayName || u.username || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                      <div className="w-36 flex-shrink-0">
                        <Label>Usuário</Label>
                        <div className="text-sm truncate" title={u.username}>{u.username}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label>Nome exibido</Label>
                        <Input className="w-full min-w-0" value={adminEditing[u.id]?.displayName ?? u.displayName ?? ''} onChange={(e) => setAdminEditing(s => ({ ...s, [u.id]: { ...(s[u.id]||{}), displayName: e.target.value } }))} />
                      </div>
                      <div className="w-28 flex-shrink-0">
                        <Label>Admin</Label>
                        <div>
                          <input type="checkbox" checked={adminEditing[u.id]?.isAdmin ?? !!u.isAdmin} onChange={(e) => setAdminEditing(s => ({ ...s, [u.id]: { ...(s[u.id]||{}), isAdmin: e.target.checked } }))} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button onClick={() => saveAdminUser(u)}>Salvar</Button>
                      <Button variant="destructive" onClick={() => deleteAdminUser(u)}>Remover</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button onClick={() => { fetchAdminUsers(); }} className="w-24">Atualizar</Button>
          </div>
        </DialogContent>
      </Dialog>

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
            className="bg-red-600 hover:bg-red-700"
          >
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}