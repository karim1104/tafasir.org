import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import SearchByBook from './SearchByBook';

const ayahs = [
  { ayah_number: 1, text: 'نص الآية الأولى' },
  { ayah_number: 2, text: 'نص الآية الثانية' },
];

const jsonResponse = (data) => Promise.resolve({
  ok: true,
  json: async () => data,
});

const mockApi = (request) => {
  const url = String(request);

  if (url === '/api/suras') {
    return jsonResponse([{ sura_number: 1, name: 'الفاتحة' }]);
  }
  if (url === '/api/madhabs') {
    return jsonResponse([{ madhab_number: 3, name: 'المذهب' }]);
  }
  if (url === '/api/tafsirs/count?madhab_number=3') {
    return jsonResponse(1);
  }
  if (url === '/api/tafsirs?madhab_numbers=3') {
    return jsonResponse([
      {
        tafsir_number: 10,
        name: 'كتاب التفسير',
        description: 'وصف الكتاب',
      },
    ]);
  }
  if (url === '/api/ayahs/1') {
    return jsonResponse(ayahs);
  }

  const ayahMatch = url.match(/^\/api\/ayah\/1\/(\d+)$/);
  if (ayahMatch) {
    const ayahNumber = Number(ayahMatch[1]);
    return jsonResponse({
      ayah_number: ayahNumber,
      text: `نص الآية ${ayahNumber}`,
    });
  }

  const tafsirMatch = url.match(
    /^\/api\/tafsir_texts\/1\/(\d+)\?tafsir_numbers=10$/
  );
  if (tafsirMatch) {
    return jsonResponse([
      {
        id: Number(tafsirMatch[1]),
        text: `تفسير الآية ${tafsirMatch[1]}`,
      },
    ]);
  }

  return Promise.reject(new Error(`Unexpected API request: ${url}`));
};

const LocationSearch = () => {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
};

const renderSearchByBook = () => render(
  <MemoryRouter
    initialEntries={[
      '/search-by-book?madhab=3&tafsir=10&sura=1&ayah=1',
    ]}
  >
    <SearchByBook />
    <LocationSearch />
  </MemoryRouter>
);

beforeEach(() => {
  global.fetch = jest.fn(mockApi);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('restores a complete selection and result from the URL', async () => {
  renderSearchByBook();

  expect(await screen.findByText('تفسير الآية 1')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByLabelText('اختر المذهب')).toHaveValue('3');
    expect(screen.getByLabelText('اختر كتاب التفسير')).toHaveValue('10');
    expect(screen.getByLabelText('اختر السورة')).toHaveValue('1');
    expect(screen.getByLabelText('اختر الآية')).toHaveValue('1');
  });
});

test('loads the next ayah without changing the madhab or tafsir', async () => {
  renderSearchByBook();

  expect(await screen.findByText('تفسير الآية 1')).toBeInTheDocument();
  const nextButtons = screen.getAllByRole('button', { name: 'الآية التالية' });
  await waitFor(() => expect(nextButtons[0]).toBeEnabled());

  fireEvent.click(nextButtons[0]);

  expect(await screen.findByText('تفسير الآية 2')).toBeInTheDocument();
  expect(screen.getByLabelText('اختر المذهب')).toHaveValue('3');
  expect(screen.getByLabelText('اختر كتاب التفسير')).toHaveValue('10');
  expect(screen.getByLabelText('اختر الآية')).toHaveValue('2');
  expect(screen.getByTestId('location-search')).toHaveTextContent(
    '?madhab=3&tafsir=10&sura=1&ayah=2'
  );
});
