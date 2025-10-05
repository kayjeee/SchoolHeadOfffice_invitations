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

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
    };
  }

  private async fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, { ...options, headers: this.getHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }

  /**
   * Get all learners for a school, with optional filtering
   */
  async getLearners(schoolId: string, filters?: LearnerFilters): Promise<Learner[]> {
    if (!schoolId) throw new Error("School ID is required.");
    const queryParams = new URLSearchParams();

    if (filters?.gradeIds?.length) queryParams.append('gradeIds', filters.gradeIds.join(','));
    if (filters?.searchTerm) queryParams.append('search', filters.searchTerm);
    if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters?.lastActiveAfter) queryParams.append('lastActiveAfter', filters.lastActiveAfter.toISOString());
    if (filters?.lastActiveBefore) queryParams.append('lastActiveBefore', filters.lastActiveBefore.toISOString());

    const url = `${this.config.apiBaseUrl}/schools/${schoolId}/learners?${queryParams.toString()}`;
    return this.fetchJSON<Learner[]>(url);
  }

  /**
   * Get a specific learner by ID from a school
   */
  async getLearner(schoolId: string, learnerId: string): Promise<Learner> {
    if (!schoolId || !learnerId) throw new Error("School ID and Learner ID are required.");
    const url = `${this.config.apiBaseUrl}/schools/${schoolId}/learners/${learnerId}`;
    return this.fetchJSON<Learner>(url);
  }

  /**
   * Search learners by name or email within a school
   */
  async searchLearners(schoolId: string, searchTerm: string): Promise<Learner[]> {
    return this.getLearners(schoolId, { searchTerm });
  }

  /**
   * Get learners by grade within a school
   */
  async getLearnersByGrade(schoolId: string, gradeId: string): Promise<Learner[]> {
    return this.getLearners(schoolId, { gradeIds: [gradeId] });
  }

  /**
   * Get learners by multiple grades within a school
   */
  async getLearnersByGrades(schoolId: string, gradeIds: string[]): Promise<Learner[]> {
    return this.getLearners(schoolId, { gradeIds });
  }

  /**
   * Update learner information in a school
   */
  async updateLearner(schoolId: string, learnerId: string, updates: Partial<Learner>): Promise<Learner> {
    if (!schoolId || !learnerId) throw new Error("School ID and Learner ID are required.");
    const url = `${this.config.apiBaseUrl}/schools/${schoolId}/learners/${learnerId}`;
    return this.fetchJSON<Learner>(url, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get learner statistics for a school
   */
  async getLearnerStats(schoolId: string): Promise<{
    totalLearners: number;
    activeLearners: number;
    inactiveLearners: number;
    byGrade: Record<string, number>;
  }> {
    if (!schoolId) throw new Error("School ID is required.");
    const url = `${this.config.apiBaseUrl}/schools/${schoolId}/learners/stats`;
    return this.fetchJSON<any>(url);
  }

  /**
   * Bulk update learners in a school
   */
  async bulkUpdateLearners(schoolId: string, updates: Array<{ id: string; updates: Partial<Learner> }>): Promise<Learner[]> {
    if (!schoolId) throw new Error("School ID is required.");
    const url = `${this.config.apiBaseUrl}/schools/${schoolId}/learners/bulk-update`;
    return this.fetchJSON<Learner[]>(url, {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  /**
   * Export learners data from a school
   */
  async exportLearners(schoolId: string, format: 'csv' | 'json' = 'csv', filters?: LearnerFilters): Promise<Blob> {
    if (!schoolId) throw new Error("School ID is required.");
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);

    if (filters?.gradeIds?.length) queryParams.append('gradeIds', filters.gradeIds.join(','));
    if (filters?.searchTerm) queryParams.append('search', filters.searchTerm);
    if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);

    const url = `${this.config.apiBaseUrl}/schools/${schoolId}/learners/export?${queryParams.toString()}`;
    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      throw new Error(`Failed to export learners: ${response.statusText}`);
    }
    return response.blob();
  }
}

// ✅ Default instance always points to port 4000
export const learnerService = new LearnerService({
  apiBaseUrl: 'http://localhost:4000/api/v1',
});

export default LearnerService;
