import React, { useState, useEffect } from "react";
import useAuth from "./hooks/useAuth";
import { resolvePhotoUrl } from "./lib/photoUtils";
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { toast } from 'react-toastify';
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label"; 

interface ProfileProps {
  externalPreview?: string | null;
  file?: File | null;
  onUpload?: () => Promise<void>;
  showLogoutButton?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ externalPreview, file, onUpload, showLogoutButton = true }) => {
  const { user, logout, updateUser } = useAuth();

  // Hooks sempre declarados no topo
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [preview, setPreview] = useState<string | null>(
    // prefer user's own photo; if missing, use admin-set default stored in localStorage
    user?.photoPath ? resolvePhotoUrl(user.photoPath) : (localStorage.getItem('default-user-photo') ? resolvePhotoUrl(localStorage.getItem('default-user-photo') || undefined) : null)
  );

  // Use external preview if provided, otherwise use internal
  const effectivePreview = externalPreview !== undefined ? externalPreview : preview;

  useEffect(() => {
    setDisplayName(user?.displayName || "");
    if (externalPreview === undefined) {
      // if user has photo use it; otherwise fall back to stored default (if any)
      const defaultPhoto = localStorage.getItem('default-user-photo');
      setPreview(user?.photoPath ? resolvePhotoUrl(user.photoPath) : (defaultPhoto ? resolvePhotoUrl(defaultPhoto) : null));
    }
  }, [user, externalPreview]);

  // Listen to admin updates for default user photo
  useEffect(() => {
    const handler = (ev: any) => {
      try {
        const path = ev?.detail?.path;
        if (path) {
          try { localStorage.setItem('default-user-photo', String(path)); } catch (e) {}
        }
        // update preview only if user has no custom photo
        if (!user?.photoPath) {
          const resolved = resolvePhotoUrl(path || localStorage.getItem('default-user-photo') || undefined);
          setPreview(resolved);
        }
      } catch (e) {}
    };
    window.addEventListener('user-photos-updated', handler as any);
    return () => window.removeEventListener('user-photos-updated', handler as any);
  }, [user]);

  useEffect(() => {
    const handler = async () => {
      try {
        await saveName();
      } catch (e) {}
    };
    window.addEventListener("profile-save-request", handler as any);
    return () => window.removeEventListener("profile-save-request", handler as any);
  }, [displayName, file, onUpload]);

  useEffect(() => {
    return () => {
      if (effectivePreview && effectivePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(effectivePreview);
        } catch {}
      }
    };
  }, [effectivePreview]);

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
      // Notify other UI parts about the name change
      try {
        window.dispatchEvent(new Event('profile-config-updated'));
      } catch (e) {}
      try { toast.success('Nome atualizado'); } catch (e) {}
      // If the parent passed an upload handler and there's a selected file, invoke it
      if (file && onUpload) {
        try { await onUpload(); } catch (e) { console.error('upload after save failed', e); }
      }
    } catch (e: any) {
    }
  }; 

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 h-full">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0 relative">
            <Avatar className="size-16 sm:size-20 bg-gray-200">
              {effectivePreview ? (
                <AvatarImage src={effectivePreview} alt="avatar" className="object-cover w-full h-full" />
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
            {file && (
              <div className="text-xs text-green-600 font-medium mt-1">
                como sua foto irá ficar
              </div>
            )}
          </div>
          {showLogoutButton && (
            <div className="flex-shrink-0">
              <Button variant="destructive" size="sm" onClick={() => { logout(); try { window.dispatchEvent(new Event('profile-logged-out')); } catch (e) {}; try { toast.info('Você saiu'); } catch (e) {} }}>
                Sair
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 h-full">
          <div className="h-full">
            <Label className="mb-2 block text-sm font-medium text-gray-700">Nome</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border border-gray-300"
                placeholder="Seu nome"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
