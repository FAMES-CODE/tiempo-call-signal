"use client";

import React from "react";
import { Search, Users, PhoneCall, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CustomerCall = {
  id: number;
  status: string;
  problemType: string | null;
  createdAt: string;
};

type Customer = {
  id: number;
  CLIENT: string;
  CODE_CLIENT: string;
  CONTACT: string | null;
  TEL: string | null;
  EMAIL: string | null;
  ADRESSE: string | null;
  COMMUNE: string | null;
  WILAYA: string | null;
  NOTES: string | null;
  _count: {
    callSheets: number;
  };
  callSheets: CustomerCall[];
};

function Page() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<Customer | null>(null);

  const fetchCustomers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/api/customers",
      );
      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data: Customer[] = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = React.useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return customers;
    return customers.filter((customer) =>
      [
        customer.CLIENT,
        customer.CODE_CLIENT,
        customer.CONTACT ?? "",
        customer.TEL ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [customers, query]);

  const totalCalls = React.useMemo(
    () =>
      customers.reduce((sum, customer) => sum + customer._count.callSheets, 0),
    [customers],
  );

  const totalResolved = React.useMemo(
    () =>
      customers.reduce(
        (sum, customer) =>
          sum +
          customer.callSheets.filter((call) => call.status === "resolved")
            .length,
        0,
      ),
    [customers],
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Search and review customer profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">Total customers</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">Total calls</p>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCalls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">Resolved calls</p>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalResolved}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, code, contact, or phone..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading customers...
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const resolvedCount = customer.callSheets.filter(
                        (call) => call.status === "resolved",
                      ).length;
                      return (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.CODE_CLIENT}</TableCell>
                          <TableCell className="font-medium">
                            {customer.CLIENT}
                          </TableCell>
                          <TableCell>{customer.CONTACT || "-"}</TableCell>
                          <TableCell>{customer.TEL || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {customer._count.callSheets} total
                              </Badge>
                              <Badge>{resolvedCount} resolved</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger
                                render={
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedCustomer(customer)
                                    }
                                  >
                                    View
                                  </Button>
                                }
                              />

                              <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Customer information
                                  </DialogTitle>
                                  <DialogDescription>
                                    Details and recent activity for this
                                    customer.
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCustomer && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <InfoItem
                                        label="Name"
                                        value={selectedCustomer.CLIENT}
                                      />
                                      <InfoItem
                                        label="Code"
                                        value={selectedCustomer.CODE_CLIENT}
                                      />
                                      <InfoItem
                                        label="Contact"
                                        value={selectedCustomer.CONTACT || "-"}
                                      />
                                      <InfoItem
                                        label="Phone"
                                        value={selectedCustomer.TEL || "-"}
                                      />
                                      <InfoItem
                                        label="Email"
                                        value={selectedCustomer.EMAIL || "-"}
                                      />
                                      <InfoItem
                                        label="Location"
                                        value={
                                          [
                                            selectedCustomer.COMMUNE,
                                            selectedCustomer.WILAYA,
                                          ]
                                            .filter(Boolean)
                                            .join(", ") || "-"
                                        }
                                      />
                                    </div>
                                    <div className="rounded-md border p-3">
                                      <p className="text-sm font-medium mb-2">
                                        Address
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedCustomer.ADRESSE || "-"}
                                      </p>
                                    </div>
                                    <div className="rounded-md border p-3">
                                      <p className="text-sm font-medium mb-2">
                                        Recent calls
                                      </p>
                                      <div className="space-y-2">
                                        {selectedCustomer.callSheets.length ===
                                        0 ? (
                                          <p className="text-sm text-muted-foreground">
                                            No calls for this customer.
                                          </p>
                                        ) : (
                                          selectedCustomer.callSheets.map(
                                            (call) => (
                                              <div
                                                key={call.id}
                                                className="flex items-center justify-between text-sm"
                                              >
                                                <span>
                                                  {call.problemType ||
                                                    "No problem type"}
                                                </span>
                                                <Badge variant="outline">
                                                  {call.status}
                                                </Badge>
                                              </div>
                                            ),
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default Page;
