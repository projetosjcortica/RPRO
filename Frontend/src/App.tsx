import { useState, useEffect } from 'react';
import { useRuntimeConfig } from './hooks/useRuntimeConfig';
import Home from './home';
import Login from './Login';
import useAuth from './hooks/useAuth';
import { ProfileConfig, IHMConfig, AdminConfig, usePersistentForm } from './config';
import Report from './report';
import Estoque from './estoque';
import Amendoim from './amendoim';
import { Sidebar,SidebarFooter,SidebarContent,SidebarGroup,SidebarHeader,SidebarProvider,SidebarGroupContent,SidebarMenu,SidebarMenuSubButton,SidebarMenuButton,SidebarMenuItem, SidebarGroupLabel} from "./components/ui/sidebar";
import { HomeIcon, Settings, Sheet } from 'lucide-react';
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
import logo from './public/logo.png';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import monoLogo from './public/logoCmono.png';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  // Redireciona para login se não autenticado
  useEffect(() => {
    const publicPaths = ['/login'];
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [location.pathname, user, navigate]);

  const [sideInfo, setSideInfo] = useState({
    granja: 'Granja',
    proprietario: 'Proprietario',
  });

  const runtime = useRuntimeConfig();
  const { formData: profileConfigData } = usePersistentForm('profile-config');

  // Atualiza sideInfo com base em perfil ou runtime
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

  // Escuta eventos globais
  useEffect(() => {
    const onCfg = (e: any) => {
      const name = e?.detail?.nomeCliente;
      if (name) {
        setSideInfo((prev) => ({ ...prev, granja: name, proprietario: name }));
      }
    };

    const onPhotoUpdate = () => {
      if (user) {
        updateUser({ ...user });
      }
    };

    window.addEventListener('profile-config-updated', onCfg as EventListener);
    window.addEventListener('user-photos-updated', onPhotoUpdate);
    return () => {
      window.removeEventListener('profile-config-updated', onCfg as EventListener);
      window.removeEventListener('user-photos-updated', onPhotoUpdate);
    };
  }, [user, updateUser]);
  
  const items=[
    {
      title:"Início",
      icon:HomeIcon,
      path: '/'
    },
    {
      title:"Relatórios",
      icon:Sheet,
      path: '/report'
    },
    {
      title:"Amendoim",
      icon:Sheet,
      path: '/amendoim'
    },
    // {
    //   title:"Relatórios Personalizados",
    //   icon:FileText,
    //   path: '/custom-reports'
    // },
    // {
    //   title:"Estoque",
    //   icon:BarChart3,
    //   path: '/estoque'
    // }
  ]
  const itemsFooter=[
    {
      title:"Configurações",
      icon:Settings,
      view: 'Cfg'
    }
  ]

  const items = [
    { title: 'Início', icon: HomeIcon, path: '/' },
    { title: 'Relatórios', icon: Sheet, path: '/report' },
  ];

  const itemsFooter = [{ title: 'Configurações', icon: Settings }];

  return (
    <div id="app" className="flex w-screen h-dvh overflow-hidden">
      <div id="sidebar" className="h-full">
        <SidebarProvider>
          {/* ✅ Adicionado "group" para permitir group-data-[state=collapsed] */}
          <Sidebar
            collapsible="icon"
            variant="inset"
            className="group bg-sidebar-red-600 shadow-2xl h-full px-0"
          >
            <div className='flex justify-end transform translate-y-8 translate-x-4.5'>
              <SidebarTrigger className='absolute' />
            </div>
            <SidebarHeader className="pt-6 px-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ml-2 cursor-pointer">
                  <AvatarImage
                    src={user?.photoPath ? resolvePhotoUrl(user.photoPath) : logo}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback>
                    <Factory />
                  </AvatarFallback>
                </Avatar>

                {/* ✅ Esconde quando o sidebar está colapsado */}
                <div className="flex flex-col font-semibold leading-tight group-data-[state=collapsed]:hidden">
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
                <SidebarGroupContent className="pl-2.5">
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title}>
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
                <SidebarGroupContent className="pl-2.5">
                  <SidebarMenu>
                    <Collapsible>
                      {itemsFooter.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <CollapsibleTrigger className="w-full">
                            <SidebarMenuButton>
                              <item.icon />
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="text-popover-foreground flex flex-col outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                            <Dialog>
                              <DialogTrigger asChild>
                                <SidebarMenuSubButton>Perfil</SidebarMenuSubButton>
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

                            {user?.isAdmin && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <SidebarMenuSubButton>IHM</SidebarMenuSubButton>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>IHM</DialogTitle>
                                      <DialogDescription>
                                        Configurações da IHM
                                      </DialogDescription>
                                    </DialogHeader>
                                    <IHMConfig />
                                  </DialogContent>
                                </Dialog>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <SidebarMenuSubButton>ADM</SidebarMenuSubButton>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <AdminConfig />
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      ))}
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* ✅ Logo também desaparece quando colapsado */}
              <div className="flex justify-center group-data-[state=collapsed]:hidden mt-2">
                <img src={monoLogo} alt="Logo" className="w-20 opacity-80 px-1" />
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
            <Route path="/estoque" element={<RequireAuth><Estoque /></RequireAuth>} />
            <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
            <Route path="/amendoim" element={<RequireAuth><Amendoim /></RequireAuth>} />
            {/* <Route path="/custom-reports" element={<RequireAuth><CustomReports /></RequireAuth>} /> */}
            {/* <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} /> */}
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
