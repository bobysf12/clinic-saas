import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/button";

import {
  Table,
  TableBody,
  TableBodyRow,
  TableCol,
  TableContainer,
  TableHead,
  TableHeadRow,
} from "~/components/common/table";

import { OUTPATIENT_STATUS_TEXT_MAP } from "~/services/outpatient.service";
import * as patientService from "~/services/patient.service";
import { formatDateTime } from "~/utils/date";
import { getToken } from "~/utils/session.server";
import { OutPatient } from "~/utils/strapiApi.types";

type LoaderData = {
  outpatients: OutPatient[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getToken(request);
  const { patientId } = params;

  const outpatients = await patientService.getPatientOutpatientRecords(session!, Number(patientId));

  if (!outpatients) {
    throw new Response("Invalid data", {
      status: 404,
    });
  }

  return {
    outpatients: outpatients.data,
  } as LoaderData;
};

export default function Outpatients() {
  const { outpatients } = useLoaderData<LoaderData>();

  return (
    <TableContainer className="mt-6">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          <Table className="table-fixed min-w-full">
            <TableHead>
              <TableHeadRow>
                <TableCol>Tanggal Visit</TableCol>
                <TableCol>Poli</TableCol>
                <TableCol>Dokter</TableCol>
                <TableCol>Status</TableCol>
                <TableCol>&nbsp;</TableCol>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {outpatients.map((outpatient) => (
                <TableBodyRow key={outpatient.id}>
                  <TableCol>{formatDateTime(outpatient.attributes.appointment_date, "dd LLL yyyy")}</TableCol>
                  <TableCol>{outpatient.attributes.polyclinic.data?.attributes.name || "-"}</TableCol>
                  <TableCol>{outpatient.attributes.doctor.data.attributes.name}</TableCol>
                  <TableCol>{OUTPATIENT_STATUS_TEXT_MAP[outpatient.attributes.status]}</TableCol>
                  <TableCol>
                    <Link to={`/app/outpatients/${outpatient.id}`}>
                      <Button color="primary" iconLeft={<i className="fa-solid fa-up-right-from-square"></i>} />
                    </Link>
                  </TableCol>
                </TableBodyRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TableContainer>
  );
}
