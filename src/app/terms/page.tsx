'use client';

import React, { useState } from 'react';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📋', description: 'Key points and summary' },
    { id: 'acceptance', title: 'Acceptance', icon: '✅', description: 'Terms and conditions' },
    { id: 'services', title: 'Services', icon: '🛠️', description: 'What we provide' },
    { id: 'responsibilities', title: 'Responsibilities', icon: '👤', description: 'User obligations' },
    { id: 'privacy', title: 'Privacy', icon: '🔒', description: 'Data protection' },
    { id: 'intellectual', title: 'Intellectual Property', icon: '💡', description: 'Content and rights' },
    { id: 'disclaimers', title: 'Disclaimers', icon: '⚠️', description: 'Limitations' },
    { id: 'termination', title: 'Termination', icon: '🚫', description: 'Account closure' },
    { id: 'governing', title: 'Governing Law', icon: '⚖️', description: 'Legal framework' }
  ];

  const termsContent = {
    overview: {
      title: 'Terms of Service Overview',
      lastUpdated: 'April 29, 2026',
      keyPoints: [
        'These terms govern your use of our refugee support platform',
        'By using our services, you agree to these terms',
        'We provide free and paid services for refugees and advocates',
        'Your privacy and data security are our priorities',
        'We comply with all applicable laws and regulations'
      ],
      summary: 'Our platform connects refugees with essential resources, legal assistance, housing, healthcare, education, and employment opportunities. These terms ensure a safe, respectful, and productive environment for all users.'
    },
    acceptance: {
      title: 'Acceptance of Terms',
      content: [
        {
          heading: 'Agreement to Terms',
          text: 'By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
        },
        {
          heading: 'Age Requirement',
          text: 'You must be at least 18 years old to use our services. By using our platform, you represent and warrant that you meet this age requirement.'
        },
        {
          heading: 'Updates to Terms',
          text: 'We may update these terms from time to time. We will notify you of any changes by posting the new terms on this page and updating the "Last updated" date.'
        }
      ]
    },
    services: {
      title: 'Our Services',
      content: [
        {
          heading: 'Platform Features',
          text: 'Our platform provides: Resource directory, Case management system, Communication tools, Educational materials, Community forums, and Emergency assistance information.'
        },
        {
          heading: 'Free Services',
          text: 'Basic access to resources, community forums, and emergency information is provided free of charge to all users.'
        },
        {
          heading: 'Premium Services',
          text: 'Advanced features such as personalized case management, direct legal consultation, and priority support may be available for a fee.'
        }
      ]
    },
    responsibilities: {
      title: 'User Responsibilities',
      content: [
        {
          heading: 'Account Security',
          text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
        },
        {
          heading: 'Content Guidelines',
          text: 'You agree not to post: False or misleading information, Hate speech or discriminatory content, Personal information of others, Illegal or harmful content, Spam or promotional materials.'
        },
        {
          heading: 'Professional Conduct',
          text: 'Users must interact respectfully with other members of the community. Harassment, threats, or abusive behavior will result in account termination.'
        }
      ]
    },
    privacy: {
      title: 'Privacy and Data Protection',
      content: [
        {
          heading: 'Data Collection',
          text: 'We collect information necessary to provide our services, including: Contact information, Usage data, and Communication history.'
        },
        {
          heading: 'Data Protection',
          text: 'We implement industry-standard security measures to protect your personal information and comply with GDPR and other privacy regulations.'
        },
        {
          heading: 'Data Sharing',
          text: 'We do not sell your personal information. We may share data with service providers only as necessary to deliver our services.'
        }
      ]
    },
    intellectual: {
      title: 'Intellectual Property',
      content: [
        {
          heading: 'Platform Content',
          text: 'All content on our platform, including text, graphics, logos, and software, is owned by us or our content suppliers and is protected by intellectual property laws.'
        },
        {
          heading: 'User Content',
          text: 'You retain ownership of content you post on our platform. By posting content, you grant us a license to use, modify, and display it for the purpose of providing our services.'
        },
        {
          heading: 'Prohibited Use',
          text: 'You may not copy, modify, distribute, or create derivative works of our platform content without our express written permission.'
        }
      ]
    },
    disclaimers: {
      title: 'Disclaimers and Limitations',
      content: [
        {
          heading: 'Service Availability',
          text: 'We do not guarantee uninterrupted or error-free service. We may temporarily suspend services for maintenance or updates.'
        },
        {
          heading: 'Information Accuracy',
          text: 'While we strive to provide accurate information, we make no warranties about the completeness or accuracy of any content on our platform.'
        },
        {
          heading: 'Third-Party Links',
          text: 'Our platform may contain links to third-party websites. We are not responsible for the content or practices of external sites.'
        }
      ]
    },
    termination: {
      title: 'Account Termination',
      content: [
        {
          heading: 'User Termination',
          text: 'You may terminate your account at any time by contacting our support team or using the account deletion feature in your settings.'
        },
        {
          heading: 'Platform Termination',
          text: 'We may suspend or terminate your account for violation of these terms, illegal activity, or behavior that harms other users or the platform.'
        },
        {
          heading: 'Effect of Termination',
          text: 'Upon termination, your right to use the platform ceases immediately. We may delete your account and associated data as required by law.'
        }
      ]
    },
    governing: {
      title: 'Governing Law',
      content: [
        {
          heading: 'Jurisdiction',
          text: 'These terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.'
        },
        {
          heading: 'Dispute Resolution',
          text: 'Any disputes arising from these terms or your use of our services will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.'
        },
        {
          heading: 'Legal Compliance',
          text: 'You agree to comply with all applicable local, state, national, and international laws and regulations in your use of our services.'
        }
      ]
    }
  };

  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Our commitment to providing a safe, transparent, and supportive platform for refugees and advocates
            </p>
            
            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-blue-100">Transparent</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">GDPR</div>
                <div className="text-blue-100">Compliant</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
              <svg className="absolute left-5 top-4.5 w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                <span>{section.title}</span>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{termsContent.overview.title}</h2>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Last updated: {termsContent.overview.lastUpdated}
                </span>
              </div>
              
              <div className="prose prose-lg max-w-none text-gray-600 mb-8">
                <p className="text-lg leading-relaxed">{termsContent.overview.summary}</p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Points</h3>
                <ul className="space-y-3">
                  {termsContent.overview.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-3 mt-1">✓</span>
                      <span className="text-blue-800">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Download Terms</h3>
                <p className="text-gray-600 mb-6">Get a printable PDF version of our terms for your records.</p>
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                  Download PDF
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Have Questions?</h3>
                <p className="text-gray-600 mb-6">Our legal team is here to help clarify any terms.</p>
                <a href="/contact" className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-semibold inline-block text-center">
                  Contact Legal Team
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Other Sections */}
        {Object.entries(termsContent).filter(([key]) => key !== 'overview').map(([key, content]) => (
          activeSection === key && (
            <div key={key} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">{content.title}</h2>
                
                <div className="space-y-8">
                  {content.content.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-6 py-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.heading}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Related Sections */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Related Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sections
                    .filter(s => s.id !== key && s.id !== 'overview')
                    .slice(0, 3)
                    .map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="p-4 bg-white rounded-xl text-left hover:shadow-lg transition-shadow duration-200"
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{section.icon}</span>
                          <span className="font-semibold text-gray-900">{section.title}</span>
                        </div>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Our legal and support teams are here to help you understand your rights and responsibilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/privacy"
              className="px-8 py-3 bg-white text-blue-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
            >
              View Privacy Policy
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors font-semibold"
            >
              Contact Legal Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
