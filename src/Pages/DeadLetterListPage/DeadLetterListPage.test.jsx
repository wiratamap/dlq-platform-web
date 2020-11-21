import React from 'react';
import { render, screen } from '@testing-library/react';
import { when } from 'jest-when';
import axios from 'axios';
import { API_RESOURCE } from '../../Configurations/url';
import { DEAD_LETTERS } from '../../Fixtures/deadLetter';
import DeadLetterListPage from './DeadLetterListPage';

jest.mock('axios');

describe('DeadLetterListPage', () => {
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

  it('should render table with proper data', async () => {
    render(<DeadLetterListPage />);
    const [firstDeadLetter] = DEAD_LETTERS;
    const { eventId: firstEventId } = JSON.parse(firstDeadLetter.originalMessage);

    const originalMessage = await screen.findByTestId(`original-message-${firstEventId}`);
    const reason = screen.getByText(/Source account with CIF acc44 not found/);
    const originTopic = screen.getByText(/EVENT_TOP_UP_REQUEST/);

    expect(originTopic).toBeInTheDocument();
    expect(originalMessage).toBeInTheDocument();
    expect(reason).toBeInTheDocument();
  });
});
