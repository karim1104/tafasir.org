// PageHeader.js
import React from 'react';
import logo from './logo.png';

const PageHeader = ({ title, subtitle }) => {
  return (
    <header className="mb-4 flex flex-col items-center">
      <img
        src={logo}
        alt="شعار موسوعة التفاسير"
        className="h-16 mb-4"
      />
      <h1 className="text-xl font-bold mt-2 mb-2 text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-center text-sm text-gray-500">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default PageHeader;
