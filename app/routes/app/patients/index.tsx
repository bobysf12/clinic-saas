import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DotsVerticalIcon, PlusIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { z, ZodError } from "zod";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { Dialog, DialogActions, DialogContent } from "~/components/common/dialog";
import { DropdownMenuContent, DropdownMenuItem } from "~/components/common/dropdown-menu";
import { InputField, SelectField } from "~/components/common/form-elements";
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
import { getOrgId, getToken } from "~/utils/session.server";
import { patientApi } from "~/utils/strapiApi.server";
import { Gender, Patient, StrapiFilterOperators, StrapiRequestError, StrapiResponse } from "~/utils/strapiApi.types";

type LoaderData = {
  patients: Patient[];
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

  const result = await patientApi.getPatients(session!, {
    pagination: { pageSize: 10, page: Number(page) },
    filters: {
      organization: {
        id: {
          [StrapiFilterOperators.$eq]: orgId,
        },
      },
      [StrapiFilterOperators.$or]: [
        {
          name: {
            [StrapiFilterOperators.$contains]: search,
          },
        },
        {
          rm_id: {
            [StrapiFilterOperators.$contains]: search,
          },
        },
      ],
    },
  });

  return {
    patients: result.data,
    pagination: result.meta?.pagination,
  } as LoaderData;
};

const patientSchema = z.object({
  name: z.string().min(1),
  dob: z.string().min(1),
  address: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  phone: z.string().optional(),
  rm_id: z.string().optional(),
});

type ActionData = {
  error?: {
    fieldErrors?: any;
    message?: string;
    details?: any;
  };
  result?: Patient;
  fields?: any;
};

