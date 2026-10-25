import { screen, userEvent } from '@testing-library/react-native';

import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PersonalInfoScreen } from './PersonalInfoScreen';

describe('PersonalInfoScreen (perfil de usuario)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows name, email and phone', async () => {
    mockApi([
      {
        path: '/api/v1/users/me',
        data: { id: 'u1', email: 'ana@mail.com', fullName: 'Ana Pérez', phone: '3001234567' },
      },
    ]);

    await renderWithProviders(<PersonalInfoScreen onEdit={jest.fn()} />);

    expect(await screen.findAllByText('Ana Pérez')).toHaveLength(2); // header + detail row
    expect(screen.getAllByText('ana@mail.com')).toHaveLength(2);
    expect(screen.getByText('3001234567')).toBeOnTheScreen();
  });

  it('shows a placeholder when the name or the phone are not set yet', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);

    await renderWithProviders(<PersonalInfoScreen onEdit={jest.fn()} />);

    expect(await screen.findAllByText('Sin nombre')).toHaveLength(2); // header + detail row
    expect(screen.getByText('Sin celular')).toBeOnTheScreen();
  });

  it('opens the edit screen', async () => {
    mockApi([{ path: '/api/v1/users/me', data: { id: 'u1', email: 'ana@mail.com', fullName: null, phone: null } }]);
    const onEdit = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<PersonalInfoScreen onEdit={onEdit} />);

    await user.press(await screen.findByRole('button', { name: 'Editar' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
