import { create } from 'zustand';

export const useThemeStore = create((set) => {
  // Initialize theme and palette from localStorage
  const initTheme = () => {
    const savedTheme = localStorage.getItem('edumesh_theme') || 'light';
    const savedPalette = localStorage.getItem('edumesh_palette') || 'mint';
    
    // Apply theme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply palette
    if (savedPalette !== 'mint') {
      document.body.classList.add(`theme-${savedPalette}`);
    }

    return { theme: savedTheme, palette: savedPalette };
  };

  const initialState = initTheme();

  return {
    theme: initialState.theme,
    palette: initialState.palette,
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

    setPalette: (paletteName) => {
      // Remove all previous theme classes
      const themes = ['theme-lavender', 'theme-cyber', 'theme-latte'];
      themes.forEach(t => document.body.classList.remove(t));
      
      // Add new theme if not default (mint)
      if (paletteName !== 'mint') {
        document.body.classList.add(`theme-${paletteName}`);
      }
      
      localStorage.setItem('edumesh_palette', paletteName);
      set({ palette: paletteName });
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
