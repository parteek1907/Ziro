import React from 'react';

type CreditCardProps = {
  type: 'gradient-strip' | 'dark-cyan' | 'dark-rainbow' | 'gray-strip' | 'blue-glow' | 'pastel-gradient' | 'pure-dark' | 'lilac-black' | 'cyan-black';
  className?: string;
  style?: React.CSSProperties;
  orientation?: 'landscape' | 'portrait';
};

export default function CreditCard({ type, className = '', style, orientation = 'landscape' }: CreditCardProps) {
  const isPortrait = orientation === 'portrait';
  const textStyle: React.CSSProperties = {
    writingMode: isPortrait ? 'vertical-rl' : 'horizontal-tb',
    transform: isPortrait ? 'rotate(180deg)' : 'none'
  };

  if (type === 'gradient-strip') {
    return (
      <div 
        className={`absolute rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-black/5 flex flex-col ${className}`}
        style={{ 
          background: 'transparent',
          ...style
        }}
      >
        {/* Top Half (Gradient) */}
        <div 
          className="flex-1 p-6 flex justify-between items-start"
          style={{ background: 'linear-gradient(135deg, #A4B2F5 0%, #B9A0F0 50%, #CFA5F2 100%)' }}
        >
          <div className="text-white text-lg font-bold tracking-tight relative -top-6 lg:-top-8" style={textStyle}>
            <img src="/logo.png" alt="Ziro" className="h-20 lg:h-24 w-auto object-contain brightness-0 invert" />
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-90">
            <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
            <path d="M5.5 13.5a9 9 0 0 1 13 0"/>
            <path d="M2.5 10.5a13 13 0 0 1 19 0"/>
          </svg>
        </div>
        
        {/* Bottom Half (Dark Strip) */}
        <div className="h-[55%] bg-[#27272A] p-6 flex flex-col justify-between relative">
          <div className="flex justify-between items-center text-[10px] font-bold text-white/70 tracking-widest uppercase">
            <span style={textStyle}>Olivia Rhye</span>
            <span style={textStyle}>06/28</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="text-white text-lg sm:text-xl font-bold tracking-[0.15em]" style={textStyle}>
              1234 1234 1234 1234
            </div>
            {/* Mastercard-style logo */}
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'dark-cyan') {
    return (
      <div 
        className={`absolute rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col ${className}`}
        style={{ 
          background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
          ...style
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        <div className="flex-1 p-6 flex justify-between items-start relative z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-90">
            <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
            <path d="M5.5 13.5a9 9 0 0 1 13 0"/>
            <path d="M2.5 10.5a13 13 0 0 1 19 0"/>
          </svg>
        </div>
        <div className="h-[45%] bg-[#27272A] p-6 flex flex-col justify-between relative z-10">
          <div className="flex justify-between items-center text-[10px] font-bold text-white/70 tracking-widest uppercase">
            <span style={textStyle}>Zahra Mohamadi</span>
            <span style={textStyle}>09/24</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-white text-lg sm:text-xl font-bold tracking-[0.15em]" style={textStyle}>
              1253 5432 3521 3090
            </div>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'dark-rainbow') {
    return (
      <div 
        className={`absolute z-10 rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 ${className}`}
        style={{ 
          background: 'linear-gradient(160deg, #1A1A1A 0%, #1A1A1A 35%, #E8945A 55%, #FF5C8A 70%, #D946EF 82%, #3B82F6 100%)',
          ...style
        }}
      >
        <div className="p-6 h-full flex justify-between relative z-10">
          <div className="flex flex-col justify-end">
            <div className="text-white/80 text-base font-medium tracking-wider" style={textStyle}>Zahra Mohamadi</div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <div></div>
            <div className="text-white text-2xl tracking-[0.12em] font-medium" style={textStyle}>1253 &nbsp;5432 &nbsp;352</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'gray-strip') {
    return (
      <div 
        className={`absolute rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-black/5 flex flex-col ${className}`}
        style={{ 
          background: '#F4F5F7',
          ...style
        }}
      >
        {/* Top Half (Light) */}
        <div className="flex-1 p-6 flex justify-between items-start">
          <div className="text-slate-800 text-lg font-bold tracking-tight relative -top-6 lg:-top-8" style={textStyle}>
            <img src="/logo.png" alt="Ziro" className="h-20 lg:h-24 w-auto object-contain brightness-0 invert" />
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" className="opacity-80">
            <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
            <path d="M5.5 13.5a9 9 0 0 1 13 0"/>
            <path d="M2.5 10.5a13 13 0 0 1 19 0"/>
          </svg>
        </div>
        
        {/* Bottom Half (Dark Strip) */}
        <div className="h-[55%] bg-[#27272A] p-6 flex flex-col justify-between relative">
          <div className="flex justify-between items-center text-[10px] font-bold text-white/70 tracking-widest uppercase">
            <span style={textStyle}>Olivia Rhye</span>
            <span style={textStyle}>06/28</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="text-white text-lg sm:text-xl font-bold tracking-[0.15em]" style={textStyle}>
              1234 1234 1234 1234
            </div>
            {/* Mastercard-style logo */}
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'blue-glow') {
    return (
      <div 
        className={`absolute rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col ${className}`}
        style={{ background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', ...style }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        <div className="p-6 h-full flex flex-col justify-between relative z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-90">
            <path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5.5 13.5a9 9 0 0 1 13 0"/><path d="M2.5 10.5a13 13 0 0 1 19 0"/>
          </svg>
          <div className="text-white text-lg sm:text-xl font-bold tracking-[0.15em] whitespace-nowrap" style={textStyle}>
            1253 5432 3521 3090
          </div>
        </div>
      </div>
    );
  }

  if (type === 'pastel-gradient') {
    return (
      <div 
        className={`absolute rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col ${className}`}
        style={{ background: 'linear-gradient(135deg, #A4B2F5 0%, #B9A0F0 50%, #CFA5F2 100%)', ...style }}
      >
        <div className="p-6 h-full flex flex-col justify-between relative z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-90">
            <path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5.5 13.5a9 9 0 0 1 13 0"/><path d="M2.5 10.5a13 13 0 0 1 19 0"/>
          </svg>
          <div className="flex justify-between items-end">
            <div className="text-white text-lg sm:text-xl font-bold tracking-[0.15em] whitespace-nowrap" style={textStyle}>
              1253 5432 3521 3090
            </div>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
              <div className="w-6 h-6 rounded-full bg-white/40 mix-blend-screen"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'pure-dark') {
    return (
      <div 
        className={`absolute rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col ${className}`}
        style={{ background: '#1A1A2E', ...style }}
      >
        <div className="p-6 h-full flex flex-col justify-between relative z-10">
          <div className="flex justify-end">
            <div className="text-[10px] font-bold text-white/70 tracking-widest uppercase whitespace-nowrap" style={textStyle}>Exp 09/24</div>
          </div>
          <div className="flex justify-end items-end">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-white/20 mix-blend-screen"></div>
              <div className="w-6 h-6 rounded-full bg-white/20 mix-blend-screen"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'lilac-black') {
    return (
      <div 
        className={`absolute rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col ${className}`}
        style={style}
      >
        {/* Top Half (Lilac) */}
        <div className="h-1/2 w-full bg-[#B6A6F5] relative p-6 flex justify-between items-start">
          <div className="text-white font-bold text-lg opacity-90 relative -top-6 lg:-top-8" style={textStyle}>
            <img src="/logo.png" alt="Ziro" className="h-20 lg:h-24 w-auto object-contain brightness-0 invert" />
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-80">
            <path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5.5 13.5a9 9 0 0 1 13 0"/><path d="M2.5 10.5a13 13 0 0 1 19 0"/>
          </svg>
        </div>
        
        {/* Bottom Half (Black) */}
        <div className="h-1/2 w-full bg-[#1A1A1A] relative p-6 flex flex-col justify-end">
          <div className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-1" style={textStyle}>
            OLIVIA RHYE
          </div>
          <div className="flex justify-between items-end w-full">
            <div className="text-white text-lg sm:text-xl font-medium tracking-[0.2em] whitespace-nowrap" style={textStyle}>
              1234 1234 1234 1234
            </div>
            {/* Mastercard-style logo */}
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-white/30 mix-blend-screen"></div>
              <div className="w-5 h-5 rounded-full bg-white/30 mix-blend-screen"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'cyan-black') {
    return (
      <div 
        className={`absolute rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col ${className}`}
        style={style}
      >
        {/* Top Half (Blue) */}
        <div className="h-1/2 w-full bg-[#3B7DFF] relative p-6 flex justify-between items-start">
          <div className="text-white font-bold text-lg opacity-90 relative -top-6 lg:-top-8" style={textStyle}>
            <img src="/logo.png" alt="Ziro" className="h-20 lg:h-24 w-auto object-contain brightness-0 invert" />
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-80">
            <path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5.5 13.5a9 9 0 0 1 13 0"/><path d="M2.5 10.5a13 13 0 0 1 19 0"/>
          </svg>
        </div>
        
        {/* Bottom Half (Black) */}
        <div className="h-1/2 w-full bg-[#1A1A1A] relative p-6 flex flex-col justify-end">
          <div className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-1" style={textStyle}>
            OLIVIA RHYE
          </div>
          <div className="flex justify-between items-end w-full">
            <div className="text-white text-lg sm:text-xl font-medium tracking-[0.2em] whitespace-nowrap" style={textStyle}>
              1234 1234 1234 1234
            </div>
            {/* Mastercard-style logo */}
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-white/30 mix-blend-screen"></div>
              <div className="w-5 h-5 rounded-full bg-white/30 mix-blend-screen"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
