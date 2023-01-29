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

enum FormActions {
  CONTINUE = "continue",
  BACK = "back",
}

const soapSchema = z.object({
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

export const action: ActionFunction = async ({ request, params }) => {
  const token = await getToken(request);
  const { outpatientId } = params;

  const { _action, ...formData } = Object.fromEntries(await request.formData());

  const patientRecordData = await getPatientRecordByOutpatientId(token!, Number(outpatientId));
  const values = soapSchema.parse(formData);

  try {
    // Update existing record
    await patientRecordApi.updatePatientRecord(token!, patientRecordData.id, values);

    let redirectUrl: string = "";
    if (_action === FormActions.CONTINUE) {
      // Redirect to treatment page
      return redirect("/app/outpatients/" + outpatientId + "/treatment");
    }
    if (_action === FormActions.BACK) {
      // Redirect to treatment page
      return redirect("/app/outpatients/" + outpatientId + "/ttv");
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
  const fetcher = useFetcher();
  const { outpatient } = useLoaderData<LoaderData>();

  return (
    <fetcher.Form method="post" replace aria-disabled={fetcher.state === "submitting"}>
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
        <Button color="secondary" variant="outline" name="_action" value={FormActions.BACK}>
          Sebelumnya
        </Button>
        <Button color="primary" name="_action" value={FormActions.CONTINUE}>
          Selanjutnya
        </Button>
      </div>
    </fetcher.Form>
  );
}
