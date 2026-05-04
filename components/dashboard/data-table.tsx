"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useForm, SubmitHandler, type Path } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormSheetT } from "@/lib/schemas/formsheetSchema";

function stringAccessorKey<TData>(
  columnDef: ColumnDef<TData, unknown>,
): string | undefined {
  if ("accessorKey" in columnDef) {
    const k = columnDef.accessorKey;
    return typeof k === "string" ? k : undefined;
  }
  return undefined;
}

/** Rows that may expose ownership for edit actions */
type DataTableRow = { id: number; createdById?: number };

interface DataTableProps<TData extends DataTableRow, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends DataTableRow, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { register, handleSubmit } = useForm<FormSheetT>();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  });

  const session = useSession();
  console.log(session);

  if (session.status === "loading") {
    return <div>Loading...</div>;
  }

  const onSubmit: SubmitHandler<FormSheetT> = async (data) => {
    console.log(data);
  };

  const handleResolve = async (id: number) => {
    console.log(id);
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/api/sheets/" + id,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "resolved",
            resolvedAt: new Date(),
            resolvedById: session.data?.user?.id
              ? parseInt(session.data.user.id)
              : undefined,
          }),
        },
      );
      if (!res.ok) {
        console.error("Failed to resolve:", res.status, res.statusText);
        const text = await res.text();
        console.error("Response:", text);
        return;
      }
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter IDs..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {session.data?.user?.id &&
                      parseInt(session.data.user.id) ==
                        row.original.createdById && (
                        <Dialog>
                          <DialogTrigger
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                            )}
                          >
                            Edit
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit</DialogTitle>
                              <DialogDescription>
                                Make changes to the row data here.
                              </DialogDescription>
                            </DialogHeader>
                            <div>
                              <form onSubmit={handleSubmit(onSubmit)}>
                                {row.getVisibleCells().map((cell) => {
                                  const accessorKey = stringAccessorKey(
                                    cell.column.columnDef,
                                  );
                                  if (
                                    accessorKey === "id" ||
                                    accessorKey === "customer.CLIENT" ||
                                    accessorKey === "user.username"
                                  )
                                    return null;
                                  return (
                                    <div
                                      key={cell.id}
                                      className="mb-4 grid w-full items-center gap-2 grid-cols-2"
                                    >
                                      <label className="block text-sm font-medium mb-1">
                                        {flexRender(
                                          cell.column.columnDef.header,
                                          // Header renderer expects header context; label reuses column header from row cell.
                                          cell.getContext() as never,
                                        )}
                                      </label>
                                      {accessorKey === "status" ? (
                                        <Select>
                                          <SelectTrigger className="w-full">
                                            <SelectValue
                                              placeholder={
                                                cell.getValue() as string
                                              }
                                            />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectGroup>
                                              <SelectItem value="pending">
                                                Pending
                                              </SelectItem>
                                              <SelectItem value="resolved">
                                                Resolved
                                              </SelectItem>
                                            </SelectGroup>
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input
                                          defaultValue={
                                            cell.getValue() as string
                                          }
                                          className="w-full"
                                          {...(accessorKey
                                            ? register(
                                                accessorKey as Path<FormSheetT>,
                                              )
                                            : {})}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                                <div className="grid gap-4 ">
                                  <Button size="sm" type="submit">
                                    Save changes
                                  </Button>
                                  <Button
                                    size="sm"
                                    type="submit"
                                    variant={"outline"}
                                    onClick={() =>
                                      handleResolve(row.original.id)
                                    }
                                  >
                                    Set as resolved
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    Delete row
                                  </Button>
                                </div>
                              </form>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
