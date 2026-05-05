# Messaging File Uploads & Rich Previews Implementation

This document summarizes the changes made to implement the file upload flow and rich preview system for the teacher messaging interface.

## Overview

The messaging system now supports high-performance, secure file attachments (images, videos, and documents) using Cloudinary's direct-to-cloud upload mechanism. The implementation includes real-time upload progress, optimistic UI updates, and rich media rendering within the chat interface.

## Key Features

- **Cloudinary Unsigned Uploads:** Implemented a secure frontend-to-cloud upload flow using Upload Presets, bypassing the need for backend signatures and avoiding CORS/401 issues.
- **Rich Media Previews:**
    - **Images:** Rendered as thumbnails with a full-screen lightbox powered by Radix UI.
    - **Videos:** Integrated native HTML5 video player with playback controls.
    - **Documents:** Branded tile previews for PDFs and other files with download support.
- **Real-time Feedback:** Added a `FileUploadProgress` component to show the user exactly what's happening during an upload.
- **Optimistic UI:** Messages with attachments appear instantly in the chat while the actual transfer and backend persistence occur in the background.
- **ActionCable Synchronization:** Updated the real-time message listener to properly handle and normalize attachment metadata.

## Files Created

| File | Description |
| :--- | :--- |
| `components/teacher/messaging/FileUploadProgress.tsx` | A new component that displays a progress bar, filename, and status (Uploading/Processing/Failed) during the Cloudinary transfer. |
| `components/teacher/messaging/AttachmentPreview.tsx` | A new component that renders rich previews based on file type. Includes Radix UI `Dialog` for image lightboxes and HTML5 `<video>` for videos. |

## Files Modified

| File | Changes |
| :--- | :--- |
| `lib/types/messaging.ts` | Updated the `MessageSchema` and `Message` interface to include `attachment_url`, `attachment_type`, `attachment_name`, and `attachment_size`. Updated the status enum to include `failed`. |
| `lib/api/messaging-api.ts` | 1. Updated `sendMessage` to accept optional attachment metadata and wrap the payload under a `message` key for Rails compatibility. 2. Enhanced `normalizeMessage` to parse attachment fields from the backend response. |
| `lib/hooks/useMessaging.ts` | 1. Updated the `useMessages` hook to support optimistic updates for messages with attachments. 2. Updated the Action Cable `received` callback to use `normalizeMessage`, ensuring real-time updates include all metadata. |
| `components/teacher/messaging/MessageInput.tsx` | 1. Wired the paperclip button to a hidden file input. 2. Implemented the Cloudinary unsigned upload logic in `handleFileChange`. 3. Integrated `FileUploadProgress`. 4. Added logic to auto-send the message upon successful upload and allow empty text content if an attachment exists. |
| `components/teacher/messaging/ChatWindow.tsx` | Integrated the `AttachmentPreview` component into the message bubbles to display uploaded files alongside text content. |
| `components/teacher/messaging/MessagingSection.tsx` | Updated the `onSendMessage` handler to pass through attachment metadata from the `MessageInput`. |

## Technical Implementation Details

- **Environment Variables:** The system uses `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
- **Validation:** Frontend and backend validations are synchronized to allow `content` to be optional if an `attachment_url` is present.
- **Processing States:** Images and videos use `onLoad` and `onError` handlers to manage UI state while Cloudinary processes the file.
- **Payload Structure:** All outgoing message requests now correctly nest data: `{ message: { content, attachment_url, ... } }`.
