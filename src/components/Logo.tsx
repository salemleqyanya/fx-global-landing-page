import logoImage from 'figma:asset/949f9ff3e49b50cd73e9efb072f668b246d3262c.png';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Logo Icon */}
        <div className="w-14 h-14 rounded-lg overflow-hidden shadow-lg shadow-[#E91E8C]/30">
          <img
            src={logoImage}
            alt="FX GLOBAL Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-[#E91E8C] blur-md opacity-30 -z-10"></div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col leading-tight">
        <span className="text-white text-xl tracking-wider font-bold text-[32px]">
          FX <span className="text-[#E91E8C]">GLOBAL</span>
        </span>
        <span className="text-white/60 text-xs text-[14px] text-center">Trading Academy</span>
      </div>
    </div>
  );
}
