import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { Dialog, DialogContent } from "~/components/common/dialog";
import { InputField } from "~/components/common/form-elements";
import {
  Table,
  TableBody,
  TableBodyRow,
  TableCol,
  TableContainer,
  TableHead,
  TableHeadRow,
} from "~/components/common/table";
import { H5 } from "~/components/common/typography";
import { getOutpatient } from "~/services/outpatient.service";
import { updatePatientRecord } from "~/services/patientrecord.service";
import { getTreatments } from "~/services/treatment.service";
import { formatIDR } from "~/utils/number";
import { getOrgId, getToken } from "~/utils/session.server";
import { treatmentsApi } from "~/utils/strapiApi.server";
import { MedicalTreatment, OutPatient, PatientRecordMedicalTreatment } from "~/utils/strapiApi.types";

type LoaderData = {
  treatments: MedicalTreatment[];
  outpatient: OutPatient;
};
export const loader: LoaderFunction = async ({ request, params }) => {
  const token = await getToken(request);
  const { outpatientId } = params;

  const outpatientData = await getOutpatient(token!, Number(outpatientId));
  const treatments = await getTreatments(request);

  return {
    treatments: treatments.data,
    outpatient: outpatientData.data,
  };
};

enum FormActions {
  ADD_TREATMENT = "ADD_TREATMENT",
  UPDATE_SELECTED_TREATMENT = "UPDATE_SELECTED_TREATMENT",
  DELETE_SELECTED_TREATMENT = "DELETE_SELECTED_TREATMENT",
  UPDATE_TREATMENT_NOTE = "UPDATE_TREATMENT_NOTE",
  CONTINUE = "CONTINUE",
  BACK = "BACK",
}

