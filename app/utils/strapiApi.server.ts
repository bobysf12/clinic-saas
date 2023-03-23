import qs from "qs";
import {
  Doctor,
  Inventory,
  MedicalTreatment,
  OutPatient,
  OutPatientStatus,
  Patient,
  PatientRecord,
  PatientRecordInventory,
  PatientRecordPayload,
  Polyclinic,
  StrapiFilterOperators,
  StrapiRequestError,
  StrapiRequestOption,
  StrapiResponse,
  User,
} from "./strapiApi.types";

let baseUrl = process.env.STRAPI_BASE_URL;
if (!baseUrl) {
  baseUrl = "http://localhost:1337";
}

const parseJson = (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") > -1) {
    return response.json();
  } else {
    return response.text();
  }
};

const generateHeaders = (token: string | null) => ({
  Authorization: token ? "Bearer " + token : "",
  "Content-Type": "application/json",
});

const httpGet = async (token: string, path: string) => {
  const response = await fetch(baseUrl + path, {
    headers: generateHeaders(token),
    method: "GET",
  });
  const jsonResponse = await parseJson(response);
  if (response.status >= 400) {
    throw new StrapiRequestError(jsonResponse.error);
  }
  return jsonResponse;
};
const httpPost = async (token: string | null, path: string, body?: any) => {
  const response = await fetch(baseUrl + path, {
    headers: generateHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
    method: "POST",
  });
  const jsonResponse = await parseJson(response);
  if (response.status >= 400) {
    throw new StrapiRequestError(jsonResponse.error);
  }
  return jsonResponse;
};
const httpPut = async (token: string | null, path: string, body?: any) => {
  const response = await fetch(baseUrl + path, {
    headers: generateHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
    method: "PUT",
  });
  const jsonResponse = await parseJson(response);
  if (response.status >= 400) {
    throw new StrapiRequestError(jsonResponse.error);
  }
  return jsonResponse;
};
const httpDelete = async (token: string | null, path: string, body?: any) => {
  const response = await fetch(baseUrl + path, {
    headers: generateHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
    method: "DELETE",
  });
  const jsonResponse = await parseJson(response);
  if (response.status >= 400) {
    throw new StrapiRequestError(jsonResponse.error);
  }
  return jsonResponse;
};

const generateStrapiQueryString = (option?: StrapiRequestOption) => {
  if (!option) {
    return "";
  }
  const query = qs.stringify(
    {
      pagination: option.pagination,
      filters: option.filters,
      populate: option.populate,
      sort: option.sort,
    },
    {
      encodeValuesOnly: true, // prettify URL
    }
  );

  return query;
};

export type LoginResponse = {
  // Token string
  jwt: string;
  // User data
  user: User;
};

export const getOrganizationFilter = (orgId: number | undefined) => {
  return {
    organization: {
      id: {
        [StrapiFilterOperators.$eq]: orgId,
      },
    },
  };
};

