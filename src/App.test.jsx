import React from 'react';
import { render, screen } from '@testing-library/react';
import { when } from 'jest-when';
import axios from 'axios';
import App from './App';
import { API_RESOURCE } from './Configurations/url';
import { DEAD_LETTERS } from './Fixtures/deadLetter';

jest.mock('axios');

describe('App', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    });

    when(axios.get)
      .calledWith(API_RESOURCE.DEAD_LETTERS)
      .mockReturnValue({ data: DEAD_LETTERS });
  });

  it('should render learn react text', async () => {
    render(<App />);

    const deadLetterListPage = await screen.findByTestId('dead-letter-list-page');

    expect(deadLetterListPage).toBeInTheDocument();
  });
});
