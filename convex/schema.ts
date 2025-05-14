import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    color: v.string(),
    familyId: v.optional(v.string()),
    clerkId: v.string(),
  })
    .index("byClerkId", ["clerkId"])
    .index("byFamilyId", ["familyId"]),

  families: defineTable({
    name: v.string(),
    joinCode: v.string(),
  }).index("byJoinCode", ["joinCode"]),

  homes: defineTable({
    name: v.string(),
    familyId: v.string(),
  })
    .index("byFamilyId", ["familyId"])
    .index("byFamilyIdAndName", ["familyId", "name"]),

  bookings: defineTable({
    fromDate: v.string(),
    toDate: v.string(),
    homeId: v.string(),
    userId: v.string(),
  })
    .index("byHomeAndUser", ["homeId", "userId"])
    .index("byUserId", ["userId"])
    .index("byHomeId", ["homeId"]),
});