export const authApi = {
  async getOwnData(token: string) {
    return httpGet(token, "/api/users/me");
  },
  async login(username: string, password: string): Promise<LoginResponse> {
    return httpPost(null, "/api/auth/local", { identifier: username, password });
  },
};
export const patientApi = {
  async getPatient(token: string, id: number, option?: StrapiRequestOption): Promise<StrapiResponse<Patient>> {
    return httpGet(token, `/api/patients/${id}?` + generateStrapiQueryString(option));
  },
  async getPatients(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<Patient[]>> {
    return httpGet(token, "/api/patients?" + generateStrapiQueryString(option));
  },
  async createPatient(
    token: string,
    patient: Partial<Omit<Patient["attributes"], "id">> & { organization: number }
  ): Promise<StrapiResponse<Patient>> {
    return httpPost(token, "/api/patients", { data: patient });
  },
  async updatePatient(
    token: string,
    id: number,
    patient: Partial<Omit<Patient["attributes"], "id">>
  ): Promise<StrapiResponse<Patient>> {
    return httpPut(token, "/api/patients/" + id, { data: patient });
  },
  async deletePatient(token: string, id: number): Promise<StrapiResponse<Patient>> {
    return httpDelete(token, "/api/patients/" + id);
  },
};

export const inventoryApi = {
  async getInventories(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<Inventory[]>> {
    return httpGet(token, "/api/inventories?" + generateStrapiQueryString(option));
  },
};

export const outpatientApi = {
  async getOutpatients(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<OutPatient[]>> {
    return httpGet(token, "/api/outpatients?" + generateStrapiQueryString(option));
  },
  async getOutpatient(token: string, id: number, option?: StrapiRequestOption): Promise<StrapiResponse<OutPatient>> {
    return httpGet(token, `/api/outpatients/${id}?` + generateStrapiQueryString(option));
  },
  async createOutpatient(
    token: string,
    outpatient: {
      doctor: number;
      patient: number;
      organization: number;
      status: OutPatientStatus;
      appointment_date: string; // ISO String
      polyclinic: number;
    }
  ): Promise<StrapiResponse<OutPatient>> {
    return httpPost(token, "/api/outpatients", { data: outpatient });
  },
  async updateOutpatient(
    token: string,
    id: number,
    outpatient: Partial<{
      doctor: number;
      patient: number;
      organization: number;
      status: OutPatientStatus;
      appointment_date: string; // ISO String
      patient_record: number; // Only the record id
    }>
  ): Promise<StrapiResponse<OutPatient>> {
    return httpPut(token, "/api/outpatients/" + id, { data: outpatient });
  },
  async deleteOutpatientQueue(token: string, id: string): Promise<StrapiResponse<OutPatient>> {
    return httpDelete(token, `/api/outpatients/${id}`);
  },
};

export const doctorApi = {
  async getDoctors(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<Doctor[]>> {
    return httpGet(token, "/api/doctors?" + generateStrapiQueryString(option));
  },
};

export type AddPatientRecordDrugPayload = {
  organization: number;
  patient_record: number;
  patient: number;
  doctor: number;
  inventory: number;
  description: string;
  price: number;
  qty: number;
};
export type UpdatePatientRecordDrugPayload = {
  description: string;
  price: number;
  qty: number;
};

export const patientRecordApi = {
  async getPatientRecords(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<PatientRecord[]>> {
    return httpGet(token, `/api/patient-records?` + generateStrapiQueryString(option));
  },
  async createPatientRecord(token: string, data: PatientRecordPayload): Promise<StrapiResponse<PatientRecord>> {
    return httpPost(token, "/api/patient-records", { data });
  },
  async updatePatientRecord(
    token: string,
    id: number,
    data: PatientRecordPayload
  ): Promise<StrapiResponse<PatientRecord>> {
    return httpPut(token, "/api/patient-records/" + id, { data });
  },
  async addPatientRecordTreatment(
    token: string,
    data: {
      organization: number;
      patient_record: number;
      patient: number;
      doctor: number;
      medical_treatment: number;
      note: string;
      price: number;
      qty: number;
    }
  ) {
    return httpPost(token, `/api/patient-record-medical-treatments/`, { data });
  },
  async updatePatientRecordTreatment(
    token: string,
    id: number,
    data: {
      description: string;
      price: number;
      qty: number;
    }
  ) {
    return httpPut(token, `/api/patient-record-medical-treatments/${id}`, { data });
  },
  async deletePatientRecordTreatment(token: string, id: number) {
    return httpDelete(token, `/api/patient-record-medical-treatments/${id}`);
  },

  async getPatientRecordDrug(
    token: string,
    patientRecordInventoryId: number
  ): Promise<StrapiResponse<PatientRecordInventory>> {
    return httpGet(token, `/api/patient-record-inventories/${patientRecordInventoryId}`);
  },
  async addPatientRecordDrug(token: string, data: AddPatientRecordDrugPayload) {
    return httpPost(token, `/api/patient-record-inventories`, { data });
  },
  async updatePatientRecordDrug(token: string, patientRecordInventoryId: number, data: UpdatePatientRecordDrugPayload) {
    return httpPut(token, `/api/patient-record-inventories/${patientRecordInventoryId}`, { data });
  },
  async deletePatientRecordDrug(token: string, patientRecordInventoryId: number) {
    return httpDelete(token, `/api/patient-record-inventories/${patientRecordInventoryId}`);
  },
};

export const treatmentsApi = {
  async getTreatments(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<MedicalTreatment[]>> {
    return httpGet(token, `/api/medical-treatments?` + generateStrapiQueryString(option));
  },
  async addPatientRecordTreatment(
    token: string,
    data: {
      organization: number;
      patient_record: number;
      patient: number;
      doctor: number;
      medical_treatment: number;
      note: string;
      price: number;
      qty: number;
    }
  ) {
    return httpPost(token, `/api/patient-record-medical-treatments/`, { data });
  },
  async updatePatientRecordTreatment(
    token: string,
    id: number,
    data: {
      description: string;
      price: number;
      qty: number;
    }
  ) {
    return httpPut(token, `/api/patient-record-medical-treatments/${id}`, { data });
  },
  async deletePatientRecordTreatment(token: string, id: number) {
    return httpDelete(token, `/api/patient-record-medical-treatments/${id}`);
  },
};

export const polyclinicApi = {
  async findAll(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<Polyclinic[]>> {
    return httpGet(token, "/api/polyclinics?" + generateStrapiQueryString(option));
  },
};
