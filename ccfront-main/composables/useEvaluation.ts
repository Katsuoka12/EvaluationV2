export interface EvaluationPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
}

export interface EvaluationSubItem {
  id?: number;
  criteriaId?: number;
  name: string;
  type: 'score' | 'document';
}

export interface EvaluationCriteria {
  id: number;
  name: string;
  description: string;
  requiresEvidence: boolean;
  periodStart?: string | null;
  periodEnd?: string | null;
  subItems: EvaluationSubItem[];
}

export interface EvaluationItem {
  id: number;
  employee: string;
  position: string;
  period: string | null;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface EvaluationScoreItem {
  criteriaId: number;
  subitemId: number;
  selfScore: number | null;
  managerScore: number | null;
  note: string | null;
}

export interface PositionEmployee {
  userId: number;
  employee: string;
  position: string;
}

export const useEvaluation = () => {
  const { apiFetch } = useApi();

  // Periods
  const getPeriods = async (): Promise<EvaluationPeriod[]> => {
    return await apiFetch<EvaluationPeriod[]>('/evaluation/periods');
  };

  const createPeriod = async (data: { name: string; startDate: string; endDate: string; status?: string }) => {
    return await apiFetch<EvaluationPeriod>('/evaluation/periods', {
      method: 'POST',
      body: data
    });
  };

  const deletePeriod = async (id: number) => {
    return await apiFetch<{ message: string }>(`/evaluation/periods/${id}`, {
      method: 'DELETE'
    });
  };

  // Criteria
  const getCriteria = async (): Promise<EvaluationCriteria[]> => {
    return await apiFetch<EvaluationCriteria[]>('/evaluation/criteria');
  };

  const createCriteria = async (data: {
    name: string;
    description: string;
    requiresEvidence: boolean;
    periodStart?: string;
    periodEnd?: string;
  }) => {
    return await apiFetch<EvaluationCriteria>('/evaluation/criteria', {
      method: 'POST',
      body: data
    });
  };

  const updateCriteria = async (
    id: number,
    data: {
      name: string;
      description: string;
      requiresEvidence: boolean;
      subItems: { id?: number; name: string; type: string }[];
      periodStart?: string;
      periodEnd?: string;
    }
  ) => {
    return await apiFetch<EvaluationCriteria>(`/evaluation/criteria/${id}`, {
      method: 'PUT',
      body: data
    });
  };

  const deleteCriteria = async (id: number) => {
    return await apiFetch<{ message: string }>(`/evaluation/criteria/${id}`, {
      method: 'DELETE'
    });
  };

  const addSubitem = async (criteriaId: number, data: { name: string; type: 'score' | 'document' }) => {
    return await apiFetch<EvaluationSubItem>(`/evaluation/criteria/${criteriaId}/subitems`, {
      method: 'POST',
      body: data
    });
  };

  // Evaluations
  const getEvaluations = async (): Promise<EvaluationItem[]> => {
    return await apiFetch<EvaluationItem[]>('/evaluation');
  };

  const startEvaluation = async (data: { employee: string; position: string; periodId: number }) => {
    return await apiFetch<EvaluationItem>('/evaluation', {
      method: 'POST',
      body: data
    });
  };

  const getScores = async (evaluationId: number): Promise<EvaluationScoreItem[]> => {
    return await apiFetch<EvaluationScoreItem[]>(`/evaluation/${evaluationId}/scores`);
  };

  const saveScores = async (evaluationId: number, scores: EvaluationScoreItem[]) => {
    return await apiFetch<{ message: string }>(`/evaluation/${evaluationId}/scores`, {
      method: 'POST',
      body: { scores }
    });
  };

  const submitEvaluation = async (evaluationId: number) => {
    return await apiFetch<{ message: string }>(`/evaluation/${evaluationId}/submit`, {
      method: 'PUT'
    });
  };

  // Mapping & Config
  const getPositions = async (): Promise<PositionEmployee[]> => {
    return await apiFetch<PositionEmployee[]>('/evaluation/positions');
  };

  const getMyCriteriaIds = async (): Promise<number[]> => {
    return await apiFetch<number[]>('/evaluation/my-criteria');
  };

  const getAllEmployeeCriteria = async (): Promise<{ userId: number; criteriaId: number }[]> => {
    return await apiFetch<{ userId: number; criteriaId: number }[]>('/evaluation/employee-criteria');
  };

  const savePositionConfig = async (data: {
    positionName: string;
    employeeIds: number[];
    criteriaIds: number[];
  }) => {
    return await apiFetch<{ message: string }>('/evaluation/position-config', {
      method: 'POST',
      body: data
    });
  };

  return {
    getPeriods,
    createPeriod,
    deletePeriod,
    getCriteria,
    createCriteria,
    updateCriteria,
    deleteCriteria,
    addSubitem,
    getEvaluations,
    startEvaluation,
    getScores,
    saveScores,
    submitEvaluation,
    getPositions,
    getMyCriteriaIds,
    getAllEmployeeCriteria,
    savePositionConfig
  };
};
