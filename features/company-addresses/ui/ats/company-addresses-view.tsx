"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { EntityFormSheet } from "@/components/form/entity-form-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppDispatch } from "@/lib/hooks/redux";
import { useResourceCrud } from "@/lib/hooks/use-resource-crud";
import {
  type CompanyAddress,
  type CompanyAddressInput,
  companyAddressSchema,
} from "@/features/company-addresses/schema";
import {
  createCompanyAddress,
  deleteCompanyAddress,
  updateCompanyAddress,
} from "@/lib/store/companyAddressesSlice";
import { useCompanyAddresses } from "@/features/company-addresses/hooks";
import { companyAddressesColumns } from "./company-addresses-columns";
import { CompanyAddressForm } from "./company-address-form";
import { CompanyAddressDetailsDialog } from "./company-address-details-dialog";

const EMPTY: CompanyAddressInput = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state_province: "",
  postal_code: "",
  country: "",
  latitude: "",
  longitude: "",
};

export function CompanyAddressesView() {
  const dispatch = useAppDispatch();
  const [viewing, setViewing] = useState<CompanyAddress | null>(null);
  const {
    data,
    total,
    pages,
    loading,
    error,
    saving,
    query,
    setPage,
    setSize,
    setSearch,
    toggleSort,
    refetch,
  } = useCompanyAddresses();

  const crud = useResourceCrud<CompanyAddress>({
    singular: "Location",
    save: (body, editing) =>
      editing
        ? dispatch(updateCompanyAddress({ id: editing.id, body })).unwrap()
        : dispatch(createCompanyAddress(body)).unwrap(),
    remove: (item) => dispatch(deleteCompanyAddress(item.id)).unwrap(),
    onChanged: refetch,
  });

  const form = useForm<CompanyAddressInput>({
    resolver: zodResolver(companyAddressSchema),
    values: crud.editing
      ? {
          label: crud.editing.label,
          line1: crud.editing.line1,
          line2: crud.editing.line2 ?? "",
          city: crud.editing.city,
          state_province: crud.editing.state_province ?? "",
          postal_code: crud.editing.postal_code ?? "",
          country: crud.editing.country,
          latitude: crud.editing.latitude ?? "",
          longitude: crud.editing.longitude ?? "",
        }
      : EMPTY,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await crud.submit({
      label: values.label,
      line1: values.line1,
      line2: values.line2 || null,
      city: values.city,
      state_province: values.state_province || null,
      postal_code: values.postal_code || null,
      country: values.country,
      latitude: values.latitude ? Number(values.latitude) : null,
      longitude: values.longitude ? Number(values.longitude) : null,
    });
    if (ok) form.reset();
  });

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Company addresses assigned to job posts."
        actions={
          <Button onClick={crud.openCreate}>
            <Plus /> New location
          </Button>
        }
      />

      <DataTableToolbar
        search={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search locations…"
      />

      <DataTable
        columns={companyAddressesColumns(crud.openEdit)}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        sort={query.sort}
        onToggleSort={toggleSort}
        onRowClick={setViewing}
        emptyMessage="No locations yet."
      />

      <DataTablePagination
        page={query.page}
        size={query.size}
        total={total}
        pages={pages}
        onPageChange={setPage}
        onSizeChange={setSize}
        isLoading={loading}
      />

      <EntityFormSheet
        open={crud.sheetOpen}
        onOpenChange={crud.setSheetOpen}
        title={crud.editing ? "Edit location" : "New location"}
        onSubmit={onSubmit}
        isSubmitting={saving || crud.busy}
      >
        <CompanyAddressForm form={form} />
        {crud.editing ? (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="destructive" size="sm">
                <Trash2 /> Delete location
              </Button>
            }
            title="Delete this location?"
            description="Job posts using it will block the delete."
            destructive
            confirmLabel="Delete"
            onConfirm={() => crud.remove(crud.editing!)}
          />
        ) : null}
      </EntityFormSheet>

      <CompanyAddressDetailsDialog
        address={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        onEdit={(address) => {
          setViewing(null);
          crud.openEdit(address);
        }}
      />
    </div>
  );
}
