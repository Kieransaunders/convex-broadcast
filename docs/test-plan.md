# Org Comms PWA - Test Plan

> **Purpose:** Comprehensive test plan to verify the implementation of the Org Comms PWA according to the specification.

---

## Quick Verification

Run the automated verification script:

```bash
npx tsx scripts/verify-implementation.ts
```

---

## Test Environment Setup

### Prerequisites

1. **Convex Backend Running**

   ```bash
   npm run dev:convex
   ```

2. **Environment Variables Configured** (in `.env.local` and Convex dashboard)

   **Frontend (.env.local):**
   - `VITE_CONVEX_URL` - Convex deployment URL (e.g., `https://your-deployment.convex.cloud`)
   - `VITE_CONVEX_SITE_URL` - Convex site URL (e.g., `https://your-deployment.convex.site`)
   - `VITE_VAPID_PUBLIC_KEY` - VAPID public key for push notifications (optional)

   **Convex Dashboard (npx convex env set):**
   - `BETTER_AUTH_SECRET` - Random secret for Better Auth (generate with `openssl rand -base64 32`)
   - `SITE_URL` - Your app URL (e.g., `http://localhost:3000`)
   - `SUPER_ADMIN_EMAIL` - Email that gets super_admin role on signup
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` - For push notifications (optional)
   - `RESEND_API_KEY` - For email sending (optional)

3. **Web App Running**
   ```bash
   npm run dev:web
   ```

---

## Test Suite A: Backend API Tests

### A1. Authentication System

| #    | Test Case                   | Steps                                                        | Expected Result                                                  | Status |
| ---- | --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- | ------ |
| A1.1 | User registration           | POST to `/api/auth/sign-up/email` with name, email, password | Account created, user record in `users` table with `member` role | ⬜     |
| A1.2 | Super admin auto-assignment | Register with email matching `SUPER_ADMIN_EMAIL`             | User created with `super_admin` role                             | ⬜     |
| A1.3 | User login                  | POST to `/api/auth/sign-in/email` with credentials           | Session established, token returned                              | ⬜     |
| A1.4 | Token validation            | Use expired/invalid token                                    | 401 Unauthorized response                                        | ⬜     |
| A1.5 | Current user query          | Call `auth.getCurrentUser`                                   | Returns authenticated user's profile                             | ⬜     |

### A2. User Management (Admin Only)

| #    | Test Case            | Steps                                         | Expected Result                       | Status |
| ---- | -------------------- | --------------------------------------------- | ------------------------------------- | ------ |
| A2.1 | List all users       | As admin, call `users.list`                   | Returns array of all users            | ⬜     |
| A2.2 | List users as member | As member, call `users.list`                  | 403 Forbidden error                   | ⬜     |
| A2.3 | Get user by ID       | Call `users.getById` with valid ID            | Returns user details                  | ⬜     |
| A2.4 | Update user role     | As super_admin, call `users.updateRole`       | User role updated successfully        | ⬜     |
| A2.5 | Update role as admin | As admin (not super), call `users.updateRole` | 403 Forbidden error                   | ⬜     |
| A2.6 | Update user status   | As admin, call `users.updateStatus`           | User status updated (active/inactive) | ⬜     |

### A3. Group Management

| #    | Test Case                    | Steps                                           | Expected Result                   | Status |
| ---- | ---------------------------- | ----------------------------------------------- | --------------------------------- | ------ |
| A3.1 | List groups                  | As authenticated user, call `groups.list`       | Returns active groups only        | ⬜     |
| A3.2 | Create group                 | As admin, call `groups.create`                  | Group created, returns group ID   | ⬜     |
| A3.3 | Create group as member       | As member, call `groups.create`                 | 403 Forbidden error               | ⬜     |
| A3.4 | Update group                 | As admin, call `groups.update`                  | Group details updated             | ⬜     |
| A3.5 | Get group members            | Call `groups.getMembers` with group ID          | Returns members with user details | ⬜     |
| A3.6 | Add member to group          | Call `groups.addMember` with user and group IDs | Membership created                | ⬜     |
| A3.7 | Prevent duplicate membership | Add same user to same group twice               | Returns existing membership ID    | ⬜     |
| A3.8 | Remove member                | Call `groups.removeMember` with membership ID   | Membership deleted                | ⬜     |

### A4. Event Management

| #    | Test Case              | Steps                                                            | Expected Result                       | Status |
| ---- | ---------------------- | ---------------------------------------------------------------- | ------------------------------------- | ------ |
| A4.1 | List events            | As authenticated user, call `events.list`                        | Returns all events sorted by newest   | ⬜     |
| A4.2 | Create event           | As admin, call `events.create` with title, desc, location, dates | Event created with `scheduled` status | ⬜     |
| A4.3 | Create event as member | As member, call `events.create`                                  | 403 Forbidden error                   | ⬜     |
| A4.4 | Update event           | As admin, update title, dates, or status                         | Event updated successfully            | ⬜     |
| A4.5 | Get event by ID        | Call `events.getById`                                            | Returns event details                 | ⬜     |

### A5. Invite System

| #    | Test Case                        | Steps                                               | Expected Result                       | Status |
| ---- | -------------------------------- | --------------------------------------------------- | ------------------------------------- | ------ |
| A5.1 | List pending invites             | As admin, call `invites.list`                       | Returns pending invites               | ⬜     |
| A5.2 | Create invite                    | As admin, call `invites.create` with email and role | Invite created, email sent via Resend | ⬜     |
| A5.3 | Prevent duplicate pending invite | Create invite for same email again                  | Returns existing invite ID            | ⬜     |
| A5.4 | Revoke invite                    | Call `invites.revoke`                               | Invite status set to `expired`        | ⬜     |
| A5.5 | Sign up with invite              | Use invite link to sign up                          | Account created with invited role     | ⬜     |

### A6. Message Management

| #     | Test Case                      | Steps                                          | Expected Result                                    | Status |
| ----- | ------------------------------ | ---------------------------------------------- | -------------------------------------------------- | ------ |
| A6.1  | Create message                 | As admin, call `messages.create`               | Message created with `draft` status                | ⬜     |
| A6.2  | Get message by ID              | Call `messages.getById`                        | Returns message with targets                       | ⬜     |
| A6.3  | Update draft message           | Call `messages.update` on draft                | Message updated successfully                       | ⬜     |
| A6.4  | Prevent update of sent message | Try to update sent message                     | Error: "Cannot edit sent or archived messages"     | ⬜     |
| A6.5  | List messages by status        | Call `messages.list` with status filter        | Returns filtered messages                          | ⬜     |
| A6.6  | Send message now               | Call `messages.sendNow`                        | Status: `sent`, deliveries created, push scheduled | ⬜     |
| A6.7  | Schedule message               | Call `messages.schedule` with future timestamp | Status: `scheduled`, scheduledFunctionId set       | ⬜     |
| A6.8  | Cancel scheduled message       | Call `messages.cancelScheduled`                | Status: `draft`, scheduled function cancelled      | ⬜     |
| A6.9  | Archive sent message           | Call `messages.archive` on sent message        | Status: `archived`                                 | ⬜     |
| A6.10 | Prevent archive of draft       | Try to archive draft                           | Error: "Can only archive sent messages"            | ⬜     |

### A7. Message Delivery & Feed

| #    | Test Case                    | Steps                                      | Expected Result                           | Status |
| ---- | ---------------------------- | ------------------------------------------ | ----------------------------------------- | ------ |
| A7.1 | Audience resolution (all)    | Send message with `audienceType: "all"`    | Deliveries created for all active users   | ⬜     |
| A7.2 | Audience resolution (groups) | Send message targeting specific groups     | Deliveries created for group members only | ⬜     |
| A7.3 | Get member feed              | As member, call `messages.feed`            | Returns user's delivered messages         | ⬜     |
| A7.4 | Mark message as read         | Call `messages.markRead` with delivery ID  | `readAt` timestamp set                    | ⬜     |
| A7.5 | Get delivery stats           | As admin, call `messages.getDeliveryStats` | Returns total/read/push stats             | ⬜     |
| A7.6 | Auto-create delivery on send | Send message to active users               | Delivery records created automatically    | ⬜     |

### A8. Push Notifications

| #    | Test Case                   | Steps                                        | Expected Result                      | Status |
| ---- | --------------------------- | -------------------------------------------- | ------------------------------------ | ------ |
| A8.1 | Subscribe to push           | Call `push.subscribe` with subscription data | Subscription stored in database      | ⬜     |
| A8.2 | Get my subscription         | Call `push.getMySubscription`                | Returns user's subscription or null  | ⬜     |
| A8.3 | Update preference           | Call `push.updatePreference`                 | All user subscriptions updated       | ⬜     |
| A8.4 | Unsubscribe                 | Call `push.unsubscribe`                      | Subscription removed from database   | ⬜     |
| A8.5 | Send push notification      | Trigger message send with push enabled       | Push notifications sent via web-push | ⬜     |
| A8.6 | Respect preference (all)    | User with "all" preference                   | Receives all push notifications      | ⬜     |
| A8.7 | Respect preference (urgent) | User with "urgent" preference                | Only receives urgent notifications   | ⬜     |
| A8.8 | Respect preference (none)   | User with "none" preference                  | No push notifications sent           | ⬜     |

### A9. Impersonation Logging

| #    | Test Case               | Steps                               | Expected Result                  | Status |
| ---- | ----------------------- | ----------------------------------- | -------------------------------- | ------ |
| A9.1 | Log impersonation start | Call `impersonation.logStart`       | Log entry created with startedAt | ⬜     |
| A9.2 | Log impersonation end   | Call `impersonation.logEnd`         | Log entry updated with endedAt   | ⬜     |
| A9.3 | List impersonation logs | As admin, call `impersonation.list` | Returns recent logs              | ⬜     |

---

## Test Suite B: Frontend UI Tests

### B1. Landing Page

| #    | Test Case          | Steps             | Expected Result                                | Status |
| ---- | ------------------ | ----------------- | ---------------------------------------------- | ------ |
| B1.1 | Page loads         | Navigate to `/`   | Landing page renders with design system colors | ⬜     |
| B1.2 | Navigation visible | Check header      | Logo, Sign In, Get Started buttons visible     | ⬜     |
| B1.3 | Hero section       | Check content     | Hero text, CTA buttons present                 | ⬜     |
| B1.4 | Features section   | Scroll down       | 6 feature cards with icons                     | ⬜     |
| B1.5 | Footer             | Scroll to bottom  | Copyright, logo visible                        | ⬜     |
| B1.6 | Sign In link       | Click Sign In     | Navigates to `/sign-in`                        | ⬜     |
| B1.7 | Sign Up link       | Click Get Started | Navigates to `/sign-up`                        | ⬜     |

### B2. Authentication Pages

| #    | Test Case            | Steps                                              | Expected Result                        | Status |
| ---- | -------------------- | -------------------------------------------------- | -------------------------------------- | ------ |
| B2.1 | Sign in page loads   | Navigate to `/sign-in`                             | Form with email, password fields       | ⬜     |
| B2.2 | Valid sign in        | Enter valid credentials, submit                    | Redirected to `/feed`                  | ⬜     |
| B2.3 | Invalid sign in      | Enter invalid credentials                          | Error message displayed                | ⬜     |
| B2.4 | Sign up page loads   | Navigate to `/sign-up`                             | Form with name, email, password        | ⬜     |
| B2.5 | Valid sign up        | Fill form, submit                                  | Account created, redirected to `/feed` | ⬜     |
| B2.6 | Sign up with invite  | Use `?invite=xxx` URL                              | Invite processed on registration       | ⬜     |
| B2.7 | Redirect after login | Access protected page while logged out, then login | Redirected back to original page       | ⬜     |

### B3. Member Feed

| #    | Test Case        | Steps                          | Expected Result                                  | Status |
| ---- | ---------------- | ------------------------------ | ------------------------------------------------ | ------ |
| B3.1 | Feed loads       | Navigate to `/feed`            | List of messages displayed                       | ⬜     |
| B3.2 | Unread indicator | View feed with unread messages | Unread badge/indicator shown                     | ⬜     |
| B3.3 | Message preview  | View feed                      | Message title, body preview, timestamp visible   | ⬜     |
| B3.4 | Category badge   | View feed messages             | Category badges (notice, urgent, etc.) displayed | ⬜     |
| B3.5 | Click message    | Click on message card          | Navigates to message detail                      | ⬜     |
| B3.6 | Auto-mark read   | Open message detail            | Message marked as read                           | ⬜     |
| B3.7 | Empty state      | View feed with no messages     | "No messages" placeholder shown                  | ⬜     |

### B4. Settings Page

| #    | Test Case                | Steps                               | Expected Result                                 | Status |
| ---- | ------------------------ | ----------------------------------- | ----------------------------------------------- | ------ |
| B4.1 | Settings loads           | Navigate to `/settings`             | Settings form displayed                         | ⬜     |
| B4.2 | Profile display          | View settings                       | User name displayed                             | ⬜     |
| B4.3 | Notification preferences | Change preference (all/urgent/none) | Preference saved to database                    | ⬜     |
| B4.4 | Push subscription toggle | Enable push notifications           | Browser permission prompt, subscription created | ⬜     |
| B4.5 | Sign out                 | Click Sign Out button               | Session cleared, redirected to `/`              | ⬜     |

### B5. Admin Dashboard

| #    | Test Case          | Steps                                    | Expected Result                                  | Status |
| ---- | ------------------ | ---------------------------------------- | ------------------------------------------------ | ------ |
| B5.1 | Admin access       | As admin, navigate to `/admin/dashboard` | Dashboard loads with KPIs                        | ⬜     |
| B5.2 | Non-admin redirect | As member, try `/admin/dashboard`        | Redirected to `/feed`                            | ⬜     |
| B5.3 | Dashboard KPIs     | View dashboard                           | Total users, messages sent, unread count visible | ⬜     |

### B6. User Management (Admin)

| #    | Test Case         | Steps                            | Expected Result                                  | Status |
| ---- | ----------------- | -------------------------------- | ------------------------------------------------ | ------ |
| B6.1 | Users list        | Navigate to `/admin/users`       | DataTable with all users                         | ⬜     |
| B6.2 | Role badges       | View users table                 | Role badges (member/admin/super_admin) displayed | ⬜     |
| B6.3 | Status indicators | View users table                 | Active/inactive status shown                     | ⬜     |
| B6.4 | Invite button     | Click Invite User                | Invite dialog opens                              | ⬜     |
| B6.5 | Send invite       | Enter email, select role, submit | Invite sent, toast notification                  | ⬜     |
| B6.6 | Role management   | Click change role on user        | Role selector appears, update saved              | ⬜     |

### B7. Group Management (Admin)

| #    | Test Case        | Steps                       | Expected Result                | Status |
| ---- | ---------------- | --------------------------- | ------------------------------ | ------ |
| B7.1 | Groups list      | Navigate to `/admin/groups` | List of active groups          | ⬜     |
| B7.2 | Create group     | Click New Group, fill form  | Group created, appears in list | ⬜     |
| B7.3 | Group detail     | Click on group              | Detail page with members list  | ⬜     |
| B7.4 | Add member       | Search user, add to group   | Member added to group          | ⬜     |
| B7.5 | Remove member    | Click remove on member      | Member removed from group      | ⬜     |
| B7.6 | Deactivate group | Click deactivate            | Group hidden from list         | ⬜     |

### B8. Event Management (Admin)

| #    | Test Case    | Steps                         | Expected Result                                       | Status |
| ---- | ------------ | ----------------------------- | ----------------------------------------------------- | ------ |
| B8.1 | Events list  | Navigate to `/admin/events`   | List of all events                                    | ⬜     |
| B8.2 | Create event | Click New Event, fill details | Event created with scheduled status                   | ⬜     |
| B8.3 | Event status | View event list               | Status badges (scheduled/changed/cancelled/completed) | ⬜     |
| B8.4 | Update event | Edit event details            | Changes saved, status may update                      | ⬜     |
| B8.5 | Cancel event | Cancel scheduled event        | Status changed to cancelled                           | ⬜     |

### B9. Message Management (Admin)

| #    | Test Case          | Steps                              | Expected Result                                  | Status |
| ---- | ------------------ | ---------------------------------- | ------------------------------------------------ | ------ |
| B9.1 | Messages list      | Navigate to `/admin/messages`      | Tabbed interface (draft/scheduled/sent/archived) | ⬜     |
| B9.2 | Create draft       | Click New Message, fill form, save | Draft message created                            | ⬜     |
| B9.3 | Audience selection | Create message, select groups      | Target groups saved                              | ⬜     |
| B9.4 | Schedule message   | Set future date, schedule          | Message status: scheduled                        | ⬜     |
| B9.5 | Cancel schedule    | Cancel scheduled message           | Status back to draft                             | ⬜     |
| B9.6 | Send now           | Click Send on draft                | Message sent, deliveries created                 | ⬜     |
| B9.7 | Delivery stats     | View sent message detail           | Stats: total, read, push sent/failed             | ⬜     |
| B9.8 | Archive message    | Archive sent message               | Message moved to archived tab                    | ⬜     |

---

## Test Suite C: PWA & Push Notification Tests

### C1. PWA Manifest

| #    | Test Case       | Steps                      | Expected Result                                 | Status |
| ---- | --------------- | -------------------------- | ----------------------------------------------- | ------ |
| C1.1 | Manifest valid  | Check `/manifest.json`     | Valid JSON with correct structure               | ⬜     |
| C1.2 | Manifest linked | Check `<head>` in DevTools | `<link rel="manifest">` present                 | ⬜     |
| C1.3 | Icons present   | Check manifest             | 192x192 and 512x512 icons defined               | ⬜     |
| C1.4 | Theme colors    | Check manifest             | theme_color: #6366F1, background_color: #F5F3FF | ⬜     |

### C2. Service Worker

| #    | Test Case     | Steps                                          | Expected Result                 | Status |
| ---- | ------------- | ---------------------------------------------- | ------------------------------- | ------ |
| C2.1 | SW registered | Check DevTools > Application > Service Workers | sw.js registered and active     | ⬜     |
| C2.2 | SW install    | First visit                                    | SW installs and skips waiting   | ⬜     |
| C2.3 | SW activate   | After install                                  | SW activates and claims clients | ⬜     |

### C3. Push Notifications

| #    | Test Case            | Steps                             | Expected Result                 | Status |
| ---- | -------------------- | --------------------------------- | ------------------------------- | ------ |
| C3.1 | Permission prompt    | Enable notifications in settings  | Browser permission dialog shown | ⬜     |
| C3.2 | Subscription created | Grant permission                  | Push subscription stored in DB  | ⬜     |
| C3.3 | Receive push         | Send message with push enabled    | Push notification displayed     | ⬜     |
| C3.4 | Notification click   | Click push notification           | Opens app to message detail     | ⬜     |
| C3.5 | Notification close   | Close notification                | Notification dismissed          | ⬜     |
| C3.6 | Unsubscribe          | Disable notifications in settings | Subscription removed from DB    | ⬜     |

---

## Test Suite D: Integration & E2E Tests

### D1. Complete User Flows

| #    | Test Case             | Steps                                                                                                                                  | Expected Result                       | Status |
| ---- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| D1.1 | New member onboarding | 1. Admin invites user<br>2. User receives email<br>3. User clicks invite link<br>4. User signs up<br>5. User views feed                | Complete flow works end-to-end        | ⬜     |
| D1.2 | Message broadcast     | 1. Admin creates message<br>2. Targets specific groups<br>3. Sends message<br>4. Members receive in feed<br>5. Push notifications sent | Message delivered to correct audience | ⬜     |
| D1.3 | Scheduled message     | 1. Admin schedules message for future<br>2. Waits for scheduled time<br>3. Message auto-sends<br>4. Members receive notification       | Scheduling system works correctly     | ⬜     |
| D1.4 | Event with updates    | 1. Admin creates event<br>2. Sends event update message<br>3. Members receive event notification                                       | Event linked to message correctly     | ⬜     |

### D2. Security Tests

| #    | Test Case              | Steps                                      | Expected Result        | Status |
| ---- | ---------------------- | ------------------------------------------ | ---------------------- | ------ |
| D2.1 | Unauthorized access    | Try to access admin routes as member       | Redirected to feed     | ⬜     |
| D2.2 | Cross-user data access | Try to access another user's deliveries    | Only own data returned | ⬜     |
| D2.3 | Role escalation        | Try to change own role to super_admin      | 403 Forbidden          | ⬜     |
| D2.4 | Invalid invite         | Try to sign up with expired/invalid invite | Error message shown    | ⬜     |

---

## Test Execution Log

| Date | Tester | Tests Run | Passed | Failed | Notes |
| ---- | ------ | --------- | ------ | ------ | ----- |
|      |        |           |        |        |       |

---

## Bug Tracking

| ID  | Severity | Description | Steps to Reproduce | Expected | Actual | Status |
| --- | -------- | ----------- | ------------------ | -------- | ------ | ------ |
|     |          |             |                    |          |        |        |

---

## Sign-off

| Role          | Name | Date | Signature |
| ------------- | ---- | ---- | --------- |
| QA Lead       |      |      |           |
| Product Owner |      |      |           |
| Tech Lead     |      |      |           |
