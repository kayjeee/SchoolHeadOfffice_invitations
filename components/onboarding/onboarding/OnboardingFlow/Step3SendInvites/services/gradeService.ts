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

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
    };
  }

  private async fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, { ...options, headers: this.getHeaders() });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
    }
    return response.json();
  }

  async getGrades(schoolId: string): Promise<Grade[]> {
    if (!schoolId) throw new Error('School ID is required.');
    return this.fetchJSON<Grade[]>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades`);
  }

  async getActiveGrades(schoolId: string): Promise<Grade[]> {
    if (!schoolId) throw new Error('School ID is required.');
    return this.fetchJSON<Grade[]>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades?active=true`);
  }

  async getGrade(schoolId: string, gradeId: string): Promise<Grade> {
    if (!schoolId || !gradeId) throw new Error('School ID and Grade ID are required.');
    return this.fetchJSON<Grade>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}`);
  }

  async getGradeStats(schoolId: string, gradeId: string): Promise<{ learnerCount: number; activeCount: number }> {
    if (!schoolId || !gradeId) throw new Error('School ID and Grade ID are required for stats.');
    return this.fetchJSON<{ learnerCount: number; activeCount: number }>(
      `${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}/stats`
    );
  }

  async createGrade(schoolId: string, gradeData: CreateGradeRequest): Promise<Grade> {
    if (!schoolId) throw new Error('School ID is required.');
    return this.fetchJSON<Grade>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async updateGrade(schoolId: string, gradeId: string, updates: Partial<CreateGradeRequest>): Promise<Grade> {
    if (!schoolId || !gradeId) throw new Error('School ID and Grade ID are required.');
    return this.fetchJSON<Grade>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteGrade(schoolId: string, gradeId: string): Promise<void> {
    if (!schoolId || !gradeId) throw new Error('School ID and Grade ID are required.');
    const response = await fetch(`${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to delete grade: ${response.status} ${response.statusText} - ${text}`);
    }
  }

  async reorderGrades(schoolId: string, gradeOrders: Array<{ id: string; level: number }>): Promise<Grade[]> {
    if (!schoolId) throw new Error('School ID is required.');
    return this.fetchJSON<Grade[]>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ orders: gradeOrders }),
    });
  }

  async archiveGrade(schoolId: string, gradeId: string): Promise<Grade> {
    return this.updateGrade(schoolId, gradeId, { isActive: false });
  }

  async restoreGrade(schoolId: string, gradeId: string): Promise<Grade> {
    return this.updateGrade(schoolId, gradeId, { isActive: true });
  }
}

// Default instance
export const gradeService = new GradeService({
  apiBaseUrl: 'http://localhost:4000/api/v1',
});

export default GradeService;
