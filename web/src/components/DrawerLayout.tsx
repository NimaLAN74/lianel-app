import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type DrawerLayoutProps = {
  title?: string;
  children: React.ReactNode;
  rightNav?: React.ReactNode;
};

export default function DrawerLayout({ title = "Lianel", children, rightNav }: DrawerLayoutProps) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Focus drawer when it opens
  useEffect(() => { if (open && drawerRef.current) drawerRef.current.focus(); }, [open]);

  // Ensure assets resolve correctly under /app basename
  const base = import.meta.env.BASE_URL; // e.g., "/app/"
  const bgUrl = `${base}lw-background.png`;
  const logoUrl = `${base}lw-icon.png`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll", // scroll with content
        backgroundColor: "#f8fafc", // slate-50 fallback
      }}
    >
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur relative">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Hamburger */}
          <button
            className="p-2 rounded hover:bg-slate-100"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-controls="app-drawer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Brand: icon + text */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoUrl}
              alt="Lianel logo"
              className="h-8 w-8"
            />
            <span className="text-lg font-semibold text-slate-800">{title}</span>
          </Link>

          {/* Right nav */}
          <nav className="text-sm flex gap-4">
            {rightNav ?? (
              <Link to="/signup" className="text-green-700 hover:underline">
                Sign up
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <button
          aria-label="Close menu overlay"
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in Drawer */}
      <aside
        id="app-drawer"
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold text-slate-800">Menu</div>
          <button
            className="p-2 rounded hover:bg-slate-100"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.415L11.414 10l4.95 4.95a1 1 0 01-1.415 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.415L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        <nav className="py-2">
          <Link to="/profiles" className="block px-4 py-2 text-slate-700 hover:bg-slate-100">
            Profiles
          </Link>
        </nav>
        <div className="mt-auto border-t px-4 py-3 text-xs text-slate-500">
          v0.1.0 • Lianel
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}