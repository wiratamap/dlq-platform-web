import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import axios from 'axios';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { message } from 'antd';
import { API_RESOURCE } from '../../Configurations/url';
import { DEAD_LETTERS } from '../../Fixtures/deadLetter';
import DeadLetterListPage from './DeadLetterListPage';

jest
  .mock('axios')
  .mock('antd/lib/message');

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

  afterEach(() => {
    jest.clearAllMocks();
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

  it('should show error message when something went wrong when try to fetch dead letters', async () => {
    when(axios.get)
      .calledWith(API_RESOURCE.DEAD_LETTERS)
      .mockRejectedValue(new Error());
    await waitFor(() => render(<DeadLetterListPage />));

    expect(message.error).toHaveBeenCalledWith('Something went wrong when try to fetch dead letters');
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
    expect(message.success).toHaveBeenCalledWith(`Success to delete message with id ${firstDeadLetter.id}`);
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
    expect(message.success).toHaveBeenCalledWith(`Success to re-orchestrate message with id ${firstDeadLetter.id}`);
  });

  it('should show error message when try to take an action to specific dead letter message', async () => {
    axios.delete.mockRejectedValue(new Error());
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
    expect(message.error).toHaveBeenCalledWith(`Failed to take an action on message ${firstDeadLetter.id}, please try again!`);
  });

  it('should render dead letters with searched event id when user search with event id filter criteria', async () => {
    const [firstDeadLetter] = DEAD_LETTERS;
    const { eventId: firstEventId } = JSON.parse(firstDeadLetter.originalMessage);
    when(axios.get)
      .calledWith(`${API_RESOURCE.DEAD_LETTERS}?eventId=${firstEventId}`)
      .mockReturnValue({ data: [firstDeadLetter] });
    render(<DeadLetterListPage />);
    const searchInput = await screen.findByPlaceholderText(/search by event id/i);

    userEvent.type(searchInput, firstEventId);
    userEvent.type(searchInput, '{enter}');

    const reason = await screen.findByText(/Source account with CIF acc44 not found/);
    const originTopic = screen.getByText(/EVENT_TOP_UP_REQUEST/);
    expect(reason).toBeInTheDocument();
    expect(originTopic).toBeInTheDocument();
  });
});
