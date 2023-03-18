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
import { getInventories } from "~/services/inventory.service";
import * as outpatientService from "~/services/outpatient.service";
import * as patientRecordService from "~/services/patientrecord.service";
import { formatIDR } from "~/utils/number";
import { getOrgId, getToken } from "~/utils/session.server";
import { Inventory, PatientRecordInventory } from "~/utils/strapiApi.types";

type LoaderData = {
  drugs: Inventory[];
  patientRecordDrugs: PatientRecordInventory[];
  patientRecordDrugNote: string;
};
export const loader: LoaderFunction = async ({ request, params }): Promise<LoaderData> => {
  const token = await getToken(request);
  const { outpatientId } = params;

  const outpatientData = await outpatientService.getOutpatient(token!, Number(outpatientId));
  const patientRecordDrugs =
    outpatientData.data.attributes.patient_record.data.attributes.patient_record_inventories.data;
  const patientRecordDrugNote = outpatientData.data.attributes.patient_record.data.attributes.drug_recipe_note;
  const drugs = await getInventories(request);

  return {
    drugs: drugs.data,
    patientRecordDrugs: patientRecordDrugs,
    patientRecordDrugNote,
  };
};

enum FormActions {
  ADD_DRUG = "ADD_DRUG",
  UPDATE_SELECTED_DRUG = "UPDATE_SELECTED_DRUG",
  DELETE_SELECTED_DRUG = "DELETE_SELECTED_DRUG",
  UPDATE_NOTE = "UPDATE_NOTE",
  DONE = "DONE",
  BACK = "BACK",
}

const createDrugSchema = z.object({
  id: z.coerce.number(),
  price: z.coerce.number(),
  qty: z.coerce.number().default(1),
  description: z.string().optional(),
});
const updateDrugSchema = z.object({
  id: z.coerce.number(),
  price: z.coerce.number().optional(),
  qty: z.coerce.number().optional(),
  description: z.string().optional(),
});

export const action: ActionFunction = async ({ request, params }) => {
  const token = await getToken(request);
  const orgId = await getOrgId(request);
  const { outpatientId } = params;
  const { _action, ...formData } = Object.fromEntries(await request.formData());
  switch (_action) {
    case FormActions.ADD_DRUG: {
      const data = createDrugSchema.parse(formData);
      const outpatientData = await outpatientService.getOutpatient(token!, Number(outpatientId));
      await outpatientService.addPatientRecordDrug(token!, {
        description: data.description || "",
        doctor: outpatientData.data.attributes.doctor.data.id,
        inventory: data.id,
        organization: orgId!,
        patient: outpatientData.data.attributes.patient.data.id,
        patient_record: outpatientData.data.attributes.patient_record.data.id,
        price: data.price,
        qty: data.qty,
      });
      break;
    }
    case FormActions.UPDATE_SELECTED_DRUG: {
      const data = updateDrugSchema.parse(formData);
      const existingPatientRecordInventory = await outpatientService.getPatientRecordDrug(token!, data.id);
      if (!existingPatientRecordInventory) break;

      await outpatientService.updatePatientRecordDrug(token!, data.id, {
        description: data.description || existingPatientRecordInventory.data.attributes.description,
        price: data.price || existingPatientRecordInventory.data.attributes.price,
        qty: data.qty || existingPatientRecordInventory.data.attributes.qty,
      });
      break;
    }
    case FormActions.UPDATE_NOTE: {
      const patientRecord = await outpatientService.getPatientRecordByOutpatientId(token!, Number(outpatientId));
      if (!patientRecord) {
        break;
      }
      await patientRecordService.updatePatientRecord(token!, patientRecord.id, {
        drug_recipe_note: formData.note as string,
      });
      break;
    }
    case FormActions.DELETE_SELECTED_DRUG: {
      await outpatientService.deletePatientRecordDrug(token!, Number(formData.id));
      break;
    }
    case FormActions.DONE: {
      return redirect("/app/outpatients/" + outpatientId + "/recipe");
    }
    case FormActions.BACK: {
      return redirect("/app/outpatients/" + outpatientId + "/treatment");
    }
    default:
      break;
  }
  return json({ success: true });
};

