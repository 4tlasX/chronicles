import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { RecoverView } from '@/views/RecoverView';
import { renderWithTheme } from '../testUtils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => mockNavigate),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
  })),
}));

vi.mock('@/contexts/EncryptionContext', () => ({
  useEncryption: vi.fn(() => ({
    unlockWithRecoveryKey: vi.fn(),
    rewrapMasterKey: vi.fn().mockResolvedValue({ salt: 's', wrappedMK: 'w', wrapIv: 'iv' }),
  })),
}));

vi.mock('@/services/api', () => ({
  auth: {
    getRecoveryParams: vi.fn().mockResolvedValue({
      recoveryWrappedMK: 'rwmk',
      recoveryWrapIv: 'rwiv',
    }),
    recover: vi.fn(),
  },
}));

vi.mock('@/components/templates/AuthTemplate', () => ({
  AuthTemplate: ({ title, children, footer }: any) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="auth-body">{children}</div>
      {footer && <div data-testid="auth-footer">{footer}</div>}
    </div>
  ),
}));

vi.mock('@/components/atoms/TextInput', () => ({
  TextInput: (props: any) => <input {...props} />,
}));

vi.mock('@/components/atoms/PasswordInput', () => ({
  PasswordInput: (props: any) => <input type="password" {...props} />,
}));

vi.mock('@/components/atoms/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/atoms/Spinner', () => ({
  Spinner: () => <span data-testid="spinner">Loading...</span>,
}));

vi.mock('@/components/atoms/AuthForm', () => ({
  AuthForm: ({ children, onSubmit }: any) => <form onSubmit={onSubmit}>{children}</form>,
}));

vi.mock('@/components/atoms/ErrorBanner', () => ({
  ErrorBanner: ({ children }: any) => <div data-testid="error-banner">{children}</div>,
}));

vi.mock('@/components/molecules/FormField', () => ({
  FormField: ({ label, children }: any) => (
    <div>
      <label>{label}</label>
      {children}
    </div>
  ),
}));

describe('RecoverView', () => {
  it('renders without crashing', () => {
    renderWithTheme(<RecoverView />);
    expect(screen.getByText('Recover Account')).toBeInTheDocument();
  });

  it('starts on the email step', () => {
    renderWithTheme(<RecoverView />);
    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders Continue button on email step', () => {
    renderWithTheme(<RecoverView />);
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('renders footer with link to login', () => {
    renderWithTheme(<RecoverView />);
    const link = screen.getByRole('link', { name: 'Sign in' });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('shows email input that can be typed into', () => {
    renderWithTheme(<RecoverView />);
    const input = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(input, { target: { value: 'test@test.com' } });
    expect(input).toHaveValue('test@test.com');
  });

  it('does not show recovery key or password fields on initial render', () => {
    renderWithTheme(<RecoverView />);
    expect(screen.queryByText('Recovery Key')).not.toBeInTheDocument();
    expect(screen.queryByText('New Password')).not.toBeInTheDocument();
  });
});
