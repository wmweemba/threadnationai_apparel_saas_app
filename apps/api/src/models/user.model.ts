import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  credits: number;
  dpaConsentSigned: boolean;
  dpaConsentDate?: Date;
  rejectionsThisHour: number;
  rejectionsWindowStart?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    credits: {
      type: Number,
      default: 3,
      min: 0,
    },
    dpaConsentSigned: {
      type: Boolean,
      default: false,
    },
    dpaConsentDate: {
      type: Date,
    },
    rejectionsThisHour: {
      type: Number,
      default: 0,
    },
    rejectionsWindowStart: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.index({ clerkId: 1, email: 1 });

export const User =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
