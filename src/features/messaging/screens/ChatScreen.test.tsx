import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { acceptedWalk } from '@/test/fixtures';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { ChatScreen } from './ChatScreen';

const messages = [
  { id: 'm1', sentBy: 'Owner', text: '¿Ya llegaste?', sentAt: '2026-09-30T15:00:00+00:00' },
  { id: 'm2', sentBy: 'Walker', text: 'Estoy en la portería', sentAt: '2026-09-30T15:01:00+00:00' },
];

describe('ChatScreen (RF-013)', () => {
  let fetchSpy: jest.SpyInstance;

  afterEach(() => fetchSpy.mockRestore());

  it('shows the conversation, telling my messages from the other person', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { path: '/api/v1/walks/walk-1/messages', data: messages },
    ]);

    await renderWithProviders(<ChatScreen walkId="walk-1" viewer="Owner" />);

    expect(await screen.findByLabelText(/^Tú, \d{1,2}:\d{2}: ¿Ya llegaste\?$/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Paseador, \d{1,2}:\d{2}: Estoy en la portería$/)).toBeOnTheScreen();
  });

  it('sends a message and clears the box', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { path: '/api/v1/walks/walk-1/messages', data: [] },
      {
        method: 'POST',
        path: '/api/v1/walks/walk-1/messages',
        data: { id: 'm3', sentBy: 'Walker', text: 'Voy subiendo', sentAt: '2026-09-30T15:02:00+00:00' },
      },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<ChatScreen walkId="walk-1" viewer="Walker" />);

    await user.type(await screen.findByLabelText('Escribe un mensaje'), 'Voy subiendo');
    await user.press(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => {
      const post = fetchSpy.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST');
      expect(JSON.parse(String((post![1] as RequestInit).body))).toEqual({ text: 'Voy subiendo' });
    });
    expect(screen.getByLabelText('Escribe un mensaje')).toHaveDisplayValue('');
  });

  it('is read only once the walk is over', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: { ...acceptedWalk, status: 'Completed' } },
      { path: '/api/v1/walks/walk-1/messages', data: messages },
    ]);

    await renderWithProviders(<ChatScreen walkId="walk-1" viewer="Owner" />);

    expect(await screen.findByText('El paseo terminó. El chat queda solo para leer.')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Escribe un mensaje')).not.toBeOnTheScreen();
  });

  it('suggests coordinating the pickup when there are no messages yet', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { path: '/api/v1/walks/walk-1/messages', data: [] },
    ]);

    await renderWithProviders(<ChatScreen walkId="walk-1" viewer="Owner" />);

    expect(await screen.findByRole('header', { name: 'Coordina la recogida' })).toBeOnTheScreen();
  });

  it('keeps the text and offers to retry when a message was not sent', async () => {
    fetchSpy = mockApi([
      { path: '/api/v1/walks/walk-1', data: acceptedWalk },
      { path: '/api/v1/walks/walk-1/messages', data: [] },
    ]);
    const user = userEvent.setup();
    await renderWithProviders(<ChatScreen walkId="walk-1" viewer="Owner" />);

    await user.type(await screen.findByLabelText('Escribe un mensaje'), 'Voy subiendo');
    await user.press(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('No se envió.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Escribe un mensaje')).toHaveDisplayValue('Voy subiendo');
  });
});
