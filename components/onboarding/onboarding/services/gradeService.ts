// components/onboarding/services/gradeService.ts
import { Grade, CreateGradeData, UpdateGradeData } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

/**
 * Service for handling grade-related operations
 */
class GradeService {
  private baseUrl = `${API_BASE_URL}/api/v1/grades`;

  /**
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
   * Get grades by school ID
   */
  async getGradesBySchool(schoolId: any, params?: { includeLearners?: boolean; activeOnly?: boolean }): Promise<Grade[]> {
    const id = schoolId?.$oid || schoolId?.id || schoolId;
    const queryParams = new URLSearchParams();
    queryParams.append('school_id', id);
    
    if (params?.includeLearners) queryParams.append('include_learners', 'true');
    if (params?.activeOnly) queryParams.append('active_only', 'true');

    const data = await this.apiCall(`${this.baseUrl}?${queryParams.toString()}`);
    return data.data?.grades || [];
  }

  /**
   * Create a new grade
   */
  async createGrade(gradeData: CreateGradeData): Promise<Grade> {
    const data = await this.apiCall(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
    return data.data;
  }

  /**
   * Update grade information
   */
  async updateGrade(gradeId: string, updates: UpdateGradeData): Promise<Grade> {
    const data = await this.apiCall(`${this.baseUrl}/${gradeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data.data;
  }

  /**
   * Delete a grade (soft delete)
   */
  async deleteGrade(gradeId: string): Promise<{ success: boolean; message: string }> {
    return this.apiCall(`${this.baseUrl}/${gradeId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get grade statistics
   */
  async getGradeStats(schoolId: string): Promise<{
    totalGrades: number;
    totalCapacity: number;
    enrolledLearners: number;
    availableSpots: number;
    gradeBreakdown: { gradeId: string; gradeName: string; enrolled: number; capacity: number }[];
  }> {
    const data = await this.apiCall(`${this.baseUrl}/stats?school_id=${schoolId}`);
    return data.data;
  }

  /**
   * Bulk create grades
   */
  async createBulkGrades(gradesData: CreateGradeData[]): Promise<{ success: number; failed: number; results: Grade[] }> {
    const data = await this.apiCall(`${this.baseUrl}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ grades: gradesData }),
    });
    return data.data;
  }

  /**
   * Validate grade data
   */
  async validateGradeData(gradeData: Partial<CreateGradeData>): Promise<{ 
    isValid: boolean; 
    errors: Record<string, string[]>; 
    suggestions?: Record<string, string> 
  }> {
    return this.apiCall(`${this.baseUrl}/validate`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  /**
   * Check if grade name is available within a school
   */
  async checkGradeNameAvailability(schoolId: string, gradeName: string, excludeGradeId?: string): Promise<{ available: boolean; suggestion?: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append('school_id', schoolId);
    queryParams.append('name', gradeName);
    if (excludeGradeId) queryParams.append('exclude_id', excludeGradeId);

    const data = await this.apiCall(`${this.baseUrl}/check-availability?${queryParams.toString()}`);
    return data.data;
  }

  /**
   * Reorder grades
   */
  async reorderGrades(schoolId: string, gradeOrder: string[]): Promise<{ success: boolean; message: string }> {
    return this.apiCall(`${this.baseUrl}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ 
        school_id: schoolId, 
        grade_order: gradeOrder 
      }),
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

// Export singleton instance
export const gradeService = new GradeService();
