import React, { useState } from 'react';
import { ArrowRight, Book, Brain, Zap, BarChart3, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '../ui';
import { AuthModal } from '../auth';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get personalized explanations and study materials powered by advanced AI',
    },
    {
      icon: Zap,
      title: 'Voice Input',
      description: 'Speak your questions and get instant answers with our voice recognition',
    },
    {
      icon: Book,
      title: 'Study Notes',
      description: 'Generate comprehensive study notes with organized sections and key concepts',
    },
    {
      icon: BarChart3,
      title: 'Quiz Generation',
      description: 'Practice with AI-generated quizzes tailored to your learning level',
    },
    {
      icon: Sparkles,
      title: 'Chat History',
      description: 'Save and revisit all your learning conversations anytime',
    },
    {
      icon: CheckCircle,
      title: 'PDF Export',
      description: 'Download your notes and quiz results as professional PDF documents',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <div className="px-6 py-20 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Learn Smarter with AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            EduMesh combines AI tutoring, voice input, and personalized learning to help you master any subject faster and more effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                if (isAuthenticated) navigate('/dashboard');
                else setAuthModalOpen(true);
              }}
              size="lg"
              className="gap-2"
            >
              Get Started <ArrowRight size={20} />
            </Button>
            <Button variant="outlined" size="lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </Button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl h-96 flex items-center justify-center mb-20">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Brain size={64} className="mx-auto mb-4 opacity-50" />
            <p>Your AI Learning Dashboard</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="px-6 py-20 sm:px-12 lg:px-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Powerful Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Everything you need to accelerate your learning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 sm:px-12 lg:px-20 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Ready to Transform Your Learning?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of students using EduMesh to study smarter, not harder. Start free today!
        </p>
        <Button
          onClick={() => {
            if (isAuthenticated) navigate('/dashboard');
            else setAuthModalOpen(true);
          }}
          size="lg"
        >
          Start Learning Now
        </Button>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-12 sm:px-12 lg:px-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">EduMesh</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Learn Smarter with AI</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 EduMesh. All rights reserved.</p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
};

export default Landing;
