// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import 'daisyui/dist/full.css';
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';

import PrivacyPolicy from './PrivacyPolicy';
import Contact from './Contact';
import SourceCode from './SourceCode';
import SearchByAyah from './SearchByAyah';
import SearchByBook from './SearchByBook';
import SearchInTafsir from './SearchInTafsir';
import SearchInQuran from './SearchInQuran';

const DownloadPage = () => {
  return (
    <section className="px-4 py-12" dir="rtl">
      <div className="mx-auto max-w-xl rounded-3xl border border-base-300 bg-base-200/70 p-6 text-right shadow-lg">
        <h1 className="text-2xl font-bold text-base-content">
          تحميل تطبيق الجوال
        </h1>
        <p className="mt-3 leading-8 text-base-content/80">
          لتحميل التطبيق على الجوال، الرجاء البحث عن
          {' '}
          <span className="font-semibold">"موسوعة التفاسير"</span>
          {' '}
          من
          {' '}
          <span className="font-semibold">"Tadawul Academy FZE"</span>.
        </p>
        <p className="mt-4 text-sm leading-7 text-base-content/70">
          يمكنك كتابة اسم التطبيق واسم الناشر في متجر التطبيقات للوصول إليه مباشرة.
        </p>
        <div className="mt-6 rounded-2xl bg-base-100 p-4 text-sm leading-7 text-base-content/80 shadow-sm">
          الاسم: "موسوعة التفاسير"
          <br />
          الناشر: "Tadawul Academy FZE"
        </div>
        <div className="mt-6">
          <Link to="/" className="btn btn-primary btn-sm">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const closeMenu = () => setMenuOpen(false);
  const toggleTheme = () => {
    setTheme((currentTheme) => (
      currentTheme === 'dark' ? 'light' : 'dark'
    ));
  };

  return (
    <Router>
      <div className="min-h-screen bg-base-100 text-base-content">
        {/* Theme toggle button */}
        <button
          type="button"
          className="fixed top-4 left-4 z-50 btn btn-circle btn-ghost shadow-sm"
          onClick={toggleTheme}
          aria-label={
            theme === 'dark'
              ? 'تفعيل الوضع الفاتح'
              : 'تفعيل الوضع الداكن'
          }
          title={
            theme === 'dark'
              ? 'تفعيل الوضع الفاتح'
              : 'تفعيل الوضع الداكن'
          }
        >
          {theme === 'dark' ? (
            <FiSun className="text-2xl text-warning" />
          ) : (
            <FiMoon className="text-2xl text-primary" />
          )}
        </button>

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
                    to="/source-code"
                    onClick={closeMenu}
                    className="link link-hover"
                  >
                    SOURCE CODE
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
            <Route path="/source-code" element={<SourceCode />} />
            <Route path="/download" element={<DownloadPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
