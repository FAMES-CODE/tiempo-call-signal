import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import React from 'react'
import NewformSheet from './new-form-sheet';

function SummaryCard() {
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
          <div className=" rounded-lg p-4 bg-primary-foreground mt-4">
            <div className="flex items-center gap-4 ">
              <h1>John Doe</h1>
              <p className="text-sm text-muted-foreground">
                {" "}
                Resolved 2 hours ago
              </p>
            </div>
            <h2 className="text-sm text-muted-foreground">
              Call reason : Technical issue
            </h2>
          </div>
          <div className=" rounded-lg p-4 bg-primary-foreground mt-4">
            <div className="flex items-center gap-4 ">
              <h1>John Doe</h1>
              <p className="text-sm text-muted-foreground">
                {" "}
                Resolved 2 hours ago
              </p>
            </div>
            <h2 className="text-sm text-muted-foreground">
              Call reason : Technical issue
            </h2>
          </div>
          <div className=" rounded-lg p-4 bg-primary-foreground mt-4">
            <div className="flex items-center gap-4 ">
              <h1>John Doe</h1>
              <p className="text-sm text-muted-foreground">
                {" "}
                Resolved 2 hours ago
              </p>
            </div>
            <h2 className="text-sm text-muted-foreground">
              Call reason : Technical issue
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between ">
          <h1 className="text-lg font-semibold">
            Customer waiting for support
          </h1>
          <p className="text-3xl font-bold mt-2">2</p>
        </div>
        <div>
          <div className=" rounded-xl p-4 mt-4 h-24 bg-muted">
             <h1>Jane Doe - <span className="text-sm text-muted-foreground"> Technical issue</span> - <span className="text-sm text-muted-foreground"> 555 5555 555 </span></h1>
              <p className="text-sm text-muted-foreground"> Case opened 2 hours ago by <span className="text-sm text-muted-foreground">John Doe</span></p>
          </div>
          <div className=" rounded-xl p-4 mt-4 h-24 bg-muted">
             <h1>Jane Doe - <span className="text-sm text-muted-foreground"> Technical issue</span> - <span className="text-sm text-muted-foreground"> 555 5555 555 </span></h1>
              <p className="text-sm text-muted-foreground"> Case opened 2 hours ago by <span className="text-sm text-muted-foreground">John Doe</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard