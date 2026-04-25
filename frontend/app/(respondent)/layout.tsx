export default function RespondentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes thinkDot { 0%,80%,100% { opacity:0.2; transform:translateY(0); } 40% { opacity:1; transform:translateY(-3px); } }
      `}</style>
      {children}
    </>
  );
}
