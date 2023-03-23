import { LoaderFunction } from "@remix-run/node";
import { findAllDoctorsByPolyclinicId } from "~/services/polyclinic.service";
import { getToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getToken(request);
  const { polyclinicId } = params;

  const doctors = await findAllDoctorsByPolyclinicId(session!, Number(polyclinicId));
  return {
    doctors: doctors.data,
  };
};
