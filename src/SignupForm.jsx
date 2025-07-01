import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase/config';

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) return 'Password must be at least 8 characters';
  if (!hasUpperCase) return 'Password must contain an uppercase letter';
  if (!hasLowerCase) return 'Password must contain a lowercase letter';
  if (!hasNumbers) return 'Password must contain a number';
  if (!hasSpecialChar) return 'Password must contain a special character';
  
  return null;
};

export default function SignupForm({ onSignup, onSwitchToLogin, error: propError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(propError || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!confirmPassword) {
      setError('Confirm password is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await onSignup({ email, password });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-center">
      <div className="auth-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <div className="auth-buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>

          </div>
          {error && <div className="error">{error}</div>}
        </form>
        <p>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="link-btn">Login</button>
        </p>
      </div>
    </div>
  );
}