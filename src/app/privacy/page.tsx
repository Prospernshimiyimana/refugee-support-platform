'use client';

import React, { useState } from 'react';
import { Shield, Lock, Eye, Users, Cookie, Baby, RefreshCw, Phone, Search, CheckCircle, AlertCircle, Info, Download, Settings, MessageSquare, Clock } from 'lucide-react';

interface Contact {
  label: string;
  value: string;
}

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'overview', title: 'Overview', icon: '🔍', description: 'Key points and summary', estimatedRead: '2 min' },
    { id: 'collection', title: 'Data Collection', icon: '📊', description: 'What we collect', estimatedRead: '3 min' },
    { id: 'usage', title: 'Data Usage', icon: '⚙️', description: 'How we use data', estimatedRead: '3 min' },
    { id: 'sharing', title: 'Data Sharing', icon: '🤝', description: 'Third-party sharing', estimatedRead: '2 min' },
    { id: 'security', title: 'Security', icon: '🛡️', description: 'Data protection', estimatedRead: '2 min' },
    { id: 'rights', title: 'Your Rights', icon: '👤', description: 'User rights', estimatedRead: '4 min' },
    { id: 'cookies', title: 'Cookies', icon: '🍪', description: 'Cookie policy', estimatedRead: '2 min' },
    { id: 'children', title: 'Children', icon: '👶', description: 'Minor protection', estimatedRead: '1 min' },
    { id: 'changes', title: 'Changes', icon: '🔄', description: 'Policy updates', estimatedRead: '1 min' },
    { id: 'contact', title: 'Contact', icon: '📞', description: 'Reach us', estimatedRead: '1 min' }
  ];

  const privacyContent = {
    overview: {
      title: 'Privacy Policy Overview',
      lastUpdated: 'April 29, 2026',
      keyPoints: [
        'We collect only necessary information to provide our services',
        'Your data is protected with industry-standard security measures',
        'We never sell your personal information to third parties',
        'You have full control over your data and privacy settings',
        'We comply with GDPR, CCPA, and other privacy regulations'
      ],
      summary: 'At Refugee Support Platform, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and protect your data when you use our services.'
    },
    collection: {
      title: 'Data Collection',
      content: [
        {
          heading: 'Personal Information',
          text: 'We collect information you provide directly, such as: Name, email address, phone number, date of birth, nationality, and immigration status. This information is necessary to provide you with appropriate support services.',
          examples: ['Name and contact details', 'Demographic information', 'Immigration status', 'Family composition']
        },
        {
          heading: 'Usage Data',
          text: 'We automatically collect certain information about how you use our platform: Pages visited, time spent on each page, features used, and interaction patterns. This helps us improve our services.',
          examples: ['Page views and navigation', 'Session duration', 'Feature usage', 'Device information']
        },
        {
          heading: 'Communications',
          text: 'We record communications with our support team and other users when necessary to provide services. This includes case notes, support tickets, and forum discussions.',
          examples: ['Support tickets', 'Case notes', 'Forum posts', 'Email communications']
        }
      ]
    },
    usage: {
      title: 'How We Use Your Data',
      content: [
        {
          heading: 'Service Provision',
          text: 'We use your information to: Provide personalized support, Connect you with resources, Manage your case files, and Coordinate with service providers.',
          purpose: 'Essential for delivering our refugee support services'
        },
        {
          heading: 'Platform Improvement',
          text: 'We analyze usage patterns to: Improve user experience, Optimize performance, Develop new features, and Fix technical issues.',
          purpose: 'Enhancing our platform for all users'
        },
        {
          heading: 'Communication',
          text: 'We use your contact information to: Send important updates, Respond to inquiries, Provide service notifications, and Share relevant resources.',
          purpose: 'Keeping you informed about your case and available services'
        },
        {
          heading: 'Legal Compliance',
          text: 'We use data to: Comply with legal requirements, Report to funding agencies, Ensure program accountability, and Maintain audit trails.',
          purpose: 'Meeting our legal and regulatory obligations'
        }
      ]
    },
    sharing: {
      title: 'Data Sharing',
      content: [
        {
          heading: 'Service Providers',
          text: 'We share data with trusted partners who help us deliver services: Legal aid organizations, Healthcare providers, Housing agencies, and Educational institutions.',
          partners: ['Legal aid clinics', 'Medical facilities', 'Housing organizations', 'Educational institutions']
        },
        {
          heading: 'Government Agencies',
          text: 'We may share information with: Immigration authorities, Health departments, Social services, and Law enforcement (when required).',
          partners: ['Immigration services', 'Health departments', 'Social services', 'Law enforcement']
        },
        {
          heading: 'Research Partners',
          text: 'We share anonymized data with: Academic researchers, Policy organizations, and Advocacy groups to improve refugee services.',
          partners: ['Research institutions', 'Policy think tanks', 'Advocacy organizations']
        },
        {
          heading: 'What We Never Share',
          text: 'We never sell your personal information or share it for marketing purposes without your explicit consent.',
          partners: ['Marketing companies', 'Data brokers', 'Advertisers', 'Third-party marketers']
        }
      ]
    },
    security: {
      title: 'Data Security',
      content: [
        {
          heading: 'Technical Measures',
          text: 'We implement: End-to-end encryption, Secure servers, Regular security audits, and Multi-factor authentication.',
          measures: ['256-bit encryption', 'Secure socket layers (SSL)', 'Regular penetration testing', 'Intrusion detection systems']
        },
        {
          heading: 'Physical Security',
          text: 'Our data centers feature: 24/7 surveillance, Biometric access controls, Redundant power systems, and Climate-controlled environments.',
          measures: ['Video surveillance', 'Restricted access', 'Backup power systems', 'Fire suppression']
        },
        {
          heading: 'Administrative Controls',
          text: 'We maintain: Strict access policies, Regular staff training, Background checks, and Confidentiality agreements.',
          measures: ['Role-based access', 'Annual security training', 'Employee background checks', 'NDAs for all staff']
        }
      ]
    },
    rights: {
      title: 'Your Privacy Rights',
      content: [
        {
          heading: 'Access Rights',
          text: 'You have the right to: View your personal data, Request copies of your information, Know how your data is used, and Verify data accuracy.',
          action: 'Contact our privacy team to request access to your data'
        },
        {
          heading: 'Correction Rights',
          text: 'You can: Update incorrect information, Add missing details, Remove outdated data, and Clarify ambiguous entries.',
          action: 'Use your account settings or contact support to update your information'
        },
        {
          heading: 'Deletion Rights',
          text: 'You may request deletion of: Account information, Communication history, Usage data, and Third-party connections.',
          action: 'Submit a deletion request through your account settings or privacy team'
        },
        {
          heading: 'Portability Rights',
          text: 'You can: Export your data in common formats, Transfer information to other services, Download complete records, and Request data summaries.',
          action: 'Use the data export feature in your account settings'
        },
        {
          heading: 'Objection Rights',
          text: 'You can: Object to data processing, Restrict certain uses, Withdraw consent, and Request data anonymization.',
          action: 'Contact our privacy team to exercise your objection rights'
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      content: [
        {
          heading: 'Essential Cookies',
          text: 'Required for: User authentication, Security features, Site functionality, and Preference storage.',
          duration: 'Session to 1 year'
        },
        {
          heading: 'Analytics Cookies',
          text: 'Used for: Website performance, User behavior analysis, Service improvement, and Error detection.',
          duration: '1 month to 2 years'
        },
        {
          heading: 'Functional Cookies',
          text: 'Enable: Personalization, Language preferences, Theme settings, and Remembered actions.',
          duration: '1 month to 1 year'
        },
        {
          heading: 'Marketing Cookies',
          text: 'Support: Outreach campaigns, Service announcements, Community updates, and Event notifications.',
          duration: '1 month to 2 years'
        }
      ]
    },
    children: {
      title: 'Children\'s Privacy',
      content: [
        {
          heading: 'Age Requirements',
          text: 'Our services are designed for adults 18 and older. We do not knowingly collect personal information from children under 18.'
        },
        {
          heading: 'Parental Consent',
          text: 'If we discover we have collected information from a minor, we will: Delete the data immediately, Notify parents/guardians, Take preventive measures, and Review our processes.'
        },
        {
          heading: 'Educational Services',
          text: 'For educational programs involving minors: We obtain parental consent, Limit data collection, Use data only for educational purposes, and Ensure appropriate security measures.'
        }
      ]
    },
    changes: {
      title: 'Policy Changes',
      content: [
        {
          heading: 'Update Process',
          text: 'When we update this policy: We post changes on this page, Update the "Last updated" date, Send email notifications to active users, and Provide 30-day notice for material changes.'
        },
        {
          heading: 'Material Changes',
          text: 'Significant changes include: New data collection practices, Changes in data sharing, Additional rights for users, and Modified security practices.'
        },
        {
          heading: 'Continued Use',
          text: 'If you continue using our services after changes are posted, you accept the updated policy. You may object to changes by closing your account.'
        }
      ]
    },
    contact: {
      title: 'Contact Information',
      content: [
        {
          heading: 'Privacy Team',
          text: 'For privacy-related questions, concerns, or requests:',
          contacts: [
            { label: 'Email', value: 'privacy@refugeeplatform.org' },
            { label: 'Phone', value: '+1 (800) PRIVACY' },
            { label: 'Mail', value: 'Privacy Officer, 123 Refugee Support Center, San Francisco, CA 94102' }
          ]
        },
        {
          heading: 'Data Protection Officer',
          text: 'Our DPO oversees: GDPR compliance, Data protection strategies, Privacy impact assessments, and Regulatory communications.',
          contacts: [
            { label: 'Email', value: 'dpo@refugeeplatform.org' },
            { label: 'Response Time', value: 'Within 30 days for GDPR requests' }
          ]
        },
        {
          heading: 'Emergency Contact',
          text: 'For data breach notifications or urgent privacy matters:',
          contacts: [
            { label: 'Hotline', value: '+1 (800) 911-PRIV' },
            { label: 'Available', value: '24/7 for emergencies' }
          ]
        }
      ]
    }
  };

  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* View Mode Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-1 flex border border-slate-200">
          <button
            onClick={() => setViewMode('standard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'standard' 
                ? 'bg-blue-100 text-blue-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Standard
            </div>
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'compact' 
                ? 'bg-blue-100 text-blue-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Compact
            </div>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 backdrop-blur-sm rounded-3xl mb-8 border border-blue-400/30">
              <Shield className="w-10 h-10 text-blue-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              Your privacy is our fundamental commitment. Discover how we protect your data with transparency, security, and respect for your rights.
            </p>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <CheckCircle className="w-8 h-8 text-green-400 mb-3 mx-auto" />
                <div className="text-2xl font-bold mb-1">GDPR</div>
                <div className="text-blue-200 text-sm">Compliant</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Lock className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                <div className="text-2xl font-bold mb-1">256-bit</div>
                <div className="text-blue-200 text-sm">Encryption</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Users className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
                <div className="text-2xl font-bold mb-1">Never</div>
                <div className="text-blue-200 text-sm">Sold Data</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <Eye className="w-8 h-8 text-cyan-400 mb-3 mx-auto" />
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-blue-200 text-sm">Transparent</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search privacy topics, rights, or specific questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-12 py-4 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg shadow-sm hover:shadow-md focus:shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-slate-600">
                Found {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 overflow-x-auto py-4 scrollbar-hide">
            {filteredSections.map((section) => {
              const Icon = getIconForSection(section.id);
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                    activeSection === section.id 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-xs opacity-75">{section.estimatedRead}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{privacyContent.overview.title}</h2>
                  <p className="text-slate-600 mt-1">Last updated: {privacyContent.overview.lastUpdated}</p>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed mb-8">
                {privacyContent.overview.summary}
              </div>

              <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Key Commitments
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {privacyContent.overview.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-slate-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Download PDF</h3>
                  <p className="text-slate-600 text-sm mb-4">Get a printable PDF version for your records.</p>
                  <button className="w-full bg-slate-700 text-white py-2 px-4 rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm">
                    Download PDF
                  </button>
                </div>
                
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Privacy Settings</h3>
                  <p className="text-slate-600 text-sm mb-4">Manage your data preferences and consent.</p>
                  <a href="/account/settings" className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm inline-block text-center">
                    Manage Settings
                  </a>
                </div>
                
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Have Questions?</h3>
                  <p className="text-slate-600 text-sm mb-4">Our privacy team is here to help.</p>
                  <a href="/contact" className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm inline-block text-center">
                    Contact Privacy Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Sections */}
        {Object.entries(privacyContent).filter(([key]) => key !== 'overview').map(([key, content]) => {
          if (activeSection === key && 'content' in content) {
            return (
              <div key={key} className="space-y-8">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      {(() => {
                        const Icon = getIconForSection(key);
                        return Icon && <Icon className="w-6 h-6 text-blue-600" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">{content.title}</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {content.content.map((item, index) => (
                      <div key={index} className="bg-linear-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border-l-4 border-blue-400">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{item.heading}</h3>
                        <p className="text-slate-700 leading-relaxed mb-6 text-lg">{item.text}</p>
                        
                        {'examples' in item && item.examples && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-blue-500" />
                              Examples:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {item.examples.map((example: string, idx: number) => (
                                <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                                  {example}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {'partners' in item && item.partners && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-500" />
                              {item.heading.includes('Never') ? 'We never share with:' : 'We share with:'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {item.partners.map((partner: string, idx: number) => (
                                <div key={idx} className="flex items-center text-sm text-slate-600 bg-white p-3 rounded-lg">
                                  <div className={`w-2 h-2 rounded-full mr-3 ${
                                    item.heading.includes('Never') ? 'bg-red-400' : 'bg-green-400'
                                  }`}></div>
                                  {partner}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {'measures' in item && item.measures && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-blue-500" />
                              Security Measures:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {item.measures.map((measure: string, idx: number) => (
                                <div key={idx} className="flex items-center text-sm text-slate-600 bg-white p-3 rounded-lg">
                                  <Lock className="w-4 h-4 text-green-500 mr-3" />
                                  {measure}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {'action' in item && item.action && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-blue-800">
                              <span className="font-semibold">How to exercise:</span> {item.action}
                            </p>
                          </div>
                        )}
                        
                        {'contacts' in item && item.contacts && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <Phone className="w-5 h-5 text-blue-500" />
                              Contact Information:
                            </h4>
                            <div className="space-y-3">
                              {item.contacts.map((contact: Contact, idx: number) => (
                                <div key={idx} className="flex items-center text-sm bg-white p-4 rounded-lg">
                                  <div className="font-semibold text-slate-900 mr-3 min-w-20">{contact.label}:</div>
                                  <div className="text-slate-600">{contact.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {'duration' in item && item.duration && (
                          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                            <Clock className="w-4 h-4 mr-2" />
                            Duration: {item.duration}
                          </div>
                        )}
                        
                        {'purpose' in item && item.purpose && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-indigo-800">
                              <span className="font-semibold">Purpose:</span> {item.purpose}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Related Sections */}
                  <div className="mt-12 bg-linear-to-r from-slate-50 to-blue-50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Related Sections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {sections
                        .filter(s => s.id !== key && s.id !== 'overview')
                        .slice(0, 3)
                        .map((section) => {
                          const Icon = getIconForSection(section.id);
                          return (
                            <button
                              key={section.id}
                              onClick={() => setActiveSection(section.id)}
                              className="p-4 bg-white rounded-xl text-left hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-blue-300 group"
                            >
                              <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                                  <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-semibold text-slate-900">{section.title}</span>
                              </div>
                              <p className="text-sm text-slate-600">{section.description}</p>
                              <div className="mt-2 text-xs text-blue-600 font-medium">
                                {section.estimatedRead} read
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">Refugee Support Platform</span>
            </div>
            <p className="text-slate-400 mb-6">Your privacy and security are our top priorities.</p>
            <div className="flex justify-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
            <div className="mt-8 text-xs text-slate-500">
              © 2026 Refugee Support Platform. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get icons for sections
function getIconForSection(sectionId: string) {
  const icons: { [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>> } = {
    overview: Info,
    collection: Users,
    usage: Settings,
    sharing: Users,
    security: Shield,
    rights: Eye,
    cookies: Cookie,
    children: Baby,
    changes: RefreshCw,
    contact: Phone
  };
  return icons[sectionId] || Info;
}
