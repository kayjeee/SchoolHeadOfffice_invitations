will show our thinking here
okay 
number 1
look we wan to add onboarding to overall flow
We want to add onboarding to our overall flow. In our Next.js + GraphQL app, the UserProfile type includes an onboardingStatus object that tracks setup steps (creating grades, uploading learners, sending invites, role-specific onboarding, completion state, and timestamps). example
/**
 * @file src/types/User.ts
 * @description Defines the type structures for user-related data including onboarding status.
 * @author kagiso
 * @version 1.1.0
 */

// Import the School interface as it will be part of the UserProfile when populated
import { School } from './School';

/**
 * @typedef {string} UserRole
 * @description A type representing the possible roles a user can have.
 * These roles are expected to be provided by the Auth0 token.
 */
export type UserRole = 'admin' | 'parent' | 'student' | 'guest';

/**
 * @interface OnboardingStatus
 * @description Tracks the completion status of various onboarding steps for new users.
 * This helps guide users through the initial setup process and ensures all
 * necessary configuration steps are completed.
 */
export interface OnboardingStatus {
  /** Whether the user has completed creating grade/class structures */
  createGrades: boolean;
  
  /** Whether the user has uploaded learner/student data */
  uploadLearners: boolean;
  
  /** Whether the user has sent invitation emails to stakeholders */
  sendInvites: boolean;
  
  /** Whether the admin user has completed their specific onboarding steps. */
  adminOnboardingCompleted: boolean;

  /** Whether the parent user has completed their specific onboarding steps. */
  parentOnboardingCompleted: boolean;

  /** Whether the guest user has completed their specific onboarding steps. */
  guestOnboardingCompleted: boolean;
  
  /** Whether the entire onboarding process has been completed */
  completed: boolean;

  /** Timestamp of the last update to the onboarding status. */
  lastUpdated: string | Date | null;
}

/**
 * @interface UserProfile
 * @description Represents the complete user profile object, combining data
 * from Auth0 and our application's backend (via Apollo/MongoDB).
 * It includes associated school IDs, optionally populated school objects,
 * and onboarding status tracking for new users.
 */
export interface UserProfile {
  /** The unique subject identifier from Auth0 (user.sub) */
  auth0_id: string;
  
  /** The user's full name */
  name: string;
  
  /** The user's email. Can be null for social login providers */
  email: string | null;
  
  /** URL to the user's profile picture */
  picture?: string;
  
  /** An array of roles assigned to the user */
  roles: UserRole[];
  
  /** * An array of string IDs for schools associated with the user.
   * This comes directly from the backend (MongoDB's has_and_belongs_to_many association).
   */
  school_ids?: string[];
  
  /** * An optional array of fully populated School objects.
   * This is typically available when the 'school_ids' association is populated
   * by GraphQL resolvers or other data fetching logic.
   */
  schools?: School[];

  /** User's account status */
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  
  /** Timestamp of last login */
  last_login: Date | string | null;

  /**
   * Tracks the user's progress through the initial onboarding workflow.
   * This helps ensure new users complete all necessary setup steps.
   */
  onboardingStatus: OnboardingStatus;
}


On the Rails (Mongoid) side, the User model manages roles, school associations, and grade/learner relations but doesn’t yet align with the onboarding structure. The goal is to make both systems consistent so the frontend can read and update onboarding progress seamlessly through the Rails backend.example
# 2) ALIGNED VERSION — add an embedded OnboardingStatus document and helpers
#    This makes Rails match your TS/GraphQL shape closely (snake_case -> camelCase handled in serializer).
# File: app/models/user.rb
class User
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name,        type: String
  field :email,       type: String
  field :auth0_id,    type: String
  field :roles,       type: Array, default: []
  field :status,      type: String, default: 'active'
  field :last_login,  type: Time

  validates :email, presence: true, uniqueness: true
  validates :auth0_id, presence: true, uniqueness: true

  has_and_belongs_to_many :schools, class_name: 'School', inverse_of: :users, validate: false
  has_many :created_grades,   class_name: 'Grade',   inverse_of: :created_by
  has_many :created_learners, class_name: 'Learner', inverse_of: :created_by

  # NEW: onboardingStatus as an embedded document
  embeds_one :onboarding_status, class_name: 'OnboardingStatus'
  after_build :ensure_onboarding_status

  def ensure_onboarding_status
    self.build_onboarding_status unless onboarding_status
  end

  # Convenience updaters that mimic the GraphQL input semantics
  def update_onboarding_status!(attrs = {})
    ensure_onboarding_status
    onboarding_status.assign_attributes(attrs.transform_keys!(&:to_s))
    onboarding_status.touch_last_updated!
    onboarding_status.auto_complete_if_ready!
    save!
    onboarding_status
  end

  # Serialize to match the frontend’s expected camelCase keys
  def to_api_hash
    {
      auth0_id: auth0_id,
      name: name,
      email: email,
      roles: roles,
      school_ids: school_ids&.map(&:to_s),
      status: status,
      last_login: last_login&.iso8601,
      onboardingStatus: onboarding_status&.to_api_hash
    }
  end
end

