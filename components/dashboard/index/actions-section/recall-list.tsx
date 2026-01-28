import React from 'react'
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function RecallList() {
  return (
    <Dialog>
      <form>
        <DialogTrigger className={"w-full text-left "}>
          <div className="w-full p-4 text-left  border rounded-md hover:cursor-pointer hover:bg-secondary">
            Recall list
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              <h1>Recall list</h1>
            </DialogTitle>
            <DialogDescription>List of person to recall</DialogDescription>
          </DialogHeader>
          <div>
             Empty
          </div>
          <DialogFooter>
            <DialogClose>
              <div>Cancel</div>
            </DialogClose>
            
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default RecallList