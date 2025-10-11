import { render, screen } from '@testing-library/react';
import App from './App';

test('renders In Bearbeitung column', () => {
  render(<App />);
  const linkElement = screen.getByText(/In Bearbeitung/i);
  expect(linkElement).toBeInTheDocument();
});