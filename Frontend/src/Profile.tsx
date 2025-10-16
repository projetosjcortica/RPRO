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
    return <div className="p-4">Not logged in</div>;
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
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-md ">
      <div className="flex items-center gap-6">
        <Avatar className="size-20 bg-gray">
          {preview ? (
            <AvatarImage src={preview} alt="avatar" />
          ) : (
            <AvatarFallback>
              {(user.displayName || user.username || "U").charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="text-lg font-semibold">
            {user.displayName || user.username}
          </div>
          <div className="text-sm text-muted-foreground">{user.username}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null);
              setPreview(
                user?.photoPath ? resolvePhotoUrl(user.photoPath) : null
              );
            }}
          >
            Reverter
          </Button>
          <Button variant="destructive" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <Label className="mb-1">Nome</Label>
          <div className="flex flex-row items-center justify-between gap-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border border-black"
            />  
            <Button onClick={saveName} size="sm">
              Salvar nome
            </Button>
            {/* <div className="text-sm text-muted-foreground self-center"> {status}</div> */}
          </div>
        </div>

        <div>
          {/* <Label className="mb-1">Foto de perfil</Label> */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="profile-upload"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 shadow-xs border border-black rounded-lg hover:bg-gray-100 transition"
            >
              <Plus className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-700 font-medium">
                Selecionar imagem
              </span>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden border border-black"  
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await uploadPhoto();
                  await useAsReportLogo();
                }}
                variant="secondary"
                size="sm"
                disabled={!file}
                className="bg-gray-300 enabled:bg-destructive/90 enabled:text-white "
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
            {/* <div className="text-sm text-muted-foreground">
              {file ? file.name : ""}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
