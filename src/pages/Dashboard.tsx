import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingBag,
  Plus,
  Clock,
  History,
  CreditCard,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { handleSupabaseError, OperationType } from '@/lib/supabase-errors';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Today Revenue', value: '$0.00', trend: 'Updating...', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Products', value: '0', trend: '...', icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Sales', value: '0', trend: '...', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Low Stock', value: '0', trend: '...', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    if (!user?.storeId || user.storeId === 'pending') return;

    const storeId = user.storeId;
    
    try {
      // 1. Products
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);
      
      if (prodError) throw prodError;
      
      const lowStockCount = products?.filter((p: any) => p.stock <= p.min_stock).length || 0;
      
      setStats(prev => prev.map(s => {
        if (s.label === 'Total Products') return { ...s, value: (products?.length || 0).toString(), trend: 'Real-time' };
        if (s.label === 'Low Stock') return { ...s, value: lowStockCount.toString(), trend: lowStockCount > 0 ? 'Critical' : 'Healthy' };
        return s;
      }));

      // 2. Sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (salesError) throw salesError;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySales = sales?.filter(s => new Date(s.created_at) >= today) || [];
      const totalToday = todaySales.reduce((sum, s) => sum + s.total, 0);
      
      setStats(prev => prev.map(s => {
        if (s.label === 'Today Revenue') return { ...s, value: `$${totalToday.toFixed(2)}`, trend: `Last updated ${new Date().toLocaleTimeString()}` };
        if (s.label === 'Total Sales') return { ...s, value: (sales?.length || 0).toString(), trend: 'All time' };
        return s;
      }));

      setRecentSales((sales || []).slice(0, 5).map(s => ({
        ...s,
        customer: s.customer_name || 'Walk-in Customer',
        time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: s.items_count || 0 // Assuming count exists or we fetch separately
      })));

      // Weekly analysis
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekly = days.map(day => {
        const dayRev = (sales || [])
          .filter(s => days[new Date(s.created_at).getDay()] === day)
          .reduce((sum, s) => sum + s.total, 0);
        return { name: day, revenue: dayRev };
      });
      setWeeklyRevenue(weekly);

    } catch (error) {
       console.error('Dashboard fetch error:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // In a real app, you'd add subscriptions here too
  }, [user?.storeId]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, your beauty business is growing gracefully.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full shadow-sm">
            <History className="mr-2 h-4 w-4" /> Reports
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bg} rounded-bl-[4rem] transition-all group-hover:scale-110`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`text-[10px] font-semibold text-muted-foreground`}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Sales Analysis</CardTitle>
              <CardDescription>Weekly revenue performance overview</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs rounded-full">Week</Button>
              <Button variant="secondary" size="sm" className="h-8 text-xs rounded-full">Month</Button>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyRevenue.length > 0 ? weeklyRevenue : [ { name: '...', revenue: 0 } ]}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.18 342)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="oklch(0.6 0.18 342)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.02 340 / 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'oklch(0.4 0.04 340)' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'oklch(0.4 0.04 340)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(1 0 0 / 0.8)', 
                      borderRadius: '12px', 
                      border: '1px solid oklch(0.9 0.02 340 / 0.2)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="oklch(0.6 0.18 342)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border/50 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Recent Performance</CardTitle>
            <CardDescription>Live sales stream</CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {sale.customer[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold group-hover:text-primary transition-colors">{sale.customer}</span>
                          <span className="text-xs text-muted-foreground">{sale.items} items • {sale.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold">${sale.total.toFixed(2)}</span>
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter h-4 bg-emerald-500/10 text-emerald-600 border-none">
                          COMPLETED
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentSales.length === 0 && (
                    <div className="h-60 flex flex-col items-center justify-center text-muted-foreground opacity-50 italic">
                      <ShoppingCart className="h-10 w-10 mb-2" />
                      <p>No sales today</p>
                    </div>
                  )}
                </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20">
            <CardContent className="p-8 flex flex-col h-full justify-between gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">Open POS</h3>
                <p className="text-white/70 text-sm">Start a new checkout session with your customer.</p>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl mt-4">
                Launch Terminal
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/40 backdrop-blur-md border-dashed">
            <CardContent className="p-8 flex flex-col h-full items-center justify-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center border border-border/50">
                <AlertCircle className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold">Inventory Alert</h3>
                <p className="text-xs text-muted-foreground mt-1">Some products are running low on stock and need attention.</p>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/5">
                Review Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
