// services/WhatsAppBusinessService.ts
import { nasaLog as logger } from '../nasaLogger';
import InvitationService from './invitationService';

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  learnerNumbers?: string[];
  parentName?: string;
  gradeId?: string;
  sender: string; // ⚠️ TEMPORARY – remove once backend auth is enforced
  userEmail?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "shobackendv2-production.up.railway.app";

class WhatsAppBusinessService {
  baseURL: string;
  invitationsURL: string;

constructor() {
this.baseURL = '/api/whatsapp-business';
this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
}

/**
* 🔹 Step 1: Create an invitation to generate a token
* FIXED: Changed school_id → school in payload
*/
async createInvitation({
  phoneNumber,
  schoolId,
  learnerNumbers,
  parentName,
  gradeId,
  sender,
  userEmail,
}: InvitationParams): Promise<string> {
try {
logger('INFO', 'WhatsAppBusinessService', 'Creating invitation token', {
phoneNumber,
schoolId,
userEmail
});

// Validate required fields
if (!schoolId) {
throw new Error('schoolId is required to create invitation');
}

if (!phoneNumber) {
throw new Error('phoneNumber is required to create invitation');
}

// ⚠️ sender is TEMPORARILY passed from frontend
// TODO: Remove sender from payload and derive it from auth on backend
const payload = {
  phone_number: phoneNumber,
  school_id: schoolId,
  learner_numbers: learnerNumbers ?? [],
  role: 'parent',
  parent_name: parentName ?? null,
  grade_id: gradeId ?? null,
  invited_via: 'whatsapp',
  sender, // ⚠️ TEMPORARY
};

console.log('📤 [WhatsAppBusinessService] Creating invitation with payload:', payload);

const response = await fetch(this.invitationsURL, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
},
body: JSON.stringify(payload),
});

console.log('📥 [WhatsAppBusinessService] Invitation response status:', response.status);

const data = await response.json();
console.log('📥 [WhatsAppBusinessService] Invitation response data:', data);

if (!response.ok) {
throw new Error(data.message || `HTTP ${response.status}: Failed to create invitation`);
}

if (!data.success) {
throw new Error(data.message || 'API returned success: false');
}

const token = data.invitation?.token || data.token;
if (!token) {
throw new Error('No token received in invitation response');
}

logger('INFO', 'WhatsAppBusinessService', 'Invitation token created successfully', {
token: token.substring(0, 8) + '...', // Log partial token for security
phoneNumber
});
return token;
} catch (error) {
logger('ERROR', 'WhatsAppBusinessService', 'Failed to create invitation', {
error: error.message,
phoneNumber,
schoolId,
userEmail
});
throw error;
}
}

/**
* 🔹 Step 2: Compose final WhatsApp message with magic link
*/
buildMagicLinkMessage({ schoolName, gradeName, magicLink }) {
const domain = schoolName.toLowerCase().replace(/\s+/g, '');
const supportEmail = `support@${domain}.com`;

return `🏫 ${schoolName} Parent Portal Invitation

Dear Parent,

You're invited to join our secure parent communication portal for ${gradeName}.

✅ Get real-time updates about your child's progress
✅ Receive important announcements instantly
✅ Connect with teachers directly
✅ Access school resources and calendar

🔗 Join now: ${magicLink}

For support, WhatsApp us at this number or email ${supportEmail}

Best wishes,
${schoolName} Admin Team`;
}

/**
* 🔹 Step 3: Validate message before sending
*/
validateMessageTemplate(message) {
if (typeof message !== 'string') {
throw new Error('Message must be a string');
}

const validations = [
{
check: message.length > 0,
error: 'Message cannot be empty',
},
{
check: message.length <= 4096,
error: `Message exceeds maximum length of 4096 characters (current: ${message.length})`,
},
{
check: !message.includes('{{1}}') || message.match(/{{(\d+)}}/g)?.length <= 10,
error: 'Maximum 10 variables allowed in template',
},
{
check: !message.match(/[<>]/g),
error: 'Message contains invalid characters (< or >)',
},
];

for (const validation of validations) {
if (!validation.check) {
throw new Error(validation.error);
}
}

return true;
}

/**
* 🔹 Step 4: Build magic link from token and school name
*/
buildMagicLink({ token, schoolName }) {
const domain = schoolName.toLowerCase().replace(/\s+/g, '');
return `?token=${token}`;
}

