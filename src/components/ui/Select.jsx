import React from 'react';

const Select = ({ label, options = [], error, disabled = false, helperText, icon: Icon = null, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium font-body text-secondary">{label}</label>}

      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3 w-5 h-5 text-slate pointer-events-none" />}
        <select
          className={`
            w-full px-4 py-2.5 rounded-[14px] border-[1.5px] transition-all duration-300 appearance-none cursor-pointer
            bg-[rgba(255,255,255,0.80)] text-primary font-body
            ${Icon ? 'pl-10' : ''}
            ${error
              ? 'border-rose focus:border-rose focus:shadow-[0_0_0_4px_rgba(255,176,176,0.20)]'
              : 'border-[rgba(204,204,204,0.50)] focus:border-lavender focus:shadow-[0_0_0_4px_rgba(208,170,255,0.20)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-[rgba(204,204,204,0.15)]' : ''}
            focus:outline-none focus:bg-[rgba(255,255,255,0.95)]
          `}
          disabled={disabled}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none text-slate text-xs">▼</div>
      </div>

      {error && <span className="text-xs font-body font-medium text-rose">{error}</span>}
      {helperText && !error && <span className="text-xs font-body text-muted">{helperText}</span>}
    </div>
  );
};

export default Select;
