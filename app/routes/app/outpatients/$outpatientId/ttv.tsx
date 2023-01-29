import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { InputField } from "~/components/common/form-elements";
import { H5 } from "~/components/common/typography";
import { getOutpatient, getPatientRecordByOutpatientId } from "~/services/outpatient.service";
import { getToken } from "~/utils/session.server";
import { patientRecordApi } from "~/utils/strapiApi.server";
import { OutPatient, StrapiRequestError } from "~/utils/strapiApi.types";

type LoaderData = {
  outpatient: OutPatient;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = await getToken(request);
  const { outpatientId } = params;

  const outpatientData = await getOutpatient(token!, Number(outpatientId));

  return {
    outpatient: outpatientData.data,
  };
};

function calcBMI(weight: number, height: number) {
  const heightInMeter = height / 100;
  const bmiResult = weight / Math.pow(heightInMeter, 2);
  return parseFloat(bmiResult.toString()).toFixed(2);
}

enum FormActions {
  CONTINUE = "save",
}

const ttvSchema = z.object({
  blood_pressure: z.string().optional(),
  pulse: z.string().optional().transform(Number),
  temperature: z.string().optional().transform(Number),
  respiratory_rate: z.string().optional().transform(Number),
  saturation: z.string().optional().transform(Number),
  height: z.string().optional().transform(Number),
  weight: z.string().optional().transform(Number),
});

export const action: ActionFunction = async ({ request, params }) => {
  const token = await getToken(request);
  const { outpatientId } = params;

  const { _action, ...formData } = Object.fromEntries(await request.formData());

  const values = ttvSchema.parse(formData);

  try {
    const patientRecordData = await getPatientRecordByOutpatientId(token!, Number(outpatientId));
    await patientRecordApi.updatePatientRecord(token!, patientRecordData.id, values);

    return redirect("/app/outpatients/" + outpatientId + "/soap");
  } catch (err) {
    if (err instanceof StrapiRequestError) {
      return json({
        error: {
          message: err.message,
          details: err.details,
        },
      });
    }
  }
};

export default function TTV() {
  const fetcher = useFetcher();
  const { outpatient } = useLoaderData<LoaderData>();

  const bmi = calcBMI(
    outpatient.attributes.patient_record.data?.attributes.weight || 0,
    outpatient.attributes.patient_record.data?.attributes.height || 0
  );

  return (
    <fetcher.Form method="post" aria-disabled={fetcher.state === "submitting"}>
      <Card className="mt-4">
        <H5>TTV</H5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          <InputField
            label="Tekanan darah (mm/hg)"
            type="text"
            name="blood_pressure"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.blood_pressure}
          />
          <InputField
            label="Nadi (x/menit)"
            type="number"
            name="pulse"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.pulse?.toString()}
          />
          <InputField
            label="Suhu (celcius)"
            type="number"
            name="temperature"
            step="0.1"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.temperature?.toString()}
          />
          <InputField
            label="Frekuensi Napas (x/menit)"
            type="number"
            name="respiratory_rate"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.respiratory_rate?.toString()}
          />
          <InputField
            label="Saturasi (%)"
            type="number"
            name="saturation"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.saturation?.toString()}
          />
          <InputField
            label="Tinggi (cm)"
            type="number"
            name="height"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.height?.toString()}
          />
          <InputField
            label="Berat (kg)"
            type="number"
            name="weight"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.weight?.toString()}
          />
          <InputField label="BMI" type="number" name="weight" value={bmi?.toString()} disabled />
        </div>
      </Card>
      <div className="w-full justify-center mx-auto inline-flex mt-4">
        <Button color="primary" name="_action" value={FormActions.CONTINUE}>
          Selanjutnya
        </Button>
      </div>
    </fetcher.Form>
  );
}
