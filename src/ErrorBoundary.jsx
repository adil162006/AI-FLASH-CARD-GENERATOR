import { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      timestamp: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console with detailed information
    console.error('Error caught by boundary:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      location: window.location.href,
      userAgent: navigator.userAgent
    });

    this.setState({
      errorInfo,
      timestamp: new Date().toISOString()
    });

    // Here you could send error reports to your error tracking service
    // if (process.env.NODE_ENV === 'production') {
    //   sendErrorToTrackingService(error, errorInfo);
    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops! Something went wrong</h2>
          <p className="error-message">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="error-actions">
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                this.props.children.props.onReset?.();
              }}
              className="retry-button"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="reload-button"
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Technical Details</summary>
              <pre>
                {this.state.error?.stack}
                {this.state.errorInfo?.componentStack}
                {this.state.timestamp && `\nTimestamp: ${this.state.timestamp}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;