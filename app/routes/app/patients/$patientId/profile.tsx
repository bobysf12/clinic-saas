import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/common/card";
import { InputField } from "~/components/common/form-elements";
import * as patientService from "~/services/patient.service";
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

export default function Profile() {
  const { patient } = useLoaderData<LoaderData>();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        <Card>
          <h2>Biodata Pasien</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-4">
            <div className="flex flex-col">
              <span className="text-sm">No Rekam Medis</span>
              <b className="text-lg">{patient.attributes.rm_id || "-"}</b>
            </div>
            <div className="flex flex-col">
              <span className="text-sm">Nama</span>

              <b className="text-lg">{patient.attributes.name || "-"}</b>
            </div>
            <div className="flex flex-col">
              <span className="text-sm">Jenis Kelamin</span>
              <b className="text-lg">{patient.attributes.gender || "-"}</b>
            </div>
            <div className="flex flex-col">
              <span className="text-sm">No. Telp</span>
              <b className="text-lg">{patient.attributes.phone || "-"}</b>
            </div>
            <div className="flex flex-col">
              <span className="text-sm">Alamat</span>
              <b className="text-lg">{patient.attributes.address || "-"}</b>
            </div>
          </div>
        </Card>
        <Card>
          <h2>Catatan Dokter</h2>
          <InputField name="note" type="textarea" rows={5} />
        </Card>
        <Card>
          <h2>Alergi</h2>
          <InputField name="allergies" type="textarea" rows={5} />
        </Card>
      </div>
    </>
  );
}
