export const inviteService = {
  sendInvites: async (inviteData: any) => {
    console.log("Sending invites:", inviteData);
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve({ success: true, message: "Invites sent successfully" }), 1500));
  },
};
