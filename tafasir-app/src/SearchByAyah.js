// SearchByAyah.js
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from './PageHeader';

const API_BASE_URL = '/api';

const readNumericParam = (searchParams, name) => {
  const value = searchParams.get(name);
  return value && /^\d+$/.test(value) ? value : '';
};

const readSelectionFromUrl = (searchParams) => ({
  madhab: readNumericParam(searchParams, 'madhab'),
  tafsir: readNumericParam(searchParams, 'tafsir'),
  sura: readNumericParam(searchParams, 'sura'),
  ayah: readNumericParam(searchParams, 'ayah'),
});

const isCompleteSelection = (selection) => (
  Object.values(selection).every(Boolean)
);

function SearchByAyah() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSelection = readSelectionFromUrl(searchParams);
  const [suras, setSuras] = useState([]);
  const [ayahs, setAyahs] = useState([]);
  const [activeAyahs, setActiveAyahs] = useState([]);
  const [madhabs, setMadhabs] = useState([]);
  const [tafsirs, setTafsirs] = useState([]);
  const [selectedSura, setSelectedSura] = useState(initialSelection.sura);
  const [selectedAyah, setSelectedAyah] = useState(initialSelection.ayah);
  const [selectedMadhab, setSelectedMadhab] = useState(initialSelection.madhab);
  const [selectedTafsir, setSelectedTafsir] = useState(initialSelection.tafsir);
  const [activeSelection, setActiveSelection] = useState(
    isCompleteSelection(initialSelection) ? initialSelection : null
  );
  const [ayah, setAyah] = useState(null);
  const [tafsirTexts, setTafsirTexts] = useState([]);
  const [selectedSuraName, setSelectedSuraName] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [noTafsirFound, setNoTafsirFound] = useState(false);
  const [tafsirDescription, setTafsirDescription] = useState('');
  const [selectedTafsirName, setSelectedTafsirName] = useState('');
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [resultError, setResultError] = useState('');
  const searchControlsRef = useRef(null);

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
      const controller = new AbortController();

      fetch(`${API_BASE_URL}/ayahs/${selectedSura}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data) => {
          setAyahs(data);
          if (activeSelection?.sura === selectedSura) {
            setActiveAyahs(data);
          }
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Error fetching ayahs:', error);
          }
        });

      return () => controller.abort();
    } else {
      setAyahs([]);
      setSelectedAyah('');
    }

    return undefined;
  }, [selectedSura, activeSelection?.sura]);

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

  useEffect(() => {
    if (!activeSelection || !isOnline) {
      return undefined;
    }

    const controller = new AbortController();
    const { sura, ayah: ayahNumber, tafsir } = activeSelection;

    setIsLoadingResult(true);
    setResultError('');
    setNoTafsirFound(false);

    Promise.all([
      fetch(`${API_BASE_URL}/ayah/${sura}/${ayahNumber}`, {
        signal: controller.signal,
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch ayah');
        }
        return response.json();
      }),
      fetch(
        `${API_BASE_URL}/tafsir_texts/${sura}/${ayahNumber}?tafsir_numbers=${tafsir}`,
        { signal: controller.signal }
      ).then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch tafsir');
        }
        return response.json();
      }),
    ])
      .then(([ayahData, tafsirData]) => {
        setAyah(ayahData);
        setTafsirTexts(tafsirData);
        setNoTafsirFound(tafsirData.length === 0);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching ayah and tafsir:', error);
          setResultError('تعذّر تحميل الآية والتفسير. يرجى المحاولة مرة أخرى.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingResult(false);
        }
      });

    return () => controller.abort();
  }, [activeSelection, isOnline]);

  useEffect(() => {
    if (!activeSelection) {
      return;
    }

    const selectedSuraObj = suras.find(
      (sura) => String(sura.sura_number) === activeSelection.sura
    );
    if (selectedSuraObj) {
      setSelectedSuraName(
        `${selectedSuraObj.sura_number} - ${selectedSuraObj.name}`
      );
    }

    const selectedTafsirObj = tafsirs.find(
      (tafsir) => String(tafsir.tafsir_number) === activeSelection.tafsir
    );
    if (selectedTafsirObj) {
      setTafsirDescription(selectedTafsirObj.description || '');
      setSelectedTafsirName(selectedTafsirObj.name || '');
    }
  }, [activeSelection, suras, tafsirs]);

  const activateSelection = (selection) => {
    setSelectedMadhab(selection.madhab);
    setSelectedTafsir(selection.tafsir);
    setSelectedSura(selection.sura);
    setSelectedAyah(selection.ayah);
    setActiveSelection(selection);
    setSearchParams(selection, { replace: true });
  };

  const handleFetchAyahAndTafsir = () => {
    const selection = {
      madhab: selectedMadhab,
      tafsir: selectedTafsir,
      sura: selectedSura,
      ayah: selectedAyah,
    };

    if (isCompleteSelection(selection)) {
      setActiveAyahs(ayahs);
      activateSelection(selection);
    }
  };

  const activeAyahIndex = activeSelection
    ? activeAyahs.findIndex(
      (ayahItem) => String(ayahItem.ayah_number) === activeSelection.ayah
    )
    : -1;
  const canShowPreviousAyah = activeAyahIndex > 0;
  const canShowNextAyah =
    activeAyahIndex >= 0 && activeAyahIndex < activeAyahs.length - 1;

  const handleAdjacentAyah = (offset) => {
    const targetAyah = activeAyahs[activeAyahIndex + offset];
    if (!activeSelection || !targetAyah) {
      return;
    }

    setAyahs(activeAyahs);
    activateSelection({
      ...activeSelection,
      ayah: String(targetAyah.ayah_number),
    });
  };

  const scrollToSearchControls = () => {
    searchControlsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
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

      <div ref={searchControlsRef} className="scroll-mt-4">
        <div className="mb-4">
          <select
            className="select select-bordered w-full font-bold"
            aria-label="اختر السورة"
            onChange={(e) => {
              setSelectedSura(e.target.value);
              setSelectedAyah('');
            }}
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
            aria-label="اختر الآية"
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
            aria-label="اختر المذهب"
            onChange={(e) => {
              setSelectedMadhab(e.target.value);
              setSelectedTafsir('');
            }}
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
            aria-label="اختر كتاب التفسير"
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
      </div>

      {isLoadingResult && (
        <div className="alert mb-4" role="status" aria-live="polite">
          جاري تحميل الآية والتفسير...
        </div>
      )}

      {resultError && (
        <div className="alert alert-error mb-4" role="alert">
          {resultError}
        </div>
      )}

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
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleAdjacentAyah(-1)}
              disabled={!canShowPreviousAyah || isLoadingResult}
            >
              الآية السابقة
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAdjacentAyah(1)}
              disabled={!canShowNextAyah || isLoadingResult}
            >
              الآية التالية
            </button>
          </div>
          <button
            type="button"
            className="btn btn-ghost mt-2 w-full"
            onClick={scrollToSearchControls}
          >
            اختيار سورة أو آية أخرى
          </button>
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

      {ayah && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleAdjacentAyah(-1)}
            disabled={!canShowPreviousAyah || isLoadingResult}
          >
            الآية السابقة
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleAdjacentAyah(1)}
            disabled={!canShowNextAyah || isLoadingResult}
          >
            الآية التالية
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchByAyah;
