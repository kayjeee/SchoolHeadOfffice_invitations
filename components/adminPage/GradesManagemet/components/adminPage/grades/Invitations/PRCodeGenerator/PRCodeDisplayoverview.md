```mermaid
graph TD
    PRCodeDisplay --> DisplayPRCode[Show invite.prCode]
    PRCodeDisplay --> CopyButton[Copy Code Button]

```
```mermaid
sequenceDiagram
    participant Admin
    participant PRCodeDisplay
    participant Clipboard

    Admin->>PRCodeDisplay: Views invitation
    PRCodeDisplay->>Admin: Shows PR Code
    Admin->>PRCodeDisplay: Clicks "Copy"
    PRCodeDisplay->>Clipboard: Copies PR Code
    Clipboard-->>Admin: Confirmation (copied)

```

📌 Summary of PRCodeDisplay

Purpose:
Displays the personal referral (PR) code in a clean, readable format.

Main Features (based on context and naming):

Shows the generated PR code (invite.prCode).

Provides copy-to-clipboard functionality (similar to InviteLinkManager).

Uses a monospace font for clarity (good for codes).

Simple UI component focused only on the PR code (no analytics or expiration info).