import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Filter, FileSpreadsheet, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const revenueData = [
  { month: 'Jan', revenue: 45000, profit: 12000 },
  { month: 'Feb', revenue: 52000, profit: 15400 },
  { month: 'Mar', revenue: 48000, profit: 11000 },
  { month: 'Apr', revenue: 61000, profit: 19000 },
  { month: 'May', revenue: 55000, profit: 16500 },
  { month: 'Jun', revenue: 67000, profit: 21000 },
];

const categoryData = [
  { name: 'Lipsticks', value: 400 },
  { name: 'Foundations', value: 300 },
  { name: 'Skincare', value: 300 },
  { name: 'Nails', value: 200 },
];

const COLORS = ['oklch(0.6 0.18 342)', 'oklch(0.6 0.18 342 / 0.8)', 'oklch(0.6 0.18 342 / 0.6)', 'oklch(0.6 0.18 342 / 0.4)'];

export default function Analytics() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your store's performance data.</p>
        </div>
        <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md p-1 rounded-2xl border border-border/50">
           <Button variant="ghost" size="sm" className="rounded-xl px-4 h-9">Last 7 Days</Button>
           <Button variant="secondary" size="sm" className="rounded-xl px-4 h-9 shadow-sm">Last 30 Days</Button>
           <Button variant="ghost" size="sm" className="rounded-xl px-4 h-9 font-medium border border-transparent hover:border-border/50">
             <Calendar className="mr-2 h-4 w-4" /> Custom
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         {[
           { label: 'Total Sales', value: '1,482', sub: '+12%', color: 'text-primary' },
           { label: 'Net Profit', value: '$94,200', sub: '+8.4%', color: 'text-emerald-500' },
           { label: 'Avg Order', value: '$72.50', sub: '-2%', color: 'text-blue-500' },
           { label: 'Conversion', value: '3.2%', sub: '+0.5%', color: 'text-purple-500' },
         ].map((stat, i) => (
           <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
             <Card className="border-none bg-card/40 backdrop-blur-md">
               <CardContent className="p-6">
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <Badge variant="secondary" className={`${stat.sub.includes('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'} border-none text-[10px]`}>
                      {stat.sub}
                    </Badge>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-card/40 backdrop-blur-md p-1 rounded-2xl border border-border/50 h-12 w-fit">
          <TabsTrigger value="revenue" className="rounded-xl px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Revenue</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Categories</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-xl px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Inventory Flow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
             <Card className="lg:col-span-2 border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
               <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2">
                   <TrendingUp className="h-5 w-5 text-primary" />
                   Revenue vs Profit
                 </CardTitle>
                 <CardDescription>Monthly financial performance summary</CardDescription>
               </CardHeader>
               <CardContent className="px-2">
                 <div className="h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={revenueData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.4 0.04 340 / 0.1)" />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} />
                       <Tooltip 
                        cursor={{ fill: 'oklch(0.6 0.18 342 / 0.05)' }}
                        contentStyle={{ 
                          backgroundColor: 'oklch(1 0 0 / 0.8)', 
                          borderRadius: '12px', 
                          border: 'none',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                       <Legend verticalAlign="top" height={36}/>
                       <Bar dataKey="revenue" fill="oklch(0.6 0.18 342)" radius={[6, 6, 0, 0]} name="Total Revenue" />
                       <Bar dataKey="profit" fill="oklch(0.2 0.04 340)" radius={[6, 6, 0, 0]} name="Net Profit" />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </CardContent>
             </Card>

             <div className="space-y-6">
                <Card className="border border-border/50 bg-primary text-primary-foreground overflow-hidden relative">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                   <CardContent className="p-8 relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <ArrowUpRight className="h-6 w-6" />
                         </div>
                         <Badge className="bg-white text-primary font-bold">TOP GROWTH</Badge>
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-3xl font-black italic">42%</h3>
                         <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Subscription Retention</p>
                      </div>
                      <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl mt-2">
                        View Growth Strategy
                      </Button>
                   </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Download Reports</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start rounded-xl group hover:border-primary transition-all">
                         <FileSpreadsheet className="mr-3 h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                         <span>Sales History (XLS)</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start rounded-xl group hover:border-primary transition-all">
                         <FileText className="mr-3 h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
                         <span>Profitability Analysis (PDF)</span>
                      </Button>
                   </CardContent>
                </Card>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Product segment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={categoryData}
                       cx="50%"
                       cy="50%"
                       innerRadius={100}
                       outerRadius={140}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {categoryData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" height={36}/>
                   </PieChart>
                 </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-0">
          <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
             <CardHeader>
                <CardTitle>Inventory Flux</CardTitle>
                <CardDescription>Incoming vs Outgoing stock trends</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.4 0.04 340 / 0.1)" />
                         <XAxis dataKey="month" axisLine={false} tickLine={false} />
                         <YAxis axisLine={false} tickLine={false} />
                         <Tooltip />
                         <Line type="monotone" dataKey="revenue" stroke="oklch(0.6 0.18 342)" strokeWidth={4} dot={{ r: 6, fill: "oklch(0.6 0.18 342)" }} />
                         <Line type="monotone" dataKey="profit" stroke="oklch(0.2 0.04 340)" strokeWidth={4} strokeDasharray="5 5" />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
