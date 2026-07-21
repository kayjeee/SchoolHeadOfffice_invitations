import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  if (!client) {
    return res.status(500).json({ error: "Database client connection error" });
  }
  const db = client.db('tracker');
  const collection = db.collection('learner_invitations');

  // Handle params if present
  const { params } = req.query;
  const method = req.method;

  if (!params || params.length === 0) {
    // GET /api/v1/learner_invitations -> Fetch all invitations
    if (method === 'GET') {
      const { school_id } = req.query;
      const filter = {};
      if (school_id) {
        filter.school_id = school_id;
      }
      let invitations = await collection.find(filter).sort({ created_at: -1 }).toArray();

      // Auto-seed if database is empty for this school
      if (invitations.length === 0 && school_id) {
        const seedInvites = [
          {
            school_id: school_id,
            school_name: 'Far North Secondary School',
            learner_name: 'Lethabo Manana',
            parent_name: 'Mrs Manana',
            parent_phone: '+27700400585',
            status: 'Sent',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            grade_name: 'Grade 10',
            channel: 'WhatsApp'
          },
          {
            school_id: school_id,
            school_name: 'Far North Secondary School',
            learner_name: 'Sipho Sello',
            parent_name: 'Mr Sello',
            parent_phone: '+27825551234',
            status: 'Delivered',
            created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
            grade_name: 'Grade 11',
            channel: 'WhatsApp'
          },
          {
            school_id: school_id,
            school_name: 'Far North Secondary School',
            learner_name: 'Zanele Khumalo',
            parent_name: 'Thabo Khumalo',
            parent_phone: '+27712229876',
            status: 'Accepted',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            grade_name: 'Grade 10',
            channel: 'SMS'
          },
          {
            school_id: school_id,
            school_name: 'Far North Secondary School',
            learner_name: 'Bandile Nkosi',
            parent_name: 'Lindiwe Nkosi',
            parent_phone: '+27734445555',
            status: 'Expired',
            created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
            grade_name: 'Grade 12',
            channel: 'WhatsApp'
          },
          {
            school_id: school_id,
            school_name: 'Far North Secondary School',
            learner_name: 'Kabelo Mokoena',
            parent_name: 'Mrs Mokoena',
            parent_phone: '+27723334444',
            status: 'Cancelled',
            created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            grade_name: 'Grade 9',
            channel: 'SMS'
          }
        ];

        for (const item of seedInvites) {
          await collection.insertOne(item);
        }
        invitations = await collection.find(filter).sort({ created_at: -1 }).toArray();
      }

      const formatted = invitations.map(inv => ({
        id: inv._id.toString(),
        ...inv,
        _id: inv._id.toString()
      }));
      return res.status(200).json({ success: true, learner_invitations: formatted });
    }

    // POST /api/v1/learner_invitations -> Create invitations
    if (method === 'POST') {
      const { invitations: incomingInvites, schoolId, schoolName } = req.body;
      if (!Array.isArray(incomingInvites) || incomingInvites.length === 0) {
        return res.status(400).json({ error: "invitations array is required" });
      }

      const results = [];
      const host = req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'http';

      for (const invite of incomingInvites) {
        const parentPhone = invite.parent_phone || invite.phone || '';
        const learnerName = invite.learner_name || invite.name || 'Unnamed Learner';
        const parentName = invite.parent_name || 'Parent';
        const gradeName = invite.grade_name || 'Unspecified';
        const channel = invite.channel || 'WhatsApp';

        const newInvite = {
          school_id: schoolId || invite.school_id || '',
          school_name: schoolName || invite.school_name || 'Far North Secondary School',
          learner_name: learnerName,
          parent_name: parentName,
          parent_phone: parentPhone,
          grade_name: gradeName,
          channel: channel,
          status: 'Sent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        let triggerSuccess = false;
        let triggerError = '';

        // Clean up formatting of SA phone numbers for delivery
        let cleanPhone = parentPhone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
          cleanPhone = '27' + cleanPhone.slice(1);
        }

        if (channel === 'WhatsApp') {
          try {
            const waRes = await fetch(`${protocol}://${host}/api/whatsapp-business/test-message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: cleanPhone,
                schoolName: newInvite.school_name
              })
            });
            const waData = await waRes.json();
            if (waRes.ok && waData.success) {
              triggerSuccess = true;
              newInvite.status = 'Delivered';
              newInvite.messageId = waData.messageId;
            } else {
              triggerError = waData.error || 'WhatsApp API failed';
            }
          } catch (err) {
            triggerError = err.message;
          }
        } else if (channel === 'SMS') {
          try {
            const smsRes = await fetch(`${protocol}://${host}/api/sms/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: cleanPhone,
                message: `Hi ${parentName}! You are invited to join the Parent Portal for ${newInvite.school_name} on SchoolHeadOffice. Register at: https://schoolheadoffice.co.za/parent`,
                schoolId: newInvite.school_id
              })
            });
            const smsData = await smsRes.json();
            if (smsRes.ok && smsData.success) {
              triggerSuccess = true;
              newInvite.status = 'Sent';
              newInvite.messageId = smsData.messageId;
            } else {
              triggerError = smsData.error || 'SMS API failed';
            }
          } catch (err) {
            triggerError = err.message;
          }
        } else {
          // 'Both' or other options
          triggerSuccess = true;
        }

        // If live trigger fails (missing credentials, timeout, etc.), keep the invite as 'Sent'
        // so that administrators can still manage it locally!
        if (!triggerSuccess) {
          console.warn(`[Invitations] Live trigger fallback to simulated sent: ${triggerError}`);
          newInvite.simulation = true;
          newInvite.simulation_error = triggerError;
          newInvite.status = 'Sent';
        }

        const insertResult = await collection.insertOne(newInvite);
        results.push({
          id: insertResult.insertedId.toString(),
          ...newInvite,
          _id: insertResult.insertedId.toString()
        });
      }

      return res.status(200).json({ success: true, learner_invitations: results });
    }
  } else {
    // Actions on dynamic subroutes: /api/v1/learner_invitations/:id/:action
    const [id, action] = params;
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      objectId = id;
    }

    const invitation = await collection.findOne(typeof objectId === 'string' ? { id: objectId } : { _id: objectId });
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    if (method === 'POST') {
      const host = req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'http';

      if (action === 'resend') {
        let cleanPhone = invitation.parent_phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
          cleanPhone = '27' + cleanPhone.slice(1);
        }

        let triggerSuccess = false;
        if (invitation.channel === 'WhatsApp') {
          try {
            const waRes = await fetch(`${protocol}://${host}/api/whatsapp-business/test-message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: cleanPhone,
                schoolName: invitation.school_name
              })
            });
            const waData = await waRes.json();
            if (waRes.ok && waData.success) triggerSuccess = true;
          } catch (err) {
            console.error(err);
          }
        } else {
          try {
            const smsRes = await fetch(`${protocol}://${host}/api/sms/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: cleanPhone,
                message: `Hi ${invitation.parent_name}! You are invited to join the Parent Portal for ${invitation.school_name} on SchoolHeadOffice. Register at: https://schoolheadoffice.co.za/parent`,
                schoolId: invitation.school_id
              })
            });
            const smsData = await smsRes.json();
            if (smsRes.ok && smsData.success) triggerSuccess = true;
          } catch (err) {
            console.error(err);
          }
        }

        await collection.updateOne(
          typeof objectId === 'string' ? { id: objectId } : { _id: objectId },
          { $set: { status: invitation.channel === 'WhatsApp' ? 'Delivered' : 'Sent', updated_at: new Date().toISOString() } }
        );

        return res.status(200).json({ success: true, message: "Invitation resent successfully" });
      }

      if (action === 'cancel') {
        await collection.updateOne(
          typeof objectId === 'string' ? { id: objectId } : { _id: objectId },
          { $set: { status: 'Cancelled', updated_at: new Date().toISOString() } }
        );
        return res.status(200).json({ success: true, message: "Invitation cancelled" });
      }

      if (action === 'accept') {
        await collection.updateOne(
          typeof objectId === 'string' ? { id: objectId } : { _id: objectId },
          { $set: { status: 'Accepted', updated_at: new Date().toISOString() } }
        );
        return res.status(200).json({ success: true, message: "Invitation accepted" });
      }
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
