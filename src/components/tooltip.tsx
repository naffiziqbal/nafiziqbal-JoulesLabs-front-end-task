export function ToolTip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="relative group inline-block z-50">
      {children}
      <div
        className="absolute top-full left-1/2 z-50 -translate-x-1/2 mb-2 
                        whitespace-nowrap bg-black text-white text-xs 
                        px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200 pointer-events-none"
      >
        {text}
      </div>
    </div>
  );
}
