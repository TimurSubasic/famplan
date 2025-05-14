import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
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

    return {
      success: true,
      message: "Booking created",
    };
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

export const getBookingsByHomeAndUser = query({
  args: {
    homeId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("byHomeAndUser", (q) =>
        q.eq("homeId", args.homeId).eq("userId", args.userId)
      )
      .first();

    if (booking) {
      return booking;
    }
  },
});

export const deleteBooking = mutation({
  args: {
    id: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const deleted = await ctx.db.delete(args.id);

    return deleted;
  },
});

export const getBookingsWithUserInfo = query({
  args: {
    homeId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all bookings for this home
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("byHomeId", (q) => q.eq("homeId", args.homeId))
      .collect();

    // For each booking, fetch the associated user and combine the data
    const bookingsWithUserInfo = await Promise.all(
      bookings.map(async (booking) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("_id", booking.userId as Id<"users">))
          .first();

        return {
          fromDate: booking.fromDate,
          toDate: booking.toDate,
          name: user?.username,
          color: user?.color,
        };
      })
    );

    return bookingsWithUserInfo;
  },
});
