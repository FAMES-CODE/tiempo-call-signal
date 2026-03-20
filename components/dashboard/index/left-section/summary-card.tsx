"use client";
import { Calendar } from "lucide-react";
import React, { useEffect } from "react";
import NewformSheet from "./new-form-sheet";
import { Badge } from "@/components/ui/badge";

type CaseItem = {
  id: number;
  status: string;
  updatedAt: string;
  createdAt: string;
  problemType: string;
  callNumber: string;
  callSim: string;
  customer: {
    CLIENT: string;
  };
  user: {
    username: string;
  };
};

function SummaryCard() {
  const [cases, setCases] = React.useState<CaseItem[]>([]);
  const [currentTime, setCurrentTime] = React.useState(() => Date.now());
  const fetchCases = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL + "/api/sheets",
    );
    const data: CaseItem[] = await res.json();
    setCases(data);
  };
  useEffect(() => {
    try {
      fetchCases();
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const resolvedCases = cases.filter((c) => c.status === "resolved");
  const pendingCases = cases.filter((c) => c.status === "pending");
  const latestResolvedCase = resolvedCases.reduce<CaseItem | null>((latest, c) => {
    if (!latest) return c;
    return new Date(c.updatedAt).getTime() > new Date(latest.updatedAt).getTime()
      ? c
      : latest;
  }, null);

  const getHoursAgo = (isoDate: string) =>
    Math.max(0, Math.floor((currentTime - new Date(isoDate).getTime()) / 36e5));

  return (
    <div className="flex flex-col w-full gap-4 bg-sidebar rounded-xl">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Last case resolved :{" "}
            {latestResolvedCase
              ? new Date(latestResolvedCase.updatedAt).toLocaleString()
              : "No resolved case yet"}
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
          {resolvedCases.map((c) => {
            if (c.status === "resolved")
              return (
                <div className=" rounded-lg p-4 bg-primary-foreground mt-4" key={c.id}>
                  <div className="flex items-center gap-4 ">
                    <h1>{c.customer.CLIENT}</h1>
                    <p className="text-sm text-muted-foreground">
                      {" "}
                      Resolved{" "}
                      {getHoursAgo(c.updatedAt)}{" "}
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
          {resolvedCases.length === 0 && (
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
            {pendingCases.length}
          </p>
        </div>
        <div>
          {pendingCases.map((c) => {
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
