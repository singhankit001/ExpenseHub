import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants, useMotionValue, useSpring } from 'framer-motion';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  CheckCircle,
  Star,
  Code,
  Sparkles,
  Lock,
  Globe,
  Activity,
  PieChart,
  CreditCard,
  Users,
  Receipt,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BackgroundSystem } from '@/components/ui/background';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

// Count-up hook
const useCountUp = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return { count, start: () => setStarted(true) };
};

const StatCard = ({ value, label, prefix = '', suffix = '' }: { value: number; label: string; prefix?: string; suffix?: string }) => {
  const { count, start } = useCountUp(value);
  return (
    <motion.div
      onViewportEnter={start}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <span className="text-4xl md:text-5xl font-black tracking-tighter gradient-text-accent">
        {prefix}{count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm text-surface-500 mt-2 font-medium">{label}</span>
    </motion.div>
  );
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen text-white selection:bg-brand-500/30 selection:text-white overflow-x-hidden relative">
      <BackgroundSystem />

      {/* ─── Navigation Header ─────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-2xl px-5 py-3 flex items-center justify-between border border-surface-200/30 shadow-glass">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-tr from-brand-500 to-accent-violet rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white">ExpenseFlow</span>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-surface-600 hover:text-white px-3 py-1.5 text-xs bg-transparent"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 px-3 py-1.5 text-xs"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="pt-36 pb-24 px-4 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-[11px] font-bold text-brand-400 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          The next-generation personal finance platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
          className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.0] max-w-4xl mb-6"
        >
          <span className="gradient-text-primary">Master your money.</span>
          <br />
          <span className="gradient-text-accent">Shape your future.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base text-surface-500 max-w-xl mb-10 leading-relaxed"
        >
          A premium expense intelligence platform with real-time analytics, AI insights, and enterprise-grade security — built for people who take their finances seriously.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link to="/register">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 px-5 py-2.5 text-base"
            >
              Start for free — no card needed
              <ChevronRight className="w-4 h-4 ml-2" />
            </motion.div>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-surface-500 hover:text-white bg-transparent px-5 py-2.5 text-base"
          >
            Sign in to your account
          </Link>
        </motion.div>
      </section>

      {/* ─── Stats Strip ──────────────────────────────────── */}
      <section className="py-16 px-4 relative">
        <div className="max-w-5xl mx-auto glass-card rounded-3xl border border-surface-200/30 shadow-glass p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <StatCard value={12400} label="Expenses Tracked" prefix="₹" suffix="M+" />
            <StatCard value={98} label="Uptime SLA" suffix="%" />
            <StatCard value={4200} label="Active Users" suffix="+" />
            <StatCard value={6} label="Months of Data" suffix=" Yrs" />
          </div>
        </div>
      </section>

      {/* ─── Bento Grid Features ──────────────────────────── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={itemVariants} className="text-center mb-14">
            <p className="text-[11px] text-brand-400 font-bold uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl font-black tracking-tight gradient-text-primary mb-4">
              Built for serious spenders
            </h2>
            <p className="text-sm text-surface-500 max-w-lg mx-auto leading-relaxed">
              Every feature is crafted with intention — from the algorithms powering your insights to the pixels you interact with.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
            {/* Large card — Analytics */}
            <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2">
              <Card className="h-full min-h-[280px] relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-accent-violet/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <CardContent className="p-8 flex flex-col h-full gap-6">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl w-fit shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">Interactive Analytics</h3>
                    <p className="text-sm text-surface-500 leading-relaxed max-w-sm">
                      Visualize your spending across time ranges with gradient area charts, drill down by category, and spot trends before they hurt your budget.
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {['7D', '30D', '90D', '1Y', 'ALL'].map(r => (
                      <span key={r} className="px-2 py-1 rounded-lg bg-surface-200/50 text-[10px] font-bold text-surface-600">{r}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full min-h-[130px] relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/15 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <CardContent className="p-6 flex flex-col gap-3 h-full">
                  <div className="p-2.5 bg-accent-violet/10 text-accent-violet rounded-xl w-fit">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Stateless JWT Security</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">HMAC-SHA256 signed tokens with active rotation defense against replay attacks.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Insights card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full min-h-[130px] relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-emerald/15 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <CardContent className="p-6 flex flex-col gap-3 h-full">
                  <div className="p-2.5 bg-accent-emerald/10 text-accent-emerald rounded-xl w-fit">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">AI-Powered Insights</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">Contextual spending intelligence that surfaces financial patterns automatically.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Audit card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="p-2.5 bg-accent-gold/10 text-accent-gold rounded-xl w-fit">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Immutable Audit Trail</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">Every action is cryptographically logged. Complete session and event history.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reports card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="p-2.5 bg-accent-blue/10 text-accent-blue rounded-xl w-fit">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">PDF / CSV Exports</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">Generate professional reports for any date range and download instantly.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* API card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl w-fit">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">RESTful API + Swagger</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">Fully documented Express API with OpenAPI spec and interactive Swagger UI.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Social Proof ─────────────────────────────────── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              quote: "Finally an expense tracker that doesn't look like it was designed in 2012. The analytics alone are worth it.",
              name: 'Priya S.',
              role: 'Product Designer',
              rating: 5,
            },
            {
              quote: "The AI insights surfaced a subscription I forgot about. Saved me over ₹1,200/month immediately.",
              name: 'Rohit M.',
              role: 'Software Engineer',
              rating: 5,
            },
            {
              quote: "I showed this in my portfolio interview and the interviewer immediately asked about the tech stack. It's that polished.",
              name: 'Ananya K.',
              role: 'CS Graduate',
              rating: 5,
            },
          ].map((testimonial, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="h-full group cursor-default hover:border-brand-500/20 transition-colors">
                <CardContent className="p-6 flex flex-col gap-4 h-full">
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-accent-gold text-accent-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-surface-600 leading-relaxed flex-1">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-surface-200/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-accent-violet flex items-center justify-center text-white font-bold text-xs">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{testimonial.name}</p>
                      <p className="text-[10px] text-surface-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="glass-card rounded-3xl border border-brand-500/20 shadow-glass p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent-violet/15 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-tr from-brand-500 to-accent-violet rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter gradient-text-primary mb-4">
                Ready to take control?
              </h2>
              <p className="text-base text-surface-500 max-w-md mx-auto mb-8 leading-relaxed">
                Join thousands of users who've transformed their relationship with money. Free forever. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 px-5 py-2.5 text-base"
                  >
                    Create your free account
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </motion.div>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-surface-200/50 text-surface-900 hover:bg-surface-100 bg-transparent px-5 py-2.5 text-base"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-surface-200/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-tr from-brand-500 to-accent-violet rounded-lg">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">ExpenseFlow</span>
          </div>
          <p className="text-[11px] text-surface-600">
            © {new Date().getFullYear()} ExpenseFlow Platform. All rights reserved. Built with ❤️ as a portfolio-grade project.
          </p>
        </div>
      </footer>
    </div>
  );
};
