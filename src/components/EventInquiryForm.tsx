"use client";

import { useState, type FormEvent } from "react";

import {
  Field,
  FormSuccess,
  HoneypotField,
  PreferencePicker,
  SubmitButton,
  handleInquirySubmit,
  inputClass,
} from "@/components/inquiry/formShared";
import {
  validateInquiry,
  type ContactPreference,
  type InquiryFieldErrors,
} from "@/lib/inquiry";

/** Event photography inquiry — used on /book only. */
export function EventInquiryForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<InquiryFieldErrors>({});
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>("email");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    await handleInquirySubmit({
      event,
      topic: "event",
      contactPreference,
      setStatus,
      setError,
      setFieldErrors,
      validate: validateInquiry,
      onSuccess: () => {
        setStatus("success");
        setContactPreference("email");
        setFieldErrors({});
      },
    });
  }

  if (status === "success") {
    return (
      <FormSuccess
        title="Thanks — Thomas will follow up."
        note="This is an inquiry, not a confirmed booking."
        onAgain={() => setStatus("idle")}
      />
    );
  }

  const phoneRequired =
    contactPreference === "phone" || contactPreference === "either";

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md">
      <HoneypotField />
      <div className="space-y-9">
        <Field label="Name" required error={fieldErrors.name}>
          <input
            name="name"
            autoComplete="name"
            className={inputClass(Boolean(fieldErrors.name))}
          />
        </Field>
        <Field label="Email" required error={fieldErrors.email}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass(Boolean(fieldErrors.email))}
          />
        </Field>
        <Field
          label="Phone"
          required={phoneRequired}
          error={fieldErrors.phone}
        >
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass(Boolean(fieldErrors.phone))}
          />
        </Field>
        <Field label="Date" required error={fieldErrors.eventDate}>
          <input
            name="eventDate"
            type="date"
            className={inputClass(Boolean(fieldErrors.eventDate))}
          />
        </Field>
        <Field label="Event type" required error={fieldErrors.eventType}>
          <input
            name="eventType"
            placeholder="Wedding, family, corporate…"
            className={inputClass(Boolean(fieldErrors.eventType))}
          />
        </Field>
        <Field label="Location" required error={fieldErrors.location}>
          <input
            name="location"
            placeholder="City or venue"
            autoComplete="address-level2"
            className={inputClass(Boolean(fieldErrors.location))}
          />
        </Field>
      </div>

      <div className="mt-10">
        <PreferencePicker
          value={contactPreference}
          onChange={(next) => {
            setContactPreference(next);
            setFieldErrors((prev) => ({ ...prev, phone: undefined }));
          }}
        />
      </div>

      <div className="mt-10">
        <Field label="Notes" error={fieldErrors.notes}>
          <textarea
            name="notes"
            rows={4}
            placeholder="Timing, guest count, anything useful."
            className={`${inputClass(Boolean(fieldErrors.notes))} resize-none`}
          />
        </Field>
      </div>

      {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}

      <SubmitButton
        loading={status === "loading"}
        hint="Inquiry only — not a booking."
      />
    </form>
  );
}
