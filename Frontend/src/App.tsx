import { useState, useEffect } from 'react';
import { useRuntimeConfig } from './hooks/useRuntimeConfig';
import Home from './home';
import Login from './Login';
import useAuth from './hooks/useAuth';
// import Profile from './Profile';
import { ProfileConfig, IHMConfig, DatabaseConfig, AdminConfig, usePersistentForm } from './config';
import Report from './report';
// import CustomReports from './CustomReports';
import Estoque from './estoque';
import { Sidebar,SidebarFooter,SidebarContent,SidebarGroup,SidebarHeader,SidebarProvider,SidebarGroupContent,SidebarMenu,SidebarMenuSubButton,SidebarMenuButton,SidebarMenuItem, SidebarGroupLabel,} from "./components/ui/sidebar";
import { HomeIcon, Settings, Sheet } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import { resolvePhotoUrl } from './lib/photoUtils';
import { ToastContainer } from 'react-toastify';
import './index.css'
import { Factory } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
// Tooltips removidos - usando title nativo agora
// import { Button } from './components/ui/button';
// import { useMediaQuery } from './hooks/use-mobile';
import logo from './public/logo.png'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const App = () => {  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // If user is not logged in, and they try to navigate to any protected route,
  // redirect them to /login. This runs on location changes.
  useEffect(() => {
    const publicPaths = ['/login'];
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [location.pathname, user, navigate]);
  const [sideInfo, setSideInfo] = useState({ granja: 'Granja', proprietario: 'Proprietario' });
  const runtime = useRuntimeConfig();
  const { formData: profileConfigData } = usePersistentForm("profile-config");

  useEffect(() => {
    if (!profileConfigData) return;
    setSideInfo({
      granja: profileConfigData.nomeCliente || 'Granja',
      proprietario: profileConfigData.nomeCliente,
    });
  }, [profileConfigData]);
  // Listen to explicit event so other UI pieces (like GeneralConfig) can trigger an immediate update
  useEffect(() => {
    const onCfg = (e: any) => {
      try {
        const name = e?.detail?.nomeCliente;
        if (!name) return;
        setSideInfo(prev => ({ ...prev, granja: name, proprietario: name }));
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('profile-config-updated', onCfg as EventListener);
    return () => window.removeEventListener('profile-config-updated', onCfg as EventListener);
  }, []);
  useEffect(() => {
    // If runtime configs are loaded, prefer those values
    if (!runtime || runtime.loading) return;
    const p = runtime.get('granja') || runtime.get('nomeCliente') || 'Granja';
    const g = runtime.get('proprietario') || runtime.get('owner') || 'Proprietario';
    setSideInfo({ granja: g, proprietario: p });
  }, [runtime]);
  
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

  
  return (
    <div id='app' className='flex flex-row w-screen h-dvh overflow-hidden'>
      {/* Provide simple auth guard: if not logged in, show Login route */}
      <div id='sidebar' className='h-full'>
        <SidebarProvider>
          <Sidebar className="bg-sidebar-red-600 shadow-xl h-full">
            <SidebarHeader className="pt-6 ">
                <div id='avatar' className='flex gap-3'>
                <Avatar className="h-12 w-12 ml-2 cursor-pointer">
                  <AvatarImage src={(user?.photoPath ? resolvePhotoUrl(user.photoPath) : logo) || undefined} alt="Profile" />
                  <AvatarFallback><Factory/></AvatarFallback>
                </Avatar>
                <div className='flex flex-col font-semibold'>
                  <h2 className="truncate max-w-[175px]" title={sideInfo.proprietario}>
                    {sideInfo.proprietario}
                  </h2>
                  
                  <p className='text-sm truncate max-w-[175px]' title={user?.displayName || sideInfo.granja}>
                    {user?.displayName || sideInfo.granja}
                  </p>
                </div>
              </div>
            </SidebarHeader>
          <SidebarContent>
             <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <Separator/>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => {
                            // If not authenticated, force redirect to login immediately
                            if (!user) return navigate('/login');
                            navigate(item.path);
                          }}
                          className={`flex items-center gap-2 transition-colors 
                            ${location.pathname === item.path || (item.path === '/' && location.pathname === '/home')
                              ? "bg-sidebar-accent text-sidebar-accent-foreground inset-shadow-sm" 
                              : "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"}`}
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
          <SidebarFooter>
            <SidebarGroup>
                <SidebarGroupLabel>Outros</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Collapsible>
                      {itemsFooter.map((itemsFooter) => (
                      <SidebarMenuItem key={itemsFooter.title}>
                        <CollapsibleTrigger className='w-full'>
                          <SidebarMenuButton>
                          <itemsFooter.icon />
                          <span>{itemsFooter.title}</span>
                        </SidebarMenuButton>
                        </CollapsibleTrigger>
                          <CollapsibleContent className="text-popover-foreground flex flex-col outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                            <Dialog>
                              <DialogTrigger>
                                <SidebarMenuSubButton>
                                  <p>Perfil</p>
                                </SidebarMenuSubButton>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Configurações de Perfil</DialogTitle>
                                  <DialogDescription>Edite as opções do perfil do usuário.</DialogDescription>
                                </DialogHeader>
                                <ProfileConfig/>
                              </DialogContent>
                            </Dialog>
                            {user?.isAdmin && (
                              <Dialog>
                                  <DialogTrigger>
                                    <SidebarMenuSubButton>
                                      <p>Banco de dados</p>
                                    </SidebarMenuSubButton>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Banco de Dados</DialogTitle>
                                      <DialogDescription>Configurações do banco de dados</DialogDescription>
                                    </DialogHeader>
                                    <DatabaseConfig/>
                                  </DialogContent>
                              </Dialog>
                            )}
                              {user?.isAdmin && (
                            <Dialog>
                              <DialogTrigger>
                                <SidebarMenuSubButton>
                                  <p>IHM</p>
                                </SidebarMenuSubButton>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>IHM</DialogTitle>
                                  <DialogDescription>Configurações da IHM</DialogDescription>
                                </DialogHeader>
                                <IHMConfig/>
                              </DialogContent>
                            </Dialog>
                            )}
                            {user?.isAdmin && (
                              <Dialog>
                                <DialogTrigger>
                                  <SidebarMenuSubButton>
                                    <p>ADM</p>
                                  </SidebarMenuSubButton>
                                </DialogTrigger>
                                <DialogContent>
                                  <AdminConfig/>
                                </DialogContent>
                              </Dialog>
                            )}
                          </CollapsibleContent>
                      </SidebarMenuItem>
                    ))}
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
      </div>
      <div id='main-content' className='flex flex-1 flex-col overflow-hidden w-full h-full py-2 px-2 md:px-4'>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
            {/* <Route path="/custom-reports" element={<RequireAuth><CustomReports /></RequireAuth>} /> */}
            <Route path="/estoque" element={<RequireAuth><Estoque /></RequireAuth>} />
            {/* <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} /> */}
            <Route path="*" element={<RequireAuth><h1>404 - Página não encontrada</h1></RequireAuth>} />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="light"
          />
      </div>   
    </div>
  );
};
export default App

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return <div />;
  }

  return children;
}
