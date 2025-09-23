import { Grade } from '../types';

export interface GradeServiceConfig {
  apiBaseUrl: string;
  apiKey?: string;
}

export interface CreateGradeRequest {
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export interface UpdateGradeRequest extends Partial<CreateGradeRequest> {
  id: string;
}

class GradeService {
  private config: GradeServiceConfig;

  constructor(config: GradeServiceConfig) {
    this.config = config;
  }

  // Helper to get headers with optional API key
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
    };
  }

  // Generic fetch with error handling
  private async fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, { ...options, headers: this.getHeaders() });

    if (!response.ok) {
      const text = await response.text(); // read body safely
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
    }

    return response.json();
  }

  /**
   * Get all grades
   */
  async getGrades(): Promise<Grade[]> {
    return this.fetchJSON<Grade[]>(`${this.config.apiBaseUrl}/grades`);
  }

  /**
   * Get active grades only
   */
  async getActiveGrades(): Promise<Grade[]> {
    return this.fetchJSON<Grade[]>(`${this.config.apiBaseUrl}/grades?active=true`);
  }

  /**
   * Get a specific grade by ID
   */
  async getGrade(gradeId: string): Promise<Grade> {
    return this.fetchJSON<Grade>(`${this.config.apiBaseUrl}/grades/${gradeId}`);
  }

  /**
   * Get grade statistics (learners count)
   */
  async getGradeStats(gradeId: string): Promise<{ learnerCount: number; activeCount: number }> {
    return this.fetchJSON<{ learnerCount: number; activeCount: number }>(
      `${this.config.apiBaseUrl}/grades/${gradeId}/stats`
    );
  }

  /**
   * Create a new grade
   */
  async createGrade(gradeData: CreateGradeRequest): Promise<Grade> {
    return this.fetchJSON<Grade>(`${this.config.apiBaseUrl}/grades`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  /**
   * Update an existing grade
   */
  async updateGrade(gradeId: string, updates: Partial<CreateGradeRequest>): Promise<Grade> {
    return this.fetchJSON<Grade>(`${this.config.apiBaseUrl}/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a grade
   */
  async deleteGrade(gradeId: string): Promise<void> {
    const response = await fetch(`${this.config.apiBaseUrl}/grades/${gradeId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to delete grade: ${response.status} ${response.statusText} - ${text}`);
    }
  }

  /**
   * Reorder grades by updating their levels
   */
  async reorderGrades(gradeOrders: Array<{ id: string; level: number }>): Promise<Grade[]> {
    return this.fetchJSON<Grade[]>(`${this.config.apiBaseUrl}/grades/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ orders: gradeOrders }),
    });
  }

  /**
   * Archive/deactivate a grade instead of deleting
   */
  async archiveGrade(gradeId: string): Promise<Grade> {
    return this.updateGrade(gradeId, { isActive: false });
  }

  /**
   * Restore/activate an archived grade
   */
  async restoreGrade(gradeId: string): Promise<Grade> {
    return this.updateGrade(gradeId, { isActive: true });
  }
}

// Default instance with environment configuration
export const gradeService = new GradeService({
  apiBaseUrl: 'http://localhost:4000/api/v1',
});

export default GradeService;
