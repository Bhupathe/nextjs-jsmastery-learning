import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * TypeScript interface for Event document.
 * Extends Mongoose Document to include _id, timestamps, etc.
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO format: YYYY-MM-DD
  time: string; // Format: HH:MM AM/PM
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook to auto-generate slug from title and normalize date/time.
 * - Slug is only regenerated if the title has been modified.
 * - Date is validated and normalized to ISO format (YYYY-MM-DD).
 * - Time is validated and normalized to consistent format (HH:MM AM/PM).
 */
eventSchema.pre("save", function (next) {
  // Generate slug only if title is new or modified
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  }

  // Normalize and validate date (ensure ISO format: YYYY-MM-DD)
  if (this.isModified("date")) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.date)) {
      return next(new Error("Date must be in ISO format (YYYY-MM-DD)"));
    }

    // Validate that the date is a valid calendar date
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      return next(new Error("Invalid date provided"));
    }
  }

  // Normalize and validate time (ensure format: HH:MM AM/PM)
  if (this.isModified("time")) {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!timeRegex.test(this.time)) {
      return next(
        new Error("Time must be in format HH:MM AM/PM (e.g., 09:00 AM)")
      );
    }

    // Normalize time format to consistent casing
    this.time = this.time.replace(/\s?(am|pm)$/i, (match) =>
      match.trim().toUpperCase()
    );
  }

  next();
});

// Create unique index on slug for efficient lookups and prevent duplicates
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Export Event model.
 * Checks if the model already exists to prevent OverwriteModelError in development.
 */
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
