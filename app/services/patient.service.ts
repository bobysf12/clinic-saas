import { outpatientApi, patientApi } from "~/utils/strapiApi.server";

export async function getPatientById(token: string, patientId: number) {
  return patientApi.getPatient(token, patientId);
}

export async function getPatientOutpatientRecords(token: string, patientId: number) {
  return outpatientApi.getOutpatients(token, {
    populate: {
      doctor: "*",
      polyclinic: "*",
    },
    filters: {
      patient: {
        id: patientId,
      },
    },
    sort: ["appointment_date:desc"],
  });
}
