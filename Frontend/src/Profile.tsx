import React, { useState, useEffect } from "react";
import useAuth from "./hooks/useAuth";
import { resolvePhotoUrl } from "./lib/photoUtils";
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Plus } from "lucide-react";

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();

  // Hooks sempre declarados no topo
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    user?.photoPath ? resolvePhotoUrl(user.photoPath) : null
  );
  // ...existing code...

  useEffect(() => {
    setDisplayName(user?.displayName || "");
    setPreview(user?.photoPath ? resolvePhotoUrl(user.photoPath) : null);
  }, [user]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(preview);
        } catch {}
      }
    };
  }, [preview]);

  // Renderização condicional só aqui (depois dos hooks)
  if (!user) {
    return <div className="p-4">Você foi desconectado</div>;
  }

  const saveName = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, displayName }),
      });
      if (!res.ok) throw new Error(`update failed: ${res.status}`);
      const data = await res.json();
      updateUser(data);
    } catch (e: any) {
    }
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
    } catch (e: any) {
    }
  };

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (!f) {
      setPreview(user?.photoPath ? resolvePhotoUrl(user.photoPath) : null);
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <Avatar className="size-16 sm:size-20 bg-gray">
              {preview ? (
                <AvatarImage src={preview} alt="avatar" className="object-cover w-full h-full" />
              ) : (
                <AvatarFallback>
                  {(user.displayName || user.username || "U").charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="text-lg font-semibold truncate">
              {user.displayName || user.username}
            </div>
            <div className="text-sm text-muted-foreground truncate">{user.username}</div>
          </div>
          <div className="flex-shrink-0">
            <Button variant="destructive" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700">Nome</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border border-gray-300"
                placeholder="Seu nome"
              />  
              <Button onClick={saveName} size="sm" className="whitespace-nowrap">
                Salvar
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700">Foto</Label>
            <div className="space-y-3">
              <label
                htmlFor="profile-upload"
                className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Plus className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">
                  Selecionar imagem
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={async () => {
                      await uploadPhoto();
                      await useAsReportLogo();
                    }}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Enviar
                  </Button>
                  <Button
                    onClick={() => {
                      setFile(null);
                      setPreview(
                        user?.photoPath ? resolvePhotoUrl(user.photoPath) : null
                      );
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
