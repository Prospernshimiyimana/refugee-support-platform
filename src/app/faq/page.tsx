'use client';

import React, { useState } from 'react';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      questions: [
        {
          q: 'What is the Refugee Support Platform?',
          a: 'The Refugee Support Platform is a comprehensive digital solution designed to help refugees access essential resources, legal assistance, housing support, and community integration services.'
        },
        {
          q: 'Who can use this platform?',
          a: 'Our platform serves refugees, asylum seekers, their families, advocates, social workers, and partner organizations providing support services.'
        },
        {
          q: 'Is the service free?',
          a: 'Yes, all core services on our platform are completely free for refugees and asylum seekers. We work with partner organizations to ensure accessibility.'
        },
        {
          q: 'How do I get started?',
          a: 'Simply create an account, complete your profile, and you\'ll have access to all our resources and support services.'
        }
      ]
    },
    {
      id: 'legal',
      title: 'Legal & Immigration',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      questions: [
        {
          q: 'What legal services do you provide?',
          a: 'We offer legal document assistance, asylum application guidance, immigration court preparation, and connections to pro bono legal services.'
        },
        {
          q: 'Can you help with asylum applications?',
          a: 'Yes, we provide guidance, document templates, and connections to legal professionals who specialize in asylum cases.'
        },
        {
          q: 'Do you provide legal representation?',
          a: 'While we don\'t directly provide legal representation, we connect you with qualified attorneys and legal aid organizations.'
        },
        {
          q: 'What documents do I need for my case?',
          a: 'Required documents vary by case type, but typically include identification, travel documents, and any relevant legal papers. Our platform helps you organize and track these.'
        }
      ]
    },
    {
      id: 'housing',
      title: 'Housing & Shelter',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      questions: [
        {
          q: 'How can I find emergency shelter?',
          a: 'Our platform maintains an updated database of emergency shelters, including availability, contact information, and requirements.'
        },
        {
          q: 'Do you help with long-term housing?',
          a: 'Yes, we connect you with affordable housing programs, rental assistance, and housing rights education.'
        },
        {
          q: 'What housing documents do I need?',
          a: 'Typically you\'ll need identification, proof of income or need, and any relevant immigration documents. We help you prepare these.'
        },
        {
          q: 'Can you help with housing applications?',
          a: 'We provide guidance on housing applications, document preparation, and connect you with housing counselors.'
        }
      ]
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      questions: [
        {
          q: 'How do I access healthcare services?',
          a: 'We help you navigate healthcare systems, find providers who accept your coverage, and understand your rights to medical care.'
        },
        {
          q: 'Do you provide mental health support?',
          a: 'Yes, we connect you with mental health professionals, support groups, and trauma-informed counseling services.'
        },
        {
          q: 'What if I need emergency medical care?',
          a: 'Always call 911 for emergencies. We also provide information on emergency rooms and urgent care centers.'
        },
        {
          q: 'Can you help with medication costs?',
          a: 'We connect you with prescription assistance programs and low-cost pharmacy options.'
        }
      ]
    },
    {
      id: 'employment',
      title: 'Employment & Education',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      questions: [
        {
          q: 'How can I find employment?',
          a: 'We offer job search assistance, resume building, interview preparation, and connections to refugee-friendly employers.'
        },
        {
          q: 'Do you help with work authorization?',
          a: 'Yes, we provide guidance on work permit applications and understanding employment eligibility requirements.'
        },
        {
          q: 'What language classes are available?',
          a: 'We connect you with free and low-cost language classes, both in-person and online, to help you improve your language skills.'
        },
        {
          q: 'Can you help with school enrollment?',
          a: 'We assist with school enrollment for children and adults, including understanding requirements and accessing educational resources.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Community',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      questions: [
        {
          q: 'How can I connect with other refugees?',
          a: 'We organize community events, support groups, and cultural integration activities to help you build connections.'
        },
        {
          q: 'What volunteer opportunities are available?',
          a: 'We offer various volunteer opportunities both for refugees to give back and for community members to support refugee families.'
        },
        {
          q: 'How do I report an issue or concern?',
          a: 'You can report issues through our platform, contact our support team, or speak with a case manager directly.'
        },
        {
          q: 'What if I need emergency help?',
          a: 'For emergencies, call 911. For urgent refugee-specific assistance, call our 24/7 hotline at 1-800-HELP-REF.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(item => 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0 || searchTerm === '');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our services and support
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Quick Help */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">24/7 Hotline</h3>
              <p className="text-sm text-blue-700 mb-3">Emergency support available anytime</p>
              <p className="text-lg font-bold text-blue-600">1-800-HELP-REF</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Live Chat</h3>
              <p className="text-sm text-green-700 mb-3">Chat with our support team</p>
              <button className="text-green-600 font-medium hover:text-green-700">Start Chat →</button>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Email Support</h3>
              <p className="text-sm text-purple-700 mb-3">Get help via email</p>
              <p className="text-purple-600 font-medium">help@refugeeplatform.org</p>
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No results found for "{searchTerm}"</p>
              <p className="text-gray-400 mt-2">Try searching with different keywords</p>
            </div>
          ) : (
            filteredCategories.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                      {category.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-500">{category.questions.length} questions</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      expandedCategory === category.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedCategory === category.id && (
                  <div className="px-6 pb-4">
                    <div className="space-y-4">
                      {category.questions.map((item, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{item.q}</h4>
                          <p className="text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the answers you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Contact Support
            </a>
            <a 
              href="/help" 
              className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold border border-blue-500"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
