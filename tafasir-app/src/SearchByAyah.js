// SearchByAyah.js
import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';

const API_BASE_URL = '/api';

function SearchByAyah() {
  const [suras, setSuras] = useState([]);
  const [ayahs, setAyahs] = useState([]);
  const [madhabs, setMadhabs] = useState([]);
  const [tafsirs, setTafsirs] = useState([]);
  const [selectedSura, setSelectedSura] = useState('');
  const [selectedAyah, setSelectedAyah] = useState('');
  const [selectedMadhab, setSelectedMadhab] = useState('');
  const [selectedTafsir, setSelectedTafsir] = useState('');
  const [ayah, setAyah] = useState(null);
  const [tafsirTexts, setTafsirTexts] = useState([]);
  const [selectedSuraName, setSelectedSuraName] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [noTafsirFound, setNoTafsirFound] = useState(false);
  const [tafsirDescription, setTafsirDescription] = useState('');
  const [selectedTafsirName, setSelectedTafsirName] = useState('');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      fetch(`${API_BASE_URL}/suras`)
        .then((response) => response.json())
        .then((data) => setSuras(data));

      fetch(`${API_BASE_URL}/madhabs`)
        .then((response) => response.json())
        .then(async (data) => {
          if (data && Array.isArray(data)) {
            const madhabsWithCounts = await Promise.all(
              data.map(async (madhab) => {
                try {
                  const response = await fetch(
                    `${API_BASE_URL}/tafsirs/count?madhab_number=${madhab.madhab_number}`
                  );
                  const count = await response.json();
                  return { ...madhab, count };
                } catch (error) {
                  console.error(
                    'Error fetching tafsir count for madhab:',
                    error
                  );
                  return { ...madhab, count: 0 };
                }
              })
            );
            setMadhabs(madhabsWithCounts);
          }
        })
        .catch((error) => console.error('Error fetching madhabs:', error));
    }
  }, [isOnline]);

  useEffect(() => {
    if (selectedSura) {
      fetch(`${API_BASE_URL}/ayahs/${selectedSura}`)
        .then((response) => response.json())
        .then((data) => setAyahs(data));
    } else {
      setAyahs([]);
      setSelectedAyah('');
    }
  }, [selectedSura]);

  useEffect(() => {
    if (selectedMadhab) {
      fetch(`${API_BASE_URL}/tafsirs?madhab_numbers=${selectedMadhab}`)
        .then((response) => response.json())
        .then((data) => setTafsirs(data));
    } else {
      setTafsirs([]);
      setSelectedTafsir('');
    }
  }, [selectedMadhab]);

  const handleFetchAyahAndTafsir = () => {
    if (selectedSura && selectedAyah && selectedTafsir) {
      const selectedSuraObj = suras.find(
        (sura) => sura.sura_number === parseInt(selectedSura, 10)
      );
      setSelectedSuraName(
        selectedSuraObj
          ? `${selectedSuraObj.sura_number} - ${selectedSuraObj.name}`
          : ''
      );

      fetch(`${API_BASE_URL}/ayah/${selectedSura}/${selectedAyah}`)
        .then((response) => response.json())
        .then((data) => setAyah(data));

      const selectedTafsirObj = tafsirs.find(
        (tafsir) => tafsir.tafsir_number === parseInt(selectedTafsir, 10)
      );
      setTafsirDescription(
        selectedTafsirObj ? selectedTafsirObj.description : ''
      );
      setSelectedTafsirName(selectedTafsirObj ? selectedTafsirObj.name : '');

      fetch(
        `${API_BASE_URL}/tafsir_texts/${selectedSura}/${selectedAyah}?tafsir_numbers=${selectedTafsir}`
      )
        .then((response) => response.json())
        .then((data) => {
          setTafsirTexts(data);
          setNoTafsirFound(data.length === 0);
        });
    }
  };

  const isSearchDisabled =
    !isOnline ||
    !selectedSura ||
    !selectedAyah ||
    !selectedMadhab ||
    !selectedTafsir;

  return (
    <div
      className="container mx-auto p-4 bg-base-100 text-base-content"
      dir="rtl"
    >
      <PageHeader
        title="التفسير حسب السورة والآية"
        subtitle="اختر السورة والآية، ثم حدِّد المذهب وكتاب التفسير لعرض النص الكامل."
      />

      {!isOnline && (
        <div className="alert alert-warning mb-4">
          <span>⚠️</span>
          <span>الاتصال بالإنترنت مطلوب لاستخدام هذه الصفحة.</span>
        </div>
      )}

      <div className="mb-4">
        <select
          className="select select-bordered w-full font-bold"
          onChange={(e) => setSelectedSura(e.target.value)}
          value={selectedSura}
        >
          <option value="" className="font-bold">
            اختر سورة
          </option>
          {suras.map((sura) => (
            <option
              key={sura.sura_number}
              value={sura.sura_number}
              className="font-bold"
            >
              {sura.sura_number}-{sura.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <select
          className="select select-bordered w-full font-bold"
          onChange={(e) => setSelectedAyah(e.target.value)}
          value={selectedAyah}
          disabled={!selectedSura}
        >
          <option value="" className="font-bold">
            اختر آية
          </option>
          {ayahs.map((ayahItem) => (
            <option
              key={ayahItem.ayah_number}
              value={ayahItem.ayah_number}
              className="font-bold"
            >
              {ayahItem.ayah_number} -{' '}
              {ayahItem.text.split(' ').slice(0, 10).join(' ')}...
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <select
          className="select select-bordered w-full font-bold"
          onChange={(e) => setSelectedMadhab(e.target.value)}
          value={selectedMadhab}
        >
          <option value="" className="font-bold">
            اختر مذهب
          </option>
          {madhabs.map((madhab) => (
            <option
              key={madhab.madhab_number}
              value={madhab.madhab_number}
              className="font-bold"
            >
              {madhab.name} ({madhab.count} تفسير)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <select
          className="select select-bordered w-full font-bold"
          onChange={(e) => setSelectedTafsir(e.target.value)}
          value={selectedTafsir}
          disabled={!selectedMadhab}
        >
          <option value="" className="font-bold">
            اختر كتاب التفسير
          </option>
          {tafsirs.map((tafsir) => (
            <option
              key={tafsir.tafsir_number}
              value={tafsir.tafsir_number}
              className="font-bold"
            >
              {tafsir.name}{' '}
              {tafsir.author_death ? `(${tafsir.author_death} هجري)` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <button
          className="btn btn-primary w-full"
          onClick={handleFetchAyahAndTafsir}
          disabled={isSearchDisabled}
        >
          ابحث عن التفسير
        </button>
      </div>

      {tafsirDescription && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">عن كتاب التفسير</h2>
          <div dangerouslySetInnerHTML={{ __html: tafsirDescription }} />
        </div>
      )}

      {ayah && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">السورة</h2>
          <p>{selectedSuraName}</p>
          <h2 className="text-xl font-bold mb-2 mt-4">الآية</h2>
          <p>
            {ayah.ayah_number} -{' '}
            {ayah.text_with_tashkeel || ayah.text}
          </p>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">التفسير</h2>
        {noTafsirFound ? (
          <p>لا يوجد تفسير متاح لهذه الآية في الكتاب المحدَّد.</p>
        ) : (
          tafsirTexts.map((tafsirText) => (
            <div key={tafsirText.id} className="mb-4">
              {selectedTafsirName && (
                <h3 className="font-semibold mb-1">
                  {selectedTafsirName}
                </h3>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: tafsirText.text }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchByAyah;
