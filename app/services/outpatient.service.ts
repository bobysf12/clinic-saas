import { getOrgId, getToken } from "~/utils/session.server";
import {
  AddPatientRecordDrugPayload,
  getOrganizationFilter,
  outpatientApi,
  patientRecordApi,
  UpdatePatientRecordDrugPayload,
} from "~/utils/strapiApi.server";
import { OutPatientStatus } from "~/utils/strapiApi.types";

const OUTPATIENT_STATUS_TEXT_MAP = {
  [OutPatientStatus.IN_PROGRESS]: "Sedang diproses",
  [OutPatientStatus.IN_QUEUE]: "Menunggu antrian",
  [OutPatientStatus.WAITING_FOR_PAYMENT]: "Menunggu pembayaran",
  [OutPatientStatus.DONE]: "Selesai",
  [OutPatientStatus.CANCELED_BY_ADMIN]: "Dibatalkan",
};

async function getOutpatient(token: string, outpatientId: number) {
  return outpatientApi.getOutpatient(token!, outpatientId, {
    populate: {
      patient: "*",
      doctor: "*",
      patient_record: {
        populate: {
          patient_record_inventories: {
            populate: ["inventory"],
          },
          patient_record_medical_treatments: {
            populate: ["medical_treatment"],
          },
        },
      },
    },
  });
}

async function getPatientRecordByOutpatientId(token: string, outpatientId: number) {
  const outpatient = await getOutpatient(token, outpatientId);
  return outpatient?.data?.attributes.patient_record?.data;
}

async function getOutpatientInventories(request: Request, outpatientId: number) {
  const orgId = await getOrgId(request);
  const token = await getToken(request);
  const outpatientData = await outpatientApi.getOutpatient(token!, outpatientId, {
    populate: {
      patient_record: {
        populate: {
          patient_record_inventories: {
            populate: ["inventory"],
          },
        },
      },
    },
    filters: {
      ...getOrganizationFilter(orgId),
    },
  });
  return outpatientData?.data?.attributes.patient_record?.data?.attributes.patient_record_inventories?.data || [];
}

async function getPatientRecordDrug(token: string, patientRecordInventoryId: number) {
  return patientRecordApi.getPatientRecordDrug(token, patientRecordInventoryId);
}
async function addPatientRecordDrug(token: string, data: AddPatientRecordDrugPayload) {
  return patientRecordApi.addPatientRecordDrug(token, data);
}
async function updatePatientRecordDrug(
  token: string,
  patientRecordInventoryId: number,
  data: UpdatePatientRecordDrugPayload
) {
  return patientRecordApi.updatePatientRecordDrug(token, patientRecordInventoryId, data);
}
async function deletePatientRecordDrug(token: string, patientRecordInventoryId: number) {
  return patientRecordApi.deletePatientRecordDrug(token, patientRecordInventoryId);
}
async function updatePatientRecordDrugRecipeNote(token: string, patientRecordId: number) {
  return patientRecordApi.deletePatientRecordDrug(token, patientRecordId);
}

export {
  OUTPATIENT_STATUS_TEXT_MAP,
  getOutpatient,
  getPatientRecordByOutpatientId,
  getOutpatientInventories,
  getPatientRecordDrug,
  addPatientRecordDrug,
  updatePatientRecordDrug,
  deletePatientRecordDrug,
  updatePatientRecordDrugRecipeNote,
};
