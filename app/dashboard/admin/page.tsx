"use client";
import { FirebirdToSQLiteSync } from "@/app/jobs/databases/databse-jobs";
import { Button } from "@/components/ui/button";
import React from "react";

function Page() {
  const handleSync = async () => {
    try {
      FirebirdToSQLiteSync();
    } catch (error) {
      console.error("Error syncing customers:", error);
    }
  };
  return (
    <div>
      <Button onClick={handleSync}>Sync customers from firebird DB</Button>
    </div>
  );
}

export default Page;
