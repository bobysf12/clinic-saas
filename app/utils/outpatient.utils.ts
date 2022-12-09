import { OutPatientStatus } from "./strapiApi.types";

export const OUTPATIENT_STATUS_TEXT_MAP = {
  [OutPatientStatus.IN_PROGRESS]: "Sedang di ruangan",
  [OutPatientStatus.IN_QUEUE]: "Menunggu antrian",
  [OutPatientStatus.WAITING_FOR_PAYMENT]: "Menunggu pembayaran",
};