# File: app/models/onboarding_status.rb
class OnboardingStatus
  include Mongoid::Document
  include Mongoid::Timestamps

  embedded_in :user

  # Fields mirroring the TS interface (snake_case internally)
  field :create_grades,               type: Mongoid::Boolean, default: false
  field :upload_learners,             type: Mongoid::Boolean, default: false
  field :send_invites,                type: Mongoid::Boolean, default: false
  field :admin_onboarding_completed,  type: Mongoid::Boolean, default: false
  field :parent_onboarding_completed, type: Mongoid::Boolean, default: false
  field :guest_onboarding_completed,  type: Mongoid::Boolean, default: false
  field :completed,                   type: Mongoid::Boolean, default: false
  field :last_updated,                type: Time

  # Keep last_updated fresh whenever anything changes
  before_save :set_last_updated

  def set_last_updated
    self.last_updated = Time.current
  end

  def touch_last_updated!
    self.last_updated = Time.current
  end

  # Mark completed when all required steps are true (you can tweak logic per role)
  def auto_complete_if_ready!
    all_steps_done =
      create_grades &&
      upload_learners &&
      send_invites &&
      (admin_onboarding_completed || parent_onboarding_completed || guest_onboarding_completed)

    self.completed = all_steps_done
  end

  # Allow clean camelCase API output
  def to_api_hash
    {
      createGrades: create_grades,
      uploadLearners: upload_learners,
      sendInvites: send_invites,
      adminOnboardingCompleted: admin_onboarding_completed,
      parentOnboardingCompleted: parent_onboarding_completed,
      guestOnboardingCompleted: guest_onboarding_completed,
      completed: completed,
      lastUpdated: last_updated&.iso8601
    }
  end

  # Allow updates using camelCase keys from GraphQL input
  def assign_attributes(attrs = {})
    mapping = {
      'createGrades' => :create_grades,
      'uploadLearners' => :upload_learners,
      'sendInvites' => :send_invites,
      'adminOnboardingCompleted' => :admin_onboarding_completed,
      'parentOnboardingCompleted' => :parent_onboarding_completed,
      'guestOnboardingCompleted' => :guest_onboarding_completed,
      'completed' => :completed
    }

    attrs.each do |k, v|
      key = mapping[k] || k
      self.send("#{key}=", v) if respond_to?("#{key}=")
    end
  end
end


number 2


```mermaid
flowchart TD

%% User + Layout Selection
A[User visits Home Page] --> B{Check screen size}
B -- Mobile --> C[FrontPageLayoutMobileView]
B -- Desktop --> D[FrontPageLayout]

%% User + Roles
A --> E[Fetch Auth0 User]
E --> F[Fetch Access Token]
F --> G[Fetch User Roles]
G --> H[Set userRoles in state]

%% Schools
E --> I[Fetch User Schools]
I -->|Schools Found| J[Show SettingsLayout]
I -->|No Schools Found| K{Stepper Workflow}

%% Stepper Workflow
K --> L1[Step 1: AdminSearchPage]
K --> L2[Step 2: CreateSchoolForm]
K --> L3[Step 3: ValidateSchoolStep]
K --> L4[Step 4: ReviewSchoolStep]

%% Loading / Error States
I -->|Loading| M[Show LoadingSpinner]
I -->|Error| N[Show Error Message]

i want when the user has not yet finished onboardingstatus he get redirected to page for onboarding
where he will complete the onboarding and backeind using RoR app is updated 

current schoolpage layout is 
components/
 ├── schoolpage/
 │    ├── CreateSchoolForm/
 │    │    ├── index.js                # Main stepper container (clean)
 │    │    ├── steps/
 │    │    │    ├── Step1BasicInfo.js  # School name, email, logo, theme
 │    │    │    ├── Step2Address.js    # Address, location, map
 │    │    │    ├── Step3Admins.js     # Admin users form
 │    │    │    ├── Step4Social.js     # Social media + submission
 │    │    ├── hooks/
 │    │    │    └── useSchoolForm.js   # All form state + navigation logic
 │    │    ├── services/
 │    │    │    └── schoolService.js   # API calls: createSchool, assignRole, syncRole
 │    │    ├── utils/
 │    │    │    └── validators.js      # Validation for steps
 │    │    └── FormNavigation.js       # Next/Prev buttons
 │    │
 │    └── Marker.js
 │    └── FileUpload.js
 │    └── FormComponent.js
 │    └── LoadingSpinner.js
 use same layout to create
 updatingonboardingstatus

 currently the user has been created without OnBoardingstatuse field
 {"_id":{"$oid":"68b4c7df537de4b0952b860b"},"roles":["admin"],"cash_account":{"$numberDouble":"0.0"},"payment_history":[],"name":"1kayjee","email":"kagiso.killagram@gmail.com","auth0_id":"google-oauth2|111442371056038350919","updated_at":{"$date":{"$numberLong":"1756372583430"}},"created_at":{"$date":{"$numberLong":"1756290364261"}},"school_ids":[{"$oid":"68aee9b147db4fd04da8c352"},{"$oid":"68aeeca547db4fd04da8c353"},{"$oid":"68aeefb347db4fd04da8c354"},{"$oid":"68af066647db4fd04da8c355"},{"$oid":"68affb8b083f885fcfcdc103"},{"$oid":"68affdb6083f885fcfcdc104"},{"$oid":"68b0018a083f885fcfcdc105"},{"$oid":"68b003fc083f885fcfcdc106"},{"$oid":"68b0047c083f885fcfcdc107"},{"$oid":"68b006a7083f885fcfcdc108"},{"$oid":"68b0079e083f885fcfcdc109"},{"$oid":"68b007dd083f885fcfcdc10a"},{"$oid":"68b00910083f885fcfcdc10b"},{"$oid":"68b00ab6083f885fcfcdc10c"},{"$oid":"68b00be2083f885fcfcdc10d"},{"$oid":"68b00c1e083f885fcfcdc10e"},{"$oid":"68b00cda083f885fcfcdc10f"},{"$oid":"68b01819083f885fcfcdc110"},{"$oid":"68b01999083f885fcfcdc111"},{"$oid":"68b01c8f083f885fcfcdc112"},{"$oid":"68b01d43197a2dd7f6b9cfd8"},{"$oid":"68b01e621ec9a305f95dcd20"}]}