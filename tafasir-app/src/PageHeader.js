// PageHeader.js
import React, { useEffect, useState } from 'react';
import logoLight from './logo.png';
import logoDark from './logo-dark.png';

const isDarkThemeEnabled = () => (
  typeof document !== 'undefined' &&
  document.documentElement.getAttribute('data-theme') === 'dark'
);

const PageHeader = ({ title, subtitle }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(isDarkThemeEnabled);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDarkTheme(isDarkThemeEnabled());
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    setIsDarkTheme(isDarkThemeEnabled());

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <header className="mb-4 flex flex-col items-center">
      <img
        src={isDarkTheme ? logoDark : logoLight}
        alt="شعار موسوعة التفاسير"
        className="h-16 mb-4"
      />
      <h1 className="text-xl font-bold mt-2 mb-2 text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-center text-sm text-base-content/70">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default PageHeader;
