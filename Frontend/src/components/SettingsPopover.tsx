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
import data from "../data/patch-notes.json";

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
  styles,
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
            <DialogContent className=" h-[90%]  flex items-center">
              <div
                style={styles?.container || { padding: 12, maxWidth: 760 }}
                className="thin-red-scrollbar"
              >
                <header style={styles?.header}>
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
                      style={styles?.logo}
                    />
                    <img
                      src={monoLogo as unknown as string}
                      alt="J.Cortiça"
                      style={styles?.monoLogo}
                    />
                  </div>
                  <h1 style={styles?.title}>{(data as any).appName}</h1>
                  <p style={styles?.version}>
                    Versão: {(data as any).version} (Build:{" "}
                    {(data as any).buildDate})
                  </p>
                  <DialogDescription style={{ color: "#666", marginTop: 6 }}>
                    {(data as any).tagline ?? ""}
                  </DialogDescription>
                </header>
                <section style={styles?.patchNotesSection}>
                  <h2>Histórico de Atualizações</h2>
                  {(data as any).patchNotes.map((note: any, index: number) => (
                    <div key={index} style={styles?.noteCard}>
                      <div style={styles?.noteHeader}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span style={styles?.noteVersion}>
                            {note.version}
                          </span>
                          <span style={styles?.noteDate}>{note.date}</span>
                        </div>
                        <h3 style={styles?.noteTitle}>{note.title}</h3>
                      </div>
                      <ul style={styles?.noteList}>
                        {note.changes.map((change: string, i: number) => (
                          <li key={i} style={styles?.noteItem}>
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
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
