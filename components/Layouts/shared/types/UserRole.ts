// STANDARDIZED ROLE DEFINITION (Recommended)
export type UserRole = 
  | 'user'        // Base user role
  | 'admin'       // School administrator
  | 'teacher'     // Classroom teacher
  | 'principal'   // School principal
  | 'district_admin' // District-level admin
  | 'super_admin' // System-wide admin
  | 'parent'      // Parent/guardian
  | 'student'     // Student user
  | 'guest';      // Limited access guest