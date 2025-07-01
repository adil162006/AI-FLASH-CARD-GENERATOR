import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import { vi } from 'vitest';

describe('LoginForm', () => {
  const mockOnLogin = vi.fn();
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToSignup={mockOnSwitchToSignup} 
      />
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates empty fields', async () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToSignup={mockOnSwitchToSignup} 
      />
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToSignup={mockOnSwitchToSignup} 
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToSignup={mockOnSwitchToSignup} 
      />
    );

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin with correct credentials', async () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToSignup={mockOnSwitchToSignup} 
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('switches to signup form', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToSignup={mockOnSwitchToSignup} 
      />
    );

    const signupLink = screen.getByText(/sign up/i);
    fireEvent.click(signupLink);

    expect(mockOnSwitchToSignup).toHaveBeenCalled();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid credentials';
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToSignup={mockOnSwitchToSignup}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});