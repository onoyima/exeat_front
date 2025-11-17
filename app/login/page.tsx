'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '@/lib/services/authApi';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/lib/services/authSlice';

// Login form schema
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .regex(/.veritas\.edu\.ng$/, 'Email must end with .veritas.edu.ng'),
  password: z.string()
    .min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * LoginPage component renders the login form and handles API-based authentication.
 */
export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values).unwrap();

      // Store credentials in Redux
      dispatch(setCredentials(response));

      // Show success message
      toast({
        title: "Success",
        description: response.message || "Login successful! Redirecting...",
      });

      // Redirect based on role
      const role = response.role.toLowerCase();

      if (role === "student") {
        router.push("/student/dashboard");
      } else {
        // All non-student roles go to staff dashboard
        router.push("/staff/dashboard");
      }
    } catch (error: any) {
      // Handle different error types
      const errorMessage = error.data?.message || error.message || "Login failed. Please try again.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Check authentication status on mount
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        const role = userData.role?.toLowerCase();
        if (role === 'student') {
          router.push('/student/dashboard');
        } else if (role) {
          // All non-student roles go to staff dashboard
          router.push('/staff/dashboard');
        } else {
          // Invalid role, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // Invalid user data in localStorage, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Show loading overlay while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Background Pattern for visual appeal */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 gradient-bg"></div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23114629' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Loading Card */}
        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* University Logo */}
            <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Veritas University Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-university-primary">Veritas University</CardTitle>
              <CardDescription className="text-gray-600">Checking authentication...</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // Center the login card on the page
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-university-light">
      {/* Background Pattern for visual appeal */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 max-h-screen overflow-hidden">
        <div className="absolute inset-0 gradient-bg"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23114629' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")`
          }}
        />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* University Logo */}
          <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Veritas University Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-university-primary">Veritas University</CardTitle>
            <CardDescription className="text-lg font-medium text-university-primary mt-2">
              Digital Exeat System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form error messages will be shown inline */}

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Username Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address or Matric Number
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter Your Email"
                {...form.register('email')}
                className={`h-12 border-2 ${form.formState.errors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:border-university-primary'
                  }`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Students: e.g: vug/coc/23/1232@hd.veritas.edu.ng <br />
                Staff: e.g: surnameb@veritas.edu.ng
              </p>
            </div>

            {/* Password Input with show/hide toggle */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...form.register('password')}
                  className={`h-12 border-2 pr-12 ${form.formState.errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 focus:border-university-primary'
                    }`}
                  autoComplete="current-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {/* Button to toggle password visibility */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || (form.formState.isSubmitted && !form.formState.isValid)}
              className="w-full h-12 gradient-bg text-white font-semibold text-base hover:opacity-90 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  {/* Loading spinner */}
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Additional Links and Support Info */}
          <div className="text-center space-y-3 pt-4 border-t">
            {/* <Button variant="ghost" className="text-university-primary hover:text-university-secondary">
              Forgot Password?
            </Button> */}
            {/* <div className="text-xs text-gray-500 space-y-1">
              <p>Having trouble logging in?</p>
              <p>Email: support@veritas.edu.ng | Phone: +234 XXX XXX XXXX</p>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}