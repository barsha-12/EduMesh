import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Star, Shield, HelpCircle, ArrowRight, ChevronLeft } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

const Pricing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleUpgrade = (plan) => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const plans = [
    {
      name: 'Standard',
      price: '$0',
      period: '/semester',
      description: 'Core AI features for students',
      features: [
        '5 Notebooks per month',
        'Basic source synthesis',
        'Standard response time',
        'Standard citations',
        'Community access',
      ],
      highlighted: false,
      icon: Star,
      accent: '#D5E3E8',
      text: '#A0C2D2'
    },
    {
      name: 'EduMesh Plus',
      price: '$9.99',
      period: '/semester',
      description: 'The ultimate research advantage',
      features: [
        'Unlimited Notebooks',
        'Audio Overviews (Podcast mode)',
        'Interactive Mind Maps',
        'Unlimited source uploads',
        'Priority neural processing',
        'Early access to Studio modules',
        'Deep citation engine',
      ],
      highlighted: true,
      cta: 'Most Popular Choice',
      icon: Sparkles,
      accent: '#E8A2A2',
      text: '#2c2c2c'
    },
    {
      name: 'EduMesh Enterprise',
      price: 'Contact',
      period: 'for quote',
      description: 'Institutional license for departments',
      features: [
        'Everything in Plus',
        'Collaborative Notebooks',
        'Bulk source indexing',
        'Custom knowledge injection',
        'Dedicated success manager',
        'API & LMS Integration',
      ],
      highlighted: false,
      icon: Shield,
      accent: '#EAC7C7',
      text: '#A0C2D2'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5E8] dark:bg-[#1c1a16] text-[#2c2c2c] dark:text-[#f7f5e8] transition-colors duration-300">
      {/* Navbar */}
      <nav className="h-16 border-b border-black/[0.03] dark:border-white/[0.03] px-6 flex items-center justify-between sticky top-0 z-40 bg-[#F7F5E8]/80 dark:bg-[#1c1a16]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] flex items-center justify-center text-white font-black text-sm">E</div>
            <span className="font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>EduMesh</span>
          </div>
        </div>
        <Link to="/dashboard" className="px-5 py-2 bg-[#A0C2D2] text-white rounded-full text-xs font-black hover:scale-105 transition-all shadow-lg shadow-[#A0C2D2]/20">
            Open Dashboard
        </Link>
      </nav>

      {/* Header */}
      <div className="px-6 py-20 sm:py-32 max-w-7xl mx-auto text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#D5E3E8] text-[#A0C2D2] rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
        >
          Intelligence for Every Researcher
        </motion.div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter font-['Outfit'] leading-tight">
          Invest in your <br /><span className="text-gradient">Synthesis Journey.</span>
        </h1>
        <p className="text-xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto font-medium">
          Whether you're a student, researcher, or creator—EduMesh has a plan to help you think deeper.
        </p>
      </div>

      {/* Plans Section */}
      <div className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`m3-card relative flex flex-col group border border-black/[0.03] dark:border-white/[0.03] ${
                plan.highlighted 
                  ? 'border-[#E8A2A2]/50 shadow-2xl shadow-[#E8A2A2]/10 scale-105 z-10' 
                  : 'bg-white dark:bg-[#1c1a16] hover:border-black/10'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#E8A2A2] text-[#2c2c2c] px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {plan.cta}
                  </span>
                </div>
              )}

              <div className="p-10 flex-1 flex flex-col">
                <div className="w-16 h-16 rounded-[24px] mb-10 flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6" style={{ backgroundColor: plan.accent }}>
                  <plan.icon size={28} className="text-[#2c2c2c]" />
                </div>

                <h3 className="text-2xl font-black mb-2 font-['Outfit']">{plan.name}</h3>
                <p className="text-[10px] text-gray-400 mb-8 font-black uppercase tracking-widest">{plan.description}</p>

                <div className="mb-10 flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest">{plan.period}</span>
                </div>

                <div className="space-y-6 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-4">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${plan.accent}33`, color: plan.accent === '#E8A2A2' ? '#E8A2A2' : '#A0C2D2' }}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`mt-12 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                    plan.highlighted 
                      ? 'bg-[#E8A2A2] text-[#2c2c2c] hover:scale-105 shadow-xl shadow-[#E8A2A2]/30' 
                      : 'bg-[#F7F5E8] dark:bg-white/5 text-gray-400 hover:text-[#2c2c2c] hover:bg-[#E8A2A2]'
                  }`}
                >
                  Sync {plan.name} Token
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-[#EAE0DA]/30 dark:bg-black/20 py-32 border-t border-black/[0.03] px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight font-['Outfit'] italic underline decoration-[#E8A2A2] decoration-4 underline-offset-8">Frequent Interrogations.</h2>
            <p className="text-sm font-black uppercase tracking-widest text-[#A0C2D2]">Everything you need to know about EduMesh access</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { q: "Is the price semester-based?", a: "Yes, our billing periods align with the typical academic semester (5 months) to simplify budgeting for students." },
              { q: "Can I cancel mid-semester?", a: "Academic plans can be paused or cancelled at any time. You will retain access until the end of your current cycle." },
              { q: "Do you offer group discounts?", a: "Yes, our Enterprise plan offers tiered pricing for study groups and departments. Contact us for bulk options." },
              { q: "Is there a trial for Plus?", a: "Every new user gets 2,000 neural synthesis tokens completely free upon initial deployment." }
            ].map((faq, i) => (
              <div key={i} className="space-y-4 p-8 bg-white dark:bg-[#1c1a16] rounded-[32px] border border-black/5">
                <div className="flex items-center gap-3">
                  <HelpCircle className="text-[#E8A2A2] shrink-0" size={20} />
                  <h3 className="font-black text-sm">{faq.q}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-32 text-center max-w-7xl mx-auto">
        <div className="m3-card !bg-[#E8A2A2] text-[#2c2c2c] max-w-4xl mx-auto !p-20 space-y-10 shadow-2xl shadow-[#E8A2A2]/30 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
           <h2 className="text-5xl font-black font-['Outfit'] tracking-tight relative z-10 leading-tight">Focus on thinking. <br />Leave the synthesis to us.</h2>
           <button onClick={() => setAuthModalOpen(true)} className="px-12 py-6 bg-white text-[#2c2c2c] font-black rounded-[32px] hover:scale-105 transition-all flex items-center gap-4 mx-auto shadow-2xl relative z-10">
             Initiate First Notebook <ArrowRight />
           </button>
        </div>
      </div>

      {authModalOpen && <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => navigate('/dashboard')} />}
    </div>
  );
};

export default Pricing;
