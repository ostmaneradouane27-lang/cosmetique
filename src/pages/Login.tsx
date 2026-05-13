import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

export default function Login() {
  const [email, setEmail] = useState('ostmaneradouane27@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPass, setShowPass] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsPending(true);
    try {
      await login(email, password);
      toast.success('Welcome back to CosmoPOS!');
      navigate('/');
    } catch (err) {
      toast.error('Invalid credentials');
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
        {/* Left Decoration - Brand Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 relative">
          <div className="relative z-10 flex items-center gap-2">
             <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-2xl">
                <Sparkles className="h-6 w-6" />
             </div>
             <span className="text-2xl font-black tracking-tight text-white uppercase italic">CosmoPOS</span>
          </div>

          <div className="relative z-10 space-y-6">
             <motion.h1 
               initial={{ opacity: 0, scale: 0.9, x: -20 }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               className="text-8xl font-black leading-[0.85] tracking-tighter text-white uppercase"
             >
                Beauty<br />
                Business<br />
                Simplified.
             </motion.h1>
             <p className="text-xl text-white/80 max-w-md font-medium leading-relaxed italic">
               The premium retail platform crafted specifically for the cosmetic & beauty industry.
             </p>
          </div>

          <div className="relative z-10 flex items-center gap-8 text-white/60 text-xs font-bold uppercase tracking-widest">
             <span>Inventory Central</span>
             <span>Smart Analytics</span>
             <span>Loyalty Pro</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col items-center justify-center p-8 md:p-24 relative">
          <div className="w-full max-w-sm p-8 rounded-3xl bg-background/40 backdrop-blur-3xl border border-white/10 shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-4xl font-bold tracking-tight text-white">Sign In</h2>
                <p className="text-white/60 font-medium">Access your Store Dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/60 group-focus-within:text-primary transition-colors">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@store.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-white/60 group-focus-within:text-primary transition-colors">Password</Label>
                      <Link to="#" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="pass" 
                        type={showPass ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 pl-12 pr-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:bg-white/10 transition-all"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                      >
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
                  disabled={isPending}
                >
                  {isPending ? 'Authenticating...' : 'Sign In Now'}
                  {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>

              <p className="text-center text-sm font-medium text-white/60">
                New store owner?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline underline-offset-4">Create your account</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
}
