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
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormSheetT } from "@/lib/schemas/formsheetSchema";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";

function NewformSheet() {
  const session = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSheetT>();

  const onSubmit: SubmitHandler<FormSheetT> = (data) => {
    // status, createdById
    console.log({
      status: "open",
      createdById: session.data?.user.id,
      ...data,
      
    });
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
          <form onSubmit={handleSubmit(onSubmit)}>
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
              <Select {...register("callSim")} >
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
              <Input
                {...register("callNumber")}
                placeholder="Call number"
                className="w-full col-span-2 ml-2 p-2 border rounded mb-4"
              />
            </div>
            <Select {...register("customerId")}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">John Doe</SelectItem>
                  <SelectItem value="2">Jane Doe</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
