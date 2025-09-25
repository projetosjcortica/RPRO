import React, { useState, useEffect } from 'react';
import useAuth from './hooks/useAuth';
import { resolvePhotoUrl } from './lib/photoUtils';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.photoPath || null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setPreview(user?.photoPath ? resolvePhotoUrl(user.photoPath) : null);
  }, [user]);

  if (!user) return <div>Not logged in</div>;

  const saveName = async () => {
    setMsg(null);
    try {
      const res = await fetch('http://localhost:3000/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, displayName }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`update failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      setMsg('Nome atualizado');
      updateUser(data);
    } catch (e: any) {
      setMsg(String(e?.message || e));
    }
  };

  const uploadPhoto = async () => {
    if (!file) return setMsg('Selecione um arquivo');
    setMsg(null);
    const fd = new FormData();
    fd.append('username', user.username);
    fd.append('photo', file);
    try {
      const res = await fetch('http://localhost:3000/api/auth/photo', { method: 'POST', body: fd });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`upload failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      setMsg('Foto atualizada');
      updateUser(data);
      setPreview(data.photoPath ? resolvePhotoUrl(data.photoPath) : preview);
    } catch (e: any) {
      setMsg(String(e?.message || e));
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

  // revoke any created object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        try { URL.revokeObjectURL(preview); } catch (e) {}
      }
    }
  }, [preview]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Perfil</h2>
      <div className="mb-3 flex items-center gap-4">
        <div>
          <img src={preview || '/public/logo.png'} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
        </div>
        <div>
          <div className="text-sm font-medium">{user.displayName || user.username}</div>
          <div className="text-xs text-gray-500">{user.username}</div>
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-sm">Nome</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="border px-2 py-1 rounded w-full" />
        <button onClick={saveName} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Salvar nome</button>
      </div>
      <div>
        <label className="block text-sm">Foto (pré-visualização)</label>
        <input type="file" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
        <div className="mt-2 flex gap-2">
          <button onClick={uploadPhoto} className="px-3 py-1 bg-green-600 text-white rounded">Enviar foto</button>
          <button onClick={() => { setFile(null); setPreview(user.photoPath ? resolvePhotoUrl(user.photoPath) : null); }} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
        </div>
      </div>
      {msg && <div className="mt-3 text-sm">{msg}</div>}
      <div className="mt-4">
        <button onClick={logout} className="px-3 py-1 bg-red-600 text-white rounded">Logout</button>
      </div>
    </div>
  );
};

export default Profile;
