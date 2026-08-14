export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
export function date(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
/** Split an ISO date (or "Mon D" label) into { day, month } for the date-block. */
export function dateParts(value: string) {
  const d = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  return {
    day: d.getDate(),
    month: d.toLocaleString("en-US", { month: "short" }),
  };
}
export function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

