import { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Shield } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    college_id: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      toast.success('Login successful!');
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      toast.success('Registration successful!');
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { email: 'student1@demo.edu', password: 'password123', role: 'student', label: 'Student Demo', icon: GraduationCap },
    { email: 'club1@demo.edu', password: 'password123', role: 'club', label: 'Club Demo', icon: Users },
    { email: 'admin@demo.edu', password: 'password123', role: 'admin', label: 'Admin Demo', icon: Shield }
  ];

  const quickLogin = async (account) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { email: account.email, password: account.password });
      toast.success(`Logged in as ${account.label}`);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      toast.error('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 noise-texture">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary/10 via-background to-accent/10"
      >
        <img
          src="https://images.pexels.com/photos/34840277/pexels-photo-34840277.jpeg"
          alt="Campus"
          className="rounded-2xl shadow-2xl w-full max-w-md object-cover aspect-[4/3] mb-8"
        />
        <div className="text-center max-w-md">
          <h1 className="font-heading text-5xl font-bold tracking-tight mb-4 text-foreground">
            Smart College Connect
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Your all-in-one platform for campus life. Stay updated with events, notices, and connect with clubs.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">Smart College Connect</h1>
            <p className="text-muted-foreground">Demo College Platform</p>
          </div>

          <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="student1@demo.edu"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="login-submit-btn"
                  className="w-full rounded-full font-medium tracking-wide hover:scale-105 transition-transform active:scale-95"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="mt-8">
                <p className="text-sm text-muted-foreground text-center mb-4">Quick Demo Access</p>
                <div className="grid grid-cols-3 gap-3">
                  {quickLogins.map((account, idx) => (
                    <Button
                      key={idx}
                      data-testid={`quick-login-${account.role}-btn`}
                      variant="outline"
                      onClick={() => quickLogin(account)}
                      disabled={loading}
                      className="flex flex-col items-center gap-2 h-auto py-4 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <account.icon className="w-5 h-5" />
                      <span className="text-xs">{account.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    data-testid="register-name-input"
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    data-testid="register-email-input"
                    type="email"
                    placeholder="your.email@demo.edu"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    data-testid="register-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role">Role</Label>
                  <select
                    id="register-role"
                    data-testid="register-role-select"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="student">Student</option>
                    <option value="club">Club/Department</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {registerData.role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="register-college-id">College ID</Label>
                    <Input
                      id="register-college-id"
                      data-testid="register-college-id-input"
                      placeholder="DC2024001"
                      value={registerData.college_id}
                      onChange={(e) => setRegisterData({ ...registerData, college_id: e.target.value })}
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  data-testid="register-submit-btn"
                  className="w-full rounded-full font-medium tracking-wide hover:scale-105 transition-transform active:scale-95"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Register'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
