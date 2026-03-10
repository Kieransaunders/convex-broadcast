
# Organisation Communications PWA Boilerplate
## Specification Document

## Overview
This project is an open-source boilerplate for building **single‑organisation communication apps** using:

- **React + TanStack Start**
- **Convex backend**
- **Better Auth**
- **Progressive Web App (PWA) with push notifications**

The goal is to provide a **clean starting point for building internal or community apps** where administrators broadcast updates to members through in‑app feeds and device notifications.

Example use cases include:

- Charity volunteer coordination
- Staff internal communications
- University course announcements
- Community group updates
- Member organisation portals

The system focuses on **admin‑led broadcast messaging with audience targeting** rather than chat or social interaction.

---

# Core Design Principles

## 1. Single Organisation Model
The boilerplate assumes **one organisation per deployment**.

There is no multi‑tenant SaaS architecture.

Configuration such as branding and settings apply to the entire app.

## 2. Broadcast Communication First
The primary feature is **one‑way communication from administrators to members**.

Messages can be targeted to:

- All users
- Selected groups
- Event audiences

## 3. Simple Roles
A minimal role system avoids unnecessary complexity.

Roles:

- `member`
- `admin`
- `super_admin`

## 4. PWA Notification Delivery
Messages appear:

- Inside the app feed
- As browser/device push notifications (if enabled)

## 5. Admin‑Centric Control
Administrators manage:

- Users
- Groups
- Events
- Messages
- Scheduling
- Notification delivery

---

# Technology Stack

Frontend
- React
- TanStack Start
- TypeScript

Backend
- Convex database and functions

Authentication
- Better Auth
- Better Auth Admin plugin

PWA
- Web App Manifest
- Service Worker
- Push Notifications API

---

# Core Features

## Authentication

Users can access the app through:

- Email/password signup
- Admin invitation
- Login authentication

Features:

- Session management
- Role-based permissions
- Invite acceptance flow

## User Roles

### Member
Can:

- Login
- View message feed
- Receive notifications
- Manage personal notification preferences

### Admin
Can:

- Create messages
- Schedule messages
- Manage groups
- Add users to groups
- Create events
- Impersonate users for testing

### Super Admin
Can:

- Manage admins
- Configure system settings
- Manage invites
- Impersonate any user
- Perform all admin actions

---

# Groups

Groups allow targeting messages to subsets of users.

Examples:

- Departments
- Volunteer teams
- Student cohorts
- Customer segments

Users may belong to **multiple groups**.

## Group Fields

- id
- name
- description
- active
- createdBy
- createdAt

## Group Membership

- userId
- groupId
- role (member or manager)
- addedBy
- addedAt

---

# Events

Events provide a context for announcements.

Examples:

- Meetings
- Community sessions
- Training events
- Lectures

Messages can target **event audiences**.

## Event Fields

- id
- title
- description
- location
- startsAt
- endsAt
- status

Status values:

- scheduled
- changed
- cancelled
- completed

---

# Messaging System

Messages are the core communication unit.

Admins can create:

- general notices
- reminders
- event updates
- urgent alerts

Messages can be:

- drafted
- scheduled
- sent

## Message Fields

- id
- title
- body
- category
- audienceType
- linkedEventId
- pushEnabled
- status
- scheduledFor
- sentAt
- createdBy

## Audience Types

Messages may target:

- all users
- selected groups
- event audiences

## Message Lifecycle

1. Draft
2. Scheduled
3. Sent
4. Archived

Sent messages should be **immutable**.

Corrections require sending a new message.

---

# Message Scheduling

Admins may:

- Send immediately
- Schedule future messages
- Edit scheduled messages
- Cancel scheduled messages

Future enhancements may include recurring schedules.

---

# Notification System

Messages are delivered through two channels.

## In-App Feed

Users see:

- message list
- unread indicators
- message detail view

## Push Notifications

Users may enable browser/device notifications.

Push notifications include:

- message title
- short preview
- deep link into the app

Users can configure preferences:

- all notifications
- urgent only
- none

---

# Impersonation

Admins may impersonate users to test targeting and notifications.

Security rules:

- impersonation sessions are clearly indicated
- impersonation actions are logged
- sensitive actions are restricted
- administrators can exit impersonation at any time

## Audit Log Fields

- adminUserId
- impersonatedUserId
- startedAt
- endedAt

---

# Admin Interface

The admin dashboard includes five areas.

## Users
- list users
- invite users
- manage roles
- impersonate users

## Groups
- create groups
- assign members
- manage memberships

## Events
- create and edit events
- link events to groups

## Messages
- create messages
- schedule messages
- manage drafts
- view sent messages

## Reporting
- delivery status
- read counts
- push notification status

---

# Database Schema Overview

## Users
- id
- name
- email
- role
- status
- createdAt

## Groups
- id
- name
- description

## GroupMemberships
- id
- userId
- groupId
- role

## Events
- id
- title
- startsAt
- endsAt
- location
- status

## Messages
- id
- title
- body
- category
- audienceType
- status
- scheduledFor
- sentAt
- createdBy

## MessageTargets
- id
- messageId
- targetType
- targetId

## Deliveries
- id
- messageId
- userId
- deliveredAt
- readAt
- pushStatus

## Invites
- id
- email
- role
- expiresAt
- invitedBy
- status

## ImpersonationLogs
- id
- adminUserId
- impersonatedUserId
- startedAt
- endedAt

---

# Repository Structure

Suggested repository layout:

apps/
    demo-app/

packages/
    convex-org-comms/
    ui/

convex/
    schema.ts
    functions/

pwa/
    service-worker.ts
    manifest.json

---

# Future Enhancements

Potential future extensions:

- recurring notifications
- analytics dashboards
- read confirmations
- document sharing
- event RSVPs
- mobile app wrapper

---

# Project Goal

Provide a **clean, extensible foundation for building organisation communication apps** with modern tooling and minimal setup.

The boilerplate should allow developers to quickly build apps where administrators can broadcast updates, schedule notifications, and reach targeted audiences efficiently.
