import mongoose, { Schema, Document, Types } from "mongoose";

export interface IContact extends Document {
  _id: Types.ObjectId; 
  phoneNumber?: string;
  email?: string;
  linkedId?: Types.ObjectId | null;
  linkPrecedence: "primary" | "secondary";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const ContactSchema: Schema = new Schema<IContact>(
  {
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    linkedId: { type: Schema.Types.ObjectId, ref: "Contact", default: null },
    linkPrecedence: { type: String, enum: ["primary", "secondary"], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { versionKey: false }
);


ContactSchema.pre<IContact>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);