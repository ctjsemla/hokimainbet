export function getNextMondayReset(from = new Date()): Date {
  const target = new Date(from);
  target.setHours(0, 0, 0, 0);

  const day = target.getDay();
  let daysUntilMonday = (1 - day + 7) % 7;
  if (daysUntilMonday === 0) {
    daysUntilMonday = 7;
  }

  target.setDate(target.getDate() + daysUntilMonday);
  return target;
}
