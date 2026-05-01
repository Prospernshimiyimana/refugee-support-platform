'use client';

import React, { useState } from 'react';

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const resources = [
    {
      id: 'legal',
      category: 'legal',
      title: 'Legal Resources',
      description: 'Access to legal forms, document templates, and guidance for asylum applications.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'blue',
      features: [
        { name: 'Asylum application forms', available: true, description: 'Complete forms and templates' },
        { name: 'Legal document templates', available: true, description: 'Ready-to-use legal documents' },
        { name: 'Court procedure guides', available: true, description: 'Step-by-step court guidance' },
        { name: 'Pro bono lawyer matching', available: false, description: 'Coming soon' }
      ],
      stats: { forms: 15, guides: 8, templates: 23 }
    },
    {
      id: 'medical',
      category: 'healthcare',
      title: 'Healthcare Resources',
      description: 'Information about healthcare access, medical facilities, and mental health support.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'green',
      features: [
        { name: 'Find nearby clinics', available: true, description: 'Locate medical facilities' },
        { name: 'Mental health support', available: true, description: 'Counseling and therapy services' },
        { name: 'Emergency medical info', available: true, description: 'Emergency contact information' },
        { name: 'Telemedicine services', available: false, description: 'Virtual consultations coming soon' }
      ],
      stats: { clinics: 45, therapists: 12, services: 28 }
    },
    {
      id: 'housing',
      category: 'housing',
      title: 'Housing Resources',
      description: 'Resources for finding temporary and permanent housing solutions.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'purple',
      features: [
        { name: 'Shelter locations', available: true, description: 'Emergency shelter directory' },
        { name: 'Rental assistance', available: true, description: 'Financial help for housing' },
        { name: 'Housing rights guide', available: true, description: 'Know your housing rights' },
        { name: 'Roommate matching', available: false, description: 'Find compatible roommates' }
      ],
      stats: { shelters: 18, programs: 7, guides: 15 }
    },
    {
      id: 'education',
      category: 'education',
      title: 'Education Resources',
      description: 'Educational opportunities, language learning, and skill development programs.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'yellow',
      features: [
        { name: 'Language classes', available: true, description: 'ESL and language courses' },
        { name: 'School enrollment', available: true, description: 'Help with school registration' },
        { name: 'Job training programs', available: true, description: 'Skills development courses' },
        { name: 'Online courses', available: false, description: 'E-learning platform coming soon' }
      ],
      stats: { classes: 32, programs: 15, students: 1250 }
    },
    {
      id: 'employment',
      category: 'employment',
      title: 'Employment Resources',
      description: 'Job search assistance, work authorization, and employment rights information.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'indigo',
      features: [
        { name: 'Work permit guidance', available: true, description: 'Authorization assistance' },
        { name: 'Resume building help', available: true, description: 'Professional resume services' },
        { name: 'Employee rights info', available: true, description: 'Know your workplace rights' },
        { name: 'Job matching service', available: false, description: 'AI-powered job matching' }
      ],
      stats: { jobs: 156, employers: 42, placements: 89 }
    },
    {
      id: 'community',
      category: 'community',
      title: 'Community Resources',
      description: 'Community organizations, support groups, and cultural integration resources.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'red',
      features: [
        { name: 'Local support groups', available: true, description: 'Peer support networks' },
        { name: 'Cultural events', available: true, description: 'Community gatherings' },
        { name: 'Volunteer opportunities', available: true, description: 'Give back to community' },
        { name: 'Mentorship program', available: false, description: '1-on-1 mentoring coming soon' }
      ],
      stats: { groups: 24, events: 156, volunteers: 342 }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', icon: '🌐' },
    { id: 'legal', name: 'Legal', icon: '⚖️' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'housing', name: 'Housing', icon: '🏠' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'employment', name: 'Employment', icon: '💼' },
    { id: 'community', name: 'Community', icon: '👥' }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; light: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
      red: { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Resources & Support</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Comprehensive resources, guides, and information to help refugees and advocates navigate every step of the journey
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                />
                <svg className="absolute left-5 top-4.5 w-6 h-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredResources.length} resources found
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => {
            const colors = getColorClasses(resource.color);
            const isExpanded = expandedCard === resource.id;
            
            return (
              <div
                key={resource.id}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  {/* Card Header */}
                  <div className={`p-6 ${colors.light} border-b ${colors.border}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {resource.icon}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 ${colors.bg} text-white text-xs font-semibold rounded-full`}>
                          {resource.stats[Object.keys(resource.stats)[0] as keyof typeof resource.stats]}+ Available
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{resource.description}</p>
                  </div>

                  {/* Stats Bar */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {Object.entries(resource.stats).map(([key, value]) => (
                        <div key={key} className="group/item">
                          <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
                          <div className="text-xs text-gray-500 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {resource.features.slice(0, isExpanded ? resource.features.length : 3).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                            feature.available ? colors.bg : 'bg-gray-300'
                          }`}>
                            {feature.available ? (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              feature.available ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {feature.name}
                            </div>
                            <div className={`text-xs ${
                              feature.available ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {feature.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expand/Collapse Button */}
                    {resource.features.length > 3 && (
                      <button
                        onClick={() => toggleCard(resource.id)}
                        className={`mt-4 w-full py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${colors.border} ${colors.text} hover:${colors.light}`}
                      >
                        {isExpanded ? 'Show Less' : `Show ${resource.features.length - 3} More`}
                      </button>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    <button className={`w-full py-3 px-4 ${colors.bg} text-white rounded-xl hover:opacity-90 transition-opacity duration-200 font-semibold shadow-lg`}>
                      Access Resources
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Emergency Contacts Section */}
      <div className="bg-red-50 border-t border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Emergency Contacts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              If you're in immediate danger or need urgent assistance, contact these emergency services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Emergency Services</h3>
              <p className="text-gray-600 mb-4">For immediate life-threatening emergencies</p>
              <div className="text-3xl font-bold text-red-600 mb-2">911</div>
              <p className="text-sm text-gray-500">Available 24/7</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Refugee Hotline</h3>
              <p className="text-gray-600 mb-4">24/7 support for refugees and asylum seekers</p>
              <div className="text-2xl font-bold text-blue-600 mb-2">1-800-HELP-REF</div>
              <p className="text-sm text-gray-500">Multilingual support available</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Legal Aid</h3>
              <p className="text-gray-600 mb-4">Free legal assistance and representation</p>
              <div className="text-2xl font-bold text-green-600 mb-2">1-800-LEGAL-AID</div>
              <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
