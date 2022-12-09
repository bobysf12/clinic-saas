import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Link, useActionData, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { z, ZodError } from "zod";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { Dialog, DialogActions, DialogContent } from "~/components/common/dialog";
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
import { formatDateTime } from "~/utils/date";
import { OUTPATIENT_STATUS_TEXT_MAP } from "~/utils/outpatient.utils";
import { getOrgId, getToken } from "~/utils/session.server";
import { outpatientApi } from "~/utils/strapiApi.server";
import { OutPatient, StrapiFilterOperators, StrapiRequestError, OutPatientStatus } from "~/utils/strapiApi.types";

type ActionData = {
  error?: {
    fieldErrors?: any;
    message?: string;
    details?: any;
  };
  result?: OutPatient;
  fields?: any;
};

const createOutpatientSchema = z.object({
  patient: z.number(),
  doctor: z.number(),
  appointment_date: z.date(),
});

export const action: ActionFunction = async ({ request }) => {
  const orgId = await getOrgId(request);
  const { _action, ...formData } = Object.fromEntries(await request.formData());

  let actionData: ActionData = {
    fields: formData,
  };

  try {
    const token = await getToken(request);
    if (_action === "create") {
      const newOutpatient = createOutpatientSchema.parse(formData);
      const result = await outpatientApi.createOutpatient(token!, {
        ...newOutpatient,
        organization: orgId!,
        status: OutPatientStatus.IN_QUEUE,
        appointment_date: newOutpatient.appointment_date.toISOString(),
      });

      if (result.data.id) {
        actionData.result = result.data;
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
                      {outpatient.attributes.status === OutPatientStatus.IN_QUEUE && (
                        <fetcher.Form method="post" action="/app/outpatients/queue">
                          <input type={"text"} hidden name="id" value={outpatient.id} readOnly />
                          <Button color="error" type="submit" name="_action" value="delete">
                            Batalkan
                          </Button>
                        </fetcher.Form>
                      )}
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
