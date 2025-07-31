import { useState, useEffect } from 'react';
import axios from 'axios';
import { Learner, Grade } from '../shared/schema'; // Assuming these schemas exist
import { RecipientInfo } from '../types/invitation'; // Assuming this type exists

export function useRecipients(schoolId?: string) {
  const [recipients, setRecipients] = useState<RecipientInfo[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecipientsAndGrades = async () => {
      if (!schoolId) {
        setRecipients([]);
        setGrades([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null); // Clear previous errors

      try {
        const [learnersResponse, gradesResponse] = await Promise.all([
          axios.get<Learner[]>(`/api/learners?schoolId=${schoolId}`),
          axios.get<Grade[]>(`/api/grades?schoolId=${schoolId}`)
        ]);

        const fetchedLearners = learnersResponse.data;
        const fetchedGrades = gradesResponse.data;

        // Transform learners data to recipient format
        const transformedRecipients: RecipientInfo[] = fetchedLearners.map(learner => ({
          id: learner.id,
          learnerName: `${learner.first_name} ${learner.last_name}`,
          parentName: (learner.parent_info as any)?.name || 'Unknown Parent',
          parentEmail: (learner.parent_info as any)?.email || '',
          parentPhone: learner.phone || (learner.parent_info as any)?.phone || '',
          grade: fetchedGrades.find(g => g.id === learner.grade_id)?.name || 'Unknown Grade',
          whatsapp: learner.whatsapp || undefined, // Assuming `whatsapp` field exists
        }));

        setRecipients(transformedRecipients);
        setGrades(fetchedGrades);
      } catch (err) {
        console.error("Failed to fetch recipients or grades:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipientsAndGrades();
  }, [schoolId]); // Re-run effect when schoolId changes

  return {
    recipients,
    grades,
    isLoading,
    error,
  };
}

export function useMockRecipients() {
  // Mock data for development/demo purposes
  const mockRecipients: RecipientInfo[] = [
    {
      id: '1',
      learnerName: 'John Smith',
      parentName: 'Mary Smith',
      parentEmail: 'mary.smith@email.com',
      parentPhone: '+27821234567',
      grade: 'Grade 1',
    },
    {
      id: '2',
      learnerName: 'Sarah Johnson',
      parentName: 'David Johnson',
      parentEmail: 'david.johnson@email.com',
      parentPhone: '+27821234568',
      grade: 'Grade 1',
    },
    {
      id: '3',
      learnerName: 'Michael Brown',
      parentName: 'Lisa Brown',
      parentEmail: 'lisa.brown@email.com',
      parentPhone: '+27821234569',
      grade: 'Grade 2',
    },
    {
      id: '4',
      learnerName: 'Emma Davis',
      parentName: 'Robert Davis',
      parentEmail: 'robert.davis@email.com',
      parentPhone: '+27821234570',
      grade: 'Grade 2',
    },
    {
      id: '5',
      learnerName: 'James Wilson',
      parentName: 'Jennifer Wilson',
      parentEmail: 'jennifer.wilson@email.com',
      parentPhone: '+27821234571',
      grade: 'Grade 3',
    },
  ];

  const mockGrades = [
    { id: '1', name: 'Grade 1' },
    { id: '2', name: 'Grade 2' },
    { id: '3', name: 'Grade 3' },
  ];

  return {
    recipients: mockRecipients,
    grades: mockGrades,
    isLoading: false,
    error: null,
  };
}