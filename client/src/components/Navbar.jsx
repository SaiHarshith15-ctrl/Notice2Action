import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-cardborder bg-white/90 backdrop-blur dark:bg-[#14132B]/90 dark:border-[#2A2953]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-navy dark:text-white text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light text-white">
            N2A
          </span>
          Notice2Action
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {user && (
            <Link
              to="/history"
              className="text-sm font-medium text-body dark:text-gray-200 hover:text-primary px-2 py-1"
            >
              History
            </Link>
          )}

          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="h-9 w-9 flex items-center justify-center rounded-full border border-cardborder dark:border-[#2A2953] text-sm"
            title="Toggle dark mode"
          >
            {dark ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted">{user.name}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-sm font-semibold px-3 py-1.5 rounded-full border border-cardborder dark:border-[#2A2953] hover:bg-cardbg dark:hover:bg-[#1C1B3A]"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-cardbg dark:hover:bg-[#1C1B3A]"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary-light"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
