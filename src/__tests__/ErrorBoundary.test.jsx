import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';
import { vi } from 'vitest';

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    console.error.mockClear();
  });

  const ThrowError = () => {
    throw new Error('Test error');
  };

  it('renders children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(container).toHaveTextContent('Test Content');
  });

  it('renders error UI when there is an error', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container).toHaveTextContent('Something went wrong');
    expect(container).toHaveTextContent('Test error');
  });

  it('provides error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container).toHaveTextContent('Test error');
    expect(container).toHaveTextContent('Stack trace:');

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('applies error styles', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass('error-container');
  });

  it('handles multiple errors', () => {
    const MultipleErrors = () => {
      throw new Error('Multiple errors test');
    };

    const { container, rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container).toHaveTextContent('Test error');

    rerender(
      <ErrorBoundary>
        <MultipleErrors />
      </ErrorBoundary>
    );

    expect(container).toHaveTextContent('Multiple errors test');
    expect(container).toHaveTextContent('Something went wrong');
  });
});