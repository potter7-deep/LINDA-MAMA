import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Phone, MapPin, Calendar, Users, Activity, Moon, Sun } from 'lucide-react';

const HEALTH_CONDITIONS = [
  { value: 'none', label: 'None / No health conditions' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
  { value: 'anemia', label: 'Anemia' },
  { value: 'thyroid', label: 'Thyroid Disorder' },
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'asthma', label: 'Asthma' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'mother',
    region: '',
    hospitals: [],
    healthCondition: 'none',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
      // Removed loading animation state
  const { register } = useAuth();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'agreedToTerms') {
      setAgreedToTerms(checked);
      if (errors.agreedToTerms) setErrors({ ...errors, agreedToTerms: '' });
      return;
    }
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
        else if (!/^[a-zA-Z\s'-]+$/.test(formData.fullName.trim())) {
          newErrors.fullName = 'Name cannot contain numbers or special characters except hyphens/apostrophes';
        }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (Kenyan format, optional or required)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+2547\d{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid Kenyan phone (+2547XXXXXXXX)';
    }
        else if (/[^\d+]/.test(formData.phone.replace(/\+/, ''))) {
          newErrors.phone = 'Phone number cannot contain letters';
        }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    // Provider-specific validation
    if (formData.role === 'provider') {
      if (!formData.region) {
        newErrors.region = 'Region is required for providers';
      }
      if (!formData.hospitals || formData.hospitals.length === 0) {
        newErrors.hospitals = 'Select at least one hospital';
      }
    }

    // Terms of Service
    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

        // setLoading(true); // Remove loading animation

    try {
      const user = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        password: formData.password,
        role: formData.role,
        region: formData.role === 'provider' ? formData.region : undefined,
        hospitals: formData.role === 'provider' ? formData.hospitals : undefined,
      });
      
      // Save health condition if user was created successfully
      if (user && formData.healthCondition !== 'none') {
        const conditionLabel = HEALTH_CONDITIONS.find(c => c.value === formData.healthCondition)?.label || formData.healthCondition;
        await api.post('/auth/health-conditions', {
          conditionType: formData.healthCondition,
          conditionName: conditionLabel,
        });
      }
      
      // Role-based redirect
      const redirectPath = user.role === 'admin' ? '/app/admin' :
                          user.role === 'provider' ? '/app/provider' :
                          '/app/dashboard';
      navigate(redirectPath);
    } catch (err) {
      setErrors({ submit: err.message || err.response?.data?.error || 'Registration failed. Please try again.' });
    } finally {
          // setLoading(false); // Remove loading animation
    }
  };

  return (
    <div className="min-h-screen flex dark-ambient-glow">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 auth-bg-gradient opacity-90 dark:opacity-80 dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"></div>
        {/* Animated orbs */}
        <div className="floating-particles absolute inset-0 pointer-events-none" />
        <div className="max-w-lg text-center text-white dark:text-primary-100 relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/20 dark:bg-primary-700/30 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Heart className="w-12 h-12 text-primary-600 dark:text-primary-300" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white dark:text-primary-100">
            Join Linda Mama
          </h2>
          <p className="text-secondary-100 dark:text-primary-200 text-lg mb-8">
            Create your account and start managing your maternal health journey.
          </p>
          <div className="space-y-4 text-left bg-white/10 dark:bg-primary-900/40 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 dark:bg-primary-700/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white dark:text-primary-200" />
              </div>
              <div>
                <p className="font-medium text-white dark:text-primary-100">Personalized Care</p>
                <p className="text-sm text-secondary-100 dark:text-primary-200">Track your pregnancy journey</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 dark:bg-primary-700/30 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white dark:text-primary-200" />
              </div>
              <div>
                <p className="font-medium text-white dark:text-primary-100">Expert Support</p>
                <p className="text-sm text-secondary-100 dark:text-primary-200">Connect with healthcare providers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 dark:bg-primary-700/30 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white dark:text-primary-200" />
              </div>
              <div>
                <p className="font-medium text-white dark:text-primary-100">Health First</p>
                <p className="text-sm text-secondary-100 dark:text-primary-200">Nutrition and immunization tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-neutral-900 transition-colors duration-300 overflow-y-auto relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 z-20"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-warning-400" />
          ) : (
            <Moon className="w-5 h-5 text-primary-600" />
          )}
        </button>

        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <img 
              src="/img/logo.png" 
              alt="Linda Mama" 
            />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Linda Mama</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Create Your Account</p>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Create Account
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Fill in your details to create an account</p>

          {errors.submit && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 rounded-xl text-danger-700 dark:text-danger-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
                  placeholder="Your full name"
                  pattern="[a-zA-Z\\s'-.,]+"
                  inputMode="text"
                />
              </div>
              {errors.fullName && <p className="input-error-message">{errors.fullName}</p>}
            </div>

            <div>
              <label className="input-label">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
                  inputMode="email"
                />
              </div>
              {errors.email && <p className="input-error-message">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Phone *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                    placeholder="+2547XXXXXXXX"
                    pattern="[+]?[0-9]{10,15}"
                    inputMode="tel"
                    aria-label="Phone number"
                  />
                </div>
                {errors.phone && <p className="input-error-message">{errors.phone}</p>}
              </div>

              <div>
                <label className="input-label">Date of Birth *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.dateOfBirth ? 'input-error' : ''}`}
                  />
                </div>
                {errors.dateOfBirth && <p className="input-error-message">{errors.dateOfBirth}</p>}
              </div>
            </div>

            <div>
              <label className="input-label">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Your address"
                  pattern="[a-zA-Z0-9\\s'-.,#]+"
                  inputMode="text"
                />
              </div>
            </div>

            <div>
              <label className="input-label">I am a...</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-neutral-400" />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input pl-10"
                >
                  <option value="mother">Expectant/Nursing Mother</option>
                  <option value="provider">Healthcare Provider</option>
                </select>
                {formData.role === 'provider' && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="input-label">Region *</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className={`input ${errors.region ? 'input-error' : ''}`}
                        required
                        aria-label="Region"
                      >
                        <option value="">Select Region</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Eldoret">Eldoret</option>
                      </select>
                      {errors.region && <p className="input-error-message">{errors.region}</p>}
                    </div>
                    <div>
                      <label className="input-label">Hospitals (select all that apply) *</label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700">
                        {['Kenyatta National Hospital', 'Nairobi Hospital', 'Aga Khan Hospital', 'Mater Misericordiae', 'MP Shah', 'Coast General Hospital', 'Jaramogi Oginga Odinga', 'Nakuru Provincial'].map((hospital) => (
                          <label key={hospital} className="flex items-center gap-2 p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                            <input
                              type="checkbox"
                              value={hospital}
                              checked={formData.hospitals.includes(hospital)}
                              onChange={(e) => {
                                const newHospitals = e.target.checked
                                  ? [...formData.hospitals, e.target.value]
                                  : formData.hospitals.filter(h => h !== e.target.value);
                                setFormData({...formData, hospitals: newHospitals});
                              }}
                              className="rounded"
                              aria-label={hospital}
                            />
                            <span className="text-sm text-neutral-700 dark:text-neutral-100">{hospital}</span>
                          </label>
                        ))}
                      </div>
                      {errors.hospitals && <p className="input-error-message">{errors.hospitals}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="input-label flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Health Condition (Optional)
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Select any health condition you have for personalized meal recommendations</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Activity className="h-5 w-5 text-neutral-400" />
                </div>
                <select
                  name="healthCondition"
                  value={formData.healthCondition}
                  onChange={handleChange}
                  className="input pl-10"
                >
                  {HEALTH_CONDITIONS.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                    pattern="^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,}$"
                    inputMode="text"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    tabIndex={0}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="input-error-message">{errors.password}</p>}
              </div>

              <div>
                <label className="input-label">Confirm *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="••••••••"
                    aria-label="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    tabIndex={0}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="input-error-message">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={agreedToTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                aria-label="Agree to Terms of Service"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                I agree to the <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
              </span>
            </div>
            {errors.agreedToTerms && <p className="input-error-message">{errors.agreedToTerms}</p>}

            <button
              type="submit"
              className="btn-gradient-animated w-full py-3 flex items-center justify-center gap-2 text-white font-semibold rounded-xl"
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

