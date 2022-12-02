import { LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { Button } from "~/components/button";
import { Card } from "~/components/common/card";
import { InputField } from "~/components/common/form-elements";
import { PaginationCard } from "~/components/common/pagination-card";
import {
  Table,
  TableBody,
  TableBodyRow,
  TableCol,
  TableContainer,
  TableHead,
  TableHeadRow,
} from "~/components/common/table";
import { H4 } from "~/components/common/typography";
import { getToken } from "~/utils/session.server";
import { inventoryApi } from "~/utils/strapiApi.server";
import { Inventory, StrapiFilterOperators } from "~/utils/strapiApi.types";

type LoaderData = {
  inventories: Inventory[];
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getToken(request);

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const search = url.searchParams.get("query");

  const result = await inventoryApi.getInventories(session!, {
    populate: "*",
    pagination: { pageSize: 10, page: Number(page) },
    filters: {
      name: {
        [StrapiFilterOperators.$contains]: search,
      },
    },
  });

  return {
    inventories: result.data,
    pagination: result.meta?.pagination,
  } as LoaderData;
};

export default function Index() {
  const { inventories, pagination } = useLoaderData<LoaderData>();
  const [_, setSearchParams] = useSearchParams();

  const nextPage = () => {
    if (pagination?.pageCount === pagination?.page) return;

    const nextPage = (pagination?.page || 0) + 1;
    setSearchParams({ page: nextPage.toString() });
  };
  const prevPage = () => {
    if (!pagination || pagination?.page === 1) return;

    const nextPage = pagination.page - 1;
    setSearchParams({ page: nextPage.toString() });
  };

  return (
    <>
      <Card>
        <H4>Inventories</H4>

        <div className="flex flex-row justify-between items-center mt-4">
          <Form>
            <div className="flex flex-row items-center space-x-2">
              <InputField label="" name="query" placeholder="Cari Inventori" />
              <Button color="secondary" iconLeft={<i className="fa-solid fa-search" />}>
                Cari inventori
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      <TableContainer className="mt-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table className="table-fixed min-w-full">
              <TableHead>
                <TableHeadRow>
                  <TableCol>Id</TableCol>
                  <TableCol>Nama</TableCol>
                  <TableCol>Stock</TableCol>
                  <TableCol>Harga</TableCol>
                  <TableCol>&nbsp;</TableCol>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {inventories.map((inventory) => (
                  <TableBodyRow key={inventory.id}>
                    <TableCol>{inventory.id}</TableCol>
                    <TableCol className="font-medium">{inventory.attributes.name}</TableCol>
                    <TableCol>{inventory.attributes.unit_in_stock}</TableCol>
                    <TableCol>{inventory.attributes.price}</TableCol>
                  </TableBodyRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TableContainer>
      {pagination && (
        <PaginationCard
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageItems={inventories.length}
          goToNextPage={nextPage}
          goToPrevPage={prevPage}
          totalItems={pagination.total}
        />
      )}
    </>
  );
}
