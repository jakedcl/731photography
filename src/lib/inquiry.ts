export type InquiryTopic = "event" | "order" | "other";

export type ContactPreference = "email" | "phone" | "either";

export type InquiryFields = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  location: string;
  eventType: string;
  notes: string;
  contactPreference: ContactPreference;
};

export type InquiryFieldErrors = Partial<
  Record<keyof InquiryFields, string>
>;

export function parseInquiryTopic(value?: string | string[]): InquiryTopic {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "order" || raw === "other" || raw === "event") return raw;
  return "event";
}

export function parseContactPreference(
  value?: string | null,
): ContactPreference {
  if (value === "phone" || value === "either" || value === "email") return value;
  return "email";
}

export function contactPreferenceLabel(value: ContactPreference): string {
  if (value === "phone") return "Phone";
  if (value === "either") return "Either email or phone";
  return "Email";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function digitCount(value: string) {
  return (value.match(/\d/g) || []).length;
}

function isPhoneShape(value: string) {
  // Digits + common phone punctuation only
  return /^[\d\s+().\-]+$/.test(value) && digitCount(value) >= 7;
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function maxEventDateISO() {
  const now = new Date();
  now.setFullYear(now.getFullYear() + 2);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function normalizeInquiryFields(input: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  eventDate?: string | null;
  location?: string | null;
  eventType?: string | null;
  notes?: string | null;
  contactPreference?: string | null;
}): InquiryFields {
  return {
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
    eventDate: String(input.eventDate || "").trim(),
    location: String(input.location || "").trim(),
    eventType: String(input.eventType || "").trim(),
    notes: String(input.notes || "").trim(),
    contactPreference: parseContactPreference(input.contactPreference),
  };
}

/** Shared client + server validation. Returns field errors; empty = valid. */
export function validateInquiry(
  topic: InquiryTopic,
  fields: InquiryFields,
): InquiryFieldErrors {
  const errors: InquiryFieldErrors = {};

  if (fields.name.length < 2) {
    errors.name = "Enter your full name.";
  } else if (fields.name.length > 80) {
    errors.name = "Name is too long.";
  }

  if (!fields.email) {
    errors.email = "Enter your email.";
  } else if (!EMAIL_RE.test(fields.email) || fields.email.length > 120) {
    errors.email = "Enter a valid email (like name@example.com).";
  }

  const phoneRequired =
    fields.contactPreference === "phone" ||
    fields.contactPreference === "either";

  if (phoneRequired && !fields.phone) {
    errors.phone =
      fields.contactPreference === "phone"
        ? "Add a phone number for follow-up."
        : "Add a phone number, or switch preference to email.";
  } else if (fields.phone && !isPhoneShape(fields.phone)) {
    errors.phone = "Enter a real phone number.";
  } else if (fields.phone.length > 40) {
    errors.phone = "Phone number is too long.";
  }

  if (topic === "event") {
    if (!fields.eventDate) {
      errors.eventDate = "Choose an event date.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.eventDate)) {
      errors.eventDate = "Choose a valid date.";
    } else if (fields.eventDate < todayISO()) {
      errors.eventDate = "Pick today or a future date.";
    } else if (fields.eventDate > maxEventDateISO()) {
      errors.eventDate = "Pick a date within the next 2 years.";
    }

    if (fields.eventType.length < 2) {
      errors.eventType = "Tell us the type of event.";
    } else if (fields.eventType.length > 80) {
      errors.eventType = "Event type is too long.";
    }

    if (fields.location.length < 2) {
      errors.location = "Enter a city or venue.";
    } else if (fields.location.length > 120) {
      errors.location = "Location is too long.";
    }

    if (fields.notes.length > 2000) {
      errors.notes = "Notes are too long.";
    }
  } else {
    if (fields.notes.length < 5) {
      errors.notes = "Write a short message.";
    } else if (fields.notes.length > 2000) {
      errors.notes = "Message is too long.";
    }
  }

  return errors;
}

export function firstInquiryError(errors: InquiryFieldErrors): string | null {
  const first = Object.values(errors).find(Boolean);
  return first || null;
}
