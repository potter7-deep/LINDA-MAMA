import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

const Landing = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-primary-950 dark:via-neutral-900 dark:to-purple-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(225,29,141,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.25),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_60%)]"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 px-6 py-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/img/logo.png" 
                alt="Linda Mama" 
                className="h-[150px] w-[200px] rounded-xl"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-warning-400" />
                ) : (
                  <Moon className="w-5 h-5 text-primary-600" />
                )}
              </button>
              <Link 
                to="/login"
                className="px-5 py-2.5 text-neutral-700 dark:text-neutral-200 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-purple-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-purple-700 transition-all shadow-lg shadow-primary-500/25"
              >
Sign Up
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-1 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                Trusted by thousands of mothers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white leading-tight mb-6">
                Your Journey to
                <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Motherhood
                </span>
                Starts Here
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 max-w-xl">
                Comprehensive maternal healthcare at your fingertips. Track your pregnancy, 
                get nutrition guidance, monitor immunizations, and connect with healthcare providers - all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-purple-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 text-center"
                >
Create Account
                </Link>
                <Link 
                  to="/login"
                  className="px-8 py-4 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 font-semibold rounded-xl hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-all text-center"
                >
                  Start Demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-8 border border-neutral-100 dark:border-neutral-700">
                <img 
                  src="/img/linda.png" 
                  alt="Linda Mama" 
                  className="w-64 h-64 mx-auto mb-6 rounded-2xl object-cover"
                />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    Welcome to Linda Mama
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Your personal maternal health companion
                  </p>
                </div>
                
                {/* Feature Icons */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                    <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Pregnancy Tracking</p>
                  </div>
                  <div className="text-center p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
                    <div className="w-12 h-12 mx-auto mb-2 bg-secondary-100 dark:bg-secondary-900/40 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nutrition Guidance</p>
                  </div>
                  <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-xl">
                    <div className="w-12 h-12 mx-auto mb-2 bg-success-100 dark:bg-success-900/40 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Immunization</p>
                  </div>
                  <div className="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-xl">
                    <div className="w-12 h-12 mx-auto mb-2 bg-warning-100 dark:bg-warning-900/40 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Emergency Support</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <section className="py-16 px-6 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Why Linda Mama?
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              We address the critical challenges in maternal healthcare access
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="p-8 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
              <div className="w-14 h-14 bg-danger-100 dark:bg-danger-900/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-danger-600 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                Limited Access
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Many mothers lack easy access to quality healthcare information and services, especially in rural areas.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="p-8 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
              <div className="w-14 h-14 bg-warning-100 dark:bg-warning-900/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                Information Gap
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Critical health information about nutrition, immunizations, and danger signs is often unavailable or confusing.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="p-8 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
              <div className="w-14 h-14 bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                Fragmented Care
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Healthcare services are scattered across multiple platforms, making it difficult for mothers to manage their care.
              </p>
            </div>
          </div>

          {/* Our Solution */}
          <div className="mt-16 p-8 md:p-12 bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-secondary-900/20 rounded-3xl border border-primary-100 dark:border-primary-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/40 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Our Solution
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                All-in-One Maternal Healthcare Platform
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-3xl">🤰</span>
                </div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Pregnancy Tracking</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Monitor your pregnancy week by week with personalized updates</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-3xl">🥗</span>
                </div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Nutrition Guidance</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Get meal plans and dietary recommendations for a healthy pregnancy</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-3xl">💉</span>
                </div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Immunization Schedules</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Never miss a vaccination with automated reminders</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-3xl">🏥</span>
                </div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Emergency Support</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Quick access to emergency contacts and danger sign alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            Join thousands of mothers who trust Linda Mama for their maternal healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-purple-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40"
            >
Get Your Account
            </Link>
            <Link 
              to="/login"
              className="px-8 py-4 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 font-semibold rounded-xl hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/img/logo.png" 
              alt="Linda Mama" 
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Linda Mama</span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Linda Mama. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

