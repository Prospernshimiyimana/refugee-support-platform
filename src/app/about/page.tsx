'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Home, Briefcase, Users, BookOpen, Globe, Shield, Target, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Heart className="w-4 h-4 mr-2" />
                About Our Mission
              </motion.div>

              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="block mb-2">About</span>
                <span className="block text-3xl md:text-4xl lg:text-5xl text-blue-600">Refugee Support Platform</span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl lg:max-w-none"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Empowering refugees with essential resources, legal guidance, and community support to build new lives with dignity and hope.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a
                    href="#mission"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a
                    href="#contact"
                    className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    Get Involved
                    <Users className="w-5 h-5 ml-2" />
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-2xl flex items-center justify-center">
                  <Heart className="w-24 h-24 text-blue-600" />
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <Globe className="w-8 h-8 text-blue-600" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                <Shield className="w-6 h-6 text-green-600" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

        {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Target className="w-4 h-4 mr-2" />
              Our Mission
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              To provide comprehensive support and resources for refugees, helping them navigate the complexities of resettlement, 
              access legal assistance, and build new lives with dignity and hope.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start space-x-4"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Support</h3>
                    <p className="text-gray-600">Providing holistic assistance covering legal, housing, employment, and healthcare needs.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-4"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Integration</h3>
                    <p className="text-gray-600">Fostering connections and building supportive networks for successful integration.</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-4"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Dignity & Hope</h3>
                    <p className="text-gray-600">Empowering refugees to rebuild their lives with confidence and optimism.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-xl flex items-center justify-center">
                <Target className="w-32 h-32 text-blue-600" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl shadow-xl flex items-center justify-center">
                <Zap className="w-32 h-32 text-green-600" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Our Vision
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                A world where every refugee has access to the resources, support, and opportunities needed to thrive and contribute to their new communities.
              </p>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Inclusive communities that welcome diversity</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Equal access to education and employment</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Sustainable support systems for long-term success</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Our Values
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our work and shape our approach to refugee support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'Compassion', color: 'red', description: 'Treating every refugee with empathy and understanding' },
              { icon: Shield, title: 'Protection', color: 'blue', description: 'Ensuring safety and security for all refugees' },
              { icon: Users, title: 'Community', color: 'green', description: 'Building inclusive and supportive networks' },
              { icon: BookOpen, title: 'Education', color: 'purple', description: 'Providing learning opportunities for all ages' },
              { icon: Home, title: 'Stability', color: 'yellow', description: 'Creating foundation for lasting success' },
              { icon: Briefcase, title: 'Opportunity', color: 'indigo', description: 'Opening doors to economic independence' }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full">
                  <motion.div 
                    className={`w-16 h-16 bg-${value.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <value.icon className={`w-8 h-8 text-${value.color}-600`} />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Users className="w-4 h-4 mr-2" />
              Our Team
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to making a difference in refugee lives
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Executive Director', experience: '15+ years in refugee advocacy' },
              { name: 'Dr. Michael Chen', role: 'Legal Director', experience: 'Immigration law specialist' },
              { name: 'Maria Rodriguez', role: 'Program Manager', experience: 'Community integration expert' }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="w-12 h-12 text-blue-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-gray-600 mb-3">{member.role}</p>
                  <p className="text-sm text-gray-500">{member.experience}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Get Involved Today</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join us in making a difference. Whether you&apos;re looking to volunteer, donate, or partner with us, 
              there are many ways to support refugee families in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  Contact Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="/volunteer"
                  className="inline-flex items-center px-8 py-4 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-all duration-300 border-2 border-white"
                >
                  Volunteer
                  <Heart className="w-5 h-5 ml-2" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

        </div>
  );
}
