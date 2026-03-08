import mongoose, { Schema, Document, Model, Types } from "mongoose";
import Event from "./event.model";

/**
 * TypeScript interface for Booking document.
 * Extends Mongoose Document to include _id, timestamps, etc.
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook to validate that the referenced event exists in the database.
 * Throws an error if the event does not exist, preventing orphaned bookings.
 */
bookingSchema.pre("save", async function (next) {
  // Only validate eventId if it's new or modified
  if (this.isModified("eventId")) {
    try {
      const eventExists = await Event.findById(this.eventId);
      if (!eventExists) {
        return next(
          new Error(
            `Event with ID ${this.eventId} does not exist. Cannot create booking.`
          )
        );
      }
    } catch (error) {
      return next(
        new Error(`Failed to validate event existence: ${error}`)
      );
    }
  }

  next();
});

// Create index on eventId for faster queries when fetching bookings by event
bookingSchema.index({ eventId: 1 });

/**
 * Export Booking model.
 * Checks if the model already exists to prevent OverwriteModelError in development.
 */
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