const updateTreatmentSchema = z.object({
  qty: z.coerce.number().optional(),
  description: z.string().optional(),
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getToken(request);
  const orgId = await getOrgId(request);
  const { outpatientId } = params;
  const { _action, ...formData } = Object.fromEntries(await request.formData());

  const existingOutpatientData = await getOutpatient(session!, Number(outpatientId));

  if (!existingOutpatientData) {
    throw new Response("Invalid data", {
      status: 404,
    });
  }

  const patientRecordTreatments =
    existingOutpatientData.data.attributes.patient_record.data.attributes.patient_record_medical_treatments.data;

  switch (_action) {
    case FormActions.ADD_TREATMENT: {
      // Create new entry
      await treatmentsApi.addPatientRecordTreatment(session!, {
        medical_treatment: Number(formData.id),
        doctor: Number(existingOutpatientData.data.attributes.doctor.data.id),
        organization: Number(orgId),
        patient: Number(existingOutpatientData.data.attributes.patient.data.id),
        patient_record: Number(existingOutpatientData.data.attributes.patient_record.data.id),
        note: "",
        qty: 1,
        price: Number(formData.price),
      });
      // }
      break;
    }
    case FormActions.UPDATE_SELECTED_TREATMENT: {
      const data = updateTreatmentSchema.parse(formData);
      const existingTreatment = patientRecordTreatments.find((treatment) => treatment.id === Number(formData.id));
      if (!existingTreatment) {
        break;
      }
      await treatmentsApi.updatePatientRecordTreatment(session!, existingTreatment.id, {
        description: data.description || existingTreatment.attributes.description,
        price: existingTreatment.attributes.medical_treatment.data.attributes.price,
        qty: data.qty ? Number(data.qty) : existingTreatment.attributes.qty,
      });
      break;
    }
    case FormActions.DELETE_SELECTED_TREATMENT: {
      await treatmentsApi.deletePatientRecordTreatment(session!, Number(formData.id));
      break;
    }
    case FormActions.UPDATE_TREATMENT_NOTE: {
      await updatePatientRecord(session!, existingOutpatientData.data.attributes.patient_record.data.id, {
        medical_treatment_note: formData.note as string,
      });
      break;
    }
    case FormActions.CONTINUE: {
      return redirect("/app/outpatients/" + outpatientId + "/recipe");
    }
    case FormActions.BACK: {
      return redirect("/app/outpatients/" + outpatientId + "/soap");
    }
  }
  return json({
    success: true,
  });
};

export default function Treatment() {
  const { treatments, outpatient } = useLoaderData<LoaderData>();
  const outpatientTreatments: PatientRecordMedicalTreatment[] =
    outpatient.attributes.patient_record.data.attributes.patient_record_medical_treatments.data;
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const openSearchDialog = () => {
    setIsSearchDialogOpen(true);
  };
  const closeSearchDialog = () => {
    setIsSearchDialogOpen(false);
  };

  return (
    <>
      <Card className="mt-4">
        <H5>Tindakan</H5>
        {/* <div className="px-4"> */}
        <InputField placeholder="Cari tindakan" type="text" name="search" onClick={openSearchDialog} />
        {/* </div> */}
      </Card>
      <TableContainer className="mt-4">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table className="table-fixed min-w-full">
              <TableHead>
                <TableHeadRow>
                  <TableCol width="30%" style={{ minWidth: 240 }}>
                    Nama
                  </TableCol>
                  <TableCol width="10%" style={{ minWidth: 120 }}>
                    Qty
                  </TableCol>
                  <TableCol width="15%" style={{ minWidth: 120 }}>
                    Total
                  </TableCol>
                  <TableCol style={{ minWidth: 240 }}>Catatan Tindakan</TableCol>
                  <TableCol width="10%">&nbsp;</TableCol>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {outpatientTreatments.length === 0 ? (
                  <TableBodyRow>
                    <TableCol colSpan={4} className="text-center">
                      Tidak ada data. Cari{" "}
                      <span onClick={openSearchDialog} className="font-bold underline cursor-pointer">
                        disini
                      </span>
                    </TableCol>
                  </TableBodyRow>
                ) : null}
                {outpatientTreatments.map((patientRecordTreatment) => (
                  <TreatmentRow key={patientRecordTreatment.id} patientRecordTreatment={patientRecordTreatment} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TableContainer>

      <Card className="mt-4">
        <NoteForm note={outpatient.attributes.patient_record.data.attributes.medical_treatment_note || ""} />
      </Card>
      <Form method="post">
        <div className="w-full justify-center mx-auto inline-flex mt-4">
          <Button color="secondary" variant="outline" name="_action" value={FormActions.BACK}>
            Sebelumnya
          </Button>
          <Button color="primary" name="_action" value={FormActions.CONTINUE}>
            Selanjutnya
          </Button>
        </div>
      </Form>
      <SearchTreatmentDialog open={isSearchDialogOpen} onClose={closeSearchDialog} treatments={treatments} />
    </>
  );
}

const TreatmentRow = (props: { patientRecordTreatment: PatientRecordMedicalTreatment }) => {
  const { patientRecordTreatment: patientRecordInventory } = props;
  const fetcher = useFetcher();
  const qtyFormRef = useRef<HTMLFormElement>(null);
  const descriptionFormRef = useRef<HTMLFormElement>(null);

  return (
    <TableBodyRow key={patientRecordInventory.id}>
      <TableCol className="font-semibold">
        {patientRecordInventory.attributes.medical_treatment.data.attributes.name}
      </TableCol>

      <TableCol>
        <fetcher.Form method="post" ref={qtyFormRef}>
          <input type="hidden" name="id" value={patientRecordInventory.id} />
          <input type="hidden" name="_action" value={FormActions.UPDATE_SELECTED_TREATMENT} />
          <InputField
            name="qty"
            type="number"
            defaultValue={patientRecordInventory.attributes.qty?.toString()}
            onBlur={() => fetcher.submit(qtyFormRef.current)}
          />
        </fetcher.Form>
      </TableCol>
      <TableCol className="text-right">
        {formatIDR(patientRecordInventory.attributes.qty * patientRecordInventory.attributes.price)}
      </TableCol>
      <TableCol>
        <fetcher.Form method="post" ref={descriptionFormRef}>
          <input type="hidden" name="id" value={patientRecordInventory.id} />
          <input type="hidden" name="_action" value={FormActions.UPDATE_SELECTED_TREATMENT} />
          <InputField
            name="description"
            defaultValue={patientRecordInventory.attributes.description}
            onBlur={() => fetcher.submit(descriptionFormRef.current)}
          />
        </fetcher.Form>
      </TableCol>
      <TableCol>
        <fetcher.Form method="post">
          <input type="hidden" name="id" value={patientRecordInventory.id} />
          <Button
            color="error"
            type="submit"
            value={FormActions.DELETE_SELECTED_TREATMENT}
            name="_action"
            iconLeft={<i className="fa-solid fa-trash" />}
          ></Button>
        </fetcher.Form>
      </TableCol>
    </TableBodyRow>
  );
};

const NoteForm = (props: { note: string }) => {
  const fetcher = useFetcher();
  const noteFormRef = useRef<HTMLFormElement>(null);
  return (
    <fetcher.Form method="post" ref={noteFormRef}>
      <input type="hidden" name="_action" value={FormActions.UPDATE_TREATMENT_NOTE} />
      <InputField
        type="textarea"
        name="note"
        label="Catatan"
        defaultValue={props.note}
        onBlur={() => fetcher.submit(noteFormRef.current)}
      />
    </fetcher.Form>
  );
};

const SearchTreatmentDialog = (props: { treatments: MedicalTreatment[]; open: boolean; onClose: () => void }) => {
  const { open, treatments, onClose } = props;
  const fetcher = useFetcher();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInputText, setSearchInputText] = useState("");
  const searchResult = filterTreatments(searchInputText, treatments);

  useEffect(() => {
    if (open) searchInputRef.current?.focus();
    else setSearchInputText("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} title="Pilih Tindakan" maxWidth="lg" fullWidth>
      <DialogContent>
        <InputField
          ref={searchInputRef}
          placeholder="Cari Tindakan"
          name="search"
          autoFocus
          value={searchInputText}
          onChange={(evt) => setSearchInputText(evt.target.value)}
        />
      </DialogContent>

      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          <Table className="table-fixed min-w-full">
            <TableHead>
              <TableHeadRow>
                <TableCol>Nama</TableCol>
                <TableCol>Deskripsi</TableCol>
                <TableCol>Harga</TableCol>
                <TableCol>&nbsp;</TableCol>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {!searchInputText && searchResult.length === 0 && (
                <TableBodyRow>
                  <TableCol colSpan={4} className="text-center">
                    Data kosong
                  </TableCol>
                </TableBodyRow>
              )}
              {!!searchInputText && searchResult.length === 0 && (
                <TableBodyRow>
                  <TableCol colSpan={4} className="text-center">
                    <b>Data tidak ditemukan</b>
                  </TableCol>
                </TableBodyRow>
              )}
              {searchResult.map((treatment) => (
                <TableBodyRow key={treatment.id}>
                  <TableCol>{treatment.attributes.name}</TableCol>
                  <TableCol>{treatment.attributes.description || "-"}</TableCol>
                  <TableCol>{formatIDR(treatment.attributes.price)}</TableCol>
                  <TableCol>
                    <fetcher.Form method="post">
                      <input type="hidden" name="id" value={treatment.id} />
                      <input type="hidden" name="price" value={treatment.attributes.price} />
                      <Button
                        variant="text"
                        type="submit"
                        name="_action"
                        value={FormActions.ADD_TREATMENT}
                        onClick={onClose}
                      >
                        Pilih
                      </Button>
                    </fetcher.Form>
                  </TableCol>
                </TableBodyRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Dialog>
  );
};

function filterTreatments(searchText: string, treatments: MedicalTreatment[]): MedicalTreatment[] {
  if (!searchText) return treatments;
  return treatments.filter((treatment) => {
    return (treatment.attributes.name + treatment.attributes.description || "")
      .toLowerCase()
      .includes(searchText.toLowerCase());
  });
}
