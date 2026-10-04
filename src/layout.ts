/**
 * layout.ts — v3.0 A5: when the card is wide enough for two columns.
 *
 * With hysteresis: the map column changes the card's height, which can
 * bring a scrollbar and change the width by its few pixels — without a band
 * the layout would flip back and forth at the threshold.
 */
export const WIDE_PX = 700;
const BAND_PX = 24;

export function isWideCard(widthPx: number, currentlyWide: boolean): boolean {
  return currentlyWide ? widthPx >= WIDE_PX - BAND_PX : widthPx >= WIDE_PX;
}
