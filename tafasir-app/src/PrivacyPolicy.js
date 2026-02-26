// PrivacyPolicy.js
import React from 'react';
import PageHeader from './PageHeader';

const PrivacyPolicy = () => {
  return (
    <div
      className="container mx-auto p-4 bg-base-100 text-base-content"
      dir="rtl"
    >
      <PageHeader
        title="سياسة الخصوصية"
        subtitle="توضّح هذه الصفحة كيفية تعامل موسوعة التفاسير مع بيانات المستخدمين."
      />

      <section className="mb-4">
        <p>
          نحن في موقع{' '}
          <span className="font-semibold">Tafasir.org</span>{' '}
          وتطبيق &quot;موسوعة التفاسير&quot;، الذي تديره{' '}
          <span className="font-semibold">Tadawul Academy</span>، نلتزم
          بحماية خصوصية المستخدمين. تم تصميم هذا التطبيق لخدمة العلم
          الشرعي، ولا يهدف إلى جمع بيانات شخصية أو تتبّع المستخدمين.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold mb-2">المعلومات التي نجمعها</h2>
        <p>
          لا نقوم بجمع أي معلومات شخصية أو حساسة عن المستخدمين. الخيار
          الوحيد الذي يتم حفظه محلياً على جهازك هو تفضيل الثيم
          (الوضع الفاتح أو الداكن) لتحسين تجربة الاستخدام فقط.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold mb-2">استخدام المعلومات</h2>
        <p>
          بما أننا لا نجمع بيانات شخصية، فلا يتم استخدام بياناتك لأي
          أغراض إعلانية أو تسويقية أو تحليلية. إعداد الثيم يُستخدم فقط
          لعرض الواجهة بالشكل الذي اخترته في زياراتك السابقة.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold mb-2">
          ملفات تعريف الارتباط (الكوكيز) والتقنيات المشابهة
        </h2>
        <p>
          لا يعتمد التطبيق نفسه على ملفات تعريف الارتباط لتتبعك، لكن بعض
          الخدمات الخارجية مثل متاجر التطبيقات أو مزوّدي الاستضافة قد
          تستخدم تقنيات خاصة بها حسب سياساتها المستقلة.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold mb-2">حقوقك</h2>
        <p>
          نظراً لعدم جمعنا لبيانات شخصية عنك، لا نحتفظ بسجلات يمكن تعديلها
          أو حذفها. إذا كانت لديك أي أسئلة أو مخاوف بخصوص الخصوصية عند
          استخدام التطبيق، يمكنك التواصل معنا في أي وقت عبر البريد
          الإلكتروني الموضّح أدناه.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold mb-2">
          التعديلات على سياسة الخصوصية
        </h2>
        <p>
          قد نقوم بتحديث هذه السياسة من حين لآخر بما يتوافق مع أي تغييرات
          تقنية أو قانونية. نوصي بمراجعة هذه الصفحة بشكل دوري للبقاء على
          اطّلاع على أحدث إصدار من سياسة الخصوصية.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold mb-2">الاتصال بنا</h2>
        <p>
          إذا كانت لديك أي استفسارات حول سياسة الخصوصية هذه، يرجى
          التواصل معنا عبر البريد الإلكتروني:{' '}
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

export default PrivacyPolicy;
