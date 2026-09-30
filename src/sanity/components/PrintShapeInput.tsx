"use client";

import { useEffect, useRef, useState } from "react";
import { set, useClient, useFormValue, type StringInputProps } from "sanity";
import { Stack, Text } from "@sanity/ui";

import { inferPrintShape } from "@/lib/printCatalog";

type ImageField = {
  asset?: { _ref?: string; _id?: string };
};

type Dims = { width?: number; height?: number };

async function fetchDimensions(
  client: ReturnType<typeof useClient>,
  assetId: string,
  attempts = 8,
): Promise<Dims | null> {
  for (let i = 0; i < attempts; i++) {
    const dims = await client.fetch<Dims | null>(
      `*[_id == $id][0].metadata.dimensions{width,height}`,
      { id: assetId },
    );
    if (dims?.width && dims?.height) return dims;
    // Fresh uploads sometimes need a beat before metadata exists
    await new Promise((r) => setTimeout(r, 400 + i * 200));
  }
  return null;
}

/**
 * Default radio input + auto-fill from the uploaded image’s pixel ratio.
 * - New upload / empty shape → set portrait | landscape | panoramic
 * - Replace image → re-detect
 * - Manual radio change is kept until the image changes again
 */
export function PrintShapeInput(props: StringInputProps) {
  const { value, onChange, renderDefault } = props;
  const image = useFormValue(["image"]) as ImageField | undefined;
  const assetId = image?.asset?._ref || image?.asset?._id;
  const client = useClient({ apiVersion: "2025-02-19" });
  const seenAsset = useRef<string | null | undefined>(undefined);
  const [hintForAsset, setHintForAsset] = useState<{
    assetId: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!assetId) {
      seenAsset.current = null;
      return;
    }

    const isFirstLook = seenAsset.current === undefined;
    const assetChanged = seenAsset.current !== assetId;

    if (isFirstLook) {
      seenAsset.current = assetId;
      // Opening an existing doc: keep a manual choice; only fill if blank.
      if (value) return;
    } else if (!assetChanged) {
      return;
    } else {
      seenAsset.current = assetId;
    }

    let cancelled = false;

    fetchDimensions(client, assetId)
      .then((dims) => {
        if (cancelled || !dims?.width || !dims?.height) return;
        const shape = inferPrintShape(dims.width, dims.height);
        const ratio = (dims.width / dims.height).toFixed(2);
        setHintForAsset({
          assetId,
          text: `From image ${Math.round(dims.width)}×${Math.round(dims.height)} (${ratio}:1) → ${shape}`,
        });
        if (shape !== value) {
          onChange(set(shape));
        }
      })
      .catch(() => {
        /* ignore — Thomas can still pick manually */
      });

    return () => {
      cancelled = true;
    };
    // Asset-driven only: a manual radio tweak must not re-run detection.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [assetId, client, onChange]);

  const hint =
    assetId && hintForAsset?.assetId === assetId ? hintForAsset.text : null;

  return (
    <Stack space={3}>
      {renderDefault(props)}
      {hint ? (
        <Text size={1} muted>
          {hint}
        </Text>
      ) : null}
    </Stack>
  );
}
