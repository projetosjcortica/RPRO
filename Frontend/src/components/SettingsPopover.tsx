import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  CircleUser,
  CircleQuestionMark,
  GalleryThumbnails,
  HatGlasses,
  Settings,
} from "lucide-react";
import { ProfileConfig, IHMConfig, AdminConfig } from "../config";
import logo from "../public/logo.png";
import monoLogo from "../public/logoCmono.png";
import packageJson from "../../package.json";

interface Props {
  profileDialogOpen: boolean;
  setProfileDialogOpen: (v: boolean) => void;
  user?: any;
  styles?: any;
}

export default function SettingsPopover({
  profileDialogOpen,
  setProfileDialogOpen,
  user,
}: Props) {
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <button className="hover:bg-destructive h-11 w-11 rounded-lg [&>svg]:stroke-black hover:[&>svg]:stroke-white m-auto flex items-center justify-center">
            <Settings strokeWidth={1.5}/>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 bg-white p-2 flex flex-col gap-1"
          side="right"
          sideOffset={6}
          align="start"
        >
          <Dialog
            open={profileDialogOpen}
            onOpenChange={(v) => setProfileDialogOpen(v)}
          >
            <DialogTrigger asChild>
              <Button className="w-full border border-gray-400 bg-gray text-black justify-start hover:bg-red-600">
                <CircleUser className="mr-2 h-4 w-4" />
                Perfil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de Perfil</DialogTitle>
                <DialogDescription>
                  Edite as opções do perfil do usuário.
                </DialogDescription>
              </DialogHeader>
              <ProfileConfig />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full border border-gray-400 bg-gray text-black justify-start hover:bg-red-600">
                <CircleQuestionMark className="mr-2 h-4 w-4" />
                Sobre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <div
                style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto' }}
                className="thin-red-scrollbar"
              >
                <header style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={logo as unknown as string}
                      alt="Cortez"
                      style={{ width: '80px', height: 'auto', marginBottom: '10px' }}
                    />
                    <img
                      src={monoLogo as unknown as string}
                      alt="J.Cortiça"
                      style={{ width: '120px', height: 'auto', opacity: 0.9, marginBottom: '10px' }}
                    />
                  </div>
                  <h1 style={{ margin: '10px 0', fontSize: '2rem', color: '#333' }}>Cortez</h1>
                  <p style={{ margin: '5px 0', fontSize: '1.1rem', color: '#666', fontWeight: 'bold' }}>
                    Versão {packageJson.version}
                  </p>
                  <DialogDescription style={{ color: "#666", marginTop: 12, fontSize: '0.95rem' }}>
                    A inteligência por trás do seu controle
                  </DialogDescription>
                </header> 
              </div>
            </DialogContent>
          </Dialog>

          {user?.isAdmin && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full border border-gray-400 bg-gray text-black justify-start hover:bg-destructive">
                    <GalleryThumbnails className="mr-2 h-4 w-4" />
                    IHM
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>IHM</DialogTitle>
                    <DialogDescription>Configurações da IHM</DialogDescription>
                  </DialogHeader>
                  <IHMConfig />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full border border-gray-400 bg-gray text-black justify-start hover:bg-red-600">
                    <HatGlasses className="mr-2 h-4 w-4" />
                    ADM
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AdminConfig />
                </DialogContent>
              </Dialog>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
