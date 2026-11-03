import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createWebSocket } from '../services/api';
import WebSocketTester from './WebSocketTester';

jest.mock('../services/api', () => ({ createWebSocket: jest.fn() }));

function fakeSocket() {
  return { close: jest.fn(), send: jest.fn() };
}

test('late events from a replaced socket do not change connection state', () => {
  const first = fakeSocket();
  const second = fakeSocket();
  createWebSocket.mockReturnValueOnce(first).mockReturnValueOnce(second);

  render(<WebSocketTester />);
  fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
  fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
  expect(first.close).toHaveBeenCalled();

  act(() => first.onopen());
  expect(screen.getByText('Disconnected')).toBeTruthy();

  act(() => second.onopen());
  expect(screen.getByText('Connected', { selector: 'span' })).toBeTruthy();

  act(() => first.onclose());
  expect(screen.getByText('Connected', { selector: 'span' })).toBeTruthy();
});
