Structure: ChoreFlow Application
1. User Flow Diagrams
1.1. Onboarding Flow
New User A (Creator): Lands on homepage -> Clicks "Sign Up" -> Authenticates via Firebase -> Is prompted to "Create a Household" -> Enters household name -> Lands on the main household dashboard.

Invitation Flow: User A clicks "Invite Members" -> App generates a unique URL and QR Code -> User A shares the link with User B.

New User B (Invitee): Clicks invitation link -> Is taken to the "Sign Up" page -> Authenticates via Firebase -> Is automatically added to User A's household -> Lands on the main household dashboard.

1.2. Chore Management Flow
Creation: Any member clicks "Add Chore" -> Fills out form (name, description, due date, recurring status) -> Clicks "Save".

Assignment:

Manual: On creation, user selects one or more members from a list to assign the chore.

Automatic: If chore is "recurring" and auto-assign is "on", the system assigns it to the next person in the round-robin sequence on the day of its creation/recurrence.

Completion: User assigned to a chore clicks a "Mark as Complete" checkbox -> Chore moves from "To-Do" list to "Completed" list.

2. Proposed Database Schema (PostgreSQL)
users

id (UUID, Primary Key)

firebase_uid (VARCHAR, Unique) - Links to Firebase Auth user

email (VARCHAR, Unique)

display_name (VARCHAR)

household_id (UUID, Foreign Key to households.id)

created_at (TIMESTAMP)

households

id (UUID, Primary Key)

name (VARCHAR)

admin_id (UUID, Foreign Key to users.id)

invite_code (VARCHAR, Unique) - For generating invite links

created_at (TIMESTAMP)

chores

id (UUID, Primary Key)

household_id (UUID, Foreign Key to households.id)

created_by_id (UUID, Foreign Key to users.id)

title (VARCHAR)

description (TEXT)

due_date (DATE)

is_recurring (BOOLEAN, default: false)

recurrence_interval (VARCHAR, e.g., 'daily', 'weekly') - NULL if not recurring

created_at (TIMESTAMP)

chore_assignments (Tracks who is assigned what and the status)

id (UUID, Primary Key)

chore_id (UUID, Foreign Key to chores.id)

user_id (UUID, Foreign Key to users.id)

status (VARCHAR, e.g., 'pending', 'completed')

completed_at (TIMESTAMP) - NULL if not completed

3. API Specification (High-Level REST API)
This should be expanded into a full OpenAPI/Swagger specification.

Method

Endpoint

Description

Auth Required

POST

/api/households

Create a new household.

Yes

GET

/api/households/{id}

Get household details and members.

Yes

POST

/api/households/{id}/invites

Generate a new invite code/link.

Yes (Admin)

POST

/api/join

Join a household using an invite code.

Yes

GET

/api/households/{id}/chores

Get all chores for a household.

Yes

POST

/api/households/{id}/chores

Create a new chore in the household.

Yes

PUT

/api/chores/{chore_id}

Update a chore's details.

Yes

DELETE

/api/chores/{chore_id}

Delete a chore.

Yes

POST

/api/chores/{chore_id}/complete

Mark a chore as complete for the current user.

Yes

WebHooks
A WebSocket connection will be established upon user login.

The server will push events (e.g., new_chore_assigned, chore_updated) to relevant clients to enable live UI updates without needing to re-fetch data.
