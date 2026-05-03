import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export interface LegalCase {
  id: string;
  title_en: string;
  title_rw: string;
  status: 'Active' | 'Pending' | 'Blocked';
  description_en: string;
  description_rw: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  clientId?: string;
  assignedTo?: string;
  priority?: 'High' | 'Medium' | 'Low';
  filedDate?: Date;
  documents?: string[];
  notes?: string;
}

class CaseService {
  private collection = db ? collection(db, 'cases') : null;

  // Get a single case by ID
  async getCaseById(caseId: string): Promise<LegalCase | null> {
    try {
      if (!db) {
        console.error('CaseService: Database not available');
        throw new Error('Database not available');
      }
      
      const caseDoc = await getDoc(doc(db, 'cases', caseId));
      
      if (caseDoc.exists()) {
        const caseData = caseDoc.data();
        return {
          id: caseDoc.id,
          ...caseData
        } as LegalCase;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching case by ID:', error);
      throw error;
    }
  }

  // Get all cases
  async getAllCases(): Promise<LegalCase[]> {
    try {
      if (!this.collection) {
        console.error('CaseService: Database not available');
        throw new Error('Database not available');
      }
      
      const snapshot = await getDocs(this.collection);
      const cases: LegalCase[] = [];
      
      snapshot.forEach((doc) => {
        cases.push({
          id: doc.id,
          ...doc.data()
        } as LegalCase);
      });
      
      return cases;
    } catch (error) {
      console.error('Error fetching all cases:', error);
      throw error;
    }
  }

  // Get cases by status
  async getCasesByStatus(status: string): Promise<LegalCase[]> {
    try {
      if (!this.collection) {
        console.error('CaseService: Database not available');
        throw new Error('Database not available');
      }
      
      const q = query(this.collection, where('status', '==', status));
      const snapshot = await getDocs(q);
      const cases: LegalCase[] = [];
      
      snapshot.forEach((doc) => {
        cases.push({
          id: doc.id,
          ...doc.data()
        } as LegalCase);
      });
      
      return cases;
    } catch (error) {
      console.error('Error fetching cases by status:', error);
      throw error;
    }
  }

  // Get cases by assigned user
  async getCasesByAssignedUser(userId: string): Promise<LegalCase[]> {
    try {
      if (!this.collection) {
        console.error('CaseService: Database not available');
        throw new Error('Database not available');
      }
      
      const q = query(this.collection, where('assignedTo', '==', userId));
      const snapshot = await getDocs(q);
      const cases: LegalCase[] = [];
      
      snapshot.forEach((doc) => {
        cases.push({
          id: doc.id,
          ...doc.data()
        } as LegalCase);
      });
      
      return cases;
    } catch (error) {
      console.error('Error fetching cases by assigned user:', error);
      throw error;
    }
  }

  // Delete a case by ID
  async deleteCase(caseId: string): Promise<void> {
    try {
      if (!db) {
        console.error('CaseService: Database not available');
        throw new Error('Database not available');
      }
      
      const caseDoc = doc(db, 'cases', caseId);
      await deleteDoc(caseDoc);
    } catch (error) {
      console.error('Error deleting case:', error);
      throw error;
    }
  }
}

export const caseService = new CaseService();
