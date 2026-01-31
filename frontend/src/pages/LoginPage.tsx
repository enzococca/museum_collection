import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AlertCircle, Landmark, Archive, Camera, Search, Users, BookOpen, Globe } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Archive, title: 'Collection Management', description: 'Catalog and organize artifacts with detailed metadata' },
    { icon: Camera, title: 'Media Library', description: 'High-resolution images with annotation tools' },
    { icon: Search, title: 'Advanced Search', description: 'Powerful filters and full-text search' },
    { icon: Users, title: 'Collaboration', description: 'Role-based access for teams' },
  ];

  const collections = [
    { name: 'Government Museum Chennai', items: '~300 objects' },
    { name: 'British Museum London', items: '~555 objects' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-bronze-900 via-bronze-800 to-primary-900" />

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="museumGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.3"/>
                <circle cx="10" cy="10" r="1" fill="white" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#museumGrid)" />
          </svg>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-museum-400/10 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white max-w-3xl">
          {/* Logo and title */}
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-2xl">
              <Landmark className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold">Museum Collection</h1>
              <p className="text-bronze-300 text-lg">Digital Archive System</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
            Nilgiri Mountains<br />
            <span className="text-primary-400">Archaeological Collection</span>
          </h2>

          <p className="text-xl text-bronze-200 mb-12 leading-relaxed max-w-xl">
            A digital archive preserving grave goods from megalithic burials excavated
            in the 19th century from the Nilgiri Mountains, Tamil Nadu, South India.
            The collection includes ceramic urns, terracotta figurines, bronze artifacts,
            iron tools, gold ornaments, and stone beads dating from the 1st to 16th century AD.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="p-2 bg-primary-500/20 rounded-lg w-fit mb-3 group-hover:bg-primary-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-300" />
                </div>
                <h3 className="font-semibold mb-1 text-white">{feature.title}</h3>
                <p className="text-sm text-bronze-300">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Collections */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-bronze-400 text-sm mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Nilgiri Grave Goods Collections
            </p>
            <div className="flex gap-6">
              {collections.map((collection, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-300" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{collection.name}</p>
                    <p className="text-xs text-bronze-400">{collection.items}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-museum-50 to-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-bronze-800 to-bronze-900 rounded-2xl text-white mb-4 shadow-lg">
              <Landmark className="w-6 h-6" />
              <span className="font-display font-semibold text-lg">Museum Collection</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-museum-lg border border-museum-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-gradient-to-br from-museum-100 to-bronze-100 rounded-2xl mb-4">
                <Archive className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-3xl font-display font-bold text-bronze-900">
                Welcome Back
              </h2>
              <p className="mt-2 text-bronze-500">
                Sign in to access your collection
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bronze-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-museum-50 border border-museum-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 placeholder:text-museum-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bronze-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-museum-50 border border-museum-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 placeholder:text-museum-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 border-0 shadow-lg shadow-primary-500/25 text-base font-semibold rounded-xl"
                isLoading={isLoading}
              >
                Sign in to Dashboard
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-museum-100">
              <p className="text-xs text-center text-bronze-400">
                Need access? Contact your museum administrator.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
