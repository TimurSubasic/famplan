import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createHome = mutation({
  args: {
    name: v.string(),
    familyId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingHome = await ctx.db
      .query("homes")
      .withIndex("byFamilyIdAndName", (q) =>
        q.eq("familyId", args.familyId).eq("name", args.name)
      )
      .first();

    if (existingHome) {
      return {
        success: false,
        home: "existing",
      };
    }

    const homeId = await ctx.db.insert("homes", {
      name: args.name,
      familyId: args.familyId,
    });

    return {
      success: true,
      home: homeId,
    };
  },
});

export const getHomesByFamilyId = query({
  args: {
    familyId: v.string(),
  },
  handler: async (ctx, args) => {
    const homes = await ctx.db
      .query("homes")
      .withIndex("byFamilyId", (q) => q.eq("familyId", args.familyId))
      .collect();

    if (homes.length === 0) {
      return null;
    }

    return homes;
  },
});
