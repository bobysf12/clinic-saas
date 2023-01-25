import { getToken } from "~/utils/session.server";
import { patientRecordApi } from "~/utils/strapiApi.server";
import { PatientRecordPayload } from "~/utils/strapiApi.types";

async function updatePatientRecord(request: Request, patientRecordId: number, data: PatientRecordPayload) {
  const session = await getToken(request);
  return patientRecordApi.updatePatientRecord(session!, patientRecordId, data);
}

export { updatePatientRecord };
