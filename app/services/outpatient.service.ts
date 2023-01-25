import { getOrgId, getToken } from "~/utils/session.server";
import { outpatientApi } from "~/utils/strapiApi.server";
import { StrapiFilterOperators } from "~/utils/strapiApi.types";

async function getOutpatient(request: Request, outpatientId: number) {
  const orgId = await getOrgId(request);
  const token = await getToken(request);
  return outpatientApi.getOutpatient(token!, outpatientId, {
    populate: {
      patient: "*",
      doctor: "*",
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
}

export { getOutpatient };
