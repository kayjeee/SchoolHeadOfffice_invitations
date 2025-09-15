export const uploadLearners = async (auth0Id: string, data: any[]): Promise<any> => {
  const payload = {
    auth0Id,
    data,
  };

  const response = await fetch('/api/learners/bulk_upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
};