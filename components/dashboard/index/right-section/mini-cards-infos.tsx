import { Separator } from '@/components/ui/separator';
import { PhoneIcon } from 'lucide-react';

function MiniCards() {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-primary rounded-xl p-4">
        <PhoneIcon className="mb-4 p-2 text-3xl w-12 h-12 bg-accent rounded-xl" />
        <div className="mb-4 flex items-center font-bold gap-4">
          <h1 className="order-2 text-xl">
            Total <br /> call received
          </h1>
          <p className="text-6xl">256</p>
        </div>
        <Separator className="bg-muted-foreground" orientation="horizontal" />
        <div className="flex font-bold gap-4 mt-4 items-center">
          <h1 className="order-2">Cases resolved</h1>
          <p className="text-3xl font-bold">128</p>
        </div>
      </div>
      <div className="bg-chart-2 rounded-xl p-4">
        <PhoneIcon className="mb-4 p-2 text-3xl w-12 h-12 bg-accent rounded-xl" />
        <div className="mb-4 flex items-center font-bold gap-4">
          <h1 className="order-2 text-xl">
            Total <br /> call received
          </h1>
          <p className="text-6xl">256</p>
        </div>
        <Separator className="bg-muted" orientation="horizontal" />
        <div className="flex font-bold gap-4 mt-4 items-center">
          <h1 className="order-2">Cases resolved</h1>
          <p className="text-3xl font-bold">128</p>
        </div>
      </div>
    </div>
  );
}

export default MiniCards