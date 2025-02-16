import { Pairs, Strong } from '@/components/Helpers';
import { PrettyNumber } from '@/components/Num';
import { Input } from '@/components/Textfield';
import { useSearchParam } from '@/hooks/useSearchParameter';

const DEFAULT_VALUES = {
  entry: 100,
  takeProfit: 120,
  stopLoss: 90,
  capital: 1000,
  riskPercent: 5, // 5% risk of capital
  leverage: 10,
  dipBuy1: 95,
  dipBuy2: 85
};

export default function DipBuyCalculator() {
  // Use search parameters (or local state) for each input.
  const [entryState, setEntry] = useSearchParam<number>('entry');
  const [takeProfitState, setTakeProfit] = useSearchParam<number>('tp');
  const [stopLossState, setStopLoss] = useSearchParam<number>('sl');
  const [capitalState, setCapital] = useSearchParam<number>('capital');
  const [riskPercentState, setRiskPercent] = useSearchParam<number>('risk');
  const [leverageState, setLeverage] = useSearchParam<number>('lev');
  const [dipBuy1State, setDipBuy1] = useSearchParam<number>('dip1');
  const [dipBuy2State, setDipBuy2] = useSearchParam<number>('dip2');

  // Fallback to default values if nothing is in the URL.
  const entry = entryState ?? DEFAULT_VALUES.entry;
  const takeProfit = takeProfitState ?? DEFAULT_VALUES.takeProfit;
  const stopLoss = stopLossState ?? DEFAULT_VALUES.stopLoss;
  const capital = capitalState ?? DEFAULT_VALUES.capital;
  const riskPercent = riskPercentState ?? DEFAULT_VALUES.riskPercent;
  const leverage = leverageState ?? DEFAULT_VALUES.leverage;
  const dipBuy1 = dipBuy1State ?? DEFAULT_VALUES.dipBuy1;
  const dipBuy2 = dipBuy2State ?? DEFAULT_VALUES.dipBuy2;

  // Determine trade direction.
  // For a long trade, stopLoss is below entry; for a short trade, stopLoss is above entry.
  const isLong = entry > stopLoss;
  const isShort = entry < stopLoss;

  // Risk calculations.
  const riskAmount = (capital * riskPercent) / 100;
  const riskUnit = Math.abs(entry - stopLoss);
  let qMain = riskAmount / riskUnit;

  // Apply a leverage limit: maximum allowed position value = capital * leverage.
  const maxPosition = (capital * leverage) / entry;
  if (qMain > maxPosition) {
    qMain = maxPosition;
  }

  // Expected profit from the main order (if takeProfit is hit).
  const profitMain = isLong
    ? qMain * (takeProfit - entry)
    : qMain * (entry - takeProfit);

  // Calculate dip orders so that a recovery “earns back” an extra profit equal to profitMain.
  let qDip1 = 0;
  let qDip2 = 0;
  if (isLong) {
    // For a long trade, dip orders are below entry.
    if (entry > dipBuy1) {
      qDip1 = profitMain / (entry - dipBuy1);
    }
    if (dipBuy1 > dipBuy2) {
      qDip2 = profitMain / (dipBuy1 - dipBuy2);
    }
  } else if (isShort) {
    // For a short trade, dip orders are above entry.
    if (dipBuy1 > entry) {
      qDip1 = profitMain / (dipBuy1 - entry);
    }
    if (dipBuy2 > dipBuy1) {
      qDip2 = profitMain / (dipBuy2 - dipBuy1);
    }
  }

  // Calculate the expected loss from each dip order.
  // For a long trade: loss = quantity * (dip price - stopLoss).
  // For a short trade: loss = quantity * (stopLoss - dip price).
  let expectedLossDip1 = 0;
  let expectedLossDip2 = 0;
  if (qDip1 > 0) {
    expectedLossDip1 = isLong
      ? qDip1 * (dipBuy1 - stopLoss)
      : qDip1 * (stopLoss - dipBuy1);
  }
  if (qDip2 > 0) {
    expectedLossDip2 = isLong
      ? qDip2 * (dipBuy2 - stopLoss)
      : qDip2 * (stopLoss - dipBuy2);
  }

  // --- Potential Profit Scenarios ---
  //
  // For a long trade:
  //  • Main Order only: Profit = profitMain.
  //  • Main Order + Dip Buy 1 triggered: if price recovers from dipBuy1 to entry, dip order profit = profitMain,
  //    and additional profit if takeProfit is reached = qDip1*(takeProfit - dipBuy1).
  //  • All Orders triggered: additional profit from dipBuy2 recovery (from dipBuy2 to dipBuy1) = profitMain.
  //
  // (For a short trade, the formulas are mirrored.)
  const totalProfitWithDip1AtTP = isLong
    ? profitMain + qDip1 * (takeProfit - dipBuy1)
    : profitMain + qDip1 * (dipBuy1 - takeProfit);

  const totalProfitWithBothAtTP = isLong
    ? profitMain +
      qDip1 * (takeProfit - dipBuy1) +
      qDip2 * (takeProfit - dipBuy2)
    : profitMain +
      qDip1 * (dipBuy1 - takeProfit) +
      qDip2 * (dipBuy2 - takeProfit);

  return (
    <div className="flex w-[600px] max-w-full flex-col gap-7 text-left">
      <h2>Dip Buy Calculator</h2>

      {/* Input Section */}
      <div className="flex flex-col gap-4">
        {/* Price Inputs */}
        <div className="flex flex-wrap gap-2">
          <Input
            type="number"
            label="Entry Price"
            prefix="$"
            value={entryState}
            onChange={setEntry}
          />
          <Input
            type="number"
            label="Take Profit Price"
            prefix="$"
            value={takeProfitState}
            onChange={setTakeProfit}
          />
          <Input
            type="number"
            label="Stop Loss Price"
            prefix="$"
            value={stopLossState}
            onChange={setStopLoss}
          />
        </div>

        {/* Capital, Risk, Leverage */}
        <div className="flex flex-wrap gap-2">
          <Input
            type="number"
            label="Capital"
            prefix="$"
            value={capitalState}
            onChange={setCapital}
          />
          <Input
            type="number"
            label="Risk (%)"
            suffix="%"
            value={riskPercentState}
            onChange={setRiskPercent}
          />
          <Input
            type="number"
            label="Leverage"
            prefix="X"
            value={leverageState}
            onChange={setLeverage}
          />
        </div>

        {/* Dip Buy Price Inputs */}
        <div className="flex flex-wrap gap-2">
          <Input
            type="number"
            label="Dip Buy 1 Price"
            prefix="$"
            value={dipBuy1State}
            onChange={setDipBuy1}
          />
          <Input
            type="number"
            label="Dip Buy 2 Price"
            prefix="$"
            value={dipBuy2State}
            onChange={setDipBuy2}
          />
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="mx-auto rounded bg-gray-100 px-6 py-4 dark:bg-slate-600">
        <h3>Order Quantities &amp; Expected Loss</h3>
        <Pairs
          divide
          data={[
            {
              label: 'Main Order',
              content: (
                <>
                  <div>
                    Quantity:{' '}
                    <Strong>
                      <PrettyNumber value={qMain} />
                    </Strong>
                  </div>
                  <div>
                    Expected Loss:{' '}
                    <Strong>
                      <PrettyNumber value={qMain * riskUnit} prefix="$" />
                    </Strong>
                  </div>
                </>
              )
            },
            {
              label: 'Dip Buy 1',
              content: (
                <>
                  <div>
                    Quantity:{' '}
                    <Strong>
                      <PrettyNumber value={qDip1} />
                    </Strong>
                  </div>
                  <div>
                    Expected Loss:{' '}
                    <Strong>
                      <PrettyNumber value={expectedLossDip1} prefix="$" />
                    </Strong>
                  </div>
                </>
              )
            },
            {
              label: 'Dip Buy 2',
              content: (
                <>
                  <div>
                    Quantity:{' '}
                    <Strong>
                      <PrettyNumber value={qDip2} />
                    </Strong>
                  </div>
                  <div>
                    Expected Loss:{' '}
                    <Strong>
                      <PrettyNumber value={expectedLossDip2} prefix="$" />
                    </Strong>
                  </div>
                </>
              )
            }
          ]}
        />
      </div>

      {/* Profit Summary Section */}
      <div className="mx-auto rounded bg-gray-100 px-6 py-4 dark:bg-slate-600">
        <h3>Potential Profit Scenarios</h3>
        {isLong ? (
          <>
            <div>
              <em>Main Order only:</em>{' '}
              <Strong>
                <PrettyNumber value={profitMain} prefix="$" />
              </Strong>{' '}
              if price goes from entry to take profit.
            </div>
            <div>
              <em>Main Order + Dip Buy 1 triggered:</em> if the dip order
              recovers from {dipBuy1} to entry, it “earns back”{' '}
              <Strong>
                <PrettyNumber value={profitMain} prefix="$" />
              </Strong>
              ; if take profit is reached, total profit becomes{' '}
              <Strong>
                <PrettyNumber value={totalProfitWithDip1AtTP} prefix="$" />
              </Strong>
              .
            </div>
            <div>
              <em>All Orders triggered:</em> if Dip Buy 2 recovers from{' '}
              {dipBuy2} to {dipBuy1}, you get another{' '}
              <Strong>
                <PrettyNumber value={profitMain} prefix="$" />
              </Strong>
              ; if take profit is reached, total profit becomes{' '}
              <Strong>
                <PrettyNumber value={totalProfitWithBothAtTP} prefix="$" />
              </Strong>
              .
            </div>
          </>
        ) : (
          <>
            <div>
              <em>Main Order only:</em>{' '}
              <Strong>
                <PrettyNumber value={profitMain} prefix="$" />
              </Strong>{' '}
              if price goes from entry to take profit.
            </div>
            <div>
              <em>Main Order + Dip Buy 1 triggered:</em> if the dip order
              recovers from {dipBuy1} to entry, it “earns back”{' '}
              <Strong>
                <PrettyNumber value={profitMain} prefix="$" />
              </Strong>
              ; if take profit is reached, total profit becomes{' '}
              <Strong>
                <PrettyNumber value={totalProfitWithDip1AtTP} prefix="$" />
              </Strong>
              .
            </div>
            <div>
              <em>All Orders triggered:</em> if Dip Buy 2 recovers from{' '}
              {dipBuy2} to {dipBuy1}, you get another{' '}
              <Strong>
                <PrettyNumber value={profitMain} prefix="$" />
              </Strong>
              ; if take profit is reached, total profit becomes{' '}
              <Strong>
                <PrettyNumber value={totalProfitWithBothAtTP} prefix="$" />
              </Strong>
              .
            </div>
          </>
        )}
      </div>
    </div>
  );
}
