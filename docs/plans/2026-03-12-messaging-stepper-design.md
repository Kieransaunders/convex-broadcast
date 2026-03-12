# Admin Message Compose: Stepper Wizard Redesign

## Problem

The current admin message compose flow has three key issues:

1. **Too many steps**: Create draft on one page → navigate to detail page → click "Send Now" (3 pages for one action)
2. **No scheduling UI**: Backend supports `messages.schedule()` but there's no date/time picker in the UI
3. **No preview/confirmation**: Messages can be sent immediately with no preview of what members see and no confirmation step

This is the core workflow of the app and needs to feel polished and intentional.

## Solution

Replace the single-page compose form with a **4-step stepper wizard**:

```
Step 1: Content → Step 2: Audience → Step 3: Delivery → Step 4: Preview & Confirm
```

### Step 1: Content

- Title (required, max 200 chars)
- Body (required, textarea, max 5000 chars)
- Category (Notice / Reminder / Event Update / Urgent)

### Step 2: Audience

- Three audience type cards: All Members / Groups / Event
- Group multi-select with search, select all, chip badges (reuses existing UI)
- Event single-select with search (reuses existing UI)
- Recipient count estimate

### Step 3: Delivery

- Two radio-style cards: "Send Immediately" / "Schedule for Later"
- Date picker (shadcn Calendar in Popover) + time picker when scheduling
- Push notification toggle (Switch component)

### Step 4: Preview & Confirm

- Message preview styled exactly as members see it in feed
- Summary table: recipients, delivery method, push status, category
- Three action buttons: "Save as Draft" / "Send Now" / "Schedule"

## Architecture

### Component Structure

```
src/routes/_authed/_admin/messages/new.tsx  (orchestrator)
  ├── src/components/compose/stepper.tsx          (step indicator bar)
  ├── src/components/compose/step-content.tsx     (Step 1)
  ├── src/components/compose/step-audience.tsx     (Step 2)
  ├── src/components/compose/step-delivery.tsx     (Step 3)
  ├── src/components/compose/step-preview.tsx      (Step 4)
  └── src/components/compose/use-compose-form.ts   (shared form hook)
```

### Form State

Single `react-hook-form` instance with `zod` validation, shared across all steps. Per-step validation triggers only that step's fields before allowing "Next".

### Navigation Rules

- "Next" validates current step before advancing
- "Back" always allowed (state preserved)
- Completed step indicators are clickable (jump back)
- Future steps not clickable until preceding steps validated

### Submission Flow

All actions create a draft first, then take the appropriate action:

1. **Save as Draft**: `api.messages.create` → navigate to `/messages`
2. **Send Now**: `api.messages.create` → `api.messages.sendNow` → navigate to `/messages`
3. **Schedule**: `api.messages.create` → `api.messages.schedule` → navigate to `/messages`

## Additional: Message List Improvements

Light improvements to `messages/index.tsx`:

- Quick action buttons on cards (Send, Delete, Cancel Schedule) with confirmation dialogs
- Better schedule time display with relative times
- Wire up delete functionality

## Dependencies Added

- `react-hook-form` + `@hookform/resolvers` + `zod` (form validation)
- shadcn components: `form`, `calendar`, `popover`

## Backend Changes (minor)

- `convex/users.ts`: Add `countActive` query for recipient count estimates
- `convex/messages.ts`: Add `deleteDraft` mutation for draft deletion

## Design Tokens

Follows existing design system:

- Primary: `#6366F1` (indigo)
- CTA: `#10B981` (emerald)
- Text: `#1E1B4B`
- Background: `#F5F3FF`
- Icons: Lucide React
- Components: shadcn/ui
