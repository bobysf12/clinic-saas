import { getOrgId, getToken } from "~/utils/session.server";
import { treatmentsApi } from "~/utils/strapiApi.server";
import { StrapiFilterOperators } from "~/utils/strapiApi.types";

async function getTreatments(request: Request) {
  const orgId = await getOrgId(request);
  const session = await getToken(request);
  return treatmentsApi.getTreatments(session!, {
    filters: {
      organization: {
        id: {
          [StrapiFilterOperators.$eq]: orgId,
        },
      },
    },
  });
}

export { getTreatments };
