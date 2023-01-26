import { getOrgId, getToken } from "~/utils/session.server";
import { inventoryApi } from "~/utils/strapiApi.server";
import { StrapiFilterOperators } from "~/utils/strapiApi.types";

async function getInventories(request: Request) {
  const orgId = await getOrgId(request);
  const token = await getToken(request);
  return inventoryApi.getInventories(token!, {
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

export { getInventories };
