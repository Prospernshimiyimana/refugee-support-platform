import Link from 'next/link';

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    summary: string;
    date: string;
    createdAt: any;
    updatedAt: any;
  };
}

export default function NewsCard({ article }: NewsCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/news/${article.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-500 hover:scale-105 active:scale-95 p-6 border border-gray-100 cursor-pointer group opacity-0 translate-y-4 animate-in">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4 leading-tight group-hover:text-sky-600 transition-all duration-300">
            {article.title}
          </h3>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-sky-50 text-sky-700 border-sky-200 transition-all duration-300 group-hover:scale-105">
            News
          </span>
        </div>
        
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-600 transition-all duration-300 mb-4">
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center text-xs text-gray-400">
            <svg className="w-4 h-4 mr-1 transition-all duration-300 group-hover:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(article.date)}
          </div>
        </div>
      </div>
    </Link>
  );
}
