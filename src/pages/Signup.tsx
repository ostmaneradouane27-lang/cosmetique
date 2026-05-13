import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Store, User, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    email: '',
    pass: ''
  });
  const [isPending, setIsPending] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await signup(formData.email, formData.pass, formData.name);
      toast.success('Store Created Successfully!', {
        description: `Welcome to the future of ${formData.storeName}`
      });
      navigate('/');
    } catch (err) {
      toast.error('Signup failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(20, 0, 30)"
      gradientBackgroundEnd="rgb(10, 0, 20)"
      firstColor="219, 39, 119"
      secondColor="190, 24, 93"
      thirdColor="131, 24, 67"
      fourthColor="219, 39, 119"
      fifthColor="157, 23, 77"
      containerClassName="min-h-screen w-full"
      className="z-50"
    >
      <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden relative z-20">
        {/* Right Side - Form */}
        <div className="flex flex-col items-center justify-center p-8 md:p-24 order-2 lg:order-1 relative">
          <div className="w-full max-w-sm p-8 rounded-3xl bg-background/40 backdrop-blur-3xl border border-white/10 shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-4xl font-bold tracking-tight text-white">Get Started</h2>
                <p className="text-white/60 font-medium">Build your beauty empire with CosmoPOS</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2 group">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-white/60 group-focus-within:text-primary transition-colors">Your Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="name" 
                        placeholder="Sarah Miller" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="storeName" className="text-xs font-bold uppercase tracking-wider text-white/60 group-focus-within:text-primary transition-colors">Store Name</Label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="storeName" 
                        placeholder="Rose Cosmetic Lux" 
                        value={formData.storeName}
                        onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                        className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/60 group-focus-within:text-primary transition-colors">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="sarah@rosebeauty.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-white/60 group-focus-within:text-primary transition-colors">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="pass" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.pass}
                        onChange={(e) => setFormData({...formData, pass: e.target.value})}
                        className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-4"
                  disabled={isPending}
                >
                  {isPending ? 'Creating Store...' : 'Launch My Store'}
                  {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>

              <p className="text-center text-sm font-medium text-white/60">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign in here</Link>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Left Decoration - Brand Side */}
        <div className="hidden lg:flex flex-col justify-center p-12 relative order-1 lg:order-2">
          <div className="relative z-10 space-y-8 text-center backdrop-blur-[2px]">
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.8 }}
               className="inline-flex h-20 w-20 bg-white text-primary rounded-[2.5rem] items-center justify-center shadow-2xl mx-auto"
             >
                <Sparkles className="h-10 w-10" />
             </motion.div>
             <h1 className="text-6xl font-black leading-tight tracking-tighter text-white uppercase italic">
               Modern Tech for<br />
               <span className="text-primary">Timeless Beauty.</span>
             </h1>
             <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
               {[
                 { label: 'Unlimited', desc: 'Products' },
                 { label: 'Pro', desc: 'Analytics' },
                 { label: 'Cloud', desc: 'Sync' },
                 { label: '24/7', desc: 'Support' }
               ].map((item) => (
                 <div key={item.label} className="p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                    <div className="text-primary-foreground font-black text-xl">{item.label}</div>
                    <div className="text-white/60 text-[10px] uppercase font-bold tracking-widest">{item.desc}</div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
}
