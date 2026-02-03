import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Timeline from "@/components/ui/customs/timeline";
import React from "react";

function Page() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="col-span-1">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-16 h-16 mb-4">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <h1>John Doe</h1>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 bg-muted m-4 rounded-lg p-4">
          <div className="flex flex-col items-center  text-center space-y-2 border-r pr-4">
            <h1>Total calls</h1>
            <span> 12</span>
          </div>
          <div className="flex flex-col items-center  text-center space-y-2">
            <h1>Resolved</h1>
            <span> 12</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2 border-l pl-4">
            <h1>Unresolved</h1>
            <span>0</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-2">
          <div className="flex gap-2 items-center">
            <h1 className="font-bold">Address : </h1>
            <p className="text-sm">123 Main St, Cityville</p>
          </div>
          <div className="flex gap-2 items-center">
            <h1 className="font-bold">Phone : </h1>
            <p className="text-sm">+1 234 567 890</p>
          </div>
          <div className="flex gap-2 items-center">
            <h1 className="font-bold">Latest call : </h1>
            <p className="text-sm">2024-06-15 14:30</p>
          </div>
        </CardFooter>
      </Card>
      <Card className="col-span-3 p-4">
        <h1 className="text-2xl font-bold mb-4">Customer history</h1>
        <div className="flex flex-col items-start">
            <Timeline index={1} title="Support" by="Support Team" date="2024-06-15 14:30" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
            <Timeline index={2} title="Support" by="Support Team" date="2024-06-15 14:30" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
        </div>
      </Card>
    </div>
  );
}

export default Page;
