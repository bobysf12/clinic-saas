import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { Outlet } from "react-router-dom";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { H4 } from "~/components/common/typography";
import { getOutpatient } from "~/services/outpatient.service";
import { formatDateTime } from "~/utils/date";
import { getToken } from "~/utils/session.server";
import { OutPatient } from "~/utils/strapiApi.types";

type LoaderData = {
  outpatient: OutPatient;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getToken(request);
  const { outpatientId } = params;

  const outpatientData = await getOutpatient(session!, Number(outpatientId));

  if (!outpatientData) {
    throw new Response("Invalid data", {
      status: 404,
    });
  }

  return {
    outpatient: outpatientData.data,
  } as LoaderData;
};

export default function SOAP() {
  const { outpatient } = useLoaderData<LoaderData>();

  return (
    <>
      <Card>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <H4>Rawat Jalan</H4>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <span className="text-sm">Dokter</span>
            <b className="text-lg">{outpatient.attributes.doctor.data.attributes.name || "-"}</b>
          </div>
          <div className="flex flex-col">
            <span className="text-sm">Nama Pasien</span>
            <b className="text-lg">{outpatient.attributes.patient.data.attributes.name}</b>
          </div>
          <div className="flex flex-col">
            <span className="text-sm">Tanggal Kunjungan</span>
            <b className="text-lg">{formatDateTime(outpatient.attributes.appointment_date, "dd MMM yyyy")}</b>
          </div>
          <div className="flex flex-col">
            <span className="text-sm">No Rekam Medis</span>
            <b className="text-lg">{outpatient.attributes.patient.data.attributes.rm_id || "-"}</b>
          </div>
          <div className="flex flex-col">
            <span className="text-sm">No. Telp</span>
            <b className="text-lg">{outpatient.attributes.patient.data.attributes.phone || "-"}</b>
          </div>
          <div className="flex flex-col">
            <span className="text-sm">Alamat</span>
            <b className="text-lg">{outpatient.attributes.patient.data.attributes.address || "-"}</b>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex flex-row overflow-x-auto">
          <NavLink to="ttv" className="mr-2">
            {({ isActive }) => (
              <Button variant={isActive ? "raised" : "text"} color={isActive ? "primary" : "secondary"}>
                TTV
              </Button>
            )}
          </NavLink>
          <NavLink to="soap" className="mr-2">
            {({ isActive }) => (
              <Button variant={isActive ? "raised" : "text"} color={isActive ? "primary" : "secondary"}>
                SOAP
              </Button>
            )}
          </NavLink>
          <NavLink to="treatment" className="mr-2">
            {({ isActive }) => (
              <Button variant={isActive ? "raised" : "text"} color={isActive ? "primary" : "secondary"}>
                Tindakan
              </Button>
            )}
          </NavLink>
          <NavLink to="recipe" className="mr-2">
            {({ isActive }) => (
              <Button
                className="whitespace-nowrap"
                variant={isActive ? "raised" : "text"}
                color={isActive ? "primary" : "secondary"}
              >
                Resep Obat
              </Button>
            )}
          </NavLink>
        </div>
      </Card>
      <Outlet />
    </>
  );
}
