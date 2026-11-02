import React from 'react';

interface DoraemonHouseBackgroundProps {
  children?: React.ReactNode;
  showWindowClouds?: boolean;
}

export const DoraemonHouseBackground: React.FC<DoraemonHouseBackgroundProps> = ({
  children,
  showWindowClouds = true,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FAF6EE] text-slate-800 select-none">
      {/* ============================================================== */}
      {/* 3D CARTOON HOUSE ENVIRONMENT (NOBITA'S ROOM / DORAEMON'S HOME) */}
      {/* ============================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Wall & Ceiling Architecture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F2ECE1] via-[#FAF6EE] to-[#EBE2D3]">
          {/* Wooden ceiling beam */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-[#8D6E63] border-b-2 border-[#5D4037] shadow-sm flex items-center justify-around px-8">
            <div className="w-16 h-1 bg-[#A1887F] rounded-full opacity-60" />
            <div className="w-24 h-1 bg-[#A1887F] rounded-full opacity-60" />
            <div className="w-20 h-1 bg-[#A1887F] rounded-full opacity-60" />
          </div>

          {/* Wall vertical cedar wood frames */}
          <div className="absolute top-6 bottom-48 left-12 w-2.5 bg-[#8D6E63] border-x border-[#5D4037] opacity-40 hidden sm:block" />
          <div className="absolute top-6 bottom-48 right-16 w-2.5 bg-[#8D6E63] border-x border-[#5D4037] opacity-40 hidden sm:block" />
        </div>

        {/* Center / Window: The Iconic Cartoon Sky Window */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-[42vh] rounded-3xl overflow-hidden border-4 border-[#8D6E63] shadow-2xl bg-gradient-to-b from-[#0288D1] via-[#29B6F6] to-[#BAE6FD]">
          {/* Sky Gradient & Clouds visible through the window */}
          {showWindowClouds && (
            <div className="absolute inset-0">
              {/* Soft distant sun glow */}
              <div className="absolute -top-10 right-16 w-44 h-44 rounded-full bg-yellow-300/40 blur-2xl animate-pulse" />

              {/* Drifting Background Cloud 1 */}
              <div className="absolute top-6 -left-10 w-48 h-16 rounded-full bg-white/80 blur-xs animate-cloud-drift-slow" />
              <div className="absolute top-14 left-44 w-36 h-12 rounded-full bg-white/70 blur-xs animate-cloud-drift-medium" />
              <div className="absolute top-20 right-10 w-56 h-20 rounded-full bg-white/85 blur-xs animate-cloud-drift-fast" />

              {/* Distant Futuristic Tokyo Tower Silhouette (Doraemon World) */}
              <div className="absolute bottom-0 left-12 w-8 h-24 bg-sky-900/15 rounded-t-lg" />
              <div className="absolute bottom-0 left-18 w-14 h-32 bg-sky-900/10 rounded-t-xl" />
              <div className="absolute bottom-0 right-28 w-16 h-28 bg-sky-900/15 rounded-t-lg" />
              <div className="absolute bottom-0 right-16 w-10 h-36 bg-sky-900/20 rounded-t-xl" />

              {/* Open Window Japanese Wooden Grids (Shoji panels pushed open) */}
              <div className="absolute inset-y-0 left-0 w-8 border-r-2 border-[#5D4037] bg-white/20 backdrop-blur-xs flex flex-col justify-between py-2">
                <div className="w-full h-0.5 bg-[#5D4037]" />
                <div className="w-full h-0.5 bg-[#5D4037]" />
                <div className="w-full h-0.5 bg-[#5D4037]" />
              </div>
              <div className="absolute inset-y-0 right-0 w-8 border-l-2 border-[#5D4037] bg-white/20 backdrop-blur-xs flex flex-col justify-between py-2">
                <div className="w-full h-0.5 bg-[#5D4037]" />
                <div className="w-full h-0.5 bg-[#5D4037]" />
                <div className="w-full h-0.5 bg-[#5D4037]" />
              </div>
            </div>
          )}

          {/* Window Sill with small comic book or pen stand */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-[#6D4C41] border-t-2 border-[#5D4037]" />
        </div>

        {/* Slanted Golden Sunbeam pouring from the window onto the floor */}
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 w-[120%] max-w-5xl h-[80vh] pointer-events-none opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 241, 118, 0.45) 0%, rgba(255, 255, 255, 0) 70%)',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
          }}
        />

        {/* Left Side: Nobita's Legendary Study Desk & Time Machine Drawer */}
        <div className="absolute bottom-28 left-4 sm:left-12 w-44 sm:w-64 h-36 sm:h-44 bg-[#8D6E63] rounded-t-2xl border-4 border-[#5D4037] shadow-xl flex flex-col justify-between p-2 z-0 opacity-80 sm:opacity-90">
          <div className="h-5 bg-[#6D4C41] -mx-3 -mt-3 rounded-t-xl border-b-2 border-[#4E342E] flex items-center justify-between px-3">
            <span className="text-[9px] text-[#D7CCC8] font-bold tracking-wider">NOBITA'S DESK</span>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
          </div>
          {/* Middle Drawer: THE TIME MACHINE PORTAL! */}
          <div className="relative my-auto mx-auto w-[85%] h-12 bg-[#795548] rounded-lg border-2 border-[#4E342E] shadow-inner flex items-center justify-center overflow-hidden group">
            {/* Soft mystical blue aura from inside the drawer */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-sky-500/40 to-indigo-500/30 animate-pulse" />
            <div className="w-5 h-2 rounded-full bg-[#FFD54F] shadow-xs border border-[#FFA000]" />
            <span className="absolute bottom-0.5 right-1 text-[8px] text-cyan-200 font-extrabold uppercase tracking-tight">
              Time Machine
            </span>
          </div>
          {/* Desk lower legs */}
          <div className="flex justify-between px-3 -mb-1">
            <div className="w-4 h-6 bg-[#5D4037] rounded-b-sm" />
            <div className="w-4 h-6 bg-[#5D4037] rounded-b-sm" />
          </div>
        </div>

        {/* Right Side: Doraemon's Iconic Closet (Shoji Paper Sliding Doors) */}
        <div className="absolute bottom-28 right-4 sm:right-12 w-40 sm:w-56 h-56 sm:h-72 bg-[#EFEBE9] rounded-t-2xl border-4 border-[#8D6E63] shadow-xl overflow-hidden z-0 opacity-75 sm:opacity-85">
          {/* Sliding door division */}
          <div className="w-full h-full flex">
            {/* Left panel */}
            <div className="w-1/2 h-full border-r-2 border-[#8D6E63] bg-[#EFEBE9] flex flex-col justify-around p-1.5">
              <div className="w-full h-1/4 rounded bg-sky-100/70 border border-sky-200" />
              <div className="w-full h-1/4 rounded bg-sky-100/70 border border-sky-200" />
              <div className="w-full h-1/4 rounded bg-sky-100/70 border border-sky-200" />
              <div className="w-2 h-6 bg-[#5D4037] rounded-sm self-end -mr-1" />
            </div>
            {/* Right panel */}
            <div className="w-1/2 h-full bg-[#E8E0D9] flex flex-col justify-around p-1.5">
              <div className="w-full h-1/4 rounded bg-sky-100/50 border border-sky-200" />
              <div className="w-full h-1/4 rounded bg-sky-100/50 border border-sky-200" />
              <div className="w-full h-1/4 rounded bg-sky-100/50 border border-sky-200" />
              <div className="w-2 h-6 bg-[#5D4037] rounded-sm self-start -ml-1" />
            </div>
          </div>
          {/* Doraemon bedroom sign */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/90 border border-sky-300 text-[8px] font-black text-sky-700 shadow-xs">
            DORAEMON'S CLOSET
          </div>
        </div>

        {/* Authentic Japanese Tatami Mat Floor */}
        <div className="absolute bottom-0 inset-x-0 h-32 sm:h-40 bg-[#E8E0C8] border-t-8 border-[#5D4037] shadow-2xl">
          {/* Tatami straw mats layout with green ribbon borders */}
          <div className="relative w-full h-full grid grid-cols-3 sm:grid-cols-4 gap-0.5">
            {/* Mat 1 */}
            <div className="relative bg-[#EDE5CF] border-r-4 border-l-4 border-[#689F38] shadow-inner">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #6D4C41, #6D4C41 1px, transparent 1px, transparent 6px)',
                }}
              />
            </div>
            {/* Mat 2 */}
            <div className="relative bg-[#F2EBDA] border-r-4 border-l-4 border-[#689F38] shadow-inner">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #6D4C41, #6D4C41 1px, transparent 1px, transparent 6px)',
                }}
              />
            </div>
            {/* Mat 3 */}
            <div className="relative bg-[#EDE5CF] border-r-4 border-l-4 border-[#689F38] shadow-inner">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #6D4C41, #6D4C41 1px, transparent 1px, transparent 6px)',
                }}
              />
            </div>
            {/* Mat 4 */}
            <div className="relative bg-[#F2EBDA] border-r-4 border-l-4 border-[#689F38] shadow-inner hidden sm:block">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #6D4C41, #6D4C41 1px, transparent 1px, transparent 6px)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};
