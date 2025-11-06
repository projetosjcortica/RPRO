import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import AmendoimConfig from "./AmendoimConfig";

interface IhmProfilesConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IhmProfilesConfig({ isOpen, onClose }: IhmProfilesConfigProps) {
  const [openAmendoimConfig, setOpenAmendoimConfig] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perfis IHM</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Amendoim</div>
                <div className="text-sm text-gray-500">Configurações específicas de IHM para o módulo Amendoim</div>
              </div>
              <div>
                <Button onClick={() => setOpenAmendoimConfig(true)}>Abrir</Button>
              </div>
            </div>

            {/* TODO: Add other profiles here (e.g., Ração) */}
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Amendoim specific modal */}
      <AmendoimConfig isOpen={openAmendoimConfig} onClose={() => setOpenAmendoimConfig(false)} onSave={() => { setOpenAmendoimConfig(false); }} />
    </>
  );
}
