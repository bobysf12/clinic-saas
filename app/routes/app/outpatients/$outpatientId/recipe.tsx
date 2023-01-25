import { useMatches } from "@remix-run/react";
import {
  Table,
  TableBody,
  TableBodyRow,
  TableCol,
  TableContainer,
  TableHead,
  TableHeadRow,
} from "~/components/common/table";
import { InputField } from "~/components/common/form-elements";
import { H5 } from "~/components/common/typography";
import { OutPatient } from "~/utils/strapiApi.types";
import { Button } from "~/components/button";
import Select from "react-select";

export default function Recipe() {
  const matches = useMatches();

  const data = matches.find((match) => match.id.includes("/outpatients/$outpatientId"));
  const outpatient: OutPatient = data!.data.outpatient;
  return (
    <>
      <TableContainer className="mt-4">
        <H5 className="p-4">Resep</H5>
        <div className="px-4 grid grid-cols-[minmax(0,_1fr)_200px_200px] gap-2 items-center">
          <Select name="selected_drugs" placeholder="Cari obat" options={[{}]} />
          <InputField type="number" name="" placeholder="Qty" />
          <div>
            <Button color="secondary">Tambah</Button>
          </div>
        </div>
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table className="table-fixed min-w-full">
              <TableHead>
                <TableHeadRow>
                  <TableCol>Obat</TableCol>
                  <TableCol>Qty</TableCol>
                  <TableCol>Catatan</TableCol>
                  <TableCol>&nbsp;</TableCol>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {outpatient.attributes.patient_record.data.attributes.patient_record_inventories.data.map(
                  (patientRecordInventory) => (
                    <TableBodyRow key={patientRecordInventory.id}>
                      <TableCol>{patientRecordInventory.attributes.inventory.data.attributes.name}</TableCol>
                      <TableCol>
                        <InputField
                          name=""
                          type="number"
                          defaultValue={patientRecordInventory.attributes.qty?.toString()}
                        />
                      </TableCol>
                      <TableCol>
                        <InputField name="" defaultValue={patientRecordInventory.attributes.description} />
                      </TableCol>
                      <TableCol>
                        <Button color="error">Hapus</Button>
                      </TableCol>
                    </TableBodyRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="p-4">
          <InputField type="text" name="" label="Catatan" />
        </div>
      </TableContainer>
    </>
  );
}
