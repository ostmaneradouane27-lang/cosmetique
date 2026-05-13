import { useState, useEffect } from 'react';
import { 
  Store, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Receipt, 
  Globe, 
  Palette,
  Save,
  Check,
  ChevronRight,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    const fetchStore = async () => {
      if (!user?.storeId) return;
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', user.storeId)
        .single();
      
      if (data) setStoreData(data);
    };
    fetchStore();
  }, [user?.storeId]);

  const handleSave = async () => {
    if (!user?.storeId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: storeData.name,
          address: storeData.address,
          phone: storeData.phone,
          tax_rate: storeData.tax_rate,
          currency: storeData.currency
        })
        .eq('id', user.storeId);
      
      if (error) throw error;
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!storeData) return <div>Loading settings...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your store configuration and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
           <Card className="border border-border/50 bg-card/40 backdrop-blur-md sticky top-24">
              <CardContent className="p-2">
                 {[
                   { icon: Store, label: 'Store Profile', id: 'profile' },
                   { icon: Bell, label: 'Notifications', id: 'notifications' },
                   { icon: Receipt, label: 'Receipt & Invoicing', id: 'receipt' },
                   { icon: Shield, label: 'Security & Access', id: 'security' },
                   { icon: Globe, label: 'Localization', id: 'localization' },
                 ].map((item) => (
                   <button 
                     key={item.id}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 group transition-all text-sm font-medium"
                   >
                     <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-foreground transition-colors">{item.label}</span>
                     </div>
                     <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                   </button>
                 ))}
              </CardContent>
           </Card>
        </div>

        <div className="space-y-8">
           <Card className="border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
             <CardHeader className="bg-accent/5 pb-6">
                <CardTitle>Global Store Settings</CardTitle>
                <CardDescription>Public information and operational defaults</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-8">
                   <div className="relative group">
                      <div className="h-24 w-24 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
                         <Store className="h-10 w-10 text-primary opacity-20" />
                      </div>
                      <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                         <Camera className="h-4 w-4" />
                      </button>
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-bold">Store Logo</h4>
                      <p className="text-xs text-muted-foreground max-w-[200px]">We recommend a square logo at least 512x512px.</p>
                   </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                   <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Store Name</Label>
                      <Input 
                        value={storeData.name} 
                        onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                        placeholder="Rose Cosmetic Lux" 
                        className="rounded-xl h-11 bg-background/50 border-border/50" 
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Store ID</Label>
                      <Input value={storeData.id} disabled className="rounded-xl h-11 bg-accent/20 border-border/50 text-muted-foreground" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Phone</Label>
                      <Input 
                        value={storeData.phone} 
                        onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                        placeholder="+33 6 12 34 56 78" 
                        className="rounded-xl h-11 bg-background/50 border-border/50" 
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vat Number</Label>
                      <Input placeholder="FR 12 345 678 901" className="rounded-xl h-11 bg-background/50 border-border/50" />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Business Address</Label>
                   <Input 
                      value={storeData.address} 
                      onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                      placeholder="15 Champs-Élysées, Paris, France" 
                      className="rounded-xl h-11 bg-background/50 border-border/50" 
                   />
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-6">
                   <h3 className="font-bold">Operational Defaults</h3>
                   <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                         <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tax Rate (%)</Label>
                         <Select 
                            value={storeData.tax_rate?.toString()} 
                            onValueChange={(val) => setStoreData({ ...storeData, tax_rate: parseInt(val) })}
                         >
                            <SelectTrigger className="rounded-xl h-11 bg-background/50 border-border/50">
                               <SelectValue placeholder="Select rate" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="0">0% (Tax Exempt)</SelectItem>
                               <SelectItem value="10">10% (Reduced)</SelectItem>
                               <SelectItem value="19">19% (Standard)</SelectItem>
                               <SelectItem value="25">25% (Premium)</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Currency</Label>
                         <Select 
                            value={storeData.currency} 
                            onValueChange={(val) => setStoreData({ ...storeData, currency: val })}
                         >
                            <SelectTrigger className="rounded-xl h-11 bg-background/50 border-border/50">
                               <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="usd">USD ($)</SelectItem>
                               <SelectItem value="eur">EUR (€)</SelectItem>
                               <SelectItem value="dzd">DZD (DA)</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                   </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                         <Label className="font-bold">Low Stock Alerts</Label>
                         <p className="text-xs text-muted-foreground">Notify me via email when stock drops below threshold.</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                         <Label className="font-bold">Auto-Print Receipts</Label>
                         <p className="text-xs text-muted-foreground">Automatically trigger print dialog after checkout.</p>
                      </div>
                      <Switch className="data-[state=checked]:bg-primary" />
                   </div>
                </div>
             </CardContent>
             <div className="flex items-center justify-end p-6 border-t border-border/50 bg-accent/5">
                <Button 
                  onClick={handleSave} 
                  className="rounded-xl px-8 h-12 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                       <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <Save className="h-4 w-4" /> Save Changes
                    </div>
                  )}
                </Button>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
