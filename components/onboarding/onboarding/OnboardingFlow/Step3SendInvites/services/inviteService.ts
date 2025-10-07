export const inviteService = {
  sendInvites: async (inviteData: any) => {
    console.log("Sending invites:", inviteData);
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve({ success: true, message: "Invites sent successfully" }), 1500));
  },

  generatePrCode: async (schoolId: string, gradeId: string, purpose: string) => {
    console.log(`Generating PR code for school ${schoolId}, grade ${gradeId}, purpose: ${purpose}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      code: `PRC-${gradeId}-${Math.random().toString(36).substring(7)}`,
      success: true,
    };
  },
};
