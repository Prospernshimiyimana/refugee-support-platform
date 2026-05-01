'use client';

import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AdminRoute from '../components/AdminRoute';

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      content: [
        {
          question: 'How do I access the dashboard?',
          answer: 'Log in with your admin credentials and you will be automatically redirected to the dashboard.'
        },
        {
          question: 'What can I do on the dashboard?',
          answer: 'You can view statistics, manage cases, create news articles, and monitor user activity.'
        },
        {
          question: 'How do I navigate between sections?',
          answer: 'Use the navigation menu in the top bar to access different sections of the platform.'
        }
      ]
    },
    {
      id: 'cases',
      title: 'Managing Cases',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
        </svg>
      ),
      content: [
        {
          question: 'How do I create a new case?',
          answer: 'Click the "Create New Case" button on the dashboard or navigate to the Cases section and use the form.'
        },
        {
          question: 'What information do I need to create a case?',
          answer: 'You need to provide case title, description, client information, and priority level.'
        },
        {
          question: 'How do I update an existing case?',
          answer: 'Navigate to the Cases section, find the case you want to update, and click the edit button.'
        },
        {
          question: 'Can I delete a case?',
          answer: 'Yes, administrators can delete cases from the Cases section using the delete option.'
        }
      ]
    },
    {
      id: 'news',
      title: 'News Management',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      content: [
        {
          question: 'How do I create a news article?',
          answer: 'Click the "Create News Article" button on the dashboard or navigate to the News section.'
        },
        {
          question: 'What are the different article statuses?',
          answer: 'Articles can be Draft, Published, or Archived. Draft articles are not visible to users.'
        },
        {
          question: 'How do I schedule an article to publish later?',
          answer: 'Set a future publish date when creating or editing an article.'
        },
        {
          question: 'Can I add images to articles?',
          answer: 'Yes, you can upload images when creating or editing news articles.'
        }
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      content: [
        {
          question: 'How do I view user statistics?',
          answer: 'Click on the "Total Users" card on the dashboard to view detailed user statistics.'
        },
        {
          question: 'Can I manage user permissions?',
          answer: 'Administrators can manage user roles and permissions through the admin panel.'
        },
        {
          question: 'How do I reset a user password?',
          answer: 'Use the user management section to send password reset emails to users.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      content: [
        {
          question: 'I forgot my password. What should I do?',
          answer: 'Click the "Forgot Password" link on the login page and follow the instructions to reset your password.'
        },
        {
          question: 'Why can\'t I see certain features?',
          answer: 'Some features are only available to administrators. Check with your system administrator if you need access.'
        },
        {
          question: 'The dashboard is not loading correctly.',
          answer: 'Try clearing your browser cache and cookies, then refresh the page. If issues persist, contact support.'
        },
        {
          question: 'How do I report a bug or issue?',
          answer: 'Contact your system administrator or use the support contact information provided by your organization.'
        }
      ]
    }
  ];

  const filteredSections = helpSections.map(section => ({
    ...section,
    content: section.content.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.content.length > 0 || searchTerm === '');

  return (
    <AdminRoute>
      <DashboardLayout title="Help Center" subtitle="Find answers to common questions">
        <div className="max-w-4xl mx-auto py-6">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/dashboard" className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                <h3 className="font-medium text-blue-900 mb-2">Dashboard</h3>
                <p className="text-sm text-blue-700">Return to main dashboard</p>
              </a>
              <a href="/dashboard/settings" className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
                <h3 className="font-medium text-green-900 mb-2">Settings</h3>
                <p className="text-sm text-green-700">Configure your preferences</p>
              </a>
              <a href="/dashboard/profile" className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                <h3 className="font-medium text-purple-900 mb-2">Profile</h3>
                <p className="text-sm text-purple-700">Manage your account</p>
              </a>
            </div>
          </div>

          {/* Help Sections */}
          <div className="space-y-4">
            {filteredSections.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No results found for &quot;{searchTerm}&quot;</p>
              </div>
            ) : (
              filteredSections.map(section => (
                <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                        {section.icon}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        expandedSection === section.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedSection === section.id && (
                    <div className="px-6 pb-4">
                      <div className="space-y-4">
                        {section.content.map((item, index) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-4">
                            <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Contact Support */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-4">
              If you can&apos;t find the answer to your question, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
};

export default HelpPage;
