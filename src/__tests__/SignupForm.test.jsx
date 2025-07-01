import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupForm from '../SignupForm';
import { vi } from 'vitest';

describe('SignupForm', () => {
  const mockOnSignup = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form', () => {
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin} 
      />
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('validates empty fields', async () => {
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin} 
      />
    );

    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });

    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin} 
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin} 
      />
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });

    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it('validates password match', async () => {
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin} 
      />
    );

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

    const signupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockOnSignup).not.toHaveBeenCalled();
  });

  it('calls onSignup with correct credentials when passwords match', async () => {
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin} 
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const signupButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(mockOnSignup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('switches to login form', () => {
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin} 
      />
    );

    const loginLink = screen.getByText(/login/i);
    fireEvent.click(loginLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Email already in use';
    render(
      <SignupForm 
        onSignup={mockOnSignup} 
        onSwitchToLogin={mockOnSwitchToLogin}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});