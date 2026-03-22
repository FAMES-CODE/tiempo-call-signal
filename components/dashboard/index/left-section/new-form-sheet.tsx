"use client";

import createFormSheet from "@/app/actions/form-sheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  FormSheetFormSchema,
  type FormSheetFormValues,
} from "@/lib/schemas/formsheetSchema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClipboardList,
  Headphones,
  Loader2,
  Phone,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";

const LINE_OPTIONS = [
  { value: "905", label: "905" },
  { value: "503", label: "503" },
  { value: "903", label: "903" },
] as const;

type CustomerOption = { id: number; CLIENT: string };

function NewformSheet() {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSheetFormValues>({
    resolver: zodResolver(FormSheetFormSchema),
    defaultValues: {
      problemType: "",
      problemDescription: "",
      callSim: "",
      callNumber: "",
      customerId: 0,
      observation: "",
    },
  });

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/customers`,
      );
      if (!res.ok) throw new Error("Failed to load customers");
      const data: CustomerOption[] = await res.json();
      setCustomers(data);
    } catch (e) {
      console.error(e);
      toast.error("Could not load customers. Try again.");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.CLIENT.toLowerCase().includes(q) || String(c.id).includes(q),
    );
  }, [customers, customerQuery]);

  const onSubmit: SubmitHandler<FormSheetFormValues> = async (data) => {
    const result = await createFormSheet({
      status: "pending",
      problemType: data.problemType,
      problemDescription: data.problemDescription,
      callSim: data.callSim,
      callNumber: data.callNumber,
      customerId: data.customerId,
      observation: data.observation?.trim() || undefined,
    });

    if (result.success) {
      toast.success("Call sheet created successfully.");
      reset();
      setCustomerQuery("");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          void loadCustomers();
        } else {
          setCustomerQuery("");
        }
      }}
    >
      <DialogTrigger 
        render={
          <Button
            type="button"
            variant="default"
            size="lg"
            className={cn(
              "gap-2 rounded-xl p-6 shadow-md transition-all",
              "text-primary-foreground hover:bg-primary/90",
              "hover:shadow-lg active:scale-[0.98]",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
              <Plus className="size-5" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="flex flex-col items-start text-left leading-tight">
              <span className="text-sm font-semibold">New call sheet</span>
              <span className="text-xs font-normal text-primary-foreground/80">
                Log a support case
              </span>
            </span>
          </Button>
        }
      />

      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="border-b bg-gradient-to-br from-primary/12 via-background to-chart-2/10 px-6 pb-4 pt-6">
          <DialogHeader className="gap-1 text-left">
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Headphones className="size-6" aria-hidden />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              New call sheet
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Capture who called, from which line, and what they need—so your
              team can follow up quickly.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex max-h-[min(70vh,560px)] flex-col"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="problemType">Problem type</FieldLabel>
                <FieldDescription>
                  Short label (e.g. billing, outage, installation).
                </FieldDescription>
                <Input
                  id="problemType"
                  placeholder="e.g. Network outage"
                  autoComplete="off"
                  className={cn(errors.problemType && "border-destructive")}
                  {...register("problemType")}
                />
                {errors.problemType?.message && (
                  <FieldError>{errors.problemType.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="problemDescription">
                  What happened?
                </FieldLabel>
                <FieldDescription>
                  Enough detail for the next person to understand the case.
                </FieldDescription>
                <Textarea
                  id="problemDescription"
                  placeholder="Describe the issue, steps tried, urgency…"
                  rows={4}
                  className={cn(
                    "min-h-[100px] resize-y",
                    errors.problemDescription && "border-destructive",
                  )}
                  {...register("problemDescription")}
                />
                {errors.problemDescription?.message && (
                  <FieldError>{errors.problemDescription.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            <Separator />

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Phone className="size-4 text-muted-foreground" aria-hidden />
                Call details
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,120px)_1fr]">
                <Field>
                  <FieldLabel htmlFor="callSim">Line</FieldLabel>
                  <Controller
                    control={control}
                    name="callSim"
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="callSim"
                          className={cn(errors.callSim && "border-destructive")}
                          aria-invalid={!!errors.callSim}
                        >
                          <SelectValue placeholder="SIM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {LINE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.callSim?.message && (
                    <FieldError>{errors.callSim.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="callNumber">Caller number</FieldLabel>
                  <Input
                    id="callNumber"
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. 0555 12 34 56"
                    className={cn(errors.callNumber && "border-destructive")}
                    {...register("callNumber")}
                  />
                  {errors.callNumber?.message && (
                    <FieldError>{errors.callNumber.message}</FieldError>
                  )}
                </Field>
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <UserRound
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                Customer
              </div>
              <Field>
                <FieldLabel htmlFor="customer-search">Find customer</FieldLabel>
                <FieldDescription>
                  Search by name or ID, then pick the account below.
                </FieldDescription>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customer-search"
                    placeholder="Type to filter…"
                    className="pl-9"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    disabled={loadingCustomers}
                    autoComplete="off"
                  />
                </div>
              </Field>

              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <Field className="mt-3">
                    <FieldLabel htmlFor="customerId">Account</FieldLabel>
                    <Select
                      value={field.value > 0 ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={loadingCustomers || customers.length === 0}
                    >
                      <SelectTrigger
                        id="customerId"
                        className={cn(
                          "w-full",
                          errors.customerId && "border-destructive",
                        )}
                        aria-invalid={!!errors.customerId}
                      >
                        <SelectValue
                          placeholder={
                            loadingCustomers
                              ? "Loading customers…"
                              : "Select a customer"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectGroup>
                          {filteredCustomers.length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                              {customers.length === 0 && !loadingCustomers
                                ? "No customers in the database."
                                : "No matches. Try another search."}
                            </div>
                          ) : (
                            filteredCustomers.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                <span className="font-mono text-xs text-muted-foreground">
                                  #{c.id}
                                </span>{" "}
                                {c.CLIENT}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.customerId?.message && (
                      <FieldError>{errors.customerId.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>

            <Separator />

            <Field>
              <FieldLabel htmlFor="observation">
                Notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <FieldDescription>
                Internal notes—visible to your team on the call sheet.
              </FieldDescription>
              <Textarea
                id="observation"
                placeholder="Anything else worth remembering…"
                rows={3}
                className="resize-y"
                {...register("observation")}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ClipboardList className="size-3.5 shrink-0" aria-hidden />
              Saved as{" "}
              <span className="font-medium text-foreground">pending</span> until
              resolved.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px] gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Create call sheet"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewformSheet;
