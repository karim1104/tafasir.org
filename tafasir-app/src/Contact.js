// Contact.js
import React from 'react';
import PageHeader from './PageHeader';

const Contact = () => {
  return (
    <div
      className="container mx-auto p-4 bg-base-100 text-base-content"
      dir="rtl"
    >
      <PageHeader
        title="اتصل بنا"
        subtitle="نسعد بتلقي ملاحظاتكم واقتراحاتكم حول موسوعة التفاسير."
      />

      <section className="mb-4">
        <p>
          يمكنكم التواصل مع الدكتور عبد الكريم منصور عبر البريد الإلكتروني:{' '}
          <a
            href="mailto:karim1104@gmail.com"
            className="link"
          >
            karim1104@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default Contact;