export default function Recipe() {
  const fetcher = useFetcher();
  const { drugs, patientRecordDrugs, patientRecordDrugNote } = useLoaderData<LoaderData>();
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
        <H5>Resep Obat</H5>

        <InputField placeholder="Cari obat" type="text" name="search" onClick={openSearchDialog} />
      </Card>
      <TableContainer className="mt-4">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table className="table-fixed min-w-full">
              <TableHead>
                <TableHeadRow>
                  <TableCol>Obat</TableCol>
                  <TableCol>Qty</TableCol>
                  <TableCol>Harga</TableCol>
                  <TableCol>Catatan</TableCol>
                  <TableCol>&nbsp;</TableCol>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {patientRecordDrugs.length === 0 ? (
                  <TableBodyRow>
                    <TableCol colSpan={4} className="text-center">
                      Tidak ada data. Cari{" "}
                      <span onClick={openSearchDialog} className="font-bold underline cursor-pointer">
                        disini
                      </span>
                    </TableCol>
                  </TableBodyRow>
                ) : null}
                {patientRecordDrugs.map((drug) => (
                  <TableBodyRow key={drug.id}>
                    <TableCol>{drug.attributes.inventory.data.attributes.name}</TableCol>
                    <TableCol>
                      <InputField
                        name="qty"
                        type="number"
                        defaultValue={drug.attributes.qty?.toString()}
                        onBlur={(evt) =>
                          fetcher.submit(
                            {
                              id: drug.id.toString(),
                              qty: evt.target.value,
                              _action: FormActions.UPDATE_SELECTED_DRUG,
                            },
                            { method: "post" }
                          )
                        }
                      />
                    </TableCol>
                    <TableCol>{formatIDR(drug.attributes.qty * drug.attributes.price)}</TableCol>
                    <TableCol>
                      <InputField
                        name="description"
                        defaultValue={drug.attributes.description}
                        onBlur={(evt) =>
                          fetcher.submit(
                            {
                              id: drug.id.toString(),
                              description: evt.target.value,
                              _action: FormActions.UPDATE_SELECTED_DRUG,
                            },
                            { method: "post" }
                          )
                        }
                      />
                    </TableCol>
                    <TableCol>
                      <Button
                        color="error"
                        onClick={() =>
                          fetcher.submit(
                            {
                              id: drug.id.toString(),
                              _action: FormActions.DELETE_SELECTED_DRUG,
                            },
                            { method: "post" }
                          )
                        }
                      >
                        Hapus
                      </Button>
                    </TableCol>
                  </TableBodyRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TableContainer>
      <Card className="mt-4">
        <InputField
          type="textarea"
          name="note"
          label="Catatan"
          defaultValue={patientRecordDrugNote}
          onBlur={(evt: any) =>
            fetcher.submit(
              {
                note: evt.target.value,
                _action: FormActions.UPDATE_NOTE,
              },
              { method: "post" }
            )
          }
        />
      </Card>
      <Form method="post">
        <div className="w-full justify-center mx-auto inline-flex mt-4">
          <Button color="secondary" variant="outline" name="_action" value={FormActions.BACK}>
            Sebelumnya
          </Button>
          <Button color="primary" name="_action" value={FormActions.DONE}>
            Selesai
          </Button>
        </div>
      </Form>
      <SearchTreatmentDialog open={isSearchDialogOpen} onClose={closeSearchDialog} drugs={drugs} />
    </>
  );
}

const SearchTreatmentDialog = (props: { drugs: Inventory[]; open: boolean; onClose: () => void }) => {
  const { open, drugs, onClose } = props;
  const fetcher = useFetcher();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchInputText, setSearchInputText] = useState("");
  const searchResult = filterDrugs(searchInputText, drugs);

  useEffect(() => {
    if (open) searchInputRef.current?.focus();
    else setSearchInputText("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <InputField
          ref={searchInputRef}
          placeholder="Cari obat"
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
              {searchResult.map((drug) => (
                <TableBodyRow key={drug.id}>
                  <TableCol>{drug.attributes.name}</TableCol>
                  <TableCol>{drug.attributes.description || "-"}</TableCol>
                  <TableCol>{formatIDR(drug.attributes.price)}</TableCol>
                  <TableCol>
                    <fetcher.Form method="post">
                      <input type="hidden" name="id" value={drug.id} />
                      <input type="hidden" name="price" value={drug.attributes.price} />
                      <Button
                        variant="text"
                        type="submit"
                        name="_action"
                        value={FormActions.ADD_DRUG}
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
function filterDrugs(searchText: string, drugs: Inventory[]): Inventory[] {
  if (!searchText) return drugs;
  return drugs.filter((drug) => {
    return (drug.attributes.name + drug.attributes.description || "").toLowerCase().includes(searchText.toLowerCase());
  });
}
