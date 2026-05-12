import AuthScreen from './src/features/auth/screens/AuthScreen';
import {useEffect} from 'react';
import {configureGoogleSignIn} from './src/features/auth/lib/google';

export default function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return <AuthScreen />;
}
