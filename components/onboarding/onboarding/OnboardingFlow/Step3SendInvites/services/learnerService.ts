// components/onboarding/services/learnerService.ts
import { Learner, Grade } from '../types';

export interface LearnerFilters {
  gradeIds?: string[];
  searchTerm?: string;
  status?: 'active' | 'inactive' | 'all';
  lastActiveAfter?: Date;
  lastActiveBefore?: Date;
}

export interface LearnerServiceConfig {
  apiBaseUrl: string;
  apiKey?: string;
}

class LearnerService {
  private config: LearnerServiceConfig;

  constructor(config: LearnerServiceConfig) {
    this.config = config;
  }

  /**
   * Get all learners with optional filtering
   */
  async getLearners(filters?: LearnerFilters): Promise<Learner[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.gradeIds?.length) {
        queryParams.append('gradeIds', filters.gradeIds.join(','));
      }
      if (filters?.searchTerm) {
        queryParams.append('search', filters.searchTerm);
      }
      if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters?.lastActiveAfter) {
        queryParams.append('lastActiveAfter', filters.lastActiveAfter.toISOString());
      }
      if (filters?.lastActiveBefore) {
        queryParams.append('lastActiveBefore', filters.lastActiveBefore.toISOString());
      }

      const url = `${this.config.apiBaseUrl}/learners${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch learners: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching learners:', error);
      throw error;
    }
  }

  /**
   * Get a specific learner by ID
   */
  async getLearner(learnerId: string): Promise<Learner> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/learners/${learnerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch learner: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching learner:', error);
      throw error;
    }
  }

  /**
   * Search learners by name or email
   */
  async searchLearners(searchTerm: string): Promise<Learner[]> {
    return this.getLearners({ searchTerm });
  }

  /**
   * Get learners by grade
   */
  async getLearnersByGrade(gradeId: string): Promise<Learner[]> {
    return this.getLearners({ gradeIds: [gradeId] });
  }

  /**
   * Get learners by multiple grades
   */
  async getLearnersByGrades(gradeIds: string[]): Promise<Learner[]> {
    return this.getLearners({ gradeIds });
  }

  /**
   * Update learner information
   */
  async updateLearner(learnerId: string, updates: Partial<Learner>): Promise<Learner> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/learners/${learnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update learner: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating learner:', error);
      throw error;
    }
  }

  /**
   * Get learner statistics
   */
  async getLearnerStats(): Promise<{
    totalLearners: number;
    activeLearners: number;
    inactiveLearners: number;
    byGrade: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/learners/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch learner stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching learner stats:', error);
      throw error;
    }
  }

  /**
   * Bulk update learners
   */
  async bulkUpdateLearners(updates: Array<{ id: string; updates: Partial<Learner> }>): Promise<Learner[]> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/learners/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk update learners: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk updating learners:', error);
      throw error;
    }
  }

  /**
   * Export learners data
   */
  async exportLearners(format: 'csv' | 'json' = 'csv', filters?: LearnerFilters): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);

      if (filters?.gradeIds?.length) {
        queryParams.append('gradeIds', filters.gradeIds.join(','));
      }
      if (filters?.searchTerm) {
        queryParams.append('search', filters.searchTerm);
      }
      if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }

      const response = await fetch(`${this.config.apiBaseUrl}/learners/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export learners: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting learners:', error);
      throw error;
    }
  }
}

// ✅ Default instance always points to port 4000
export const learnerService = new LearnerService({
  apiBaseUrl: 'http://localhost:4000/api/v1',
});

export default LearnerService;
