import { render, screen } from '@testing-library/react';
import App from './App';

const originalOnlineStatus = navigator.onLine;

beforeEach(() => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: false,
  });
});

afterEach(() => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: originalOnlineStatus,
  });
});

test('renders the main tafsir search page', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: 'التفسير حسب السورة والآية' })
  ).toBeInTheDocument();
});
