// SearchInTafsir.js
import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';

const API_BASE_URL = '/api';

function SearchInTafsir() {
  const [madhabs, setMadhabs] = useState([]);
  const [tafsirs, setTafsirs] = useState([]);
  const [allTafsirs, setAllTafsirs] = useState([]);
  const [selectedMadhab, setSelectedMadhab] = useState('');
  const [selectedTafsir, setSelectedTafsir] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expandedResults, setExpandedResults] = useState({});
  const [totalCount, setTotalCount] = useState(null);

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

  // Fetch madhabs with counts
  useEffect(() => {
    if (isOnline) {
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
                  console.error('Error fetching tafsir count for madhab:', error);
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

  // Fetch all tafsirs when "all madhabs" is selected
  useEffect(() => {
    if (isOnline && selectedMadhab === 'all') {
      const fetchAllTafsirs = async () => {
        try {
          const allTafsirsList = [];
          for (const madhab of madhabs) {
            const response = await fetch(
              `${API_BASE_URL}/tafsirs?madhab_numbers=${madhab.madhab_number}`
            );
            const data = await response.json();
            if (data && Array.isArray(data)) {
              allTafsirsList.push(...data);
            }
          }
          setTafsirs(allTafsirsList);
          setAllTafsirs(allTafsirsList);
        } catch (error) {
          console.error('Error fetching all tafsirs:', error);
        }
      };

      fetchAllTafsirs();
    }
  }, [selectedMadhab, madhabs, isOnline]);

  // Fetch tafsirs for a specific madhab
  useEffect(() => {
    if (isOnline && selectedMadhab && selectedMadhab !== 'all') {
      fetch(`${API_BASE_URL}/tafsirs?madhab_numbers=${selectedMadhab}`)
        .then((response) => response.json())
        .then((data) => {
          setTafsirs(data);
          setSelectedTafsir('');
        })
        .catch((error) => console.error('Error fetching tafsirs:', error));
    }
  }, [selectedMadhab, isOnline]);

  const handleSearch = () => {
    if (!searchTerm.trim() || (!selectedTafsir && selectedTafsir !== 'all')) {
      return;
    }

    setIsSearching(true);
    setNoResultsFound(false);
    setSearchResults([]);
    setPage(1);
    setExpandedResults({});
    setTotalCount(null);

    performSearch(1);
  };

  const performSearch = (pageNumber) => {
    let tafsirNumbers;

    if (selectedTafsir === 'all') {
      tafsirNumbers = tafsirs.map((t) => t.tafsir_number).join(',');
    } else {
      tafsirNumbers = selectedTafsir;
    }

    const params = new URLSearchParams({
      search_term: searchTerm.trim(),
      tafsir_numbers: tafsirNumbers,
      page: String(pageNumber),
      limit: '10',
    });

    fetch(`${API_BASE_URL}/search_tafsir?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        if (pageNumber === 1) {
          setSearchResults(data.results);
        } else {
          setSearchResults((prev) => [...prev, ...data.results]);
        }
        setHasMore(data.has_more);
        setNoResultsFound(pageNumber === 1 && data.results.length === 0);
        setIsSearching(false);
        if (typeof data.total_count === 'number') {
          setTotalCount(data.total_count);
        }
      })
      .catch((error) => {
        console.error('Error searching tafsirs:', error);
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

  const toggleExpand = (resultId) => {
    setExpandedResults((prev) => ({
      ...prev,
      [resultId]: !prev[resultId],
    }));
  };

  const extractSnippet = (text, term) => {
    if (!term || !text) return text;

    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);

    if (index === -1) return text;

    let start = Math.max(0, index - 100);
    let end = Math.min(text.length, index + term.length + 100);

    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';

    return prefix + text.substring(start, end) + suffix;
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

  const handleMadhabChange = (e) => {
    const value = e.target.value;
    setSelectedMadhab(value);
    setSelectedTafsir('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      className="container mx-auto p-4 bg-base-100 text-base-content"
      dir="rtl"
    >
      <PageHeader
        title="البحث في نصوص التفاسير"
        subtitle="اكتب كلمة أو عبارة، ثم اختر المذهب وكتاب التفسير (أو جميع الكتب) لعرض المقاطع المطابقة."
      />

      {!isOnline && (
        <div className="alert alert-warning mb-4">
          <span>⚠️</span>
          <span>الاتصال بالإنترنت مطلوب لاستخدام هذه الصفحة.</span>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="أدخل كلمة البحث في نصوص التفاسير..."
          className="input input-bordered w-full font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="mb-4">
        <select
          className="select select-bordered w-full font-bold"
          onChange={handleMadhabChange}
          value={selectedMadhab}
        >
          <option value="" className="font-bold">
            اختر مذهب
          </option>
          <option value="all" className="font-bold">
            جميع المذاهب (قد يستغرق بضع ثوانٍ)
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

      {selectedMadhab && tafsirs.length > 0 && (
        <div className="mb-4">
          <select
            className="select select-bordered w-full font-bold"
            onChange={(e) => setSelectedTafsir(e.target.value)}
            value={selectedTafsir}
          >
            <option value="" className="font-bold">
              اختر كتاب التفسير
            </option>
            <option value="all" className="font-bold">
              جميع كتب التفسير (قد يستغرق بضع ثوانٍ)
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
      )}

      <div className="mb-4">
        <button
          className="btn btn-primary w-full"
          onClick={handleSearch}
          disabled={
            !isOnline ||
            isSearching ||
            !searchTerm.trim() ||
            (!selectedTafsir && selectedTafsir !== 'all')
          }
        >
          {isSearching ? 'جاري البحث...' : 'ابحث في التفاسير'}
        </button>
      </div>

      {noResultsFound && (
        <div className="alert alert-info mb-4">
          <span>لا توجد نتائج مطابقة لعبارة البحث.</span>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4 text-right">
            {typeof totalCount === 'number'
              ? `عدد المقاطع المطابقة: ${totalCount}`
              : 'المقاطع المطابقة لعبارة البحث'}
          </h2>

          {searchResults.map((result, index) => (
            <div
              key={index}
              className="card bg-base-200 shadow-md mb-4 p-4"
            >
              <div className="card-body">
                <h3 className="card-title">
                  سورة {result.sura_name} - الآية {result.ayah_number}
                </h3>
                <p className="text-right mb-2">{result.ayah_text}</p>
                <h4 className="font-bold mt-2">
                  {result.tafsir_name} - {result.author}
                </h4>

                <div className="text-right mt-2">
                  <div
                    className="text-right"
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(
                        expandedResults[result.id]
                          ? result.text
                          : extractSnippet(result.text, searchTerm)
                      ),
                    }}
                  />
                  <button
                    className="btn btn-sm btn-ghost mt-2"
                    onClick={() => toggleExpand(result.id)}
                  >
                    {expandedResults[result.id] ? 'عرض أقل' : 'عرض المزيد'}
                  </button>
                </div>
              </div>
            </div>
          ))}

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

export default SearchInTafsir;
