import { CreateLearnerData, BulkUploadResult } from '../types';
import { Learner } from './../OnboardingFlow/Step3SendInvites/types';

// ✅ Use environment variable for flexibility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

/**
 * Service for handling learner-related operations
 */
class LearnerService {
  private baseUrl = `${API_BASE_URL}/learners`;

  /*
   * Helper method for making API calls
   */
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get learners by school ID
   */
  async getLearnersBySchool(
    schoolId: string,
    params?: {
      page?: number;
      limit?: number;
      gradeId?: string;
      search?: string;
    }
  ): Promise<Learner[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('school_id', schoolId);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.gradeId) queryParams.append('grade_id', params.gradeId);
    if (params?.search) queryParams.append('search', params.search);

    const data = await this.apiCall(`${this.baseUrl}?${queryParams.toString()}`);
    return data.data?.learners || [];
  }

  /**
   * Create a new learner
   */
  async createLearner(learnerData: CreateLearnerData): Promise<Learner> {
    const data = await this.apiCall(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(learnerData),
    });
    return data.data;
  }

  /**
   * Bulk upload learners from CSV/data
   */
  async createBulkLearners(learnersData: CreateLearnerData[]): Promise<BulkUploadResult> {
    const data = await this.apiCall(`${this.baseUrl}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ learners: learnersData }),
    });
    return data.data;
  }

  /**
   * Update learner information
   */
  async updateLearner(learnerId: string, updates: Partial<CreateLearnerData>): Promise<Learner> {
    const data = await this.apiCall(`${this.baseUrl}/${learnerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data.data;
  }

  /**
   * Delete a learner
   */
  async deleteLearner(learnerId: string): Promise<{ success: boolean; message: string }> {
    return this.apiCall(`${this.baseUrl}/${learnerId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get learner statistics for a school
   */
  async getLearnerStats(
    schoolId: string
  ): Promise<{
    total: number;
    byGrade: { gradeId: string; gradeName: string; count: number }[];
    byStatus: { status: string; count: number }[];
    recentAdditions: number;
  }> {
    const data = await this.apiCall(`${this.baseUrl}/stats?school_id=${schoolId}`);
    return data.data;
  }

  /**
   * Search learners within a school
   */
  async searchLearners(
    schoolId: string,
    query: string,
    options?: { gradeId?: string; limit?: number }
  ): Promise<Learner[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('school_id', schoolId);
    queryParams.append('query', query);

    if (options?.gradeId) queryParams.append('grade_id', options.gradeId);
    if (options?.limit) queryParams.append('limit', options.limit.toString());

    const data = await this.apiCall(`${this.baseUrl}/search?${queryParams.toString()}`);
    return data.data?.learners || [];
  }

  /**
   * Validate learner data before creation/update
   */
  async validateLearnerData(
    learnerData: Partial<CreateLearnerData>
  ): Promise<{
    isValid: boolean;
    errors: Record<string, string[]>;
    suggestions?: Record<string, string>;
  }> {
    return this.apiCall(`${this.baseUrl}/validate`, {
      method: 'POST',
      body: JSON.stringify(learnerData),
    });
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

// ✅ Export singleton instance
export const learnerService = new LearnerService();
