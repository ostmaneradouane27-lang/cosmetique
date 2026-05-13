import { useState } from 'react';
import { 
  Users2, 
  Plus, 
  Search, 
  ShieldCheck, 
  Clock, 
  MoreVertical,
  Mail,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserRole } from '@/types';

const MOCK_STAFF = [
  { id: '1', name: 'Sarah Miller', role: UserRole.OWNER, email: 'sarah@cosmo.com', status: 'Active', shift: 'Full Time' },
  { id: '2', name: 'Karim Ahmed', role: UserRole.CASHIER, email: 'karim@cosmo.com', status: 'Active', shift: 'Morning' },
  { id: '3', name: 'Sofia Bell', role: UserRole.CASHIER, email: 'sofia@cosmo.com', status: 'Offline', shift: 'Evening' },
  { id: '4', name: 'Marc Dupont', role: UserRole.ADMIN, email: 'marc@cosmo.com', status: 'Active', shift: 'Remote' },
];

export default function Employees() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Access</h1>
          <p className="text-muted-foreground mt-1">Manage team members and their permission levels.</p>
        </div>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <UserPlus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader className="py-4 border-b border-border/50 bg-accent/10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search staff..." 
                className="pl-9 h-10 border-none bg-background shadow-none rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
               <TableHeader className="bg-muted/30">
                 <TableRow>
                   <TableHead>Employee</TableHead>
                   <TableHead>Role</TableHead>
                   <TableHead>Work Schedule</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {MOCK_STAFF.map((staff) => (
                   <TableRow key={staff.id} className="hover:bg-accent/30 transition-colors group">
                     <TableCell>
                       <div className="flex items-center gap-3">
                         <Avatar className="h-9 w-9 border-2 border-primary/10">
                           <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{staff.name[0]}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col">
                            <span className="font-bold text-sm group-hover:text-primary transition-colors">{staff.name}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {staff.email}</span>
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>
                       <Badge variant="secondary" className="capitalize text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-600 border-none">
                         {staff.role}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium">{staff.shift}</span>
                          <span className={`text-[10px] flex items-center gap-1.5 ${staff.status === 'Active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                             <span className={`h-1 w-1 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                             {staff.status}
                          </span>
                       </div>
                     </TableCell>
                     <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                             <DropdownMenuItem className="rounded-lg gap-2 p-2">Edit Access</DropdownMenuItem>
                             <DropdownMenuItem className="rounded-lg gap-2 p-2">Reset Password</DropdownMenuItem>
                             <DropdownMenuItem className="rounded-lg gap-2 p-2 text-rose-500">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
              <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Role Permissions
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { role: 'Owner', desc: 'Full system control & financials', color: 'bg-primary' },
                   { role: 'Admin', desc: 'Inventory & staff management', color: 'bg-black' },
                   { role: 'Cashier', desc: 'Sales & customer registration only', color: 'bg-muted-foreground' },
                 ].map((p) => (
                   <div key={p.role} className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 group hover:bg-accent/50 transition-colors">
                      <div className={`mt-1 h-3 w-3 rounded-full ${p.color}`} />
                      <div className="flex flex-col">
                         <span className="text-sm font-bold group-hover:text-primary transition-colors">{p.role}</span>
                         <span className="text-xs text-muted-foreground">{p.desc}</span>
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20">
              <CardContent className="p-6 space-y-4">
                 <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Clock className="h-5 w-5" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-lg font-bold">Shift Schedule</h3>
                    <p className="text-white/70 text-xs">Manage weekly shifts and attendance tracking for your beauty advisors.</p>
                 </div>
                 <Button className="w-full bg-white text-emerald-600 hover:bg-white/90 font-bold rounded-xl mt-2 h-11">
                    Configure Rosters
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
