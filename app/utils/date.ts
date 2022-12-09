import dateFnsFormat from "date-fns/format";

export function formatDateTime(date: number | string | Date, dateFormat: string) {
  if (typeof date === "string") {
    const dateObj = new Date(date);
    if (!(dateObj instanceof Date)) {
      throw new Error("Invalid date");
    }
    return dateFnsFormat(dateObj, dateFormat);
  }
  return dateFnsFormat(date, dateFormat);
}
