import { ActionFunction, json } from "@remix-run/node";
import { useFetcher, useMatches, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { InputField } from "~/components/common/form-elements";
import { H5 } from "~/components/common/typography";
import { getOutpatient } from "~/services/outpatient.service";
import { getToken } from "~/utils/session.server";
import { outpatientApi, patientRecordApi } from "~/utils/strapiApi.server";
import { OutPatient, StrapiRequestError } from "~/utils/strapiApi.types";

function calcBMI(weight: number, height: number) {
  const heightInMeter = height / 100;
  const bmiResult = weight / Math.pow(heightInMeter, 2);
  return parseFloat(bmiResult.toString()).toFixed(2);
}

enum ActionButtonValue {
  SAVE = "save",
  SAVE_AND_CONTINUE = "save_and_continue",
}

const soapSchema = z.object({
  blood_pressure: z.string().optional(),
  pulse: z.string().optional().transform(Number),
  temperature: z.string().optional().transform(Number),
  respiratory_rate: z.string().optional().transform(Number),
  saturation: z.string().optional().transform(Number),
  height: z.string().optional().transform(Number),
  weight: z.string().optional().transform(Number),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

export const action: ActionFunction = async ({ request, params }) => {
  const token = await getToken(request);
  const { outpatientId } = params;

  const { _action, ...formData } = Object.fromEntries(await request.formData());

  const existingOutpatientData = await getOutpatient(token!, Number(outpatientId));

  if (!existingOutpatientData) {
    throw new Response("Invalid data", {
      status: 404,
    });
  }

  const values = soapSchema.parse(formData);

  try {
    if (existingOutpatientData.data.attributes.patient_record.data) {
      // Update existing record
      await patientRecordApi.updatePatientRecord(
        token!,
        existingOutpatientData.data.attributes.patient_record.data.id,
        values
      );
    } else {
      // Create new record
      const result = await patientRecordApi.createPatientRecord(token!, {
        ...values,
        patient: existingOutpatientData.data.attributes.patient.data.id,
        doctor: existingOutpatientData.data.attributes.doctor.data.id,
      });

      if (result) {
        await outpatientApi.updateOutpatient(token!, Number(outpatientId), {
          patient_record: result.data.id,
        });
      }
    }

    let redirectUrl: string = "";
    if (_action === ActionButtonValue.SAVE_AND_CONTINUE) {
      // Redirect to treatment page
      redirectUrl = "/app/outpatients/" + outpatientId + "/treatment";
      // return redirect("/app/outpatients/" + outpatientId + "/treatment");
    }

    return json({
      success: true,
      redirectUrl,
    });
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

export default function SOAP() {
  const matches = useMatches();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const data = matches.find((match) => match.id.includes("/outpatients/$outpatientId"));
  const outpatient: OutPatient = data!.data.outpatient;
  const bmi = calcBMI(
    outpatient.attributes.patient_record.data?.attributes.weight || 0,
    outpatient.attributes.patient_record.data?.attributes.height || 0
  );

  useEffect(() => {
    if (fetcher.type === "done" && fetcher.data.success && fetcher.data.redirectUrl) {
      // window.location.href = fetcher.data.redirectUrl;
      navigate(fetcher.data.redirectUrl);
    }
  }, [fetcher, navigate]);
  return (
    <fetcher.Form method="post" replace aria-disabled={fetcher.state === "submitting"}>
      <Card className="mt-4">
        <H5>TTV</H5>
        <div className="grid grid-cols-4 gap-2 mt-4">
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
      <Card className="mt-4">
        <H5>SOAP</H5>
        <div className="grid grid-cols-1 gap-2 mt-4">
          <InputField
            label="Subjective"
            type="textarea"
            name="subjective"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.subjective}
          />
          <InputField
            label="Objective"
            type="textarea"
            name="objective"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.objective}
          />

          <InputField
            label="Assessment"
            type="textarea"
            name="assessment"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.assessment}
          />

          <InputField
            label="Plan"
            type="textarea"
            name="plan"
            defaultValue={outpatient.attributes.patient_record.data?.attributes.plan}
          />
        </div>
      </Card>
      <div className="w-full justify-center mx-auto inline-flex mt-4">
        <Button color="secondary" name="_action" value={ActionButtonValue.SAVE}>
          Simpan
        </Button>
        <Button color="primary" name="_action" value={ActionButtonValue.SAVE_AND_CONTINUE}>
          Selanjutnya
        </Button>
      </div>
    </fetcher.Form>
  );
}
