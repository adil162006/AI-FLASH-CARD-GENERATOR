import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import FlashcardGenerator from './FlashcardGenerator';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="center">Loading...</div>;

  const handleAuthRequired = () => {
    if (!user) {
      setShowAuth(true);
    }
  };

  if (showAuth && !user) {
    return showSignup ? (
      <SignupForm 
        onSwitchToLogin={() => setShowSignup(false)} 
        onCancel={() => setShowAuth(false)}
      />
    ) : (
      <LoginForm 
        onSwitchToSignup={() => setShowSignup(true)} 
        onCancel={() => setShowAuth(false)}
      />
    );
  }

  return (
    <ErrorBoundary>
      <FlashcardGenerator 
        user={user} 
        onLogout={() => signOut(auth)} 
        onAuthRequired={handleAuthRequired}
      />
    </ErrorBoundary>
  );
}

export default App;
