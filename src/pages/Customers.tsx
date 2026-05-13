import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail, 
  Star, 
  Calendar,
  ShoppingBag,
  Gift
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
import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { handleSupabaseError, OperationType } from '@/lib/supabase-errors';

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    if (!user?.storeId || user.storeId === 'pending') return;
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', user.storeId);
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      handleSupabaseError(error, OperationType.LIST, 'customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    const channel = supabase
      .channel('customers-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `store_id=eq.${user?.storeId}`
      }, () => {
        fetchCustomers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.storeId]);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Base</h1>
          <p className="text-muted-foreground mt-1">Manage loyalty and customer relationships.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-dashed">
            <Gift className="mr-2 h-4 w-4" /> Issue Points
          </Button>
          <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-border/50 bg-accent/10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, phone or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-none bg-background shadow-none rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((c) => (
                  <TableRow key={c.id} className="hover:bg-accent/30 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-primary/10">
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{c.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="font-bold group-hover:text-primary transition-colors text-sm">{c.name}</span>
                             {c.isVip && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">Joined {new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                           <Phone className="h-3 w-3" /> {c.phone}
                        </span>
                        <span className="text-[10px] flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                           <Mail className="h-3 w-3" /> {c.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black">{c.points || 0} PTS</Badge>
                             {c.isVip && <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black">VIP</Badge>}
                          </div>
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
                           <DropdownMenuItem className="rounded-lg gap-2 p-2">
                              <ShoppingBag className="h-4 w-4" /> Sale History
                           </DropdownMenuItem>
                           <DropdownMenuItem className="rounded-lg gap-2 p-2">
                              <Gift className="h-4 w-4" /> Reward Points
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                       No customers found. Start by adding one after a sale.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border border-border/50 bg-primary text-primary-foreground overflow-hidden">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70">Loyalty Leader</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
                       <Star className="h-8 w-8 text-white fill-white animate-pulse" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black italic">Lady Gaga</h3>
                       <p className="text-white/70 text-xs">Platinum Member</p>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold uppercase">Points Progress</span>
                       <span className="text-sm font-black">2,800/3,000</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: '93%' }} 
                         className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                       />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border border-border/50 bg-card/40 backdrop-blur-md border-dashed">
              <CardHeader>
                 <CardTitle className="text-lg">Growth Tip</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground italic">
                 "VIP customers spend 3x more on average. Consider launching a double-points weekend for lipstick categories."
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