/**
* 🔹 Step 5: Send a single test message
* ENHANCED: Better error handling and validation
*/
async sendTestMessage({ to, schoolName, grade, schoolId, userEmail, learnerNumber, parentName, invitedVia, sender_id }) {
try {
logger('INFO', 'WhatsAppBusinessService', 'Preparing to send test message', {
to,
schoolName,
grade: grade?.name,
schoolId
});

// Validate inputs
if (!to || !schoolName || !schoolId) {
throw new Error('Missing required fields: to, schoolName, and schoolId are required');
}

// 1️⃣ Create token first
const token = await this.createInvitation({
  phoneNumber: to,
  schoolId,
  learnerNumbers: learnerNumber ? [learnerNumber] : [],
  parentName: parentName || 'Test Parent',
  gradeId: grade?.id,
  sender: sender_id || userEmail || 'system@schoolheadoffice.com',
  userEmail,
});

// 2️⃣ Build dynamic link
const magicLink = this.buildMagicLink({ token, schoolName });

// 3️⃣ Build the message body
const message = this.buildMagicLinkMessage({
schoolName,
gradeName: grade?.name || 'your child\'s class',
magicLink,
});

// 4️⃣ Validate message
this.validateMessageTemplate(message);

// 5️⃣ Send the test message
const payload = {
to,
message,
gradeId: grade?.id,
schoolName,
testType: 'MAGIC_LINK',
magicLink,
};

console.log('📤 [WhatsAppBusinessService] Sending test message:', payload);

const response = await fetch(`${this.baseURL}/test-message`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${localStorage.getItem('authToken')}`,
},
body: JSON.stringify(payload),
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.error || `HTTP ${response.status}: Failed to send test message`);
}

logger('INFO', 'WhatsAppBusinessService', 'Test message sent successfully', {
messageId: data.messageId,
to
});

return {
...data,
magicLink,
token // Return token for debugging
};
} catch (error) {
logger('ERROR', 'WhatsAppBusinessService', 'Failed to send test message', {
error: error.message,
to,
schoolName,
schoolId
});
throw error;
}
}

/**
* 🔹 Step 6: Send bulk messages with personalized links
* ENHANCED: Better error handling and progress tracking
*/
async sendBulkMessages({ gradeIds, schoolName, recipientNumbers, schoolId, userEmail, senderId, countryCode }) {
    try {
      logger('INFO', 'WhatsAppBusinessService', 'Preparing to send bulk magic link messages', {
        recipientCount: recipientNumbers.length,
        schoolName,
        schoolId,
        gradeIds,
      });

      if (!schoolId || !schoolName) {
        throw new Error('schoolId and schoolName are required for bulk messages');
      }

      if (!recipientNumbers || recipientNumbers.length === 0) {
        throw new Error('recipientNumbers cannot be empty');
      }

      const invitationsData = recipientNumbers.map(recipient => ({
        phone_number: recipient.phone,
        parent_name: recipient.name,
        learner_number: recipient.learner_number,
      }));

      const bulkResult = await InvitationService.createBulkInvitations({
        invitations: invitationsData,
        school_id: schoolId,
        sender_id: senderId,
        userEmail,
        countryCode,
      });

      const personalizedMessages = bulkResult.invitations.map(invitation => {
        const magicLink = this.buildMagicLink({ token: invitation.token, schoolName });
        const message = this.buildMagicLinkMessage({
          schoolName,
          gradeName: 'your child\'s class',
          magicLink,
        });
        return {
          to: invitation.phone_number,
          message,
          magicLink,
          token: invitation.token,
        };
      });

      const response = await fetch(`${this.baseURL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          gradeIds,
          schoolName,
          schoolId,
          campaignType: 'MAGIC_LINK_INVITES',
          personalizedMessages,
          totalRecipients: personalizedMessages.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send bulk messages`);
      }

      return { ...data, generationErrors: [], totalProcessed: personalizedMessages.length };
    } catch (error) {
      logger('ERROR', 'WhatsAppBusinessService', 'Failed to send bulk magic link messages', {
        error: error.message,
        schoolName,
        schoolId,
        recipientCount: recipientNumbers?.length,
      });
      throw error;
    }
  }

/**
* 🔹 NEW: Schedule bulk messages for later delivery
*/
async scheduleBulkMessage({ gradeIds, message, scheduledAt, timezone, recipientNumbers, schoolId, schoolName }) {
try {
logger('INFO', 'WhatsAppBusinessService', 'Scheduling bulk message', {
scheduledAt,
recipientCount: recipientNumbers.length,
schoolName
});

const response = await fetch(`${this.baseURL}/schedule-bulk`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${localStorage.getItem('authToken')}`,
},
body: JSON.stringify({
gradeIds,
message,
scheduledAt,
timezone,
recipientNumbers,
schoolId,
schoolName,
campaignType: 'SCHEDULED_INVITES',
}),
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.error || `HTTP ${response.status}: Failed to schedule message`);
}

logger('INFO', 'WhatsAppBusinessService', 'Bulk message scheduled successfully', {
scheduleId: data.scheduleId,
scheduledFor: scheduledAt
});

return data;
} catch (error) {
logger('ERROR', 'WhatsAppBusinessService', 'Failed to schedule bulk message', error);
throw error;
}
}

/**
* 🔹 NEW: Validate phone number format
*/
validatePhoneNumber(phoneNumber) {
if (!phoneNumber) return false;

const cleaned = phoneNumber.replace(/\s+/g, '');
// Basic international phone number validation
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
return phoneRegex.test(cleaned);
}

/**
* 🔹 NEW: Format phone number consistently
*/
formatPhoneNumber(phoneNumber) {
if (!phoneNumber) return '';

const cleaned = phoneNumber.replace(/\s+/g, '');
// Ensure it starts with +
return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}
}

export default new WhatsAppBusinessService();