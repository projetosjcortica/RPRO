import { useState, useEffect } from 'react';
import { useRuntimeConfig } from './hooks/useRuntimeConfig';
import Home from './home';
import Login from './Login';
import About from './About';
import useAuth from './hooks/useAuth';
import { ProfileConfig, IHMConfig, AdminConfig, usePersistentForm } from './config';
import DbConfig from './DbConfig';
import Report from './report';
import Estoque from './estoque';
import Amendoim from './amendoim';
import {
  Sidebar,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuSubButton,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarTrigger
} from "./components/ui/sidebar";
import { CircleQuestionMark, CircleUser, GalleryThumbnails, HatGlasses, HomeIcon, Settings, Sheet } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import { resolvePhotoUrl } from './lib/photoUtils';
import { ToastContainer } from 'react-toastify';
import './index.css';
import { Factory } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
// Popover is provided by the extracted SettingsPopover component
import logo from './public/logo.png';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import monoLogo from './public/logoCmono.png';
import SettingsPopover from './components/SettingsPopover';
import packageJson from '../package.json';
// import { set } from 'date-fns';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [sideBarOpen, setSideBarOpen] = useState(true);
  // ... (seus useEffects anteriores permanecem iguais) ...
  useEffect(() => {
    const publicPaths = ['/login'];
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [location.pathname, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const isHome = location.pathname === '/' || location.pathname === '/home';
    if (isHome && user.userType === 'amendoim') {
      navigate('/amendoim-home', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  const [sideInfo, setSideInfo] = useState({
    granja: 'Granja',
    proprietario: 'Proprietario',
  });

  const runtime = useRuntimeConfig();
  const { formData: profileConfigData } = usePersistentForm('profile-config');

  useEffect(() => {
    let newInfo = { granja: 'Granja', proprietario: 'Proprietario' };
    if (profileConfigData?.nomeCliente) {
      newInfo = {
        granja: profileConfigData.nomeCliente,
        proprietario: profileConfigData.nomeCliente,
      };
    } else if (runtime && !runtime.loading) {
      const g = runtime.get('granja') || runtime.get('nomeCliente') || 'Granja';
      const p = runtime.get('proprietario') || runtime.get('owner') || 'Proprietario';
      newInfo = { granja: g, proprietario: p };
    }
    setSideInfo(newInfo);
  }, [profileConfigData, runtime]);

  useEffect(() => {
    const onCfg = (e: any) => {
      const name = e?.detail?.nomeCliente;
      if (name) {
        setSideInfo((prev) => ({ ...prev, granja: name, proprietario: name }));
      }
    };

    const onPhotoUpdate = (e?: any) => {
      try {
        const path = e?.detail?.path;
        if (path && user) {
          updateUser({ ...user, photoPath: path });
          return;
        }
      } catch (err) {}
      if (user) {
        updateUser({ ...user });
      }
    };

    window.addEventListener('profile-config-updated', onCfg as EventListener);
    window.addEventListener('user-photos-updated', onPhotoUpdate);
    const onLogoutClose = () => setProfileDialogOpen(false);
    window.addEventListener('profile-logged-out', onLogoutClose);
    return () => {
      window.removeEventListener('profile-config-updated', onCfg as EventListener);
      window.removeEventListener('user-photos-updated', onPhotoUpdate);
      window.removeEventListener('profile-logged-out', onLogoutClose);
    };
  }, [user, updateUser]);

  function SidebarAvatar() {
    const { user } = useAuth();
    return (
      <div>
        <Avatar className="h-12 w-12 ml-0.5">
          <AvatarImage src={user?.photoPath ? resolvePhotoUrl(user.photoPath) : logo} alt="Profile" className="object-cover w-full h-full" />
          <AvatarFallback>
            <Factory />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  const items = [
    {
      title: "Início",
      icon: HomeIcon,
      classname: "size-9",
      path: user?.userType === 'amendoim' ? '/amendoim-home' : '/'
    },
    {
      title: "Relatórios",
      icon: Sheet,
      classname: "size-9",
      path: '/report'
    } 
  ];

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);


  return (
    <div id="app" className="flex w-screen h-dvh overflow-hidden">
      <div id="sidebar" className="h-full">
        <SidebarProvider>
          <Sidebar
            collapsible="icon"
            variant="inset"
            className="group flex flex-col justify-center bg-sidebar-red-600 shadow-2xl h-full px-0"
          >
            <div className="flex justify-end">
              <SidebarTrigger onClick={() => {
                setSideBarOpen(!sideBarOpen);
              }}/>
            </div>
            <SidebarHeader className='flex justify-center'>
              <div className="flex items-center gap-3">
                <SidebarAvatar />

                <div className="flex flex-col font-semibold leading-tight opacity-100 transition-all duration-500 ease-in-out group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:invisible group-data-[state=collapsed]:delay-0">
                  <span className="truncate max-w-[175px]" title={sideInfo.proprietario}>
                    {sideInfo.proprietario}
                  </span>
                  <span
                    className="text-sm truncate max-w-[175px]"
                    title={user?.displayName || sideInfo.granja}
                  >
                    {user?.displayName || sideInfo.granja}
                  </span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <Separator />
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title} className='h-10 flex flex-col pl-1.5 justify-center items-start'>
                        <SidebarMenuButton
                          onClick={() => {
                            if (!user) return navigate('/login');
                            navigate(item.path);
                          }}
                          className={`flex items-center gap-2 transition-colors ${
                            location.pathname === item.path ||
                            (item.path === '/' && location.pathname === '/home')
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground inset-shadow-sm'
                              : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                          }`}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-0">
              <SidebarGroup>
                <SidebarGroupLabel>Outros</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* Menu colapsável para quando o sidebar está aberto */}
                    <div className="block group-data-[state=collapsed]:hidden">
                      <Collapsible>
                        <SidebarMenuItem>
                          <CollapsibleTrigger className='hover:opacity-75'>
                            <SidebarMenuButton>
                              <Settings />
                              <span>Configurações</span>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="text-popover-foreground flex flex-col outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                            <Dialog open={profileDialogOpen} onOpenChange={(v) => setProfileDialogOpen(v)}>
                              <DialogTrigger asChild>
                                <SidebarMenuSubButton className='[&>svg]:stroke-black hover:[&>svg]:stroke-white ml-4'> <CircleUser/>Perfil</SidebarMenuSubButton>
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
                                <SidebarMenuSubButton className='[&>svg]:stroke-black hover:[&>svg]:stroke-white ml-4'> <CircleQuestionMark/> Sobre</SidebarMenuSubButton>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto' }} className='thin-red-scrollbar'>
                                  <header style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
                                      <img src={logo} alt="Cortez" style={{ width: '80px', height: 'auto', marginBottom: '10px' }} />
                                      <img src={monoLogo} alt="J.Cortiça" style={{ width: '120px', height: 'auto', opacity: 0.9, marginBottom: '10px' }} />
                                    </div>
                                    <h1 style={{ margin: '10px 0', fontSize: '2rem', color: '#333' }}>Cortez</h1>
                                    <p style={{ margin: '5px 0', fontSize: '1.1rem', color: '#666', fontWeight: 'bold' }}>Versão {packageJson.version}</p>
                                    <DialogDescription style={{ color: '#666', marginTop: 12, fontSize: '0.95rem' }}>A inteligência por trás do seu controle</DialogDescription>
                                  </header>
                                   
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <SidebarMenuSubButton className='[&>svg]:stroke-black hover:[&>svg]:stroke-white ml-4'><Factory/>DB</SidebarMenuSubButton>
                              </DialogTrigger>
                              <DialogContent>
                                <DbConfig />
                              </DialogContent>
                            </Dialog>
                            {user?.isAdmin && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <SidebarMenuSubButton className='[&>svg]:stroke-black hover:[&>svg]:stroke-white ml-4'><GalleryThumbnails/>IHM</SidebarMenuSubButton>
                                  </DialogTrigger>
                                  <DialogContent className='w-100% p-5'>
                                    <DialogHeader>
                                      <DialogTitle> IHM</DialogTitle>
                                      <DialogDescription>
                                        Configurações da IHM
                                      </DialogDescription>
                                    </DialogHeader>
                                    <IHMConfig />
                                  </DialogContent>
                                </Dialog>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <SidebarMenuSubButton className='[&>svg]:stroke-black hover:[&>svg]:stroke-white ml-4'> <HatGlasses/> ADM</SidebarMenuSubButton>
                                  </DialogTrigger>
                                  <DialogContent className=' sm:max-w-700 w-155'>
                                    <AdminConfig />
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    </div>

                    {/* Popover para quando o sidebar está fechado */}
                    {!sideBarOpen && (
                      <SettingsPopover
                        profileDialogOpen={profileDialogOpen}
                        setProfileDialogOpen={setProfileDialogOpen}
                        user={user}
                      />
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="flex justify-center group-data-[state=collapsed]:hidden mt-2">
                <img src={monoLogo} alt="Logo" className="w-55 opacity- px-1" />
              </div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </div>
      <div id='main-content' className='flex flex-1 flex-col overflow-hidden w-full h-full py-2 px-2 md:px-4'>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/amendoim-home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/estoque" element={<RequireAuth><Estoque /></RequireAuth>} />
          <Route
            path="/report"
            element={
              <RequireAuth>
                {user?.userType === 'amendoim' ? <Amendoim proprietario={sideInfo.proprietario} /> : <Report />}
              </RequireAuth>
            }
          />
          {/* <Route path="/db-config" element={<RequireAuth><DbConfig /></RequireAuth>} /> */}
          <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
          <Route path="*" element={<RequireAuth><h1>404 - Página não encontrada</h1></RequireAuth>} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="light"
          limit={3}
        />
      </div>
    </div>
  );
};

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return children;
}

export default App;