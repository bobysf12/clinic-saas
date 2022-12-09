import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { InputField, SelectField } from "~/components/common/form-elements";
import { H2, H4, H5, H6 } from "~/components/common/typography";
import { getOrgId, getToken } from "~/utils/session.server";
import { doctorApi, outpatientApi, patientApi } from "~/utils/strapiApi.server";
import { Doctor, Patient, StrapiFilterOperators, OutPatientStatus } from "~/utils/strapiApi.types";

type ActionData = {
  error?: {
    fieldErrors?: any;
    message?: string;
    details?: any;
  };
  fields?: any;
};

const createOutpatientQueueSchema = z.object({
  doctor: z.string().regex(/^\d+$/),
  patient: z.string().regex(/^\d+$/),
});
const deleteOutpatientQueueSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export const action: ActionFunction = async ({ request }) => {
  const token = await getToken(request);
  const orgId = await getOrgId(request);
  const { _action, ...formData } = Object.fromEntries(await request.formData());

  switch (_action) {
    case "create": {
      const values = createOutpatientQueueSchema.parse(formData);
      await outpatientApi.createOutpatient(token!, {
        appointment_date: new Date().toISOString(),
        doctor: Number(values.doctor),
        patient: Number(values.patient),
        organization: orgId!,
        status: OutPatientStatus.IN_QUEUE,
      });
      return redirect("/app/outpatients");
    }
    case "delete": {
      const values = deleteOutpatientQueueSchema.parse(formData);

      // Check if queue status is still in_queue
      const existingQueue = await outpatientApi.getOutpatient(token!, Number(values.id));
      if (existingQueue?.data.attributes.status !== OutPatientStatus.IN_QUEUE) {
        return json({
          success: false,
        });
      }

      await outpatientApi.deleteOutpatientQueue(token!, values.id);
      return json({
        success: true,
      });
    }
  }
};

type LoaderData = {
  patient?: Patient;
  doctors: Doctor[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getToken(request);
  const orgId = await getOrgId(request);

  const url = new URL(request.url);
  const patientId = url.searchParams.get("patientId");
  console.log(orgId);
  let patient: Patient | undefined;
  if (patientId) {
    const patientResponse = await patientApi.getPatient(session!, Number(patientId), {
      filters: {
        organization: {
          id: {
            [StrapiFilterOperators.$eq]: orgId,
          },
        },
      },
    });
    patient = patientResponse.data;
  }

  const doctors = await doctorApi.getDoctors(session!, {
    filters: {
      organization: {
        id: {
          [StrapiFilterOperators.$eq]: orgId,
        },
      },
    },
  });

  return {
    patient,
    doctors: doctors.data,
  } as LoaderData;
};

export default function NewQueue() {
  const { doctors, patient } = useLoaderData<LoaderData>();
  return (
    <>
      <Card>
        <H4>Antrian Rawat Jalan</H4>
      </Card>
      <Card className="mt-4">
        <div className="max-w-md mx-auto">
          <Form method="post">
            <H5 className="mb-4">Tambah Antrian</H5>
            <input type="text" value={patient?.id} name="patient" hidden readOnly />
            <InputField label="Pasien" name="name" required defaultValue={patient?.attributes.name} disabled />
            <SelectField label="Dokter" name="doctor" required>
              <option value="">-Pilih-</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.attributes.name}
                </option>
              ))}
            </SelectField>

            <Button type="submit" value="create" name="_action">
              Simpan Antrian
            </Button>
          </Form>
        </div>
      </Card>
    </>
  );
}
