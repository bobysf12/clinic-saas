import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { z, ZodError } from "zod";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { InputField } from "~/components/common/form-elements";
import { PaginationCard } from "~/components/common/pagination-card";
import {
  Table,
  TableBody,
  TableBodyRow,
  TableCol,
  TableContainer,
  TableHead,
  TableHeadRow,
} from "~/components/common/table";
import { H4 } from "~/components/common/typography";
import { getOutpatient, OUTPATIENT_STATUS_TEXT_MAP } from "~/services/outpatient.service";
import { formatDateTime } from "~/utils/date";
import { getOrgId, getToken } from "~/utils/session.server";
import { outpatientApi, patientRecordApi } from "~/utils/strapiApi.server";
import { OutPatient, OutPatientStatus, StrapiFilterOperators, StrapiRequestError } from "~/utils/strapiApi.types";

type ActionData = {
  error?: {
    fieldErrors?: any;
    message?: string;
    details?: any;
  };
  result?: OutPatient;
  fields?: any;
};

enum FormActionName {
  CREATE = "create",
  CONTINUE = "continue",
  CANCEL = "cancel",
  PAY = "pay",
  DONE = "done",
}

const createOutpatientSchema = z.object({
  patient: z.number(),
  doctor: z.number(),
  appointment_date: z.date(),
});

export const action: ActionFunction = async ({ request }) => {
  const session = await getToken(request);
  const orgId = await getOrgId(request);
  const { _action, ...formData } = Object.fromEntries(await request.formData());

  let actionData: ActionData = {
    fields: formData,
  };

  try {
    switch (_action) {
      case FormActionName.CANCEL: {
        const outpatientId = Number(formData.id);
        const existingOutpatientData = await getOutpatient(session!, outpatientId);
        const patientRecordId = existingOutpatientData.data.attributes.patient_record.data?.id;
        await outpatientApi.updateOutpatient(session!, Number(outpatientId), {
          patient_record: patientRecordId,
          status: OutPatientStatus.CANCELED_BY_ADMIN,
        });
        break;
      }
      case FormActionName.CREATE: {
        const newOutpatient = createOutpatientSchema.parse(formData);
        const result = await outpatientApi.createOutpatient(session!, {
          ...newOutpatient,
          organization: orgId!,
          status: OutPatientStatus.IN_QUEUE,
          appointment_date: newOutpatient.appointment_date.toISOString(),
        });

        if (result.data.id) {
          actionData.result = result.data;
        }
        break;
      }

      case FormActionName.PAY:
      case FormActionName.CONTINUE: {
        const outpatientId = Number(formData.id);
        const existingOutpatientData = await getOutpatient(session!, outpatientId);
        let patientRecordId = existingOutpatientData.data.attributes.patient_record.data?.id;
        if (!patientRecordId) {
          // Create new record
          const result = await patientRecordApi.createPatientRecord(session!, {
            patient: existingOutpatientData.data.attributes.patient.data.id,
            doctor: existingOutpatientData.data.attributes.doctor.data.id,
          });
          patientRecordId = result.data.id;
        }

        await outpatientApi.updateOutpatient(session!, Number(outpatientId), {
          patient_record: patientRecordId,
          status:
            _action === FormActionName.CONTINUE ? OutPatientStatus.IN_PROGRESS : OutPatientStatus.WAITING_FOR_PAYMENT,
        });

        if (_action === FormActionName.CONTINUE) {
          return redirect(`/app/outpatients/${outpatientId}`);
        }

        break;
      }

      case FormActionName.DONE: {
        const outpatientId = Number(formData.id);
        const existingOutpatientData = await getOutpatient(session!, outpatientId);
        const patientRecordId = existingOutpatientData.data.attributes.patient_record.data?.id;
        await outpatientApi.updateOutpatient(session!, Number(outpatientId), {
          patient_record: patientRecordId,
          status: OutPatientStatus.DONE,
        });
        break;
      }
    }
  } catch (err) {
    if (err instanceof ZodError) {
      actionData.error = err.formErrors;
    } else if (err instanceof StrapiRequestError) {
      actionData.error = { message: err.message, details: err.details };
    }
  }

  return json(actionData);
};

