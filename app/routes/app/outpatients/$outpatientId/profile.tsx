import { useMatches } from "@remix-run/react";
import { Card } from "~/components/common/card";
import { H5 } from "~/components/common/typography";
import { OutPatient } from "~/utils/strapiApi.types";

export default function Profile() {
  const matches = useMatches();

  const data = matches.find((match) => match.id.includes("/outpatients/$outpatientId"));
  const outpatient: OutPatient = data!.data.outpatient;
  return (
    <>
      <Card className="mt-4">
        <H5>Pasien</H5>
        <div className="grid grid-cols-2 gap-2 mt-4">
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
      </Card>
    </>
  );
}
