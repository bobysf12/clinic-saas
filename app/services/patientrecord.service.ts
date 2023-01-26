import { patientRecordApi } from "~/utils/strapiApi.server";
import { PatientRecordPayload } from "~/utils/strapiApi.types";

async function updatePatientRecord(token: string, patientRecordId: number, data: PatientRecordPayload) {
  return patientRecordApi.updatePatientRecord(token, patientRecordId, data);
}

export { updatePatientRecord };
