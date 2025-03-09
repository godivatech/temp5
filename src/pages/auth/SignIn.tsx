
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FirebaseError } from 'firebase/app';
import { AlertCircle } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNetworkError(false);

    try {
      // Check network connectivity
      if (!navigator.onLine) {
        setNetworkError(true);
        toast.error('No internet connection. Please check your network and try again.');
        setIsLoading(false);
        return;
      }

      await login(email, password);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      
      if (error instanceof FirebaseError) {
        switch(error.code) {
          case 'auth/invalid-credential':
            toast.error('Invalid email or password');
            break;
          case 'auth/user-not-found':
            toast.error('User not found');
            break;
          case 'auth/wrong-password':
            toast.error('Incorrect password');
            break;
          case 'auth/too-many-requests':
            toast.error('Too many failed login attempts. Please try again later');
            break;
          default:
            toast.error('Failed to sign in. Please try again');
        }
      } else {
        // Handle network or other errors
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        
        if (errorMessage.includes('offline') || errorMessage.includes('network')) {
          setNetworkError(true);
          toast.error('Network error. Please check your internet connection and try again.');
        } else {
          toast.error('An unexpected error occurred');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {networkError && (
              <div className="bg-yellow-50 p-3 rounded-md flex items-center gap-2 text-yellow-800 border border-yellow-200">
                <AlertCircle size={18} />
                <p className="text-sm">No connection to Firebase. Please check your internet connection.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              variant={isLoading ? "secondary" : "default"}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignIn;
