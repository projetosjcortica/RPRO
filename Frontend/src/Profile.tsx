import React, { useState, useEffect } from 'react';
import useAuth from './hooks/useAuth';
import { resolvePhotoUrl } from './lib/photoUtils';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.photoData || (user?.photoPath ? resolvePhotoUrl(user.photoPath) : null));
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setPreview(user?.photoData || (user?.photoPath ? resolvePhotoUrl(user.photoPath) : null));
  }, [user]);

  if (!user) return <div className="p-4">Not logged in</div>;

  const saveName = async () => {
    setStatus(null);
    try {
      const res = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, displayName }),
      });
      if (!res.ok) throw new Error(`update failed: ${res.status}`);
      const data = await res.json();
      updateUser(data);
      setStatus('Nome atualizado');
    } catch (e: any) {
      setStatus(String(e?.message || e));
    }
  };

  const uploadPhoto = async () => {
    if (!file) return setStatus('Selecione um arquivo');
    setStatus('Enviando...');

    // Prefer sending base64 inline so frontend UIs can immediately use the data
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string | null;
        if (!base64) return setStatus('Falha ao ler arquivo');
        // send to new endpoint that accepts base64
        try {
          const res = await fetch('/api/auth/photoBase64', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, photoBase64: base64 }),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => '');
            // If payload too large or other server issue, fall back to multipart upload
            if (res.status === 413) throw new Error('PAYLOAD_TOO_LARGE');
            throw new Error(`upload failed: ${res.status} ${txt}`);
          }
          const data = await res.json();
          // Use returned user and prefer inline photo data
          const newUser = { ...data, photoData: base64 } as any;
          updateUser(newUser);
          setPreview(base64);
          setFile(null);
          setStatus('Foto atualizada');
          return;
        } catch (err: any) {
          // If base64 path failed due to payload size or network, try multipart/form-data upload to /api/auth/photo
          if (String(err?.message || '').includes('PAYLOAD_TOO_LARGE') || String(err?.message || '').includes('413') || String(err?.message || '').toLowerCase().includes('payload')) {
            try {
              const fd = new FormData();
              fd.append('username', user.username);
              fd.append('photo', file);
              const res2 = await fetch('/api/auth/photo', {
                method: 'POST',
                body: fd,
              });
              if (!res2.ok) {
                const txt2 = await res2.text().catch(() => '');
                throw new Error(`multipart upload failed: ${res2.status} ${txt2}`);
              }
              const data2 = await res2.json();
              // server returns user with photoPath; prefer inline preview we already have
              const newUser2 = { ...data2, photoData: preview && preview.startsWith('data:') ? preview : undefined } as any;
              updateUser(newUser2);
              // preview might be a blob URL; regenerate from file to avoid data URL large memory
              try {
                const blobUrl = URL.createObjectURL(file);
                setPreview(blobUrl);
              } catch {}
              setFile(null);
              setStatus('Foto enviada (fallback multipart)');
              return;
            } catch (mErr: any) {
              setStatus(String(mErr?.message || mErr));
              return;
            }
          }
          setStatus(String(err?.message || err));
          return;
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setStatus(String(e?.message || e));
    }
  };

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (!f) {
      setPreview(user?.photoData || (user?.photoPath ? resolvePhotoUrl(user.photoPath) : null));
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        try { URL.revokeObjectURL(preview); } catch (e) {}
      }
    }
  }, [preview]);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-md shadow-sm">
      <div className="flex items-center gap-6">
        <Avatar className="size-20">
          {preview ? (
            <AvatarImage src={preview} alt="avatar" />
          ) : (
            <AvatarFallback>{(user.displayName || user.username || 'U').charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="text-lg font-semibold">{user.displayName || user.username}</div>
          <div className="text-sm text-muted-foreground">{user.username}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setFile(null); setPreview(user?.photoData || (user?.photoPath ? resolvePhotoUrl(user.photoPath) : null)); }}>Reverter</Button>
          <Button variant="destructive" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <Label className="mb-1">Nome</Label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <Button onClick={saveName} size="sm">Salvar nome</Button>
            <div className="text-sm text-muted-foreground self-center">{status}</div>
          </div>
        </div>

        <div>
          <Label className="mb-1">Foto de perfil</Label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
            <div className="flex gap-2">
              <Button onClick={uploadPhoto} variant="secondary" size="sm" disabled={!file}>Enviar</Button>
              <Button onClick={() => { setFile(null); setPreview(user?.photoData || (user?.photoPath ? resolvePhotoUrl(user.photoPath) : null)); }} variant="ghost" size="sm">Cancelar</Button>
            </div>
            <div className="text-sm text-muted-foreground">{file ? file.name : ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
