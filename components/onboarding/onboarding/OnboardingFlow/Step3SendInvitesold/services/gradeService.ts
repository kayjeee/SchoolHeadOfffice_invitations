import { Grade } from "../types";

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
      "Content-Type": "application/json",
      ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
    };
  }

  private async fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    console.log(`[GradeService] Fetching: ${url}`, { options });

    try {
      const response = await fetch(url, { ...options, headers: this.getHeaders() });
      const text = await response.text();

      if (!response.ok) {
        console.error(`[GradeService] Request failed: ${response.status} ${response.statusText}`, { body: text });
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }

      console.log(`[GradeService] Success: ${url}`, { response: text });
      return JSON.parse(text);
    } catch (err) {
      console.error(`[GradeService] Error during fetch: ${url}`, err);
      throw err;
    }
  }

  private unwrap<T>(response: any, key?: string): T {
    if (key && Array.isArray(response?.[key])) {
      return response[key];
    }
    if (key && Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }
    if (response?.data) {
      return response.data as T;
    }
    return response as T;
  }

  async getGrades(schoolId: string): Promise<Grade[]> {
    if (!schoolId) throw new Error("School ID is required.");
    console.log(`[GradeService] getGrades for schoolId=${schoolId}`);

    const response = await this.fetchJSON<any>(
      `${this.config.apiBaseUrl}/schools/${schoolId}/grades`
    );

    const grades = this.unwrap<Grade[]>(response, "grades");
    console.log(`[GradeService] getGrades result`, grades);
    return grades;
  }

  async getActiveGrades(schoolId: string): Promise<Grade[]> {
    if (!schoolId) throw new Error("School ID is required.");
    console.log(`[GradeService] getActiveGrades for schoolId=${schoolId}`);

    const response = await this.fetchJSON<any>(
      `${this.config.apiBaseUrl}/schools/${schoolId}/grades?active=true`
    );

    const grades = this.unwrap<Grade[]>(response, "grades");
    console.log(`[GradeService] getActiveGrades result`, grades);
    return grades;
  }

  async getGrade(schoolId: string, gradeId: string): Promise<Grade> {
    if (!schoolId || !gradeId) throw new Error("School ID and Grade ID are required.");
    console.log(`[GradeService] getGrade schoolId=${schoolId}, gradeId=${gradeId}`);

    const response = await this.fetchJSON<any>(
      `${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}`
    );

    const grade = this.unwrap<Grade>(response);
    console.log(`[GradeService] getGrade result`, grade);
    return grade;
  }

  async getGradeStats(
    schoolId: string,
    gradeId: string
  ): Promise<{ learnerCount: number; activeCount: number }> {
    if (!schoolId || !gradeId) throw new Error("School ID and Grade ID are required for stats.");
    console.log(`[GradeService] getGradeStats schoolId=${schoolId}, gradeId=${gradeId}`);

    const response = await this.fetchJSON<any>(
      `${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}/stats`
    );

    const stats = this.unwrap<{ learnerCount: number; activeCount: number }>(response);
    console.log(`[GradeService] getGradeStats result`, stats);

    return {
      learnerCount: stats.learnerCount ?? 0,
      activeCount: stats.activeCount ?? 0,
    };
  }

  async createGrade(schoolId: string, gradeData: CreateGradeRequest): Promise<Grade> {
    if (!schoolId) throw new Error("School ID is required.");
    console.log(`[GradeService] createGrade schoolId=${schoolId}`, gradeData);

    const response = await this.fetchJSON<any>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades`, {
      method: "POST",
      body: JSON.stringify(gradeData),
    });

    const grade = this.unwrap<Grade>(response);
    console.log(`[GradeService] createGrade result`, grade);
    return grade;
  }

  async updateGrade(schoolId: string, gradeId: string, updates: Partial<CreateGradeRequest>): Promise<Grade> {
    if (!schoolId || !gradeId) throw new Error("School ID and Grade ID are required.");
    console.log(`[GradeService] updateGrade schoolId=${schoolId}, gradeId=${gradeId}`, updates);

    const response = await this.fetchJSON<any>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    const grade = this.unwrap<Grade>(response);
    console.log(`[GradeService] updateGrade result`, grade);
    return grade;
  }

  async deleteGrade(schoolId: string, gradeId: string): Promise<void> {
    if (!schoolId || !gradeId) throw new Error("School ID and Grade ID are required.");
    console.log(`[GradeService] deleteGrade schoolId=${schoolId}, gradeId=${gradeId}`);

    const response = await fetch(`${this.config.apiBaseUrl}/schools/${schoolId}/grades/${gradeId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[GradeService] Failed to delete grade`, { status: response.status, text });
      throw new Error(`Failed to delete grade: ${response.status} ${response.statusText} - ${text}`);
    }

    console.log(`[GradeService] deleteGrade success`);
  }

  async reorderGrades(schoolId: string, gradeOrders: Array<{ id: string; level: number }>): Promise<Grade[]> {
    if (!schoolId) throw new Error("School ID is required.");
    console.log(`[GradeService] reorderGrades schoolId=${schoolId}`, gradeOrders);

    const response = await this.fetchJSON<any>(`${this.config.apiBaseUrl}/schools/${schoolId}/grades/reorder`, {
      method: "PUT",
      body: JSON.stringify({ orders: gradeOrders }),
    });

    const grades = this.unwrap<Grade[]>(response, "grades");
    console.log(`[GradeService] reorderGrades result`, grades);
    return grades;
  }

  async archiveGrade(schoolId: string, gradeId: string): Promise<Grade> {
    console.log(`[GradeService] archiveGrade schoolId=${schoolId}, gradeId=${gradeId}`);
    return this.updateGrade(schoolId, gradeId, { isActive: false });
  }

  async restoreGrade(schoolId: string, gradeId: string): Promise<Grade> {
    console.log(`[GradeService] restoreGrade schoolId=${schoolId}, gradeId=${gradeId}`);
    return this.updateGrade(schoolId, gradeId, { isActive: true });
  }
}

// Default instance
export const gradeService = new GradeService({
  apiBaseUrl: "http://localhost:4000/api/v1",
});

export default GradeService;
