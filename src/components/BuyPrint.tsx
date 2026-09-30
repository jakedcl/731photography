"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getPrintFinish, PRINT_FINISHES } from "@/lib/printCatalog";
import { formatPrice, type PrintSize } from "@/sanity/lib/types";

type Props = {
  slug: string;
  sizes: PrintSize[];
  canceled?: boolean;
  /** Controlled size — keeps the print preview in sync. */
  sizeSku?: string;
  onSizeChange?: (sku: string) => void;
};

export function BuyPrint({
  slug,
  sizes,
  canceled,
  sizeSku: sizeSkuProp,
  onSizeChange,
}: Props) {
  const activeSizes = useMemo(
    () => sizes.filter((size) => size.sku && typeof size.priceCents === "number"),
    [sizes],
  );

  const [internalSku, setInternalSku] = useState(activeSizes[0]?.sku || "");
  const selectedSku = sizeSkuProp ?? internalSku;
  const setSelectedSku = onSizeChange ?? setInternalSku;
  const [finishSku, setFinishSku] = useState(PRINT_FINISHES[0]?.sku || "matte");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const selected = activeSizes.find((size) => size.sku === selectedSku);
  const finish = getPrintFinish(finishSku);

  async function startCheckout() {
    if (!selectedSku) return;
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, sizeSku: selectedSku, finishSku }),
      });

      const payload = (await res.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (!res.ok || !payload?.url) {
        throw new Error(payload?.error || "Could not start checkout.");
      }

      window.location.href = payload.url;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    }
  }

  if (!activeSizes.length) {
    return (
      <p className="mt-10 text-stone-600">
        Print sizes aren’t available for this photo right now.
      </p>
    );
  }

  return (
    <div className="mt-10">
      <OptionGroup
        legend="Size"
        options={activeSizes.map((size) => ({
          id: size.sku || size._key,
          label: size.label || size.sku || "Size",
          detail: formatPrice(size.priceCents),
        }))}
        value={selectedSku}
        onChange={setSelectedSku}
      />

      <div className="mt-8">
        <OptionGroup
          legend="Finish"
          options={PRINT_FINISHES.map((item) => ({
            id: item.sku,
            label: item.label,
          }))}
          value={finishSku}
          onChange={setFinishSku}
        />
        <p className="mt-3 text-sm text-stone-500">{finish.description}</p>
      </div>

      {canceled ? (
        <p className="mt-4 text-sm text-stone-600">
          Checkout canceled — pick a size when you’re ready.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={startCheckout}
          disabled={status === "loading" || !selectedSku}
          className="bg-stone-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
        >
          {status === "loading"
            ? "Redirecting…"
            : selected
              ? `Checkout · ${formatPrice(selected.priceCents)}`
              : "Checkout"}
        </button>
      </div>

      <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-500">
        Unframed. Made to order, ships in the US. The preview shows the crop for
        your selected size.{" "}
        <Link href="/shipping" className="underline underline-offset-4">
          Shipping
        </Link>
      </p>
    </div>
  );
}

function OptionGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { id: string; label: string; detail?: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
        {legend}
      </p>
      <div
        role="radiogroup"
        aria-label={legend}
        className="mt-3 border-t border-stone-200"
      >
        {options.map((option) => {
          const checked = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(option.id)}
              className={`flex w-full items-baseline justify-between border-b py-3.5 text-left text-[15px] transition ${
                checked
                  ? "border-stone-900 text-stone-900"
                  : "border-stone-200 text-stone-400 hover:text-stone-700"
              }`}
            >
              <span className={checked ? "font-medium" : undefined}>
                {option.label}
              </span>
              {option.detail ? (
                <span className="tabular-nums">{option.detail}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
