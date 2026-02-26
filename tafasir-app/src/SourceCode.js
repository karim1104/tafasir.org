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
        subtitle="روابط الكود المصدري وتفريغ قاعدة البيانات"
      />

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-left" dir="ltr">
          English
        </h2>
        <p className="mb-2 text-left" dir="ltr">
          Source code and database dump can be found here:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-left" dir="ltr">
          <li>
            GitHub repository:{' '}
            <a
              href="https://github.com/karim1104/tafasir.org"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              https://github.com/karim1104/tafasir.org
            </a>
          </li>
          <li>
            PostgreSQL database dump:{' '}
            <a
              href="https://www.dropbox.com/scl/fi/jmqh9p46dkbbmyr14fhta/db_tafasir.sql?rlkey=17p6vcwcjkx62aj1kqcva6oh1&st=ygrsmah8&dl=0"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              db_tafasir.sql (Dropbox)
            </a>
          </li>
        </ul>
        <p className="mt-3 text-left" dir="ltr">
          Instructions: download the SQL file, create a PostgreSQL database,
          then import it using <code>psql -d db_tafasir -f db_tafasir.sql</code>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">العربية</h2>
        <p className="mb-2">
          يمكن العثور على الكود المصدري وتفريغ قاعدة البيانات هنا:
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>
            مستودع GitHub:{' '}
            <a
              href="https://github.com/karim1104/tafasir.org"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
              dir="ltr"
            >
              https://github.com/karim1104/tafasir.org
            </a>
          </li>
          <li>
            ملف تفريغ قاعدة بيانات PostgreSQL:{' '}
            <a
              href="https://www.dropbox.com/scl/fi/jmqh9p46dkbbmyr14fhta/db_tafasir.sql?rlkey=17p6vcwcjkx62aj1kqcva6oh1&st=ygrsmah8&dl=0"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              db_tafasir.sql (Dropbox)
            </a>
          </li>
        </ul>
        <p className="mt-3">
          التعليمات: قم بتنزيل ملف SQL، ثم أنشئ قاعدة بيانات PostgreSQL،
          وبعدها نفّذ أمر الاستيراد:
          <br />
          <code dir="ltr">psql -d db_tafasir -f db_tafasir.sql</code>
        </p>
      </section>
    </div>
  );
};

export default SourceCode;
