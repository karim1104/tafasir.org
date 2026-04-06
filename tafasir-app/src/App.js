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

const ANDROID_DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.tafasir.org&hl=ar';
const IOS_DOWNLOAD_URL = 'https://apps.apple.com/us/app/%D9%85%D9%88%D8%B3%D9%88%D8%B9%D8%A9-%D8%A7%D9%84%D8%AA%D9%81%D8%A7%D8%B3%D9%8A%D8%B1/id6612021707';

const getUserAgent = () => {
  if (typeof navigator === 'undefined') {
    return '';
  }

  return navigator.userAgent || navigator.vendor || '';
};

const isEmbeddedWebView = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = getUserAgent();
  const isAndroidWebView = /\bwv\b/i.test(userAgent)
    || (
      /Android/i.test(userAgent)
      && /Version\/[\d.]+/i.test(userAgent)
      && !/Chrome\/[\d.]+/i.test(userAgent)
    );
  const isIOSWebView = /(iPhone|iPad|iPod)/i.test(userAgent)
    && /AppleWebKit/i.test(userAgent)
    && !/Safari/i.test(userAgent);

  return isAndroidWebView
    || isIOSWebView
    || typeof window.ReactNativeWebView !== 'undefined';
};

const getPreferredDownloadUrl = () => {
  const userAgent = getUserAgent();

  if (/Android/i.test(userAgent)) {
    return ANDROID_DOWNLOAD_URL;
  }

  if (/(iPhone|iPad|iPod)/i.test(userAgent)) {
    return IOS_DOWNLOAD_URL;
  }

  return null;
};

const openExternalUrl = (url, embeddedWebView) => {
  if (typeof window === 'undefined') {
    return;
  }

  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
    return;
  }

  if (!embeddedWebView) {
    window.location.assign(url);
  }
};

const DownloadPage = () => {
  const embeddedWebView = isEmbeddedWebView();
  const preferredDownloadUrl = getPreferredDownloadUrl();

  useEffect(() => {
    if (!embeddedWebView && preferredDownloadUrl) {
      window.location.replace(preferredDownloadUrl);
    }
  }, [embeddedWebView, preferredDownloadUrl]);

  return (
    <section className="px-4 py-12" dir="rtl">
      <div className="mx-auto max-w-xl rounded-3xl border border-base-300 bg-base-200/70 p-6 text-right shadow-lg">
        <h1 className="text-2xl font-bold text-base-content">
          تحميل تطبيق الجوال
        </h1>
        <p className="mt-3 leading-8 text-base-content/80">
          {embeddedWebView
            ? 'تم إيقاف التحويل التلقائي داخل الـ WebView حتى لا تظهر صفحة خطأ.'
            : preferredDownloadUrl
              ? 'إذا لم يتم تحويلك تلقائيًا، استخدم أحد الأزرار التالية.'
              : 'اختر المتجر المناسب لتنزيل التطبيق على هاتفك.'}
        </p>
        {embeddedWebView && (
          <p className="mt-3 text-sm text-warning">
            إذا كنت تستخدم التطبيق بالفعل، فلا تحتاج إلى تنزيله مرة أخرى.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn btn-primary sm:flex-1"
            onClick={() => openExternalUrl(ANDROID_DOWNLOAD_URL, embeddedWebView)}
          >
            فتح صفحة Android
          </button>
          <button
            type="button"
            className="btn btn-outline sm:flex-1"
            onClick={() => openExternalUrl(IOS_DOWNLOAD_URL, embeddedWebView)}
          >
            فتح صفحة iPhone / iPad
          </button>
        </div>
        {embeddedWebView && (
          <p className="mt-4 text-sm leading-7 text-base-content/70">
            إذا لم يفتح المتجر مباشرة، فسبب ذلك غالبًا من إعدادات الـ WebView داخل
            التطبيق نفسه وليس من الموقع.
          </p>
        )}
        <div className="mt-4">
          <Link to="/" className="link link-hover text-sm">
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
