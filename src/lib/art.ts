import type { ArtKind } from "./types";

/** Room-context illustrations only make sense for floor-standing / wall-sized products. */
export function supportsRoomView(kind: ArtKind, variant = 0): boolean {
  if (kind === "stairs") return variant === 0 || variant === 6;
  if (kind === "vinyl") return variant !== 7;
  if (kind === "wpc-panel") return variant !== 3;
  return ["door", "vanity", "shower-base", "shower-door"].includes(kind) && !(kind === "vanity" && variant === 4);
}
