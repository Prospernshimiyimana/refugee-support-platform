'use client';

import React, { useState } from 'react';

export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedCookies, setExpandedCookies] = useState<string[]>([]);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  const toggleCookieExpansion = (cookieId: string) => {
    setExpandedCookies(prev => 
      prev.includes(cookieId) 
        ? prev.filter(id => id !== cookieId)
        : [...prev, cookieId]
    );
  };

  const handlePreferenceChange = (category: string, value: boolean) => {
    if (category === 'necessary') return; // Necessary cookies cannot be disabled
    setCookiePreferences(prev => ({ ...prev, [category]: value }));
  };

  const savePreferences = () => {
    // Save preferences to localStorage or send to backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
      alert('Cookie preferences saved successfully!');
    }
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'types', title: 'Cookie Types', icon: '🍪' },
    { id: 'purposes', title: 'Purposes', icon: '🎯' },
    { id: 'management', title: 'Management', icon: '⚙️' },
    { id: 'third-party', title: 'Third-Party', icon: '🌐' },
    { id: 'rights', title: 'Your Rights', icon: '🛡️' }
  ];

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      description: 'Essential for the website to function properly',
      required: true,
      examples: ['Authentication tokens', 'Security tokens', 'Shopping cart contents'],
      duration: 'Session to 1 year',
      purpose: 'Enable basic functions like page navigation and access to secure areas'
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enhance functionality and personalization',
      required: false,
      examples: ['Language preferences', 'Theme settings', 'Remembered form data'],
      duration: '1 month to 1 year',
      purpose: 'Provide enhanced features and personalization'
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors use our website',
      required: false,
      examples: ['Google Analytics', 'Hotjar', 'Mixpanel'],
      duration: '1 month to 2 years',
      purpose: 'Collect anonymous usage data to improve our services'
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements',
      required: false,
      examples: ['Google Ads', 'Facebook Pixel', 'LinkedIn Insight Tag'],
      duration: '1 month to 2 years',
      purpose: 'Track user behavior across sites for targeted advertising'
    }
  ];

  const purposes = [
    {
      title: 'Essential Functionality',
      description: 'Core website features like user authentication and security',
      cookies: ['Necessary'],
      impact: 'Without these cookies, the website cannot function properly'
    },
    {
      title: 'User Experience',
      description: 'Personalization and convenience features',
      cookies: ['Functional'],
      impact: 'Enhances user experience but not essential for basic functionality'
    },
    {
      title: 'Performance Analytics',
      description: 'Understanding how users interact with our platform',
      cookies: ['Analytics'],
      impact: 'Helps us improve our services and user experience'
    },
    {
      title: 'Marketing & Advertising',
      description: 'Personalized advertising and promotional content',
      cookies: ['Marketing'],
      impact: 'Allows us to show relevant ads and measure campaign effectiveness'
    }
  ];

  const thirdPartyServices = [
    {
      name: 'Google Analytics',
      purpose: 'Website analytics and user behavior tracking',
      dataCollected: ['IP address', 'Browser type', 'Pages visited', 'Time on site'],
      privacyPolicy: 'https://policies.google.com/privacy'
    },
    {
      name: 'Google Ads',
      purpose: 'Advertising and remarketing',
      dataCollected: ['Click behavior', 'Ad interactions', 'Conversion data'],
      privacyPolicy: 'https://policies.google.com/privacy'
    },
    {
      name: 'Facebook Pixel',
      purpose: 'Social media advertising and analytics',
      dataCollected: ['Device information', 'Page views', 'Actions taken'],
      privacyPolicy: 'https://www.facebook.com/privacy/policy'
    }
  ];

  const userRights = [
    {
      right: 'Consent',
      description: 'You have the right to give or withhold consent to non-essential cookies',
      action: 'Use our cookie consent banner to manage preferences'
    },
    {
      right: 'Withdrawal',
      description: 'You can withdraw your consent at any time',
      action: 'Update your preferences through our cookie settings'
    },
    {
      right: 'Information',
      description: 'You have the right to know what data we collect and why',
      action: 'Review this policy and contact us for more details'
    },
    {
      right: 'Deletion',
      description: 'You can request deletion of your data',
      action: 'Contact our privacy team for data deletion requests'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-amber-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <span className="text-3xl">🍪</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Cookie Policy</h1>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto mb-8">
              Learn how we use cookies to enhance your experience and protect your privacy
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">4</div>
                <div className="text-amber-100 text-sm">Cookie Types</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">12+</div>
                <div className="text-amber-100 text-sm">Services</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">GDPR</div>
                <div className="text-amber-100 text-sm">Compliant</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-amber-100 text-sm">Transparent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="mb-6">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  enabling certain functionality.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Key Points</h3>
                  <ul className="space-y-2 text-amber-800">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      Cookies enhance your browsing experience
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      You control which cookies are used
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      We comply with GDPR and privacy regulations
                    </li>
                  </ul>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Use Cookies</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 mt-1">🔐</span>
                    <div>
                      <strong>Security:</strong> Protect your account and prevent fraud
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 mt-1">⚡</span>
                    <div>
                      <strong>Performance:</strong> Make our website faster and more reliable
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 mt-1">🎨</span>
                    <div>
                      <strong>Personalization:</strong> Remember your preferences and settings
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-3 mt-1">📊</span>
                    <div>
                      <strong>Analytics:</strong> Understand how users interact with our platform
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Cookie Preferences */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Cookie Settings</h3>
              <div className="space-y-4">
                {Object.entries(cookiePreferences).map(([category, enabled]) => {
                  const cookieType = cookieTypes.find(c => c.id === category);
                  const isRequired = category === 'necessary';
                  return (
                    <div key={category} className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-semibold text-gray-900">{cookieType?.name}</h4>
                          {isRequired && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{cookieType?.description}</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange(category, !enabled)}
                        disabled={isRequired}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enabled ? 'bg-amber-600' : 'bg-gray-300'
                        } ${isRequired ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={savePreferences}
                className="mt-6 w-full bg-amber-600 text-white py-3 px-6 rounded-xl hover:bg-amber-700 transition-colors font-semibold shadow-lg"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Cookie Types Section */}
        {activeSection === 'types' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
              <div className="space-y-6">
                {cookieTypes.map((cookieType) => {
                  const isExpanded = expandedCookies.includes(cookieType.id);
                  return (
                    <div key={cookieType.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="p-6 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{cookieType.name}</h3>
                              {cookieType.required && (
                                <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                                  Essential
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{cookieType.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-semibold text-gray-900">Duration:</span>
                                <div className="text-gray-600">{cookieType.duration}</div>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900">Purpose:</span>
                                <div className="text-gray-600">{cookieType.purpose}</div>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900">Status:</span>
                                <div className={`font-medium ${
                                  cookiePreferences[cookieType.id as keyof typeof cookiePreferences] 
                                    ? 'text-green-600' 
                                    : 'text-gray-500'
                                }`}>
                                  {cookiePreferences[cookieType.id as keyof typeof cookiePreferences] ? 'Enabled' : 'Disabled'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCookieExpansion(cookieType.id)}
                            className="ml-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <svg className={`w-5 h-5 transform transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-6 border-t border-gray-200 bg-white">
                          <h4 className="font-semibold text-gray-900 mb-3">Examples:</h4>
                          <ul className="space-y-2">
                            {cookieType.examples.map((example, index) => (
                              <li key={index} className="flex items-center text-gray-600">
                                <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Other sections would continue here... */}
        {activeSection === 'purposes' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookie Purposes</h2>
            <div className="space-y-6">
              {purposes.map((purpose, index) => (
                <div key={index} className="border-l-4 border-amber-400 pl-6 py-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{purpose.title}</h3>
                  <p className="text-gray-600 mb-3">{purpose.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {purpose.cookies.map((cookie) => (
                      <span key={cookie} className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                        {cookie}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 italic">{purpose.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'management' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Chrome</h4>
                    <p className="text-sm text-gray-600">Settings → Privacy and security → Cookies and other site data</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Firefox</h4>
                    <p className="text-sm text-gray-600">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                    <p className="text-sm text-gray-600">Preferences → Privacy → Cookies and website data</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Tools</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <h4 className="font-semibold text-amber-900 mb-2">Cookie Consent Banner</h4>
                    <p className="text-sm text-amber-800">Manage preferences when you first visit our site</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <h4 className="font-semibold text-amber-900 mb-2">Cookie Settings Panel</h4>
                    <p className="text-sm text-amber-800">Update your preferences anytime through our settings</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <h4 className="font-semibold text-amber-900 mb-2">Privacy Dashboard</h4>
                    <p className="text-sm text-amber-800">View and manage all your data and privacy settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'third-party' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
            <div className="space-y-6">
              {thirdPartyServices.map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600">{service.purpose}</p>
                    </div>
                    <a
                      href={service.privacyPolicy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                    >
                      Privacy Policy →
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Data Collected:</h4>
                    <ul className="space-y-1">
                      {service.dataCollected.map((data, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                          {data}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'rights' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights</h2>
            <div className="space-y-6">
              {userRights.map((right, index) => (
                <div key={index} className="flex items-start p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                    {right.right.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{right.right}</h3>
                    <p className="text-gray-600 mb-3">{right.description}</p>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm font-medium text-amber-700">
                        <span className="font-semibold">How to exercise:</span> {right.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions About Cookies?</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
            Our privacy team is here to help you understand and manage your cookie preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveSection('management')}
              className="px-8 py-3 bg-white text-amber-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
            >
              Manage Cookies
            </button>
            <a
              href="/contact"
              className="px-8 py-3 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-colors font-semibold"
            >
              Contact Privacy Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
