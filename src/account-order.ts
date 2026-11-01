/**
 * Sorts accounts into the user's saved order. Accounts the order has never
 * seen (newly added ones) keep their configured order, after the known ones.
 */
export function applyAccountOrder<T extends { id: string }>(accounts: readonly T[], order: readonly string[]): T[] {
  const rank = new Map(order.map((id, index) => [id, index]));

  return accounts
    .map((account, index) => ({ account, index }))
    .sort((a, b) => {
      const rankA = rank.get(a.account.id) ?? Infinity;
      const rankB = rank.get(b.account.id) ?? Infinity;

      return rankA === rankB ? a.index - b.index : rankA - rankB;
    })
    .map(({ account }) => account);
}

/**
 * Moves one account a step up (-1) or down (+1) within the displayed order and
 * returns the new order to save. Moving past either end is a no-op.
 */
export function moveAccount(displayedIds: readonly string[], id: string, offset: -1 | 1): string[] {
  const ids = [...displayedIds];
  const from = ids.indexOf(id);
  const to = from + offset;

  if (from === -1 || to < 0 || to >= ids.length) {
    return ids;
  }

  [ids[from], ids[to]] = [ids[to], ids[from]];
  return ids;
}
