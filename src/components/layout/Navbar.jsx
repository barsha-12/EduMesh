import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Navbar = () => {
  const { user } = useAuthStore();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="fixed top-0 left-0 right-0 h-[64px] z-50 bg-[rgba(250,250,245,0.85)] backdrop-blur-[20px] border-b border-[rgba(204,204,204,0.35)] px-6 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center">
        <NavLink to="/dashboard" className="relative group">
          <span className="font-brand text-[28px] text-primary">EduMesh</span>
          <div className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-lavender to-periwinkle transform origin-left scale-x-100 group-hover:scale-x-110 transition-transform duration-300"></div>
        </NavLink>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <span className="font-body font-semibold text-primary hidden sm:block">
          {displayName}
        </span>
        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-orchid to-periwinkle">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            <span className="font-body font-bold text-periwinkle">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
