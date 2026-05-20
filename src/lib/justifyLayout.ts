export type Sized = { width: number; height: number };

export type LaidOutItem<T> = {
  item: T;
  width: number;
  height: number;
};

export type LaidOutRow<T> = LaidOutItem<T>[];

/**
 * Justified-gallery layout. Items keep natural aspect ratios; each filled
 * row's total width matches `containerWidth - gaps`. The trailing partial
 * row is rendered at target height with a soft growth cap.
 */
export const justifyLayout = <T extends Sized>(
  items: T[],
  containerWidth: number,
  targetRowHeight: number,
  gap: number,
  trailingGrowCap = 1.3
): LaidOutRow<T>[] => {
  if (containerWidth <= 0 || items.length === 0) return [];

  const rows: LaidOutRow<T>[] = [];
  let buf: { item: T; ratio: number }[] = [];

  const flush = (isLast: boolean) => {
    if (buf.length === 0) return;
    const usable = containerWidth - gap * (buf.length - 1);
    const sumRatios = buf.reduce((s, b) => s + b.ratio, 0);
    const naturalWidth = sumRatios * targetRowHeight;
    let scaledHeight: number;
    if (isLast) {
      scaledHeight = Math.min(
        targetRowHeight * trailingGrowCap,
        (usable / naturalWidth) * targetRowHeight
      );
    } else {
      scaledHeight = (usable / naturalWidth) * targetRowHeight;
    }
    rows.push(
      buf.map(({ item, ratio }) => ({
        item,
        width: ratio * scaledHeight,
        height: scaledHeight,
      }))
    );
    buf = [];
  };

  for (const item of items) {
    const ratio = item.width / item.height;
    buf.push({ item, ratio });
    const sumRatios = buf.reduce((s, b) => s + b.ratio, 0);
    const naturalWidth = sumRatios * targetRowHeight;
    const usable = containerWidth - gap * (buf.length - 1);
    if (naturalWidth >= usable) flush(false);
  }
  flush(true);

  return rows;
};
