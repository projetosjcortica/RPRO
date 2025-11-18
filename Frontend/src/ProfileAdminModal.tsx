import React, { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';

type UserItem = {
  id: number;
  username: string;
  displayName?: string | null;
  photoPath?: string | null;
  isAdmin?: boolean;
  userType?: string | null;
};

export default function ProfileAdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Record<number, Partial<UserItem>>>({});

  useEffect(() => {
    if (!open) return;
    fetchUsers();
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      setUsers(Array.isArray(j.users) ? j.users : []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (u: UserItem) => {
    try {
      // Use existing admin toggle/update endpoints
      if (editing[u.id] && typeof (editing[u.id].displayName) !== "undefined") {
        await fetch("/api/auth/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u.username, displayName: editing[u.id].displayName }),
        });
      }
      if (editing[u.id] && typeof (editing[u.id].isAdmin) !== "undefined") {
        await fetch("/api/admin/toggle-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: u.username, isAdmin: !!editing[u.id].isAdmin }) });
      }
      toast.success("Usuário salvo");
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao salvar usuário");
    }
  };

  const deleteUser = async (u: UserItem) => {
    if (!confirm(`Remover usuário ${u.username}?`)) return;
    try {
      await fetch("/api/admin/delete-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: u.username }) });
      toast.success("Usuário removido");
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao remover usuário");
    }
  };

  // photo upload removed per request; no-op placeholder kept if needed later
  const onFileChange = async (_u: UserItem, _f: File | null) => {
    return;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[1100px]">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2 w-full">
            <DialogTitle>Perfis registrados</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={() => { fetchUsers(); }}>Atualizar</Button>
              <Button variant="outline" onClick={onClose}>Fechar</Button>
            </div>
          </div>
          <DialogDescription>Gerencie usuários, fotos e privilégios</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="flex flex-col gap-3 mt-3">
            {users.map((u) => (
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
                      <Input className="w-full min-w-0" value={editing[u.id]?.displayName ?? u.displayName ?? ''} onChange={(e) => setEditing(s => ({ ...s, [u.id]: { ...(s[u.id]||{}), displayName: e.target.value } }))} />
                    </div>
                    <div className="w-28 flex-shrink-0">
                      <Label>Admin</Label>
                      <div>
                        <input type="checkbox" checked={editing[u.id]?.isAdmin ?? !!u.isAdmin} onChange={(e) => setEditing(s => ({ ...s, [u.id]: { ...(s[u.id]||{}), isAdmin: e.target.checked } }))} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button onClick={() => saveUser(u)}>Salvar</Button>
                    <Button variant="destructive" onClick={() => deleteUser(u)}>Remover</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
