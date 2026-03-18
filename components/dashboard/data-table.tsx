"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useForm, SubmitHandler } from "react-hook-form"


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

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { FormSheetT } from "@/lib/schemas/formsheetSchema";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
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

  if (session.status === "loading") {
    return <div>Loading...</div>;
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FormSheetT> = async (data) => {
    console.log(data);
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
                    {session?.data?.user?.id == row.original.createdById && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
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
                                if (
                                  cell.column.columnDef.accessorKey === "id" ||
                                  cell.column.columnDef.accessorKey ===
                                    "customer.CLIENT" ||
                                  cell.column.columnDef.accessorKey ===
                                    "user.username"
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
                                        cell.getContext(),
                                      )}
                                    </label>
                                    {cell.column.columnDef.accessorKey ===
                                    "status" ? (
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
                                        defaultValue={cell.getValue() as string}
                                        className="w-full"
                                        {...register(
                                          cell.column.columnDef.accessorKey,
                                        )}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                              <Button size="sm" type="submit">
                                Save changes
                              </Button>
                            </form>
                          </div>
                          <DialogFooter className="grid grid-cols-2 ">
                            <Button variant="destructive" size="sm">
                              Delete row
                            </Button>
                          </DialogFooter>
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
