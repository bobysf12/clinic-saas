import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { Outlet } from "react-router-dom";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { H4 } from "~/components/common/typography";
import * as patientService from "~/services/patient.service";
import { getFullAge } from "~/utils/date";
import { getToken } from "~/utils/session.server";
import { Patient } from "~/utils/strapiApi.types";

type LoaderData = {
  patient: Patient;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getToken(request);
  const { patientId } = params;

  const patientData = await patientService.getPatientById(session!, Number(patientId));

  if (!patientData) {
    throw new Response("Invalid data", {
      status: 404,
    });
  }

  return {
    patient: patientData.data,
  } as LoaderData;
};

export default function PatientDetail() {
  const { patient } = useLoaderData<LoaderData>();

  const fullAge = patient.attributes.dob ? getFullAge(patient.attributes.dob) : null;

  return (
    <>
      <Card className="mb-4">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <H4>{patient.attributes.name}</H4>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <span className="text-sm">No Rekam Medis</span>
            <b className="text-lg">{patient.attributes.rm_id || "-"}</b>
          </div>
          <div className="flex flex-col">
            <span className="text-sm">Umur</span>
            <b className="text-lg">
              {fullAge ? `${fullAge.years} tahun ${fullAge.months} bulan ${fullAge.days} hari` : "-"}
            </b>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex flex-row overflow-x-auto">
          <NavLink to="profile" className="mr-2">
            {({ isActive }) => (
              <Button
                className="whitespace-nowrap"
                variant={isActive ? "raised" : "text"}
                color={isActive ? "primary" : "secondary"}
              >
                Profil Pasien
              </Button>
            )}
          </NavLink>
          <NavLink to="outpatients" className="mr-2">
            {({ isActive }) => (
              <Button
                className="whitespace-nowrap"
                variant={isActive ? "raised" : "text"}
                color={isActive ? "primary" : "secondary"}
              >
                Riwayat Rawat Jalan
              </Button>
            )}
          </NavLink>
        </div>
      </Card>
      <Outlet />
    </>
  );
}
