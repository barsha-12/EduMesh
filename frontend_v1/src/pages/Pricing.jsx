import React, { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { Button } from '../components/ui';
import { AuthModal } from '../components/auth';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleUpgrade = (plan) => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      description: 'Perfect for getting started',
      features: [
        '10 chats per day',
        'Basic AI explanations',
        '5 generated notes per month',
        '3 quizzes per week',
        'Text input only',
      ],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/mo',
      description: 'For serious learners',
      features: [
        'Unlimited chats',
        'Advanced AI explanations (ELI5 mode)',
        'Unlimited generated notes',
        'Unlimited quizzes',
        'Voice input and speech synthesis',
        'Chat history (up to 1 year)',
        'PDF export',
        'Priority support',
      ],
      highlighted: true,
      cta: 'Most Popular',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For institutions',
      features: [
        'All Pro features',
        'Team management (up to 100 users)',
        'Custom branding',
        'API access',
        'Advanced analytics',
        'Dedicated support',
        'SLA guarantee',
        'Custom AI models',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Pricing Header */}
      <div className="px-6 py-20 sm:px-12 lg:px-20 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the plan that works best for you. Always flexible to upgrade or downgrade.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="px-6 sm:px-12 lg:px-20 pb-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border-2 transition-all duration-200 ${
                plan.highlighted
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 transform md:scale-105'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap size={14} /> {plan.cta}
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{plan.period}</span>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  fullWidth
                  variant={plan.highlighted ? 'filled' : 'outlined'}
                  className="mb-8"
                >
                  Get Started
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-start gap-3">
                      <Check className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-6 sm:px-12 lg:px-20 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! There are no long-term contracts. You can cancel your subscription at any time from your account settings.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, all features are available in the Free plan. Upgrade to Pro anytime to unlock unlimited features.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards, debit cards, and digital payment options through our secure payment processor.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Is my data secure?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely! Your data is encrypted and stored securely. We comply with GDPR and other data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 sm:px-12 lg:px-20 py-20 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to transform your learning?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Start with our free plan and upgrade whenever you're ready.</p>
        <Button
          onClick={() => handleUpgrade('Free')}
          size="lg"
          className="gap-2"
        >
          Get Started Now
        </Button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => navigate('/dashboard')} />
    </div>
  );
};

export default Pricing;
