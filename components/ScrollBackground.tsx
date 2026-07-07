"use client";

import { useState, useEffect } from "react";

export default function ScrollBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-0 bg-[#3b0712]" />;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Main Background Image exactly as uploaded */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url("/main-bg.png")' }}
      />
    </div>
  );
}
