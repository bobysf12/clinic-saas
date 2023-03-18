import intervalToDuration from "date-fns/intervalToDuration";
import differenceInYears from "date-fns/differenceInYears";
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

export function getAge(date: number | string | Date): number {
  const dateObj = new Date(date);
  if (!(dateObj instanceof Date)) {
    throw new Error("Invalid date");
  }

  return differenceInYears(new Date(), dateObj);
}

export function getFullAge(date: number | string | Date) {
  const dateObj = validateDate(date);
  return intervalToDuration({ start: dateObj, end: new Date() });
}

function validateDate(date: number | string | Date) {
  const dateObj = new Date(date);
  if (!(dateObj instanceof Date)) {
    throw new Error("Invalid date");
  }
  return dateObj;
}
