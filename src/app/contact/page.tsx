'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Clock, MessageSquare, Users, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ 
        name: '', 
        email: '', 
        subject: '', 
        message: ''
      });
      setFormErrors({});
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-8 border border-white/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Mail className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Contact Us
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We&apos;re here to help. Reach out to our team for support, questions, or assistance with your refugee journey.
            </motion.p>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-100">Emergency Support</div>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-white mb-2">&lt;24hrs</div>
                <div className="text-blue-100">Response Time</div>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-white mb-2">5,000+</div>
                <div className="text-blue-100">People Helped</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re here to help. Reach out to our team for support, questions, or assistance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Send us a message</h3>
                  <p className="text-gray-600">Fill out the form and we&apos;ll get back to you within 24 hours.</p>
                </div>

                {/* Success State */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-6 bg-green-50 border border-green-200 rounded-2xl"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-green-800 mb-1">Message Sent!</h4>
                        <p className="text-green-700">We&apos;ll respond within 24 hours.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error State */}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-red-800 mb-1">Error</h4>
                        <p className="text-red-700">Please try again or contact us directly.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          formErrors.name 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200 bg-gray-50 hover:bg-white'
                        }`}
                        placeholder="John Doe"
                      />
                      {formErrors.name && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          formErrors.email 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200 bg-gray-50 hover:bg-white'
                        }`}
                        placeholder="john@example.com"
                      />
                      {formErrors.email && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        formErrors.subject 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 bg-gray-50 hover:bg-white'
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="legal">Legal Assistance</option>
                      <option value="medical">Medical Support</option>
                      <option value="housing">Housing Help</option>
                      <option value="employment">Employment</option>
                      <option value="education">Education</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.subject && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                      Message *
                      <span className="text-xs text-gray-500 ml-2">({formData.message.length}/500)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      maxLength={500}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none ${
                        formErrors.message 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 bg-gray-50 hover:bg-white'
                      }`}
                      placeholder="Tell us how we can help you..."
                    />
                    {formErrors.message && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.message}</p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </span>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-8"
            >
              {/* Contact Cards */}
              <div className="space-y-6">
                <motion.div
                  className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                  whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Email</h4>
                      <p className="text-gray-600 mb-3">Send us an email anytime</p>
                      <div className="space-y-2">
                        <a href="mailto:info@refugeeplatform.org" className="text-blue-600 hover:text-blue-700 font-medium block">
                          info@refugeeplatform.org
                        </a>
                        <a href="mailto:support@refugeeplatform.org" className="text-blue-600 hover:text-blue-700 font-medium block">
                          support@refugeeplatform.org
                        </a>
                        <a href="mailto:emergency@refugeeplatform.org" className="text-red-600 hover:text-red-700 font-medium block">
                          emergency@refugeeplatform.org
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                  whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Phone</h4>
                      <p className="text-gray-600 mb-3">Call us for immediate support</p>
                      <div className="space-y-2">
                        <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-700 font-medium block">
                          +1 (555) 123-4567 (Main)
                        </a>
                        <a href="tel:+1800HELPREF" className="text-blue-600 hover:text-blue-700 font-medium block">
                          +1 (800) HELP-REF (24/7)
                        </a>
                        <a href="tel:+1800911HELP" className="text-red-600 hover:text-red-700 font-medium block">
                          +1 (800) 911-HELP (Emergency)
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                  whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Office Location</h4>
                      <p className="text-gray-600 mb-3">Visit us in person</p>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          123 Refugee Support Center<br />
                          San Francisco, CA 94102<br />
                          <span className="text-sm text-gray-500">Mon-Fri 9AM-6PM</span>
                        </p>
                        <p className="text-gray-700">
                          456 Community Hub<br />
                          Oakland, CA 94607<br />
                          <span className="text-sm text-gray-500">Tue-Thu 10AM-4PM</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Office Hours */}
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center mr-4">
                    <Clock className="w-7 h-7 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Office Hours</h4>
                    <p className="text-gray-600">When we&apos;re available to help</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                    <span className="font-medium text-gray-900">Monday - Friday</span>
                    <span className="text-blue-600 font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                    <span className="font-medium text-gray-900">Saturday</span>
                    <span className="text-blue-600 font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-100/60 rounded-xl">
                    <span className="font-medium text-gray-500">Sunday</span>
                    <span className="text-gray-500 font-semibold">Closed</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="font-medium text-red-900">Emergency Hotline</span>
                    <span className="text-red-600 font-semibold">24/7 Available</span>
                  </div>
                </div>
              </motion.div>

              {/* Social Media */}
              <motion.div
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
                    <Users className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Connect With Us</h4>
                    <p className="text-gray-600">Follow for updates and resources</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.a
                    href="#"
                    className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-medium">Facebook</span>
                  </motion.a>
                  <motion.a
                    href="#"
                    className="flex items-center justify-center p-4 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-medium">Twitter</span>
                  </motion.a>
                  <motion.a
                    href="#"
                    className="flex items-center justify-center p-4 bg-blue-700 text-white rounded-2xl hover:bg-blue-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-medium">LinkedIn</span>
                  </motion.a>
                  <motion.a
                    href="#"
                    className="flex items-center justify-center p-4 bg-pink-600 text-white rounded-2xl hover:bg-pink-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-medium">Instagram</span>
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Have Questions?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Check out our FAQ section for quick answers to common questions.
            </p>
            <motion.a
              href="/faq"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View FAQ
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
