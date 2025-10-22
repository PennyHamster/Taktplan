import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggleButton from './ThemeToggleButton';

describe('ThemeToggleButton', () => {
  it('renders the button with the correct text', () => {
    const toggleTheme = jest.fn();
    render(
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
        <ThemeToggleButton />
      </ThemeContext.Provider>
    );
    expect(screen.getByText('Switch to Dark Mode')).toBeInTheDocument();
  });

  it('calls the toggleTheme function when clicked', () => {
    const toggleTheme = jest.fn();
    render(
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
        <ThemeToggleButton />
      </ThemeContext.Provider>
    );
    fireEvent.click(screen.getByText('Switch to Dark Mode'));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});