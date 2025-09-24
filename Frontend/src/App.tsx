import { useState, useEffect } from 'react';
import Home from './home';
import { GeneralConfig, IHMConfig, DatabaseConfig, AdminConfig } from './config';
import Report from './report';
import Estoque from './estoque';
import { Sidebar,SidebarFooter,SidebarContent,SidebarGroup,SidebarHeader,SidebarProvider,SidebarGroupContent,SidebarMenu,SidebarMenuSubButton,SidebarMenuButton,SidebarMenuItem, SidebarGroupLabel,} from "./components/ui/sidebar";
// import { HomeIcon, Settings, Sheet, BarChart3, Menu, X } from 'lucide-react';
import { HomeIcon, Settings, Sheet } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import { ToastContainer } from 'react-toastify';
import './index.css'
import { Factory } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
import { Dialog, DialogContent, DialogTrigger } from './components/ui/dialog';
// import { Button } from './components/ui/button';
// import { useMediaQuery } from './hooks/use-mobile';
import logo from './public/logo.png'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const App = () => {  
  const navigate = useNavigate();
  const location = useLocation();
  const [sideInfo, setSideInfo] = useState({ granja: 'Granja', proprietario: 'Proprietario' });

  useEffect(() => {
    const fetchSideInfo = async () => {
      try {
        const granjaRes =  /* await fetch('http://localhost:3000/api/config/granja') ||*/ "Granja";
        const proprietarioRes = /* await fetch('http://localhost:3000/api/config/proprietario') || */ "Proprietario";

        const granjaData = await granjaRes;
        const proprietarioData = await proprietarioRes;

        setSideInfo({
          granja: granjaData || 'Granja',
          proprietario: proprietarioData || 'Proprietario',
        });
      } catch (error) {
        console.error('Failed to fetch side info:', error);
      }
    };

    fetchSideInfo();
  }, []);
  
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
    //   title:"Estoque",
    //   icon:BarChart3,
    //   path: '/estoque'
    // }
  ]
  const itemsFooter=[
    {
      title:"configurações",
      icon:Settings,
      view: 'Cfg'
    }
  ]


  return (
    <div id='app' className='flex flex-row w-screen h-dvh overflow-hidden'>
      <div id='sidebar' className='h-full'>
        <SidebarProvider>
          <Sidebar className="bg-sidebar-red-600 shadow-xl h-full">
            <SidebarHeader className="pt-6 ">
              <div id='avatar' className='flex gap-3'>
                <Avatar className="h-12 w-12 ml-2">
                  <AvatarImage src={logo} alt="Profile" />
                  <AvatarFallback><Factory/></AvatarFallback>
                </Avatar>
                <div className='flex flex-col font-semibold'>
                  <h2>{sideInfo.granja}</h2>
                  <p className='text-sm'>{sideInfo.proprietario}</p>
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
                          onClick={() => navigate(item.path)}
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
                                <p>Geral</p>
                                </SidebarMenuSubButton>
                              </DialogTrigger>
                              <DialogContent>
                                <GeneralConfig/>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger>
                                <SidebarMenuSubButton>
                                <p>Banco de dados</p>
                                </SidebarMenuSubButton>
                              </DialogTrigger>
                              <DialogContent>
                                <DatabaseConfig/>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger>
                                <SidebarMenuSubButton>
                                  <p>IHM</p>
                                </SidebarMenuSubButton>
                              </DialogTrigger>
                              <DialogContent>
                                <IHMConfig/>
                              </DialogContent>
                            </Dialog>
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
      <div id='main-content' className='flex flex-1 flex-col overflow-auto w-full h-full py-2 px-2 md:px-4'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/report" element={<Report />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
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
