import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";

import { Card } from "~/components/common/card";

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
    <>
      {outpatients.length === 0 && <Card>Tidak ada data</Card>}
      {outpatients.map((outpatient) => (
        <NavLink to={`/app/outpatients/${outpatient.id}`} key={outpatient.id}>
          <Card key={outpatient.id} className="mb-2">
            <div className="flex flex-row justify-between items-center">
              <h5>
                {formatDateTime(outpatient.attributes.appointment_date, "dd LLL yyyy")} -{" "}
                {outpatient.attributes.doctor.data.attributes.name}
              </h5>
              <span>{OUTPATIENT_STATUS_TEXT_MAP[outpatient.attributes.status]}</span>
            </div>
          </Card>
        </NavLink>
      ))}
    </>
  );
}
