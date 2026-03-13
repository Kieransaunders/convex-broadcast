import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const DEMO_EMAIL = "demo@orgcomms.test";

export const seedDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find the demo user (must already be signed up via Better Auth)
    const demoUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", DEMO_EMAIL))
      .unique();

    if (!demoUser) {
      throw new Error(
        `Demo user ${DEMO_EMAIL} not found. Sign up first via the Better Auth endpoint.`,
      );
    }

    // Promote to super_admin
    await ctx.db.patch(demoUser._id, { role: "super_admin" });

    // --- Seed Groups ---
    const groupData = [
      { name: "All Staff", description: "Everyone in the organisation" },
      { name: "Volunteers", description: "Volunteer team members" },
      { name: "Board Members", description: "Board of directors and trustees" },
      { name: "Events Team", description: "Staff involved in event planning" },
    ];

    const groupIds: Id<"groups">[] = [];
    for (const g of groupData) {
      // Skip if group already exists
      const existing = await ctx.db
        .query("groups")
        .filter((q) => q.eq(q.field("name"), g.name))
        .unique();
      if (existing) {
        groupIds.push(existing._id);
        continue;
      }
      const id = await ctx.db.insert("groups", {
        ...g,
        active: true,
        createdBy: demoUser._id,
        createdAt: Date.now(),
      });
      groupIds.push(id);
    }

    // Add demo user to all groups
    for (const groupId of groupIds) {
      const existing = await ctx.db
        .query("groupMemberships")
        .withIndex("by_userId_groupId", (q) =>
          q.eq("userId", demoUser._id).eq("groupId", groupId),
        )
        .unique();
      if (!existing) {
        await ctx.db.insert("groupMemberships", {
          userId: demoUser._id,
          groupId,
          role: "manager",
          addedBy: demoUser._id,
          addedAt: Date.now(),
        });
      }
    }

    // --- Seed Events ---
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const eventData = [
      {
        title: "Annual Charity Gala",
        description:
          "Our flagship fundraising event with dinner, auction, and entertainment.",
        location: "Grand Ballroom, City Hotel",
        startsAt: now + 14 * DAY,
        endsAt: now + 14 * DAY + 5 * 60 * 60 * 1000,
      },
      {
        title: "Volunteer Orientation",
        description:
          "Welcome session for new volunteers covering policies and training.",
        location: "Community Centre, Room 4",
        startsAt: now + 3 * DAY,
        endsAt: now + 3 * DAY + 2 * 60 * 60 * 1000,
      },
      {
        title: "Board Meeting Q1",
        description: "Quarterly board review of financials and strategy.",
        location: "HQ Boardroom",
        startsAt: now + 7 * DAY,
        endsAt: now + 7 * DAY + 90 * 60 * 1000,
      },
    ];

    const eventIds: Id<"events">[] = [];
    for (const e of eventData) {
      const existing = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("title"), e.title))
        .unique();
      if (existing) {
        eventIds.push(existing._id);
        continue;
      }
      const id = await ctx.db.insert("events", {
        ...e,
        status: "scheduled",
        createdBy: demoUser._id,
        createdAt: Date.now(),
      });
      eventIds.push(id);
    }

    // Link events to groups
    const eventGroupPairs: [number, number][] = [
      [0, 0], // Gala -> All Staff
      [0, 3], // Gala -> Events Team
      [1, 1], // Orientation -> Volunteers
      [2, 2], // Board Meeting -> Board Members
    ];

    for (const [ei, gi] of eventGroupPairs) {
      if (!eventIds[ei] || !groupIds[gi]) continue;
      const existing = await ctx.db
        .query("eventGroupLinks")
        .withIndex("by_eventId_groupId", (q) =>
          q.eq("eventId", eventIds[ei]).eq("groupId", groupIds[gi]),
        )
        .unique();
      if (!existing) {
        await ctx.db.insert("eventGroupLinks", {
          eventId: eventIds[ei],
          groupId: groupIds[gi],
          createdAt: Date.now(),
        });
      }
    }

    // --- Seed a sample sent message ---
    const existingMsg = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("title"), "Welcome to Org Comms!"))
      .unique();

    if (!existingMsg) {
      const msgId = await ctx.db.insert("messages", {
        title: "Welcome to Org Comms!",
        body: "This is a demo message to show how broadcast notifications work. Try sending your own from the admin dashboard!",
        category: "notice",
        audienceType: "all",
        pushEnabled: false,
        status: "sent",
        sentAt: now - 60 * 60 * 1000,
        createdBy: demoUser._id,
        createdAt: now - 60 * 60 * 1000,
      });

      // Create a delivery for the demo user so it appears in their feed
      await ctx.db.insert("deliveries", {
        messageId: msgId,
        userId: demoUser._id,
        deliveredAt: now - 60 * 60 * 1000,
        pushStatus: "none",
      });
    }

    return {
      success: true,
      userId: demoUser._id,
      groups: groupIds.length,
      events: eventIds.length,
    };
  },
});
