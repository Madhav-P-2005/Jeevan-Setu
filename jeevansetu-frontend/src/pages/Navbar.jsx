// Path :- jeevansetu-frontend/src/pages/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";
import { BiDonateBlood } from "react-icons/bi";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Sync a 'dark' class to <html> for future Tailwind dark styles
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  return (
    <header className="sticky top-3 z-50">
      {/* Reduced blur for crisper logo; rounded container with safe Tailwind classes */}
      <nav className="mx-3 md:mx-6 bg-neutral-900/60 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand */}
            <div className="flex items-center group">
              <Link to="/" className="flex items-center">
                <div className="relative mr-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <BiDonateBlood className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                    <span className="text-red-500">जीवन</span>
                    <span className="text-white"> Setu</span>
                  </h1>
                  <p className="hidden sm:block text-gray-300 text-[10px] md:text-xs font-medium tracking-wider">
                    Real-Time Blood & Plasma Donor App
                  </p>
                </div>
              </Link>
            </div>
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3 justify-end">
              <button
                onClick={() => navigate("/login")}
                className="text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 border border-white/10"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/20 transition-all"
              >
                Get Started
              </button>
              {/* Dark/Light mode toggle (single button) */}
              <button
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setDarkMode((v) => !v)}
                className={darkMode ? "ml-2 p-2 rounded-lg text-blue-200 hover:text-blue-100" : "ml-2 p-2 rounded-lg text-yellow-300 hover:text-yellow-200"}
              >
                {darkMode ? <FaMoon className="w-5 h-5" /> : <FaSun className="w-5 h-5" />}
              </button>
            </div>
            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="p-2 rounded-lg text-white/90 hover:bg-white/10">
                {open ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile panel */}
        {open && (
          <div className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur-xl ">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/login");
                }}
                className="w-full text-left text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 border border-white/10"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/register");
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
              >
                Get Started
              </button>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  onClick={() => setDarkMode((v) => !v)}
                  className={darkMode ? "p-2 rounded-lg text-blue-200" : "p-2 rounded-lg text-yellow-300"}
                >
                  {darkMode ? <FaMoon className="w-5 h-5" /> : <FaSun className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
