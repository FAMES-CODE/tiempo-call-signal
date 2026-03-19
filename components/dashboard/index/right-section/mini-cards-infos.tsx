"use client";

import { Separator } from '@/components/ui/separator';
import { PhoneIcon } from 'lucide-react';
import useSWR from "swr";

function MiniCards() {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error } = useSWR(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/stats",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );
  if (error) console.error(error);

  const totalCalls = data ? data.calls.reduce((sum: number, c: any) => sum + c._count.id, 0) : 0;
  const totalResolved = data ? data.resolved.reduce((sum: number, r: any) => sum + r._count.id, 0) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-primary rounded-xl p-4">
        <PhoneIcon className="mb-4 p-2 text-3xl w-12 h-12 bg-accent rounded-xl" />
        <div className="mb-4 flex items-center font-bold gap-4">
          <h1 className="order-2 text-xl">
            Total <br /> call received
          </h1>
          <p className="text-6xl">{totalCalls}</p>
        </div>
        <Separator className="bg-muted-foreground" orientation="horizontal" />
        <div className="flex font-bold gap-4 mt-4 items-center">
          <h1 className="order-2">Cases resolved</h1>
          <p className="text-3xl font-bold">{totalResolved}</p>
        </div>
      </div>
      <div className="bg-chart-2 rounded-xl p-4">
        <PhoneIcon className="mb-4 p-2 text-3xl w-12 h-12 bg-accent rounded-xl" />
        <div className="mb-4 flex items-center font-bold gap-4">
          <h1 className="order-2 text-xl">
            Pending <br /> cases
          </h1>
          <p className="text-6xl">{totalCalls - totalResolved}</p>
        </div>
        <Separator className="bg-muted" orientation="horizontal" />
        <div className="flex font-bold gap-4 mt-4 items-center">
          <h1 className="order-2">Total calls</h1>
          <p className="text-3xl font-bold">{totalCalls}</p>
        </div>
      </div>
    </div>
  );
}

export default MiniCards