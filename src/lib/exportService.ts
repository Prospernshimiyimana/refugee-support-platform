import { 
  collection, 
  getDocs, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export interface ExportData {
  cases: ExportCase[];
  news: ExportNews[];
}

export interface ExportCase {
  id: string;
  title: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExportNews {
  id: string;
  title: string;
  summary: string;
  date: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

class ExportService {
  // Fetch all cases from Firestore
  async fetchCases(): Promise<ExportCase[]> {
    try {
      if (!db) {
        console.error('ExportService: Database not available');
        throw new Error('Database not available');
      }
      
      const casesCollection = collection(db, 'cases');
      const casesQuery = query(casesCollection, orderBy('createdAt', 'desc'));
      const casesSnapshot = await getDocs(casesQuery);
      
      return casesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          status: data.status || '',
          description: data.description || '',
          createdAt: this.formatTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? this.formatTimestamp(data.updatedAt) : ''
        };
      });
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw new Error('Failed to fetch cases from Firestore');
    }
  }

  // Fetch all news from Firestore
  async fetchNews(): Promise<ExportNews[]> {
    try {
      if (!db) {
        console.error('ExportService: Database not available');
        throw new Error('Database not available');
      }
      
      const newsCollection = collection(db, 'news');
      const newsQuery = query(newsCollection, orderBy('date', 'desc'));
      const newsSnapshot = await getDocs(newsQuery);
      
      return newsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          summary: data.summary || '',
          date: data.date || '',
          status: data.status || '',
          createdAt: this.formatTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? this.formatTimestamp(data.updatedAt) : ''
        };
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news from Firestore');
    }
  }

  // Fetch all data for export
  async fetchAllData(): Promise<ExportData> {
    try {
      const [cases, news] = await Promise.all([
        this.fetchCases(),
        this.fetchNews()
      ]);
      
      return { cases, news };
    } catch (error) {
      console.error('Error fetching export data:', error);
      throw error;
    }
  }

  // Convert Firestore timestamp to readable string
  private formatTimestamp(timestamp: Date | { toDate: () => Date } | string): string {
    if (!timestamp) return '';
    
    // Handle Firestore Timestamp
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    
    // Handle regular Date object
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    
    // Handle string date
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toISOString();
    }
    
    return '';
  }

  // Convert data to CSV format
  convertToCSV(data: ExportData): string {
    const headers = ['Type', 'ID', 'Title', 'Status/Date', 'Description/Summary', 'Created At', 'Updated At'];
    const rows: string[][] = [headers];

    // Add cases
    data.cases.forEach(caseItem => {
      rows.push([
        'Case',
        caseItem.id,
        this.escapeCSVField(caseItem.title),
        this.escapeCSVField(caseItem.status),
        this.escapeCSVField(caseItem.description),
        caseItem.createdAt,
        caseItem.updatedAt || ''
      ]);
    });

    // Add news
    data.news.forEach(newsItem => {
      rows.push([
        'News',
        newsItem.id,
        this.escapeCSVField(newsItem.title),
        this.escapeCSVField(newsItem.date),
        this.escapeCSVField(newsItem.summary),
        newsItem.createdAt,
        newsItem.updatedAt || ''
      ]);
    });

    return rows.map(row => row.join(',')).join('\n');
  }

  // Escape CSV fields to handle commas, quotes, and newlines
  private escapeCSVField(field: string): string {
    if (!field) return '';
    
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    
    return field;
  }

  // Trigger browser download
  downloadCSV(csvContent: string, filename: string = 'export.csv'): void {
    try {
      // Create blob with proper MIME type
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      // Create download link
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        // Create URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Set link attributes
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        // Append to document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('CSV download initiated successfully');
      } else {
        // Fallback for browsers that don't support download attribute
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`<pre>${csvContent}</pre>`);
          newWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      throw new Error('Failed to download CSV file');
    }
  }

  // Complete export process
  async exportToCSV(filename?: string): Promise<void> {
    try {
      console.log('Starting export process...');
      
      // Fetch data from Firestore
      const data = await this.fetchAllData();
      
      console.log(`Fetched ${data.cases.length} cases and ${data.news.length} news articles`);
      
      // Convert to CSV
      const csvContent = this.convertToCSV(data);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const defaultFilename = `refugee-support-export-${timestamp}.csv`;
      const finalFilename = filename || defaultFilename;
      
      // Trigger download
      this.downloadCSV(csvContent, finalFilename);
      
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // Export cases only
  async exportCasesToCSV(filename?: string): Promise<void> {
    try {
      console.log('Starting cases export...');
      
      const cases = await this.fetchCases();
      const data: ExportData = { cases, news: [] };
      const csvContent = this.convertToCSV(data);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = `cases-export-${timestamp}.csv`;
      const finalFilename = filename || defaultFilename;
      
      this.downloadCSV(csvContent, finalFilename);
      
      console.log('Cases export completed successfully');
    } catch (error) {
      console.error('Cases export failed:', error);
      throw error;
    }
  }

  // Export news only
  async exportNewsToCSV(filename?: string): Promise<void> {
    try {
      console.log('Starting news export...');
      
      const news = await this.fetchNews();
      const data: ExportData = { cases: [], news };
      const csvContent = this.convertToCSV(data);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = `news-export-${timestamp}.csv`;
      const finalFilename = filename || defaultFilename;
      
      this.downloadCSV(csvContent, finalFilename);
      
      console.log('News export completed successfully');
    } catch (error) {
      console.error('News export failed:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
