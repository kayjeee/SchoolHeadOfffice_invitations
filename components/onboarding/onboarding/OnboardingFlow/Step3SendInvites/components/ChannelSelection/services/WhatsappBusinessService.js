// services/WhatsAppBusinessService.js
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

class WhatsAppBusinessService {
constructor() {
this.baseURL = '/api/whatsapp-business';
this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
}

/**
* 🔹 Step 1: Create an invitation to generate a token
* FIXED: Changed school_id → school in payload
*/
async createInvitation({ phoneNumber, schoolId, userEmail }) {
try {
logger.info('WhatsAppBusinessService', 'Creating invitation token', {
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

const payload = {
phone_number: phoneNumber,
school_id: schoolId,
role: 'parent',
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

logger.info('WhatsAppBusinessService', 'Invitation token created successfully', {
token: token.substring(0, 8) + '...', // Log partial token for security
phoneNumber
});
return token;
} catch (error) {
logger.error('WhatsAppBusinessService', 'Failed to create invitation', {
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
return `https://portal.${domain}.com/join?token=${token}`;
}

/**
* 🔹 Step 5: Send a single test message
* ENHANCED: Better error handling and validation
*/
async sendTestMessage({ to, schoolName, grade, schoolId, userEmail }) {
try {
logger.info('WhatsAppBusinessService', 'Preparing to send test message', {
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

logger.info('WhatsAppBusinessService', 'Test message sent successfully', {
messageId: data.messageId,
to
});

return {
...data,
magicLink,
token // Return token for debugging
};
} catch (error) {
logger.error('WhatsAppBusinessService', 'Failed to send test message', {
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
async sendBulkMessages({ gradeIds, schoolName, recipientNumbers, schoolId, userEmail }) {
try {
logger.info('WhatsAppBusinessService', 'Preparing to send bulk magic link messages', {
recipientCount: recipientNumbers.length,
schoolName,
schoolId,
gradeIds
});

// Validate inputs
if (!schoolId || !schoolName) {
throw new Error('schoolId and schoolName are required for bulk messages');
}

if (!recipientNumbers || recipientNumbers.length === 0) {
throw new Error('recipientNumbers cannot be empty');
}

const personalizedMessages = [];
const errors = [];

// Generate individual tokens and messages per recipient
for (let i = 0; i < recipientNumbers.length; i++) {
const number = recipientNumbers[i];

try {
console.log(`🔄 [WhatsAppBusinessService] Processing recipient ${i + 1}/${recipientNumbers.length}: ${number}`);

const token = await this.createInvitation({
phoneNumber: number,
schoolId,
userEmail,
});

const magicLink = this.buildMagicLink({ token, schoolName });
const message = this.buildMagicLinkMessage({
schoolName,
gradeName: 'your child\'s class',
magicLink,
});

this.validateMessageTemplate(message);

personalizedMessages.push({
to: number,
message,
magicLink,
token // Include token for reference
});

// Small delay to avoid overwhelming the API
if (i < recipientNumbers.length - 1) {
await new Promise(resolve => setTimeout(resolve, 100));
}

} catch (error) {
console.error(`❌ [WhatsAppBusinessService] Failed to process recipient ${number}:`, error.message);
errors.push({
phoneNumber: number,
error: error.message
});
}
}

// Log any errors that occurred during token generation
if (errors.length > 0) {
logger.warn('WhatsAppBusinessService', 'Some invitations failed during token generation', {
failedCount: errors.length,
successfulCount: personalizedMessages.length,
errors: errors.slice(0, 5) // Log first 5 errors
});
}

if (personalizedMessages.length === 0) {
throw new Error('No messages could be generated. All invitations failed.');
}

console.log(`📤 [WhatsAppBusinessService] Sending ${personalizedMessages.length} bulk messages`);

// Send bulk messages
const response = await fetch(`${this.baseURL}/send-bulk`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${localStorage.getItem('authToken')}`,
},
body: JSON.stringify({
gradeIds,
schoolName,
schoolId, // Include schoolId in bulk payload
campaignType: 'MAGIC_LINK_INVITES',
personalizedMessages,
totalRecipients: personalizedMessages.length,
failedDuringGeneration: errors.length,
}),
});

const data = await response.json();

if (!response.ok) {
throw new Error(data.error || `HTTP ${response.status}: Failed to send bulk messages`);
}

const result = {
...data,
generationErrors: errors,
totalProcessed: personalizedMessages.length + errors.length
};

logger.info('WhatsAppBusinessService', 'Bulk magic link messages sent successfully', {
sentCount: data.sentCount,
failedCount: data.failedCount,
generationErrors: errors.length,
totalRecipients: recipientNumbers.length
});

return result;
} catch (error) {
logger.error('WhatsAppBusinessService', 'Failed to send bulk magic link messages', {
error: error.message,
schoolName,
schoolId,
recipientCount: recipientNumbers?.length
});
throw error;
}
}

/**
* 🔹 NEW: Schedule bulk messages for later delivery
*/
async scheduleBulkMessage({ gradeIds, message, scheduledAt, timezone, recipientNumbers, schoolId, schoolName }) {
try {
logger.info('WhatsAppBusinessService', 'Scheduling bulk message', {
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

logger.info('WhatsAppBusinessService', 'Bulk message scheduled successfully', {
scheduleId: data.scheduleId,
scheduledFor: scheduledAt
});

return data;
} catch (error) {
logger.error('WhatsAppBusinessService', 'Failed to schedule bulk message', error);
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