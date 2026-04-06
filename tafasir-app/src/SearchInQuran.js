// SearchInQuran.js
import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';

const API_BASE_URL = '/api';

function SearchInQuran() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(null);

  // Data for tafsir-by-result feature
  const [madhabs, setMadhabs] = useState([]);
  const [tafsirsByMadhab, setTafsirsByMadhab] = useState({});
  const [selectedMadhabByResult, setSelectedMadhabByResult] = useState({});
  const [selectedTafsirByResult, setSelectedTafsirByResult] = useState({});
  const [tafsirTextsByResult, setTafsirTextsByResult] = useState({});
  const [expandedResults, setExpandedResults] = useState({});
  const [tafsirLoadingByResult, setTafsirLoadingByResult] = useState({});
  const [tafsirErrorByResult, setTafsirErrorByResult] = useState({});

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

  // Fetch madhabs once (for all cards)
  useEffect(() => {
    if (!isOnline) return;

    fetch(`${API_BASE_URL}/madhabs`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMadhabs(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching madhabs:', error);
      });
  }, [isOnline]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setNoResultsFound(false);
    setSearchResults([]);
    setPage(1);
    setTotalCount(null);

    // Reset per-result tafsir state when starting a new search
    setSelectedMadhabByResult({});
    setSelectedTafsirByResult({});
    setTafsirTextsByResult({});
    setExpandedResults({});
    setTafsirLoadingByResult({});
    setTafsirErrorByResult({});

    performSearch(1);
  };

  const performSearch = (pageNumber) => {
    const params = new URLSearchParams({
      search_term: searchTerm.trim(),
      page: String(pageNumber),
      limit: '10',
    });

    fetch(`${API_BASE_URL}/search_ayahs?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        const results = data.results || [];
        if (pageNumber === 1) {
          setSearchResults(results);
        } else {
          setSearchResults((prev) => [...prev, ...results]);
        }
        setHasMore(!!data.has_more);
        if (typeof data.total_count === 'number') {
          setTotalCount(data.total_count);
        }
        setNoResultsFound(pageNumber === 1 && results.length === 0);
        setIsSearching(false);
      })
      .catch((error) => {
        console.error('Error searching ayahs:', error);
        setIsSearching(false);
      });
  };

  const loadMoreResults = () => {
    if (hasMore && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsSearching(true);
      performSearch(nextPage);
    }
  };

  const highlightSearchTerm = (text) => {
    if (!searchTerm || !text) return text;

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(
      regex,
      '<mark class="bg-warning/40 text-base-content rounded px-1">$1</mark>'
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // --- Per-result madhab/tafsir handlers ---

  const handleResultMadhabChange = (resultId, madhabNumber) => {
    setSelectedMadhabByResult((prev) => ({
      ...prev,
      [resultId]: madhabNumber,
    }));

    // Reset tafsir selection and loaded tafsir when madhab changes
    setSelectedTafsirByResult((prev) => ({
      ...prev,
      [resultId]: '',
    }));
    setTafsirTextsByResult((prev) => {
      const updated = { ...prev };
      delete updated[resultId];
      return updated;
    });
    setExpandedResults((prev) => ({
      ...prev,
      [resultId]: false,
    }));
    setTafsirErrorByResult((prev) => ({
      ...prev,
      [resultId]: undefined,
    }));

    // Fetch tafsirs for this madhab if we don't have them yet
    if (madhabNumber && !tafsirsByMadhab[madhabNumber]) {
      fetch(`${API_BASE_URL}/tafsirs?madhab_numbers=${madhabNumber}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTafsirsByMadhab((prev) => ({
              ...prev,
              [madhabNumber]: data,
            }));
          }
        })
        .catch((error) => {
          console.error('Error fetching tafsirs for madhab:', error);
        });
    }
  };

  const handleResultTafsirChange = (resultId, tafsirNumber) => {
    setSelectedTafsirByResult((prev) => ({
      ...prev,
      [resultId]: tafsirNumber,
    }));
    // Reset previously loaded tafsir when changing the book
    setTafsirTextsByResult((prev) => {
      const updated = { ...prev };
      delete updated[resultId];
      return updated;
    });
    setExpandedResults((prev) => ({
      ...prev,
      [resultId]: false,
    }));
    setTafsirErrorByResult((prev) => ({
      ...prev,
      [resultId]: undefined,
    }));
  };

  const handleShowTafsirForResult = (result) => {
    const resultId = result.id;
    const selectedMadhab = selectedMadhabByResult[resultId];
    const selectedTafsir = selectedTafsirByResult[resultId];

    if (!selectedMadhab || !selectedTafsir || !isOnline) {
      return;
    }

    // If we already have tafsir loaded, just toggle expand
    if (tafsirTextsByResult[resultId]) {
      setExpandedResults((prev) => ({
        ...prev,
        [resultId]: !prev[resultId],
      }));
      return;
    }

    setTafsirLoadingByResult((prev) => ({
      ...prev,
      [resultId]: true,
    }));
    setTafsirErrorByResult((prev) => ({
      ...prev,
      [resultId]: undefined,
    }));

    fetch(
      `${API_BASE_URL}/tafsir_texts/${result.sura_number}/${result.ayah_number}?tafsir_numbers=${selectedTafsir}`
    )
      .then((response) => response.json())
      .then((data) => {
        const texts = Array.isArray(data) ? data : [];
        setTafsirTextsByResult((prev) => ({
          ...prev,
          [resultId]: texts,
        }));
        setExpandedResults((prev) => ({
          ...prev,
          [resultId]: true,
        }));
        setTafsirLoadingByResult((prev) => ({
          ...prev,
          [resultId]: false,
        }));
      })
      .catch((error) => {
        console.error('Error fetching tafsir for ayah:', error);
        setTafsirLoadingByResult((prev) => ({
          ...prev,
          [resultId]: false,
        }));
        setTafsirErrorByResult((prev) => ({
          ...prev,
          [resultId]: 'حدث خطأ أثناء تحميل التفسير. يرجى المحاولة مرة أخرى.',
        }));
      });
  };

  const toggleExpandTafsir = (resultId) => {
    setExpandedResults((prev) => ({
      ...prev,
      [resultId]: !prev[resultId],
    }));
  };

  return (
    <div
      className="container mx-auto p-4 bg-base-100 text-base-content"
      dir="rtl"
    >
      <PageHeader
        title="البحث في آيات القرآن الكريم"
        subtitle="ابحث عن الآيات التي تحتوي على كلمة أو عبارة معيّنة من المصحف الشريف."
      />

      {!isOnline && (
        <div className="alert alert-warning mb-4">
          <span>⚠️</span>
          <span>الاتصال بالإنترنت مطلوب لاستخدام البحث.</span>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="أدخل كلمة أو عبارة للبحث في الآيات..."
          className="input input-bordered w-full font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="mb-4">
        <button
          className="btn btn-primary w-full"
          onClick={handleSearch}
          disabled={!isOnline || isSearching || !searchTerm.trim()}
        >
          {isSearching ? 'جاري البحث...' : 'ابحث في الآيات'}
        </button>
      </div>

      {noResultsFound && (
        <div className="alert alert-info mb-4">
          <span>لا توجد آيات مطابقة لعبارة البحث.</span>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4 text-right">
            {typeof totalCount === 'number'
              ? `تم العثور على ${totalCount} آية تحتوي على "${searchTerm.trim()}"`
              : `نتائج الآيات المطابقة لعبارة "${searchTerm.trim()}"`
            }
          </h2>

          {searchResults.map((result) => {
            const resultId = result.id;
            const selectedMadhab = selectedMadhabByResult[resultId] || '';
            const selectedTafsir = selectedTafsirByResult[resultId] || '';
            const tafsirList =
              selectedMadhab && tafsirsByMadhab[selectedMadhab]
                ? tafsirsByMadhab[selectedMadhab]
                : [];
            const loadingTafsir = !!tafsirLoadingByResult[resultId];
            const tafsirTexts = tafsirTextsByResult[resultId];
            const tafsirError = tafsirErrorByResult[resultId];
            const isExpanded = !!expandedResults[resultId];

            const selectedTafsirObj = tafsirList.find(
              (t) =>
                String(t.tafsir_number) === String(selectedTafsir)
            );
            const selectedTafsirName = selectedTafsirObj
              ? selectedTafsirObj.name
              : '';

            return (
              <div
                key={resultId}
                className="card bg-base-200 shadow-md mb-4 p-4"
              >
                <div className="card-body">
                  <h3 className="card-title">
                    سورة {result.sura_name} - الآية {result.ayah_number} (
                    {result.sura_number}:{result.ayah_number})
                  </h3>
                  <p
                    className="text-right mt-2 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(result.ayah_text),
                    }}
                  />

                  {/* Madhab & Tafsir selectors */}
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-col gap-2">
                      <select
                        className="select select-bordered w-full font-bold"
                        value={selectedMadhab}
                        onChange={(e) =>
                          handleResultMadhabChange(resultId, e.target.value)
                        }
                      >
                        <option value="" className="font-bold">
                          اختر مذهباً لعرض التفسير
                        </option>
                        {madhabs.map((madhab) => (
                          <option
                            key={madhab.madhab_number}
                            value={madhab.madhab_number}
                            className="font-bold"
                          >
                            {madhab.name}
                          </option>
                        ))}
                      </select>

                      <select
                        className="select select-bordered w-full font-bold"
                        value={selectedTafsir}
                        onChange={(e) =>
                          handleResultTafsirChange(resultId, e.target.value)
                        }
                        disabled={!selectedMadhab}
                      >
                        <option value="" className="font-bold">
                          اختر كتاب التفسير
                        </option>
                        {tafsirList.map((tafsir) => (
                          <option
                            key={tafsir.tafsir_number}
                            value={tafsir.tafsir_number}
                            className="font-bold"
                          >
                            {tafsir.name}{' '}
                            {tafsir.author_death
                              ? `(${tafsir.author_death} هجري)`
                              : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="btn btn-sm btn-primary w-full"
                      onClick={() => handleShowTafsirForResult(result)}
                      disabled={
                        !isOnline || !selectedTafsir || loadingTafsir
                      }
                    >
                      {loadingTafsir
                        ? 'جاري تحميل التفسير...'
                        : tafsirTexts
                        ? isExpanded
                          ? 'إخفاء التفسير'
                          : 'إظهار التفسير'
                        : 'عرض التفسير'}
                    </button>

                    {tafsirError && (
                      <p className="text-sm text-red-500 mt-1">
                        {tafsirError}
                      </p>
                    )}

                    {tafsirTexts && (
                      <div className="mt-2">
                        {tafsirTexts.length > 0 ? (
                          <>
                            <div className="flex justify-between items-center mb-2">
                              {selectedTafsirName && (
                                <span className="text-sm font-semibold">
                                  التفسير: {selectedTafsirName}
                                </span>
                              )}
                              <button
                                type="button"
                                className="btn btn-xs btn-ghost"
                                onClick={() => toggleExpandTafsir(resultId)}
                              >
                                {isExpanded ? 'إخفاء التفسير' : 'إظهار التفسير'}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="bg-base-100 rounded-lg p-3 border text-sm leading-relaxed max-h-80 overflow-y-auto">
                                {tafsirTexts.map((tt) => (
                                  <div
                                    key={tt.id}
                                    className="mb-3"
                                    dangerouslySetInnerHTML={{
                                      __html: tt.text,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-base-content/70 mt-1">
                            لا يوجد تفسير متاح لهذه الآية في هذا الكتاب.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="text-center my-4">
              <button
                className="btn btn-outline"
                onClick={loadMoreResults}
                disabled={isSearching}
              >
                {isSearching ? 'جاري التحميل...' : 'تحميل المزيد'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInQuran;
