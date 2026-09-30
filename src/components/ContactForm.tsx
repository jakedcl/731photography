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
  contactPreferenceLabel,
  validateInquiry,
  type ContactPreference,
  type InquiryFieldErrors,
} from "@/lib/inquiry";

type ContactTopic = "order" | "other";

/** Print order / general contact — used on /contact. */
export function ContactForm({
  initialTopic = "order",
}: {
  initialTopic?: ContactTopic;
}) {
  const [topic, setTopic] = useState<ContactTopic>(
    initialTopic === "other" ? "other" : "order",
  );
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
      topic,
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
        title={`Thanks — we’ll get back to you${
          contactPreference !== "email"
            ? ` by ${contactPreferenceLabel(contactPreference).toLowerCase()}`
            : ""
        }.`}
        onAgain={() => setStatus("idle")}
      />
    );
  }

  const phoneRequired =
    contactPreference === "phone" || contactPreference === "either";

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md">
      <HoneypotField />
      <fieldset>
        <legend className="text-[15px] font-medium text-stone-600">
          About
        </legend>
        <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
          {(
            [
              { value: "order", label: "A print order" },
              { value: "other", label: "Something else" },
            ] as const
          ).map((item) => {
            const active = topic === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTopic(item.value)}
                className={`text-sm tracking-tight transition ${
                  active
                    ? "text-stone-900 underline decoration-stone-900 underline-offset-8"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-12 space-y-9">
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
        <Field label="Message" required error={fieldErrors.notes}>
          <textarea
            name="notes"
            rows={4}
            placeholder={
              topic === "order"
                ? "Order number, size, shipping question…"
                : "How can we help?"
            }
            className={`${inputClass(Boolean(fieldErrors.notes))} resize-none`}
          />
        </Field>
      </div>

      {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}

      <SubmitButton loading={status === "loading"} />
    </form>
  );
}
