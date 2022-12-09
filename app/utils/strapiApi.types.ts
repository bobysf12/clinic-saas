export class StrapiRequestError extends Error {
  public details: any = undefined;
  public status: number = 0;
  constructor(param: { status: number; name: string; message: string; details: any }) {
    super(param.message);
    this.name = "StrapiRequestError";
    this.details = param.details;
    this.status = param.status;
  }
}

export interface StrapiResponse<Data> {
  data: Data;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  error?: {
    status: string;
    name: string;
    message: string;
    details: any;
  };
}

export enum StrapiFilterOperators {
  $in = "$in",
  $or = "$or",
  $eq = "$eq",
  $contains = "$contains",
  $and = "$and",
  $not = "$not",
}

export interface StrapiRequestOption {
  /**
   * https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html#filtering
   */
  filters?: Object;
  /**
   * https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html#relation-media-fields
   */
  populate?: Object;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  sort?: string[];
}

export interface StrapiEntry<Attributes, Meta = any> {
  id: number;
  attributes: Attributes & { createdAt: string; updatedAt: string; publishedAt: string };
  meta: Meta;
}

export interface PopulateData<T> {
  data: T;
}

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  organization?: {
    id: number;
    name: string;
    description: string;
  };
};

export enum Gender {
  Male = "male",
  Female = "female",
  Others = "others",
}

export type Patient = StrapiEntry<{
  rm_id: string;
  name: string;
  dob: string;
  address: string;
  phone: string;
  gender: Gender;
}>;
export type Doctor = StrapiEntry<{
  name: string;
}>;

export type InventoryType = StrapiEntry<{
  name: string;
  description: string;
}>;

export type Inventory = StrapiEntry<{
  name: string;
  description: string;
  unit_in_stock: number;
  qty_per_unit: number;
  inventory_type: InventoryType;
  price: number;
}>;

export enum OutPatientStatus {
  IN_QUEUE = "in_queue",
  IN_PROGRESS = "in_progress",
  WAITING_FOR_PAYMENT = "waiting_for_payment",
}

export type OutPatient = StrapiEntry<{
  patient: PopulateData<Patient>;
  doctor: PopulateData<Doctor>;
  appointment_date: string;
  status: OutPatientStatus;
}>;
