import React from 'react';
import { render, screen } from '@testing-library/react';
import { when } from 'jest-when';
import axios from 'axios';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
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
    const reOrchestrateButton = screen.getByTestId(`re-orchestrate-button-${firstDeadLetter.id}`);
    const deleteButton = screen.getByTestId(`delete-button-${firstDeadLetter.id}`);

    expect(originTopic).toBeInTheDocument();
    expect(originalMessage).toBeInTheDocument();
    expect(reason).toBeInTheDocument();
    expect(reOrchestrateButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call axios delete with DELETE deleteAction when delete button is clicked', async () => {
    render(<DeadLetterListPage />);
    const [firstDeadLetter] = DEAD_LETTERS;
    const reOrchestrateButton = await screen.findByTestId(`delete-button-${firstDeadLetter.id}`);
    const expectedRequestBody = {
      data: {
        deleteAction: 'DELETE'
      }
    };

    await act(async () => userEvent.click(reOrchestrateButton));

    expect(axios.delete).toHaveBeenCalledWith(`${API_RESOURCE.DEAD_LETTERS}/${firstDeadLetter.id}`, expectedRequestBody);
  });

  it('should call axios delete with SEND_TO_ORIGIN_TOPIC deleteAction when re orhcestrate button is clicked', async () => {
    render(<DeadLetterListPage />);
    const [firstDeadLetter] = DEAD_LETTERS;
    const reOrchestrateButton = await screen.findByTestId(`re-orchestrate-button-${firstDeadLetter.id}`);
    const expectedRequestBody = {
      data: {
        deleteAction: 'SEND_TO_ORIGIN_TOPIC'
      }
    };

    await act(async () => userEvent.click(reOrchestrateButton));

    expect(axios.delete).toHaveBeenCalledWith(`${API_RESOURCE.DEAD_LETTERS}/${firstDeadLetter.id}`, expectedRequestBody);
  });
});
