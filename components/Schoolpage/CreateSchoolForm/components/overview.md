README.md (for devs)
# CreateSchoolForm Module

This module provides a **multi-step form wizard** for creating schools.  
It follows **separation of concerns**: steps, hooks, services, and reusable components.  

## 📂 Structure
- `index.js` → Container (stepper logic only).
- `steps/` → Each step UI (e.g., Basic Info, Address).
- `hooks/useSchoolForm.js` → Centralized form state & navigation.
- `services/schoolService.js` → API calls (create school, assign roles).
- `utils/` → Shared utilities (validators, theme colors).
- `components/` → Reusable subcomponents (PhoneInput, ThemeColorPicker, FormNavigation).

## 🚀 Usage
```jsx
import CreateSchoolForm from "./components/schoolpage/CreateSchoolForm";

<CreateSchoolForm user={user} />

✨ Best Practices

Keep steps dumb: only presentational, no business logic.

Use hook (useSchoolForm) for state, validation, navigation.

Use services for API integration, not inside components.

Reuse inputs (PhoneInput, ThemeColorPicker) for consistency.

```


# 8️⃣ overview.md (high-level flow)


# Create School Flow Overview

```mermaid
flowchart TD
  A[Step 1: Basic Info] -->|Next| B[Step 2: Address]
  B -->|Next| C[Step 3: Admins]
  C -->|Next| D[Step 4: Social + Review]
  D -->|Submit| E[API Calls]
  E -->|Success| F[School Created 🎉]

subgraph API
  E1[createSchool] --> E2[assignUserRole]
  E2 --> E3[syncUserRole]
  E3 --> E4[addSchoolToUser]
end

```mermaid

Step 1: School Name, Email, Phone, Logo, Theme Color.

Step 2: Address & Location.

Step 3: Add Admin Users.

Step 4: Social Media + Review.

API Layer: All calls isolated in schoolService.js.
👉 This way:  
- Junior devs only touch **step files**.  
- API logic is never duplicated.  
- Theme picker + phone input are reusable across the app.  

---

Do you want me to also include a **validator update** for the new phone number field (so it blocks in