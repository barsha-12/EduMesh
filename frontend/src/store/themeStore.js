import { create } from 'zustand';

export const useThemeStore = create((set) => {
  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    const saved = localStorage.getItem('edumesh_theme');
    if (saved) return saved;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  return {
    theme: initTheme(),
    fontSize: localStorage.getItem('edumesh_fontSize') || 'medium',

    setTheme: (theme) => {
      localStorage.setItem('edumesh_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },

    setFontSize: (size) => {
      localStorage.setItem('edumesh_fontSize', size);
      document.documentElement.style.fontSize = 
        size === 'small' ? '14px' :
        size === 'large' ? '18px' :
        '16px';
      set({ fontSize: size });
    },

    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('edumesh_theme', newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      });
    },
  };
});
