import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { getCaseTitle, getCaseDescription } from '@/lib/multilingual';
import { type LegalCase } from '../../lib/caseService';

interface CaseCardProps {
  legalCase: LegalCase;
}

export default function CaseCard({ legalCase }: CaseCardProps) {
  const { language } = useLanguage();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Blocked':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (date: Date | { toDate: () => Date } | undefined | null) => {
    if (!date) {
      return 'No date available';
    }
    if ('toDate' in date) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  return (
    <Link href={`/cases/${legalCase.id}`} className="block">
      <div className="group relative">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
        
        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 active:scale-95 p-6 border border-gray-100 group-hover:border-sky-200 cursor-pointer opacity-0 translate-y-4 animate-in">
          {/* Status indicator icon */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4 leading-tight group-hover:text-sky-600 transition-all duration-300 transform group-hover:translate-x-1">
              {getCaseTitle(language, legalCase)}
            </h3>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${getStatusColor(
                legalCase.status
              )}`}
            >
              {legalCase.status}
            </span>
          </div>
          
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-600 transition-all duration-300 mb-4 transform group-hover:translate-y-1">
            {getCaseDescription(language, legalCase)}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 group-hover:border-gray-100 transition-all duration-300">
            <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-500 transition-all duration-300">
              <svg className="w-4 h-4 mr-1 transition-all duration-300 group-hover:text-sky-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(legalCase.updatedAt)}
            </div>
            
            {/* View details indicator */}
            <div className="flex items-center text-sky-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <span className="text-xs font-medium mr-1">View</span>
              <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Card corner decoration */}
          <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-sky-100 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-sky-100 to-transparent rounded-br-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        </div>
      </div>
    </Link>
  );
}
