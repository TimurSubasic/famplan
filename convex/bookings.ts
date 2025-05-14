import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBooking = mutation({
  args: {
    fromDate: v.string(),
    toDate: v.string(),
    homeId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("byHomeAndUser", (q) =>
        q.eq("homeId", args.homeId).eq("userId", args.userId)
      )
      .first();

    if (existingBooking) {
      return {
        success: false,
        message: "Booking exists",
      };
    }

    await ctx.db.insert("bookings", {
      fromDate: args.fromDate,
      toDate: args.toDate,
      homeId: args.homeId,
      userId: args.userId,
    });
  },
});

export const getBookingsByHome = query({
  args: {
    homeId: v.string(),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("byHomeId", (q) => q.eq("homeId", args.homeId))
      .collect();

    if (bookings.length === 0) {
      return null;
    }

    return bookings;
  },
});
