import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  MapPin, 
  Phone, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { handleSupabaseError, OperationType } from '@/lib/supabase-errors';
import { toast } from 'sonner';

export default function Setup() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!storeName || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const storeId = `store-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. Create store in Supabase
      const { error: storeError } = await supabase
        .from('stores')
        .insert([{
          id: storeId,
          name: storeName,
          address,
          phone,
          owner_id: user.uid,
          currency: 'USD',
          tax_rate: 19,
          created_at: new Date().toISOString()
        }]);

      if (storeError) throw storeError;

      // 2. Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          store_id: storeId,
          role: 'owner'
        })
        .eq('uid', user.uid);

      if (profileError) throw profileError;

      // 3. Update local user state
      if (setUser) {
        setUser({
          ...user,
          storeId,
          role: 'owner' as any
        });
      }

      toast.success('Store created successfully!', {
        description: `Welcome to ${storeName}. Your POS is ready.`,
      });
      navigate('/', { replace: true });
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'stores');
      toast.error('Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--color-primary)_0%,_transparent_25%)] opacity-20 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <Card className="border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="h-24 w-24 text-primary animate-pulse" />
          </div>
          
          <CardHeader className="text-center pb-8 border-b border-border/50">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 ring-1 ring-primary/30">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight italic">COSMO<span className="text-primary">POS</span></CardTitle>
            <CardDescription className="text-lg font-medium mt-2">Almost there! Let's set up your beauty store profile.</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleCreateStore}>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="storeName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Store Name</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="storeName"
                      placeholder="e.g. Velvet Beauty Lux"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-background/50 border-border/50 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="address"
                      placeholder="Street, City, Postcode"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-background/50 border-border/50 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone"
                      placeholder="+213..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-background/50 border-border/50 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-center">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  By creating a store, you become the <span className="text-primary font-bold">Admin</span>. You can later invite cashiers and staff from the settings menu.
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-8 bg-accent/5 border-t border-border/50">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all group"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    PREPARING STORE...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    LAUNCH COSMOPOS <Rocket className="ml-2 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-muted-foreground mt-8 text-sm">
          Logged in as <span className="text-foreground font-bold">{user.email}</span> • <button onClick={() => navigate('/login')} className="text-primary hover:underline">Change account</button>
        </p>
      </motion.div>
    </div>
  );
}
