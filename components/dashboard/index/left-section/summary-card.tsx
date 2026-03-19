"use client";
import { Calendar } from "lucide-react";
import React, { useEffect } from "react";
import NewformSheet from "./new-form-sheet";
import { Badge } from "@/components/ui/badge";

function SummaryCard() {
  const [cases, setCases] = React.useState([]);
  const fetchCases = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL + "/api/sheets",
    );
    const data = await res.json();
    setCases(data);
  };
  useEffect(() => {
    try {
      fetchCases();
    } catch (error) {
      console.log(error);
    }
  }, []);
  
  return (
    <div className="flex flex-col w-full gap-4 bg-sidebar rounded-xl">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Last case resolved :{" "}
            {new Date(Date.now() - 1000 * 60 * Number()).toLocaleString()}
          </p>
        </div>
        <NewformSheet />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-lg font-semibold">
          <h1>Last cases resolved</h1>
          <Calendar
            className="inline-block ml-2 mb-1 w-6 h-6 text-primary"
            size={16}
          />
        </div>
        <div>
          {cases.map((c: any) => {
            if (c.status === "resolved")
              return (
                <div className=" rounded-lg p-4 bg-primary-foreground mt-4">
                  <div className="flex items-center gap-4 ">
                    <h1>{c.customer.CLIENT}</h1>
                    <p className="text-sm text-muted-foreground">
                      {" "}
                      Resolved{" "}
                      {Math.floor(
                        Math.abs(Date.now() - new Date(c.updatedAt).getTime()) / 36e5,
                      ) / 60}{" "}
                      hours ago by{" "}
                      <span className="text-sm text-muted-foreground">
                        {c.user.username}{" "}
                      </span>
                    </p>
                  </div>
                  <h2 className="text-sm text-muted-foreground">
                    Call reason :  {c.problemType}
                  </h2>
                </div>
              );
          })}
          {cases.filter((c: any) => c.status === "resolved").length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              No cases resolved yet
            </p>
          )}
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between ">
          <h1 className="text-lg font-semibold">
            Customer waiting for support
          </h1>
          <p className="text-3xl font-bold mt-2">
            {cases.filter((c: any) => c.status === "pending").length}
          </p>
        </div>
        <div>
          {cases.map((c: any) => {
            if (c.status === "pending")
              return (
                <div className=" rounded-xl p-4 mt-4 h-24 bg-muted" key={c.id}>
                  <h1>
                    {c.customer.CLIENT} -{" "}
                    <span className="text-sm text-muted-foreground">
                      {c.problemType}
                    </span>{" "}
                    -{" "}
                    <span className="text-sm text-muted-foreground">
                      {c.callNumber}
                    </span>
                    -{" "}
                    <Badge className="text-sm" variant="outline">
                      {c.callSim}
                    </Badge>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    Case opened {c.createdAt.split("T")[0]} ago by{" "}
                    <span className="text-sm text-muted-foreground">
                      {c.user.username}{" "}
                    </span>
                  </p>
                </div>
              );
          })}
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;
