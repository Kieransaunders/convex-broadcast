export interface ArticleSection {
  heading: string;
  content: string;
  list?: Array<string>;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface HowTo {
  name: string;
  steps: Array<HowToStep>;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  category: string;
  tags: Array<string>;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  sections: Array<ArticleSection>;
  howTo?: HowTo;
  faqs: Array<FAQ>;
}

export const articles: Array<Article> = [
  {
    slug: "how-to-send-broadcast-messages-to-your-organisation",
    title: "How to Send Broadcast Messages to Your Organisation",
    metaTitle:
      "How to Send Broadcast Messages to Your Organisation | Org Comms",
    metaDescription:
      "A practical guide to sending broadcast messages to all members or targeted groups in your organisation — covering timing, targeting, and best practices.",
    intro:
      "Broadcast messaging lets you reach everyone in your organisation instantly — or target a specific group or event audience with pinpoint accuracy. Here's how to do it well.",
    category: "Getting Started",
    tags: ["broadcast", "messaging", "organisation communication"],
    readingTime: "5 min read",
    publishedAt: "2026-01-10",
    updatedAt: "2026-03-01",
    sections: [
      {
        heading: "What is broadcast messaging?",
        content:
          "Broadcast messaging is the practice of sending a single message to many recipients at once. Unlike one-to-one chat, broadcast messages flow one way — from an admin or communicator to members. This makes it ideal for announcements, reminders, event updates, and urgent notices.",
      },
      {
        heading: "Targeting: everyone vs. a specific group",
        content:
          "A well-designed broadcast system lets you choose your audience before you hit send. You can reach all members, a specific group (e.g. volunteers, committee, staff), or the audience of a particular event.",
        list: [
          "All members — org-wide announcements, policy changes, major news",
          "Group — team-specific updates, role-based reminders",
          "Event audience — pre-event briefings, last-minute changes, post-event follow-ups",
        ],
      },
      {
        heading: "Drafting vs. scheduling vs. sending immediately",
        content:
          "Most communication platforms support three modes: draft (saved for later), scheduled (set a future date/time), and immediate send. Scheduling is particularly powerful for time-sensitive content — you can write your message in advance and have it land at exactly the right moment.",
      },
      {
        heading: "Combining in-app feed and push notifications",
        content:
          "Modern broadcast tools deliver messages via both an in-app inbox and browser/device push notifications. Members who haven't opened the app still receive a notification on their device. This dual-channel approach dramatically improves open rates compared to email alone.",
      },
      {
        heading: "Keeping sent messages immutable",
        content:
          "Once a message is sent, it should be treated as a permanent record. If you need to correct something, send a follow-up message rather than editing the original. This preserves trust and prevents confusion about what was communicated and when.",
      },
    ],
    howTo: {
      name: "How to send a broadcast message",
      steps: [
        {
          name: "Open the Messages dashboard",
          text: "Navigate to the admin area and select Messages from the sidebar.",
        },
        {
          name: "Click 'New Message'",
          text: "Select the compose or new message button to open the message editor.",
        },
        {
          name: "Choose your audience",
          text: "Select 'All members', a specific group, or an event audience from the targeting dropdown.",
        },
        {
          name: "Write your message",
          text: "Enter a clear subject and body. Keep it concise — most members read on mobile.",
        },
        {
          name: "Choose delivery: now or scheduled",
          text: "Send immediately or pick a future date and time for the message to go out.",
        },
        {
          name: "Review and confirm",
          text: "Double-check the audience and content, then confirm. The message will be delivered to in-app feeds and push notifications.",
        },
      ],
    },
    faqs: [
      {
        question: "Can I edit a message after it's been sent?",
        answer:
          "No — sent messages are immutable to preserve a clear audit trail. If you made a mistake, send a follow-up correction message to the same audience.",
      },
      {
        question: "What happens if a member has push notifications disabled?",
        answer:
          "The message still appears in their in-app inbox. Push notifications are a secondary delivery channel; the in-app feed is always the primary record.",
      },
      {
        question: "Can I schedule a message for a specific time zone?",
        answer:
          "Messages are scheduled in the server's time zone (UTC by default). Make sure to convert your desired local time before scheduling.",
      },
      {
        question: "Is there a character limit for broadcast messages?",
        answer:
          "There is no hard limit in the platform, but best practice is to keep messages under 300 words for readability on mobile screens.",
      },
    ],
  },
  {
    slug: "push-notifications-vs-email-which-is-better-for-internal-comms",
    title: "Push Notifications vs. Email: Which Is Better for Internal Comms?",
    metaTitle:
      "Push Notifications vs. Email for Internal Comms | Org Comms",
    metaDescription:
      "Compare push notifications and email for internal organisational communication. Learn when to use each channel and how to combine them effectively.",
    intro:
      "Email has been the default internal communications channel for decades — but push notifications are changing the game for organisations that need timely, reliable message delivery.",
    category: "Strategy",
    tags: ["push notifications", "email", "internal communications"],
    readingTime: "6 min read",
    publishedAt: "2026-01-18",
    updatedAt: "2026-03-01",
    sections: [
      {
        heading: "The case for email",
        content:
          "Email is universal — every member already has one, and there's nothing to install. It supports rich formatting, attachments, and long-form content. It's also asynchronous, which suits non-urgent communication well. The major weakness is deliverability: spam filters, crowded inboxes, and delayed opens mean urgent messages often don't land in time.",
      },
      {
        heading: "The case for push notifications",
        content:
          "Browser and mobile push notifications are delivered almost instantly and appear directly on the user's screen — even when they're not in your app. Open rates for push notifications typically run 4–8× higher than email for time-sensitive content. The trade-off is that users must opt in, and notification fatigue is real if you over-send.",
      },
      {
        heading: "When to use push notifications",
        content:
          "Push works best for short, time-critical messages that require immediate awareness.",
        list: [
          "Urgent announcements (venue changes, cancellations)",
          "Event reminders (1 hour before, 15 minutes before)",
          "Safety or operational alerts",
          "Last-minute updates requiring same-day action",
        ],
      },
      {
        heading: "When to use email",
        content:
          "Email remains superior for content that benefits from permanence and long-form presentation.",
        list: [
          "Newsletters and monthly round-ups",
          "Documents, agendas, and minutes",
          "Invitations and onboarding flows",
          "Anything requiring a paper trail for compliance",
        ],
      },
      {
        heading: "The winning strategy: use both",
        content:
          "The most effective internal comms setups use a purpose-built in-app broadcast system for operational messages (delivered via push + in-app feed) and reserve email for newsletters, documents, and formal correspondence. This keeps each channel doing what it does best — and avoids flooding member inboxes with noise.",
      },
    ],
    faqs: [
      {
        question: "How do I get members to enable push notifications?",
        answer:
          "The best time to request permission is right after a member signs up and sees value in the app. Frame it as 'never miss an important update' rather than a generic permission prompt. Explain what you'll use it for.",
      },
      {
        question: "What is notification fatigue?",
        answer:
          "Notification fatigue happens when members receive too many notifications and start ignoring or disabling them. To avoid it, only send push notifications for genuinely important content and give members preference controls (all, urgent only, none).",
      },
      {
        question: "Do push notifications work on desktop as well as mobile?",
        answer:
          "Yes — browser push notifications work on Chrome, Edge, Firefox, and Safari (macOS) on desktop, as well as Android Chrome. iOS Safari added support in iOS 16.4+ for web push.",
      },
      {
        question: "Can members choose their notification preference?",
        answer:
          "Yes. A good broadcast platform lets each member set their push preference: receive all notifications, urgent only, or none. Their choice is stored and respected on every send.",
      },
    ],
  },
  {
    slug: "targeting-messages-by-group-and-event-audience",
    title: "Targeting Messages by Group and Event Audience",
    metaTitle:
      "How to Target Messages by Group and Event Audience | Org Comms",
    metaDescription:
      "Learn how to use group and event audience targeting in your broadcast messaging system to send relevant, timely messages to the right people.",
    intro:
      "Sending the right message to the right people is the difference between communication that lands and noise that gets ignored. Group and event targeting make this easy.",
    category: "Features",
    tags: ["targeting", "groups", "events", "segmentation"],
    readingTime: "5 min read",
    publishedAt: "2026-01-25",
    updatedAt: "2026-03-01",
    sections: [
      {
        heading: "Why targeting matters",
        content:
          "When every message goes to everyone, members quickly start ignoring communications that aren't relevant to them. Targeted messaging means committee members get committee updates, volunteers get volunteer briefings, and event attendees get event-specific reminders — and no one gets flooded with messages that don't apply to them.",
      },
      {
        heading: "Group-based targeting",
        content:
          "Groups are persistent collections of members that you define — typically based on role, team, location, or function. Examples include committees, departments, volunteer teams, or regional chapters. Once a member is in a group, any message targeted at that group reaches them automatically.",
        list: [
          "Create groups that mirror your real-world structure",
          "Add and remove members as their roles change",
          "Send group-targeted messages from the compose screen",
          "Groups persist between messages and events",
        ],
      },
      {
        heading: "Event audience targeting",
        content:
          "Events are time-bounded — a meeting, training session, or function. When you create an event, you build its audience: either specific members, a group, or all org members. Messages targeted at an event reach exactly that audience. This is ideal for last-minute changes, pre-event reminders, and post-event follow-ups.",
      },
      {
        heading: "Combining groups and events",
        content:
          "You can use groups to build event audiences quickly. For example, create a 'Volunteers' group, then use that group as the audience for your weekend event. Any message sent to the event audience will reach exactly those volunteers — no manual list-building required.",
      },
      {
        heading: "Delivery tracking",
        content:
          "A good broadcast system tracks delivery per recipient. You can see who received a message, when, and via which channel. This is especially useful for compliance-sensitive communications where you need to demonstrate that information reached specific people.",
      },
    ],
    howTo: {
      name: "How to send a message to a specific group",
      steps: [
        {
          name: "Navigate to Messages and click New Message",
          text: "Open the message composer from the admin dashboard.",
        },
        {
          name: "In the Audience field, select 'Group'",
          text: "Switch the audience type from 'All members' to 'Group'.",
        },
        {
          name: "Choose the target group from the dropdown",
          text: "Select the group you want to reach. Member count will update automatically.",
        },
        {
          name: "Write and send your message",
          text: "Compose your message as normal and send or schedule it.",
        },
      ],
    },
    faqs: [
      {
        question: "Can I send a message to multiple groups at once?",
        answer:
          "Currently each message targets one audience type (all members, one group, or one event). For multiple groups, send separate targeted messages or add members to a combined group.",
      },
      {
        question: "What happens if a member belongs to multiple groups?",
        answer:
          "They will receive messages targeted at each group they're in. Deduplication ensures they won't receive the same message twice if they're in two groups that both receive it.",
      },
      {
        question: "Can event audiences include non-members?",
        answer:
          "Event audiences are drawn from existing members only. Non-members must be invited to join the platform before they can receive targeted messages.",
      },
      {
        question: "Is there a limit to how many groups I can create?",
        answer:
          "No hard limit — create as many groups as your organisation needs to reflect its real structure.",
      },
    ],
  },
  {
    slug: "scheduling-messages-for-the-right-moment",
    title: "Scheduling Messages for the Right Moment",
    metaTitle: "How to Schedule Broadcast Messages for Maximum Impact | Org Comms",
    metaDescription:
      "Learn how to schedule broadcast messages and push notifications to land at exactly the right time — boosting open rates and member engagement.",
    intro:
      "Timing is everything in communications. Scheduled messaging lets you write content in advance and deliver it precisely when it will have the most impact — without manual effort.",
    category: "Features",
    tags: ["scheduling", "messaging", "automation"],
    readingTime: "4 min read",
    publishedAt: "2026-02-03",
    updatedAt: "2026-03-01",
    sections: [
      {
        heading: "Why schedule messages?",
        content:
          "Scheduling decouples message creation from delivery. You can batch your communications work into a focused session — writing multiple messages at once — and have them deliver at optimal times throughout the week. This is particularly valuable for recurring reminders, pre-event briefings, and time-zone-aware organisations.",
      },
      {
        heading: "When to schedule vs. send immediately",
        content:
          "Immediate sends are best for genuinely urgent, unplanned events — a venue change, a cancellation, or an emergency alert. Everything else is a candidate for scheduling.",
        list: [
          "Event reminders — 24 hours before, 1 hour before",
          "Weekly newsletter or digest — same time every week",
          "Post-event follow-up — a few hours after the event ends",
          "Monday morning motivation or weekly agenda",
        ],
      },
      {
        heading: "How scheduling works under the hood",
        content:
          "When you schedule a message, the platform stores the scheduled time and queues it for delivery. At the specified time, the system processes the message and dispatches it to all targeted recipients via their preferred channels. The scheduled delivery ID is recorded alongside the message so you can cancel or review it before it fires.",
      },
      {
        heading: "Cancelling a scheduled message",
        content:
          "Until a scheduled message fires, it can be cancelled. This is useful if circumstances change — for example, an event is cancelled after the reminder was already scheduled. Simply navigate to the message in drafts/scheduled and cancel it before the send time.",
      },
      {
        heading: "Best times to send messages",
        content:
          "For most organisations, the highest open rates come from messages sent between 8–10 AM or 5–7 PM on weekdays. Weekend mornings (9–11 AM) work well for community organisations. Avoid late evenings and early mornings unless the content is genuinely urgent.",
      },
    ],
    faqs: [
      {
        question: "Can I edit a scheduled message before it sends?",
        answer:
          "Scheduled messages can be cancelled before they fire. To edit content, cancel the scheduled message and create a new one with your updated content.",
      },
      {
        question: "What time zone are scheduled messages sent in?",
        answer:
          "Scheduled messages are processed in the server's time zone (UTC). Convert your desired local time to UTC before setting the schedule, or use a tool that shows the UTC equivalent.",
      },
      {
        question: "What happens if the server is down at the scheduled time?",
        answer:
          "The scheduler will process the message as soon as the server comes back online. For most minor downtime, the delay will be seconds to a few minutes.",
      },
      {
        question: "Can I see a list of all scheduled messages?",
        answer:
          "Yes — the Messages dashboard shows separate views for sent, scheduled, and draft messages so you can review and manage the queue at any time.",
      },
    ],
  },
  {
    slug: "member-engagement-best-practices-for-organisations",
    title: "Member Engagement Best Practices for Organisations",
    metaTitle: "Member Engagement Best Practices for Organisations | Org Comms",
    metaDescription:
      "Proven strategies for improving member engagement in your organisation through targeted communications, push notifications, and consistent messaging rhythms.",
    intro:
      "Engaged members show up, contribute, and stay. The right communication rhythm — with the right message at the right time — is the foundation of strong member engagement.",
    category: "Strategy",
    tags: ["member engagement", "best practices", "communication strategy"],
    readingTime: "7 min read",
    publishedAt: "2026-02-12",
    updatedAt: "2026-03-01",
    sections: [
      {
        heading: "Define your communication rhythm",
        content:
          "Consistency builds trust. Whether it's a weekly digest, a pre-event briefing, or a post-meeting summary, members should be able to predict when communications will arrive. Irregular, sporadic messaging creates anxiety and encourages members to tune out. Decide on a cadence and stick to it.",
      },
      {
        heading: "Segment before you send",
        content:
          "One-size-fits-all messages rarely fit anyone well. Use groups and event audiences to ensure members receive only what's relevant to them. A volunteer receives volunteer updates; a committee member receives committee notices. Relevance is the single biggest driver of open rates.",
      },
      {
        heading: "Keep messages short and action-oriented",
        content:
          "Most members read on mobile, often while doing something else. Lead with the most important information, state clearly what (if anything) you need from them, and keep body text under 200 words where possible. Every message should answer: what, why, and what next.",
        list: [
          "Start with the most critical information",
          "State the required action clearly (if any)",
          "Use plain language — avoid jargon",
          "Include a single clear call to action",
        ],
      },
      {
        heading: "Use push notifications sparingly",
        content:
          "Push notifications are powerful precisely because they're interruptive. If you use them for everything, members will disable them. Reserve push for time-sensitive content only (reminders within 24 hours, urgent changes, critical alerts). Let members set their own preference — all, urgent only, or none.",
      },
      {
        heading: "Measure and iterate",
        content:
          "Track delivery rates and, where possible, open rates over time. If a particular type of message consistently underperforms, revisit the content, timing, or targeting. Member engagement is not a set-and-forget exercise — it requires regular review and adjustment.",
      },
      {
        heading: "Acknowledge and close the loop",
        content:
          "When you ask members to do something, follow up to confirm it happened or thank them for their participation. Closing the loop — even with a brief post-event message — reinforces that their time and attention is valued, which drives future engagement.",
      },
    ],
    faqs: [
      {
        question: "How often should I send messages to members?",
        answer:
          "This depends on your organisation's activity level. A general rule: no more than 3–4 messages per week for active periods, and 1–2 per week during quieter times. Prioritise relevance over frequency.",
      },
      {
        question: "What's the best time of day to send to members?",
        answer:
          "For most organisations: 8–10 AM or 5–7 PM on weekdays. For volunteer/community organisations: Saturday or Sunday 9–11 AM performs well. Test different times and review delivery patterns to find your organisation's sweet spot.",
      },
      {
        question: "How do I re-engage members who have stopped opening messages?",
        answer:
          "First, audit your messaging — are you sending too frequently or irrelevantly? Then try a direct, personal-feeling message (e.g. 'We miss you — here's what's coming up'). If members have disabled push notifications, there's no way to force re-engagement; focus on delivering value that makes enabling notifications worth their while.",
      },
      {
        question: "Should I use the same message for all channels?",
        answer:
          "The core content should be consistent, but adapt the format. Push notifications should be very short (under 100 characters if possible). In-app messages can be longer. Email digests can include rich formatting and links.",
      },
    ],
  },
  {
    slug: "setting-up-browser-push-notifications-for-your-pwa",
    title: "Setting Up Browser Push Notifications for Your PWA",
    metaTitle:
      "Setting Up Browser Push Notifications for Your PWA | Org Comms",
    metaDescription:
      "A technical guide to setting up Web Push notifications in a Progressive Web App — covering VAPID keys, service workers, and subscription management.",
    intro:
      "Browser push notifications bring your PWA closer to a native app experience. This guide covers the technical setup — from generating VAPID keys to managing subscriptions in your backend.",
    category: "Technical",
    tags: ["PWA", "push notifications", "service worker", "VAPID"],
    readingTime: "8 min read",
    publishedAt: "2026-02-20",
    updatedAt: "2026-03-01",
    sections: [
      {
        heading: "What is the Web Push Protocol?",
        content:
          "The Web Push Protocol is a W3C standard that allows servers to send messages to browsers even when the user isn't actively on your site. It works via a service worker — a background script that runs in the browser — which receives push events and displays notifications. The connection between your server and the browser's push service is secured using VAPID (Voluntary Application Server Identification) keys.",
      },
      {
        heading: "Generating VAPID keys",
        content:
          "VAPID keys are a public/private key pair that identify your server to browser push services (Google, Mozilla, Apple). You only need one set per application deployment. Generate them with the web-push npm package and store them securely — the private key never leaves your server.",
        list: [
          "Run: npx web-push generate-vapid-keys",
          "Store VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY as environment variables",
          "Expose the public key to the frontend via a VITE_ prefixed env var",
          "Never expose the private key to the client",
        ],
      },
      {
        heading: "Registering a service worker",
        content:
          "Your PWA must register a service worker that listens for push events. The service worker file (typically sw.js) handles the 'push' event, parses the notification payload, and calls self.registration.showNotification(). It also handles 'notificationclick' events to open or focus the app when a notification is tapped.",
      },
      {
        heading: "Subscribing users",
        content:
          "To subscribe a user, call pushManager.subscribe() with the server's VAPID public key and the 'push' permission. This returns a PushSubscription object containing the endpoint URL and encryption keys. Store this subscription in your backend (keyed by user ID) for later use when sending messages.",
      },
      {
        heading: "Sending push notifications from the server",
        content:
          "When a broadcast message is sent, your backend retrieves all relevant PushSubscription objects and calls the Web Push API for each one. Use the web-push library to handle the encryption and HTTP request to the browser's push endpoint. If a subscription returns a 410 (Gone) status, remove it from your database — the user has revoked permission.",
      },
      {
        heading: "Handling notification preferences",
        content:
          "Store each member's notification preference alongside their push subscription: 'all' messages, 'urgent' only, or 'none'. Before sending a push notification, check the member's preference against the message's urgency flag. This respects member autonomy and reduces churn from notification fatigue.",
      },
    ],
    howTo: {
      name: "How to set up push notifications in your PWA",
      steps: [
        {
          name: "Generate VAPID keys",
          text: "Run npx web-push generate-vapid-keys and save the output. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your backend environment, and VITE_VAPID_PUBLIC_KEY in your frontend environment.",
        },
        {
          name: "Create a service worker (sw.js)",
          text: "Add push event and notificationclick event listeners. Parse the notification payload and call self.registration.showNotification() with the title and body.",
        },
        {
          name: "Register the service worker in your app",
          text: "On app load, call navigator.serviceWorker.register('/sw.js'). Wait for registration to be ready before requesting push permission.",
        },
        {
          name: "Request push permission and subscribe",
          text: "Call Notification.requestPermission(). If granted, call pushManager.subscribe() with your VAPID public key (urlBase64ToUint8Array encoded). Send the resulting PushSubscription to your backend API to save.",
        },
        {
          name: "Store the subscription in your database",
          text: "Save the subscription endpoint, p256dh key, and auth key against the user's ID. Also store their notification preference (all / urgent / none).",
        },
        {
          name: "Send push notifications on broadcast",
          text: "When a message is sent, query subscriptions for the target audience filtered by preference. Use the web-push library to send a notification to each subscription endpoint. Remove any subscriptions that return 410 Gone.",
        },
      ],
    },
    faqs: [
      {
        question: "Do push notifications work on iOS?",
        answer:
          "Yes, from iOS 16.4+, Safari supports Web Push for PWAs added to the home screen. Users must add the PWA to their home screen before push notifications are available — they do not work in the Safari browser tab on iOS.",
      },
      {
        question: "What happens when a user clears their browser data?",
        answer:
          "Clearing browser data removes the service worker and push subscription. The subscription stored in your database becomes invalid and will return a 410 error on the next send. Your backend should delete invalid subscriptions automatically when this occurs.",
      },
      {
        question: "How do I test push notifications locally?",
        answer:
          "Localhost is treated as a secure context by browsers, so push notifications work in development. Use Chrome DevTools > Application > Service Workers to inspect and test push events. The web-push CLI also supports sending test notifications.",
      },
      {
        question: "Is there a limit to how many push notifications I can send?",
        answer:
          "Browser push services (Google FCM, Mozilla Autopush, Apple APNs) don't publish hard rate limits, but excessive sending can result in throttling. For most organisations sending to hundreds or low thousands of subscribers, this is not a concern in practice.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
