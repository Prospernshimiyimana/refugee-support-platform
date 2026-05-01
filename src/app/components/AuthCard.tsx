'use client';

import React from 'react';
import Link from 'next/link';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showBackLink?: boolean;
  backLinkText?: string;
  backLinkHref?: string;
}

export default function AuthCard({ 
  title, 
  subtitle, 
  children, 
  showBackLink = false, 
  backLinkText = "← Back to Home",
  backLinkHref = "/" 
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600">
              {subtitle}
            </p>
          </div>

          {/* Content */}
          {children}

          {/* Back Link */}
          {showBackLink && (
            <div className="mt-6 text-center">
              <Link 
                href={backLinkHref}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {backLinkText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
