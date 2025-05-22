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

export const getMarkedDatesForHome = query({
  args: {
    homeId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all bookings for this home
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("byHomeId", (q) => q.eq("homeId", args.homeId))
      .collect();

    // Create an object to store all marked dates
    const markedDates: {
      [date: string]: {
        color: string;
        selected: boolean;
        startingDay: boolean;
        endingDay: boolean;
      };
    } = {};

    // For each booking, generate marked dates
    for (const booking of bookings) {
      // Get the user's color
      const user = await ctx.db
        .query("users")
        .withIndex("by_id", (q) => q.eq("_id", booking.userId as Id<"users">))
        .first();

      if (!user) continue;

      // Generate dates between fromDate and toDate
      const startDate = new Date(booking.fromDate);
      const endDate = new Date(booking.toDate);
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        markedDates[dateString] = {
          color: user.color,
          selected: true,
          startingDay: dateString === booking.fromDate,
          endingDay: dateString === booking.toDate,
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return markedDates;
  },
});
