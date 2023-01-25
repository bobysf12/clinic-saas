import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { Outlet } from "react-router-dom";
import { Card } from "~/components/common/card";
import { H4 } from "~/components/common/typography";
import { formatDateTime } from "~/utils/date";
import { getOrgId, getToken } from "~/utils/session.server";
import { outpatientApi } from "~/utils/strapiApi.server";
import { Inventory, OutPatient, StrapiFilterOperators } from "~/utils/strapiApi.types";

type LoaderData = {
  outpatient: OutPatient;
  drugs: Inventory[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getToken(request);
  const orgId = await getOrgId(request);
  const { outpatientId } = params;

  const outpatientData = await outpatientApi.getOutpatient(session!, Number(outpatientId), {
    populate: {
      patient: "*",
      doctor: {
        fields: ["name"],
      },
      patient_record: {
        populate: {
          patient_record_inventories: {
            populate: ["inventory"],
          },
          patient_record_medical_treatments: {
            populate: ["medical_treatment"],
          },
        },
      },
    },
    filters: {
      // Filter by exact organization id
      organization: {
        id: {
          [StrapiFilterOperators.$eq]: orgId,
        },
      },
    },
  });

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
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <span className="text-sm">Dokter</span>
            <b className="text-lg">{outpatient.attributes.doctor.data.attributes.name || "-"}</b>
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
            <span className="text-sm">Nama</span>
            <b className="text-lg">{outpatient.attributes.patient.data.attributes.name}</b>
          </div>
          <div className="flex flex-col">
            <span className="text-sm">Alamat</span>
            <b className="text-lg">{outpatient.attributes.patient.data.attributes.address || "-"}</b>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex flex-row">
          <NavLink to="soap" className="mr-4 px-2">
            TTV & SOAP
          </NavLink>
          <NavLink to="treatment" className="mr-4 px-2">
            Tindakan
          </NavLink>
          <NavLink to="recipe" className="mr-4 px-2">
            Resep Obat
          </NavLink>
        </div>
      </Card>
      <Outlet />
    </>
  );
}
