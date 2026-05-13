import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  Users2,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bell,
  Search,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingCart, label: 'POS Cashier', href: '/pos' },
  { icon: Package, label: 'Products', href: '/products' },
  { icon: Box, label: 'Inventory', href: '/inventory' },
  { icon: Users, label: 'Customers', href: '/customers' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Users2, label: 'Employees', href: '/employees' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background/50">
        <Sidebar className="border-r border-border/50 bg-card/80 backdrop-blur-xl">
          <SidebarHeader className="p-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground">Cosmo<span className="text-primary">POS</span></span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Beauty SaaS</span>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="px-4">
            <SidebarMenu className="gap-1 mt-4">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.href}
                    tooltip={item.label}
                    className={`h-11 rounded-lg px-4 transition-all duration-200 ${
                      location.pathname === item.href 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-accent/50 text-muted-foreground'
                    }`}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${location.pathname === item.href ? 'text-primary' : ''}`} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
                  <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/50 transition-all">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                      {user?.displayName || 'User'}
                    </span>
                    <span className="text-[10px] font-medium uppercase text-muted-foreground capitalize">
                      {user?.role || 'Staff'}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="rounded-lg p-2 focus:bg-primary/10 focus:text-primary cursor-pointer gap-2">
                  <Settings className="h-4 w-4" /> Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="rounded-lg p-2 focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="relative flex flex-col overflow-hidden bg-background">
          <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/50 px-8 backdrop-blur-md">
            <div className="flex flex-1 items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Universal Search..." 
                  className="h-10 w-full rounded-full border border-border/50 bg-accent/30 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background ring-offset-0" />
              </Button>
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Store Status</span>
                <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
