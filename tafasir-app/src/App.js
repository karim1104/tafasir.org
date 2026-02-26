// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { themeChange } from 'theme-change';
import 'tailwindcss/tailwind.css';
import 'daisyui/dist/full.css';
import { FiMenu } from 'react-icons/fi';

import PrivacyPolicy from './PrivacyPolicy';
import Contact from './Contact';
import SearchByAyah from './SearchByAyah';
import SearchByBook from './SearchByBook';
import SearchInTafsir from './SearchInTafsir';
import SearchInQuran from './SearchInQuran';

// Redirect component for the download route
const DownloadRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://onelink.to/6xzuc2';
  }, []);

  return null;
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    themeChange(false);
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleThemeChange = (event) => {
      const selectedTheme = event.target.value;
      document.documentElement.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('theme', selectedTheme);
    };

    const themeSelector = document.querySelector('[data-choose-theme]');
    if (themeSelector) {
      themeSelector.value = savedTheme;
      themeSelector.addEventListener('change', handleThemeChange);
    }

    return () => {
      if (themeSelector) {
        themeSelector.removeEventListener('change', handleThemeChange);
      }
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <Router>
      <div className="min-h-screen bg-base-100 text-base-content">
        {/* Floating menu button */}
        <button
          type="button"
          className="fixed top-4 right-4 z-50 btn btn-circle btn-ghost shadow-sm"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="فتح القائمة"
        >
          <FiMenu className="text-2xl text-primary" />
        </button>

        {/* Overlay navigation menu */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeMenu}
          >
            <nav
              className="absolute top-16 right-4 w-64 bg-base-100 shadow-xl rounded-xl p-4"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-lg font-bold text-right">القائمة</h2>
              <ul className="space-y-3 text-right">
                <li>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    التفسير حسب السورة والآية
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search-by-book"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    التفسير حسب كتاب التفسير
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search-in-tafsir"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    البحث في نصوص التفاسير
                  </Link>
                </li>
                <li>
                  <Link
                    to="/search-in-quran"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    البحث في آيات القرآن الكريم
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    اتصل بنا
                  </Link>
                </li>
                <li>
                  <Link
                    to="/download"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    تحميل تطبيق الجوال
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}

        <main className="pt-2 pb-6">
          <Routes>
            <Route path="/" element={<SearchByAyah />} />
            <Route path="/search-by-book" element={<SearchByBook />} />
            <Route path="/search-in-tafsir" element={<SearchInTafsir />} />
            <Route path="/search-in-quran" element={<SearchInQuran />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/download" element={<DownloadRedirect />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
