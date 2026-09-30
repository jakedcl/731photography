"use client";

import type { FormEvent, ReactNode } from "react";

import {
  normalizeInquiryFields,
  type ContactPreference,
  type InquiryFieldErrors,
  type InquiryFields,
  type InquiryTopic,
} from "@/lib/inquiry";

export type FormStatus = "idle" | "loading" | "success" | "error";

const inputBase =
  "w-full border-0 border-b bg-transparent px-0 py-3 text-[16px] text-stone-900 outline-none transition placeholder:text-stone-400 [color-scheme:light]";

export function inputClass(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? "border-red-600 focus:border-red-700"
      : "border-stone-300 focus:border-stone-900"
  }`;
}

export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span
        className={`mb-1 block text-[15px] font-medium ${
          error ? "text-red-700" : "text-stone-600"
        }`}
      >
        {label}
      </span>
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-red-700">{error}</p>
      ) : required ? (
        <p className="mt-1.5 text-[13px] text-stone-400">Required</p>
      ) : null}
    </label>
  );
}

export function PreferencePicker({
  value,
  onChange,
}: {
  value: ContactPreference;
  onChange: (next: ContactPreference) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[15px] font-medium text-stone-600">
        Follow up by
      </legend>
      <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
        {(
          [
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "either", label: "Either" },
          ] as const
        ).map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
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
  );
}

export function FormSuccess({
  title,
  note,
  onAgain,
}: {
  title: string;
  note?: string;
  onAgain: () => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
        Sent
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
        {title}
      </p>
      {note ? <p className="mt-3 text-stone-600">{note}</p> : null}
      <button
        type="button"
        className="mt-8 text-sm text-stone-700 underline underline-offset-4 hover:text-stone-950"
        onClick={onAgain}
      >
        Send another
      </button>
    </div>
  );
}

export function SubmitButton({
  loading,
  hint,
}: {
  loading: boolean;
  hint?: string;
}) {
  return (
    <div className="mt-12">
      <button
        type="submit"
        disabled={loading}
        className="bg-stone-900 px-10 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-stone-700 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send"}
      </button>
      {hint ? (
        <p className="mt-5 text-sm text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}

export async function sendInquiry(
  topic: InquiryTopic,
  fields: InquiryFields,
): Promise<{ error?: string; fields?: InquiryFieldErrors }> {
  const res = await fetch("/api/event-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, ...fields }),
  });

  const payload = (await res.json().catch(() => null)) as {
    error?: string;
    fields?: InquiryFieldErrors;
  } | null;

  if (!res.ok) {
    return {
      error: payload?.error || "Something went wrong. Try again.",
      fields: payload?.fields,
    };
  }

  return {};
}

export function fieldsFromForm(
  form: HTMLFormElement,
  contactPreference: ContactPreference,
) {
  const data = new FormData(form);
  return {
    ...normalizeInquiryFields({
      name: data.get("name") as string,
      email: data.get("email") as string,
      phone: data.get("phone") as string,
      eventDate: data.get("eventDate") as string,
      location: data.get("location") as string,
      eventType: data.get("eventType") as string,
      notes: data.get("notes") as string,
      contactPreference,
    }),
    _hp: (data.get("website") as string) ?? "",
  };
}

/** Hidden honeypot field — bots fill it, humans never see it. */
export function HoneypotField() {
  return (
    <input
      name="website"
      type="text"
      autoComplete="off"
      tabIndex={-1}
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
    />
  );
}

export function applyInquiryResult(args: {
  result: { error?: string; fields?: InquiryFieldErrors };
  setFieldErrors: (errors: InquiryFieldErrors) => void;
  setError: (error: string | null) => void;
  setStatus: (status: FormStatus) => void;
}): boolean {
  const { result, setFieldErrors, setError, setStatus } = args;
  if (!result.error) return false;

  setStatus("error");
  setFieldErrors(result.fields || {});
  setError(
    result.fields && Object.keys(result.fields).length ? null : result.error,
  );
  return true;
}

export async function handleInquirySubmit(args: {
  event: FormEvent<HTMLFormElement>;
  topic: InquiryTopic;
  contactPreference: ContactPreference;
  setStatus: (status: FormStatus) => void;
  setError: (error: string | null) => void;
  setFieldErrors: (
    errors: InquiryFieldErrors | ((prev: InquiryFieldErrors) => InquiryFieldErrors),
  ) => void;
  onSuccess: () => void;
  validate: (
    topic: InquiryTopic,
    fields: InquiryFields,
  ) => InquiryFieldErrors;
}) {
  const {
    event,
    topic,
    contactPreference,
    setStatus,
    setError,
    setFieldErrors,
    onSuccess,
    validate,
  } = args;

  event.preventDefault();
  setStatus("loading");
  setError(null);

  const form = event.currentTarget;
  const fields = fieldsFromForm(form, contactPreference);
  const localErrors = validate(topic, fields);

  if (Object.keys(localErrors).length) {
    setFieldErrors(localErrors);
    setStatus("error");
    setError(null);
    return;
  }

  setFieldErrors({});

  const result = await sendInquiry(topic, fields);
  if (
    applyInquiryResult({
      result,
      setFieldErrors,
      setError,
      setStatus,
    })
  ) {
    return;
  }

  form.reset();
  onSuccess();
}