export const action: ActionFunction = async ({ request }) => {
  const orgId = await getOrgId(request);
  const { _action, ...formData } = Object.fromEntries(await request.formData());

  let actionData: ActionData = {
    fields: formData,
  };

  try {
    const token = await getToken(request);
    if (_action === "delete") {
      const result = await patientApi.deletePatient(token!, Number(formData.id));

      if (result?.data.id) {
        actionData.result = result.data;
      }
    } else {
      if (formData.gender === "") {
        delete formData.gender;
      }
      const patient = patientSchema.parse(formData);
      let result: StrapiResponse<Patient>;

      if (_action === "create") {
        result = await patientApi.createPatient(token!, { ...patient, organization: orgId! });
      } else {
        result = await patientApi.updatePatient(token!, Number(formData.id), patient);
      }
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

export default function Patients() {
  const { patients, pagination } = useLoaderData<LoaderData>();

  const [_, setSearchParams] = useSearchParams();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [editedPatient, setEditedPatient] = useState<Patient>();

  const editPatient = (patient: Patient) => {
    setEditedPatient(patient);
    setOpen(true);
  };

  const closeFormDialog = () => {
    setEditedPatient(undefined);
    setOpen(false);
  };

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
    <div>
      <Card>
        <H4>All Patients</H4>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4">
          <div className="w-full sm:max-w-sm">
            <Form method="get">
              <InputField
                className="w-full"
                ref={searchInputRef}
                label=""
                name="query"
                placeholder="Cari Pasien"
                autoFocus
              />
              <input type="submit" hidden />
            </Form>
          </div>
          <div>
            <Button iconLeft={<i className="fa-solid fa-plus" />} onClick={() => setOpen(true)}>
              Tambah Pasien
            </Button>
          </div>
        </div>
      </Card>

      <TableContainer className="mt-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table className="table-fixed min-w-full">
              <TableHead>
                <TableHeadRow>
                  <TableCol>No. RM</TableCol>
                  <TableCol>Nama</TableCol>
                  <TableCol>Tgl Lahir</TableCol>
                  <TableCol>Alamat</TableCol>
                  <TableCol>No. Telp</TableCol>
                  <TableCol>&nbsp;</TableCol>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => (
                  <PatientRow patient={patient} editPatient={editPatient} key={patient.id} />
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
          pageItems={patients.length}
          goToNextPage={nextPage}
          goToPrevPage={prevPage}
          totalItems={pagination.total}
        />
      )}
      <PatientFormDialog open={open} close={closeFormDialog} initialValues={editedPatient} />
    </div>
  );
}

type PatientRowProps = {
  patient: Patient;
  editPatient: (patient: Patient) => void;
};

const namePrefixbyGender = {
  [Gender.Male]: "Tn.",
  [Gender.Female]: "Ny.",
  [Gender.Others]: "",
};
const PatientRow = ({ patient, editPatient }: PatientRowProps) => {
  return (
    <TableBodyRow key={patient.id}>
      <TableCol className="whitespace-nowrap">{patient.attributes.rm_id}</TableCol>
      <TableCol className="whitespace-nowrap">
        <Link to={`/app/patients/${patient.id}`} className="underline font-semibold">
          {namePrefixbyGender[patient.attributes.gender]} {patient.attributes.name}
        </Link>
      </TableCol>
      <TableCol className="whitespace-nowrap">{patient.attributes.dob}</TableCol>
      <TableCol className="">{patient.attributes.address}</TableCol>
      <TableCol className="whitespace-nowrap">{patient.attributes.phone}</TableCol>
      <TableCol className="inline-flex whitespace-nowrap">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button aria-label="More actions" color="secondary">
              <DotsVerticalIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <button onClick={() => editPatient(patient)} className="flex flex-row items-center">
                <Pencil1Icon /> <span className="ml-2">Ubah Data</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to={`/app/outpatients/queue?patientId=${patient.id}`} className="flex flex-row items-center">
                <PlusIcon /> <span className="ml-2">Antrian Rawat Jalan</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu.Root>
      </TableCol>
    </TableBodyRow>
  );
};

type PatientFormDialogProps = {
  open: boolean;
  close: () => void;
  initialValues?: Patient;
};
const PatientFormDialog = ({ open, close, initialValues }: PatientFormDialogProps) => {
  const formRef = useRef<HTMLFormElement>(undefined!);
  const fetcher = useFetcher<ActionData>();
  const formAction = fetcher.submission?.formData.get("_action")?.toString();
  const isAdding = fetcher.state === "submitting" && ["create", "update"].includes(formAction!);

  const title = initialValues ? "Ubah pasien" : "Tambah pasien";

  useEffect(() => {
    if (!open) {
      formRef.current?.reset();
    }
  }, [open]);

  useEffect(() => {
    if (fetcher.type === "done" && fetcher.data.result?.id) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  return (
    <Dialog open={open} onClose={close} title={title} fullWidth maxWidth="md">
      <fetcher.Form ref={formRef} method="post" aria-disabled={isAdding}>
        <DialogContent>
          {formAction !== "delete" && fetcher.data?.error?.message && (
            <div className="text-red">{fetcher.data.error.message}</div>
          )}
          <input type="text" hidden name="id" value={initialValues?.id} readOnly />
          <InputField label="No. Rekam Medis" name="rm_id" defaultValue={initialValues?.attributes.rm_id} />

          <InputField label="Nama" name="name" required defaultValue={initialValues?.attributes.name} />
          <InputField label="Tgl lahir" name="dob" type="date" required defaultValue={initialValues?.attributes.dob} />
          <SelectField label="Jenis kelamin" name="gender">
            <option value="">-Pilih-</option>
            {Object.values(Gender).map((gender) => (
              <option key={gender} value={gender} selected={initialValues?.attributes.gender === gender}>
                {gender}
              </option>
            ))}
          </SelectField>
          <InputField label="No. telp" name="phone" type="text" defaultValue={initialValues?.attributes.phone} />
          <InputField label="Alamat" name="address" type="text" defaultValue={initialValues?.attributes.address} />
        </DialogContent>

        <DialogActions>
          <Button
            type="submit"
            name="_action"
            value={initialValues ? "update" : "create"}
            variant="raised"
            disabled={isAdding}
          >
            Simpan
          </Button>
          <Button type="button" variant="outline" color="secondary" onClick={close}>
            Tutup
          </Button>
        </DialogActions>
      </fetcher.Form>
    </Dialog>
  );
};
