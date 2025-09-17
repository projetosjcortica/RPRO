import { useState } from 'react'
import Home from './home';
import { GeneralConfig, IHMConfig, DatabaseConfig, AdminConfig } from './config';
import Report from './report';
import { Sidebar,SidebarFooter,SidebarContent,SidebarGroup,SidebarHeader,SidebarProvider,SidebarGroupContent,SidebarMenu,SidebarMenuSubButton,SidebarMenuButton,SidebarMenuItem, SidebarGroupLabel,} from "./components/ui/sidebar";
import { HomeIcon, Settings, Sheet} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
import { ToastContainer } from 'react-toastify';
import './index.css'
import { Factory } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';
import { Dialog, DialogContent, DialogTrigger } from './components/ui/dialog';
import  logo  from './public/logo.png'

const App = () => {  
 
  const[view,setView] = useState('Home');
  
  let content;
  switch (view) {
    case 'Home':
      content = <Home />;
      break;
    case 'Report':
      content = <Report />;
      break;
    // case 'Cfg':
    //   content = <Cfg />;
    //   break;
    default:
      content = <h1>404 - Not Found</h1>;
  }
  const items=[
    {
      title:"Início",
      icon:HomeIcon,
      view: 'Home'
    },
    {
      title:"Relatórios",
      icon:Sheet,
      view: 'Report'
    },
  ]
  const itemsFooter=[
    {
      title:"configurações",
      icon:Settings,
      view: 'Cfg'
    }
  ]


  return (<div id='app' className='flex flex-row w-screen h-dvh'>
    <div id='sidebar' className='flex items-end'>
      <SidebarProvider className='flex items-end'>
        <Sidebar className="bg-sidebar-red-600 shadow-xl h-[100vh]">
          <SidebarHeader className="pt-6 ">
            <div id='avatar' className='flex gap-3'>
              <Avatar className="h-12 w-12 ml-2">
                <AvatarImage src={logo} alt="Profile" />
                <AvatarFallback><Factory/></AvatarFallback>
              </Avatar>
              <div className='flex flex-col font-semibold'>
                <h2>Granja Murakami</h2>
                {/* <h3></h3> */}
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
                          onClick={() => setView(item.view)}
                          className={`flex items-center gap-2 transition-colors 
                            ${view === item.view 
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
        <div id='main-content' className='flex flex-row justify-center items-center w-[200vh] h-full overflow-auto gap-5 ml-5 py-1 overflow-hidden'>
            {content}
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
