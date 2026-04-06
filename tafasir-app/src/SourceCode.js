import React from 'react';
import PageHeader from './PageHeader';

const SourceCode = () => {
  return (
    <div
      className="container mx-auto p-4 bg-base-100 text-base-content"
      dir="rtl"
    >
      <PageHeader
        title="SOURCE CODE"
        subtitle="الكود المصدري وقاعدة البيانات متاحان عبر GitHub."
      />

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">العربية</h2>
        <p className="mb-2">
          الكود المصدري وقاعدة البيانات متاحان على GitHub:
        </p>
        <p>
          <a
            href="https://github.com/karim1104/tafasir.org"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
            dir="ltr"
          >
            github.com/karim1104/tafasir.org
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2 text-left" dir="ltr">
          English
        </h2>
        <p className="mb-2 text-left" dir="ltr">
          The source code and database are available on GitHub:
        </p>
        <p className="text-left" dir="ltr">
          <a
            href="https://github.com/karim1104/tafasir.org"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            github.com/karim1104/tafasir.org
          </a>
        </p>
      </section>
    </div>
  );
};

export default SourceCode;
