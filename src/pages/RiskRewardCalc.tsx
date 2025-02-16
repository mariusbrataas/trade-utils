import { Drawer } from '@/components/Drawer';
import { Input } from '@/components/Textfield';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useState } from 'react';

function round(num: number, places = 2) {
  const mult = Math.pow(10, places);
  return Math.round(num * mult) / mult;
}

function InfoButton() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <button
        className="h-10 w-10 flex-none rounded-full border-1 border-slate-300 p-1 text-lg text-slate-600 transition-colors hover:border-slate-500 hover:text-slate-800"
        onClick={() => setShowInfo(true)}
      >
        ?
      </button>
      {showInfo ? (
        <Drawer onClosed={() => setShowInfo(false)}>
          <Drawer.Content>
            <div className="flex min-h-full flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold">Info</h3>
                <p>
                  Welcome to the <strong>risk-reward-calculator!</strong>
                </p>

                <p>
                  This tool is designed to help you pick a stop-loss and
                  visualize risk when trading.
                </p>
                <p>
                  Simply enter the price you want to buy at, the price you want
                  to cell at, and the risk ratio you prefer. The{' '}
                  <strong>stop-loss</strong> you should use will be calculated.
                </p>
                <p>
                  You can also specify your trading capital and trading fees to
                  get an estimate of the total reward/risk of your trade.
                </p>
              </div>

              <div className="text-center text-sm">
                Made with ❤️ by{' '}
                <a
                  href="https://github.com/mariusbrataas"
                  className="underline"
                >
                  Marius Brataas
                </a>
              </div>
            </div>
          </Drawer.Content>
        </Drawer>
      ) : undefined}
    </>
  );
}

function Calculator() {
  const [buyingPower, setBuyingPower] = useSearchParam<number>('p', 4500);
  const [fee, setFee] = useSearchParam<number>('f', 0.1);

  const [riskRatio, setRiskRatio] = useSearchParam<number>('r', 3);
  const [buyPrice, setBuyPrice] = useSearchParam<number>('b', 24.91);
  const [sellPrice, setSellPrice] = useSearchParam<number>('s', 26.97);

  const stopLossPrice =
    Math.round(
      (riskRatio ? buyPrice - (sellPrice - buyPrice) / riskRatio : 0) * 1000
    ) / 1000;

  let totalStocks = Math.round(buyingPower / buyPrice);
  let totalPrice = totalStocks * buyPrice;
  let totalFee = totalPrice * (fee / 100);

  while (totalPrice + totalFee > buyingPower) {
    totalStocks -= 1;
    totalPrice = totalStocks * buyPrice;
    totalFee = totalPrice * (fee / 100);
  }

  const maxProfit = totalStocks * sellPrice - totalPrice;
  const maxLoss = totalPrice - totalStocks * stopLossPrice;

  return (
    <div className="grid grid-cols-1 gap-2 sm:min-w-[500px] sm:grid-cols-5 sm:gap-6">
      <div className="flex flex-col gap-4 sm:col-span-3">
        <Input
          label="Buy price"
          placeholder="Price per stock"
          type="number"
          value={buyPrice}
          onChange={setBuyPrice}
          step={0.1}
          min={0}
          prefix="$"
        />
        <Input
          label="Sell price"
          placeholder="Price per stock"
          type="number"
          value={sellPrice}
          onChange={setSellPrice}
          status={`Max gain = ${(100 * (sellPrice / buyPrice - 1)).toFixed(2)}%`}
          step={0.1}
          min={0}
          prefix="$"
        />
        <Input
          label="Risk ratio"
          placeholder="Potential gain / potential loss"
          type="number"
          value={riskRatio}
          onChange={setRiskRatio}
          status={[
            `Stop loss = $${round(stopLossPrice, 4)}`,
            `Max loss = ${(100 * (1 - stopLossPrice / buyPrice)).toFixed(2)}%`
          ].join('\n')}
          step={0.25}
          min={0}
        />

        <Input
          label="How much are you buying for?"
          placeholder="Buying power"
          type="number"
          value={buyingPower}
          onChange={setBuyingPower}
          status={`Number of stocks: ${totalStocks}`}
          step={10}
          min={0}
          prefix="$"
        />
        <Input
          label="Trading fee"
          placeholder="Fee in percent"
          type="number"
          value={fee}
          onChange={setFee}
          step={0.1}
          min={0}
          max={100}
          status={`Total fee = $${totalFee}`}
          prefix="%"
        />
      </div>

      <div className="flex min-h-40 flex-col gap-0.5 sm:col-span-2">
        <div
          className="w-full flex-1 content-center rounded-md border-2 border-green-500 bg-green-200 text-center transition-all"
          style={{ flexGrow: riskRatio }}
        >
          <span>Reward </span>
          <span>${round(maxProfit)}</span>
        </div>
        <div
          className="w-full flex-1 content-center rounded-md border-2 border-red-500 bg-red-200 text-center transition-all"
          style={{ flexGrow: 1 }}
        >
          <span>Risk </span>
          <span>${round(maxLoss)}</span>
        </div>
      </div>
    </div>
  );
}

export default function RiskRewardCalc() {
  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-left">Risk reward calc</h2>
        <InfoButton />
      </div>
      <Calculator />
    </>
  );
}
