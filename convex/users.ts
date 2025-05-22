import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// Create a new task with the given text
export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    color: v.string(),
    familyId: v.optional(v.string()),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // User already exists, return early
      return;
    }

    await ctx.db.insert("users", {
      username: args.username,
      email: args.email,
      color: args.color,
      familyId: args.familyId,
      clerkId: args.clerkId,
    });
  },
});

export const getUserByClerk = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return user;
    }

    return user;
  },
});

export const getUsersByFamily = query({
  args: {
    familyId: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("byFamilyId", (q) => q.eq("familyId", args.familyId))
      .collect();

    if (users.length === 0) {
      return null;
    }

    return users;
  },
});

export const changeUsername = mutation({
  args: {
    id: v.id("users"),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      username: args.username,
    });
  },
});

export const changeColor = mutation({
  args: {
    id: v.id("users"),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      color: args.color,
    });
  },
});

export const leaveFamily = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the user document
    const user = await ctx.db.get(args.id);
    if (!user || !user.familyId) {
      return {
        success: false,
        message: "User not found or not in a family",
      };
    }
    const familyId = user.familyId;

    // Check if there are any other users in the same family
    const otherUsers = await ctx.db
      .query("users")
      .withIndex("byFamilyId", (q) => q.eq("familyId", familyId))
      .collect();

    // Remove the current user from the list
    const remainingUsers = otherUsers.filter((u) => u._id !== args.id);

    if (remainingUsers.length === 0) {
      // This is the last user in the family

      // Delete the family
      const family = await ctx.db
        .query("families")
        .withIndex("by_id", (q) => q.eq("_id", user.familyId as Id<"families">))
        .unique();
      if (family) {
        await ctx.db.delete(family._id);
      }

      // Delete all homes tied to this family
      const homes = await ctx.db
        .query("homes")
        .withIndex("byFamilyId", (q) => q.eq("familyId", familyId))
        .collect();
      for (const home of homes) {
        const bookings = await ctx.db
          .query("bookings")
          .withIndex("byHomeId", (q) => q.eq("homeId", home._id))
          .collect();

        for (const booking of bookings) {
          await ctx.db.delete(booking._id);
        }

        await ctx.db.delete(home._id);
      }

      // Optionally, you could also delete bookings for these homes if needed

      // Remove the familyId from the user
      await ctx.db.patch(args.id, { familyId: undefined });
    } else {
      // Not the last user, just remove familyId and their bookings

      // Remove the familyId from the user
      await ctx.db.patch(args.id, { familyId: undefined });

      // Remove all bookings for this user
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("byUserId", (q) => q.eq("userId", args.id))
        .collect();
      for (const booking of bookings) {
        await ctx.db.delete(booking._id);
      }
    }
  },
});

export const changeFamilyId = mutation({
  args: {
    userId: v.id("users"),
    familyId: v.id("families"),
  },
  handler: async (ctx, args) => {
    const { userId, familyId } = args;
    const user = await ctx.db.get(userId);

    if (!user) {
      return {
        success: false,
        message: "No user found",
      };
    }

    await ctx.db.patch(user._id, {
      familyId: familyId,
    });
  },
});