type LoaderData = {
  outpatients: OutPatient[];
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getToken(request);
  const orgId = await getOrgId(request);

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const search = url.searchParams.get("query");
  const status = url.searchParams.get("status");

  const result = await outpatientApi.getOutpatients(session!, {
    populate: {
      patient: {
        fields: ["name"],
      },
      doctor: {
        fields: ["name"],
      },
    },
    pagination: { pageSize: 10, page: Number(page) },
    filters: {
      // Search by doctor name or patient name
      [StrapiFilterOperators.$or]: [
        {
          doctor: {
            name: { [StrapiFilterOperators.$contains]: search },
          },
        },
        {
          patient: {
            name: { [StrapiFilterOperators.$contains]: search },
          },
        },
      ],
      status: status || undefined,
      // Filter by exact organization id
      organization: {
        id: {
          [StrapiFilterOperators.$eq]: orgId,
        },
      },
    },
    sort: ["appointment_date:desc"],
  });

  return {
    outpatients: result.data,
    pagination: result.meta?.pagination,
  } as LoaderData;
};

export default function Index() {
  const { outpatients, pagination } = useLoaderData<LoaderData>();
  const [_, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  const nextPage = () => {
    if (pagination?.pageCount === pagination?.page) return;

    const nextPage = (pagination?.page || 0) + 1;
    setSearchParams({ page: nextPage.toString() });
  };
  const prevPage = () => {
    if (!pagination || pagination?.page === 1) return;

    const nextPage = pagination.page - 1;
    setSearchParams({ page: nextPage.toString() });
  };

  return (
    <>
      <Card>
        <H4>Rawat Jalan</H4>

        <div className="flex flex-row justify-between items-center mt-4">
          <Form>
            <div className="flex flex-row items-center space-x-2">
              <InputField label="" name="query" placeholder="Cari" />
              <Button color="secondary" iconLeft={<i className="fa-solid fa-search" />}>
                Cari
              </Button>
            </div>
          </Form>
          <Link to={"/app/patients"}>
            <Button iconLeft={<i className="fa-solid fa-plus" />} color="primary">
              Tambah Antrian
            </Button>
          </Link>
        </div>
      </Card>

      <TableContainer className="mt-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table className="table-fixed min-w-full">
              <TableHead>
                <TableHeadRow>
                  <TableCol>Pasien</TableCol>
                  <TableCol>Dokter</TableCol>
                  <TableCol>Tanggal Janji</TableCol>
                  <TableCol>Status</TableCol>
                  <TableCol>&nbsp;</TableCol>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {outpatients.length === 0 && (
                  <TableBodyRow>
                    <TableCol colSpan={5} className="text-center font-bold">
                      Tidak ada antrian
                    </TableCol>
                  </TableBodyRow>
                )}
                {outpatients.map((outpatient) => (
                  <TableBodyRow key={outpatient.id}>
                    <TableCol className="font-medium">{outpatient.attributes.patient.data.attributes.name}</TableCol>
                    <TableCol>{outpatient.attributes.doctor.data.attributes.name}</TableCol>
                    <TableCol>
                      {formatDateTime(
                        outpatient.attributes.appointment_date || outpatient.attributes.createdAt,
                        "dd LLL yyyy HH:mm"
                      )}
                    </TableCol>
                    <TableCol>{OUTPATIENT_STATUS_TEXT_MAP[outpatient.attributes.status]}</TableCol>
                    <TableCol>
                      <fetcher.Form method="post">
                        <input type={"text"} hidden name="id" value={outpatient.id} readOnly />
                        {outpatient.attributes.status === OutPatientStatus.IN_QUEUE && (
                          <div className="flex flex-row">
                            <Button color="primary" name="_action" value={FormActionName.CONTINUE}>
                              Lanjut
                            </Button>
                            <Button
                              color="error"
                              variant="text"
                              type="submit"
                              name="_action"
                              value={FormActionName.CANCEL}
                            >
                              Batalkan
                            </Button>
                          </div>
                        )}
                        {outpatient.attributes.status === OutPatientStatus.IN_PROGRESS && (
                          <div className="flex flex-row">
                            <Link to={`${outpatient.id}`}>
                              <Button color="secondary">SOAP</Button>
                            </Link>
                            <Button color="primary" name="_action" value={FormActionName.PAY}>
                              Lanjut Bayar
                            </Button>
                          </div>
                        )}
                        {outpatient.attributes.status === OutPatientStatus.WAITING_FOR_PAYMENT && (
                          <div className="flex flex-row">
                            <Button color="secondary">Cetak invoice</Button>
                            <Button color="primary" name="_action" value={FormActionName.DONE}>
                              Selesai
                            </Button>
                          </div>
                        )}
                        {outpatient.attributes.status === OutPatientStatus.DONE && (
                          <div className="flex flex-row">
                            <Button color="secondary">Cetak invoice</Button>
                          </div>
                        )}
                      </fetcher.Form>
                    </TableCol>
                  </TableBodyRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TableContainer>
      {pagination && (
        <PaginationCard
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageItems={outpatients.length}
          goToNextPage={nextPage}
          goToPrevPage={prevPage}
          totalItems={pagination.total}
        />
      )}
    </>
  );
}
