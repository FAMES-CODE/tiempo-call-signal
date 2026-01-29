import { MiniChart } from './mini-chart';
import MiniCards from './mini-cards-infos';

function StatisticsCard() {
  return (
    <div className="flex flex-col w-full">
      <MiniCards />
      <MiniChart />
    </div>
  );
}

export default StatisticsCard