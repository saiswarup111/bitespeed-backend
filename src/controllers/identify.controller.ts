import { Request, Response } from "express";
import { Contact, IContact } from "../models/contact.model";
import { Types } from "mongoose";

interface IdentifyRequestBody {
  email?: string;
  phoneNumber?: string;
}

export const identifyContact = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body as IdentifyRequestBody;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "At least one of email or phoneNumber is required." });
    }

    
    let initialContacts: IContact[] = await Contact.find({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : [])
      ]
    });

    
    if (initialContacts.length === 0) {
      const newContact = await Contact.create({
        email: email ?? undefined,
        phoneNumber: phoneNumber ?? undefined,
        linkPrecedence: "primary"
      });

      return res.json({
        contact: {
          primaryContatctId: newContact._id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: []
        }
      });
    }

    
    let contactIds = initialContacts.map(c => c._id);
    let linkedIds = initialContacts.map(c => c.linkedId).filter(Boolean) as Types.ObjectId[];

    
    let allContactsSet = new Set<string>(contactIds.map(String));
    let queue = [...linkedIds];

    while (queue.length > 0) {
      const id = queue.pop()!;
      if (allContactsSet.has(String(id))) continue;
      const contact = await Contact.findById(id);
      if (contact) {
        allContactsSet.add(String(contact._id));
        if (contact.linkedId) queue.push(contact.linkedId);
      }
    }

    
    const allContacts = await Contact.find({
      $or: [
        { _id: { $in: Array.from(allContactsSet) } },
        { linkedId: { $in: Array.from(allContactsSet) } }
      ]
    });

    
    let primaryContact = allContacts
      .filter(c => c.linkPrecedence === "primary")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

    
    for (const c of allContacts) {
      if (
        c.linkPrecedence === "primary" &&
        String(c._id) !== String(primaryContact._id)
      ) {
        c.linkPrecedence = "secondary";
        c.linkedId = primaryContact._id;
        await c.save();
      }
    }

    
    const emailExists = email && allContacts.some(c => c.email === email);
    const phoneExists = phoneNumber && allContacts.some(c => c.phoneNumber === phoneNumber);

    let newSecondaryContact: IContact | null = null;
    if (!emailExists || !phoneExists) {

      newSecondaryContact = await Contact.create({
        email: email ?? undefined,
        phoneNumber: phoneNumber ?? undefined,
        linkPrecedence: "secondary",
        linkedId: primaryContact._id
      });
      allContacts.push(newSecondaryContact);
    }

    
    const emailsSet = new Set<string>();
    const phoneNumbersSet = new Set<string>();
    const secondaryContactIds: string[] = [];

    
    if (primaryContact.email) emailsSet.add(primaryContact.email);
    if (primaryContact.phoneNumber) phoneNumbersSet.add(primaryContact.phoneNumber);

    for (const c of allContacts) {
      if (String(c._id) === String(primaryContact._id)) continue;
      if (c.email) emailsSet.add(c.email);
      if (c.phoneNumber) phoneNumbersSet.add(c.phoneNumber);
      if (c.linkPrecedence === "secondary") secondaryContactIds.push(c._id.toString());
    }

    return res.json({
      contact: {
        primaryContatctId: primaryContact._id,
        emails: Array.from(emailsSet),
        phoneNumbers: Array.from(phoneNumbersSet),
        secondaryContactIds
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
