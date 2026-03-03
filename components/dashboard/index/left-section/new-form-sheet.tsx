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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormSheetT } from "@/lib/schemas/formsheetSchema";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

function NewformSheet() {
  const session = useSession();
  const [customers, setCustomers] = useState<{ id: number; CLIENT: string }[]>(
    [],
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_BASE_URL + "/api/customers",
        );
        const data = await res.json();
        console.log(res)
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormSheetT>();

  const onSubmit: SubmitHandler<FormSheetT> = async (data) => {
    await createFormSheet(data);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Plus className="w-16 h-16 rounded-lg font-bold text-primary bg-secondary p-4 hover:cursor-pointer hover:bg-secondary/80" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New case</DialogTitle>
          <DialogDescription>
            Fill in the form to create a new case.
          </DialogDescription>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            <Input
              {...register("problemType")}
              placeholder="Problem type"
              className="w-full p-2 border rounded mb-4"
            />
            <Textarea
              {...register("problemDescription")}
              placeholder="Problem description"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="grid grid-cols-3 gap-4">
              <Controller
                control={control}
                name="callSim"
                render={({ field }) => (
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger className="col-span-1">
                      <SelectValue placeholder="Select call sim" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="403">403</SelectItem>
                        <SelectItem value="503">503</SelectItem>
                        <SelectItem value="903">903</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                {...register("callNumber")}
                placeholder="Call number"
                className="w-full col-span-2 ml-2 p-2 border rounded mb-4"
              />
            </div>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.CLIENT}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <Textarea
              {...register("observation")}
              placeholder="Observation"
              className="w-full p-2 border rounded mb-4"
            />
            <Button type="submit">Submit</Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default NewformSheet;
