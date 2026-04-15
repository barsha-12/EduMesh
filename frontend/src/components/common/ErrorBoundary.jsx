import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EduMesh Runtime Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510] flex items-center justify-center p-6 text-center">
          <div className="m3-card max-w-md w-full !p-12 space-y-8 shadow-2xl bg-white dark:bg-gray-800 border-none">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>System Interruption</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                EduMesh encountered an unexpected runtime exception. This is likely due to a connection drop or a malformed data payload.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleReset}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3"
              >
                <RotateCcw size={18} /> Restore Platform
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-colors py-2 flex items-center justify-center gap-2"
              >
                <Home size={14} /> Back to Gateway
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/5">
               <p className="text-[10px] font-mono text-gray-300 uppercase tracking-tighter">
                 Error Stack: {this.state.error?.message || 'Unknown Exception'}
               </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
