import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateJoinCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createFamily = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    let joinCode;
    let existing;

    // Correct approach
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }
    const subject = identity.subject; // Now works correctly
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", subject))
      .unique();

    if (!user) {
      return {
        success: false,
        message: "No user",
      };
    }

    // Try max 10 times to find a unique code
    for (let i = 0; i < 10; i++) {
      const code = generateJoinCode().toUpperCase();
      existing = await ctx.db
        .query("families")
        .filter((q) => q.eq(q.field("joinCode"), code))
        .first();

      if (!existing) {
        joinCode = code;
        break;
      }
    }

    if (!joinCode) {
      return {
        success: false,
        message: "Join code failed to generate",
      };
    }

    //generate family
    const familyId = await ctx.db.insert("families", {
      name: args.name,
      joinCode,
    });

    await ctx.db.patch(user._id, {
      familyId: familyId,
    });
  },
});

export const getFamilyByCode = query({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const family = await ctx.db
      .query("families")
      .withIndex("byJoinCode", (q) =>
        q.eq("joinCode", args.joinCode.toUpperCase())
      )
      .first();

    // if (!family) {
    //   throw new Error("No family found");
    // }

    return family || null;
  },
});

export const getFamilyById = query({
  args: {
    id: v.id("families"),
  },
  handler: async (ctx, args) => {
    const family = await ctx.db.get(args.id);

    if (!family) {
      return family;
    }

    return family;
  },
});
