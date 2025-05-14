import { v } from "convex/values";
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
      throw new Error("User not found");
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

export const changeFamilyId = mutation({
  args: {
    id: v.id("users"),
    familyId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      familyId: args.familyId,
    });
  },
});

export const leaveFamily = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      familyId: undefined,
    });
  },
});
