import qs from "qs";
import type { Patient, StrapiRequestOption, StrapiResponse } from "./strapiApi.types";
import { StrapiRequestError } from "./strapiApi.types";

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
  let q = new URLSearchParams();
  if (option.pagination) {
    const { page, pageSize } = option.pagination;
    page && q.append("pagination[page]", page.toString());
    pageSize && q.append("pagination[pageSize]", pageSize.toString());
  }

  // if (option.filters) {}

  const query = qs.stringify(
    {
      pagination: option.pagination,
      filters: option.filters,
    },
    {
      encodeValuesOnly: true, // prettify URL
    }
  );

  // return q.toString();

  return query;
};

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
};

export type LoginResponse = {
  // Token string
  jwt: string;
  // User data
  user: User;
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
  async getPatients(token: string, option?: StrapiRequestOption): Promise<StrapiResponse<Patient[]>> {
    return httpGet(token, "/api/patients?" + generateStrapiQueryString(option));
  },
  async createPatient(
    token: string,
    patient: Partial<Omit<Patient["attributes"], "id">>
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
