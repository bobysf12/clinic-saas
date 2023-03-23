import { doctorApi, getOrganizationFilter, polyclinicApi } from "~/utils/strapiApi.server";

function findAllPolyclinics(token: string, orgId: number) {
  return polyclinicApi.findAll(token, {
    filters: {
      ...getOrganizationFilter(orgId),
    },
  });
}

function findAllDoctorsByPolyclinicId(token: string, polyclinicId: number) {
  return doctorApi.getDoctors(token, {
    filters: {
      polyclinic: {
        id: polyclinicId,
      },
    },
  });
}

export { findAllPolyclinics, findAllDoctorsByPolyclinicId };
