import { Button, ToggleButtons } from '@/components/Button';
import { Field } from '@/components/Field';
import { Pairs } from '@/components/Helpers';
import { Menu } from '@/components/Menu';
import { formatNumber, PrettyNumber } from '@/components/Num';
import { PopoverButton } from '@/components/PopoverButton';
import { Input } from '@/components/Textfield';
import { useSearchParam } from '@/hooks/useSearchParameter';

const DEFAULT_VALUES = {
  capital: 1000,
  risk: 50,
  riskPercent: 5,
  maxLeverage: 25,
  high: 198.38,
  low: 194.46,
  slLevel: 3
};

const STOP_LOSS_LEVELS = [0.236, 0.382, 0.441, 0.5];

const FIB_LEVELS = [0.786, 1, 1.272, 1.618, 2, 2.272, 2.618];

export default function FibPositionSizing() {
  /**
   * Input states, kept in the URL search parameters
   */
  const [capitalState, setCapital] = useSearchParam<number>('capital');
  const [riskState, setRisk] = useSearchParam<number>('risk');
  const [riskIsPercent, setRiskIsPercent] = useSearchParam<boolean | undefined>(
    'rp'
  );
  const [maxLeverageState, setMaxLeverage] = useSearchParam<number>('leverage');
  const [highState, setHigh] = useSearchParam<number>('hi');
  const [lowState, setLow] = useSearchParam<number>('lo');
  const [slLevelState, setSlLevel] = useSearchParam<number>('sl');
  const [isShort, setIsShort] = useSearchParam<boolean>('short');

  /**
   * Fallback to default values if state is undefined.
   */
  const highWithFallback = highState ?? DEFAULT_VALUES.high;
  const lowWithFallback = lowState ?? DEFAULT_VALUES.low;
  const high = Math.max(highWithFallback, lowWithFallback);
  const low = Math.min(highWithFallback, lowWithFallback);
  const capital = capitalState ?? DEFAULT_VALUES.capital;
  const effectiveMaxLeverage = maxLeverageState ?? DEFAULT_VALUES.maxLeverage;
  const slLevel = slLevelState ?? DEFAULT_VALUES.slLevel;

  /**
   * Calculate entry, stop-loss, and take-profit
   */
  const isLong = !isShort;

  const diff = high - low;
  const fib: (lvl: number) => number = isLong
    ? lvl => low + diff * lvl
    : lvl => high - diff * lvl;

  const stopLoss = fib(STOP_LOSS_LEVELS[slLevel]); // 0.5, 0.382
  const entry = fib(0.618);

  /**
   * Risk calculations
   */
  const riskAmount = riskIsPercent
    ? capital *
      ((riskState == null ? DEFAULT_VALUES.riskPercent : riskState) / 100)
    : riskState == null
      ? DEFAULT_VALUES.risk
      : riskState;
  const riskPercent = (riskAmount / capital) * 100;
  const riskUnit = Math.abs(entry - stopLoss);

  /**
   * Position sizing calculations
   */
  const computedPositionSize = riskAmount / riskUnit;
  const maxAllowedPositionSize = (capital * effectiveMaxLeverage) / entry;

  const positionSize = Math.min(computedPositionSize, maxAllowedPositionSize);

  const actualRisk = positionSize * riskUnit;
  const positionValue = entry * positionSize;

  return (
    <div className="flex w-[600px] max-w-full flex-col items-start justify-between gap-7 text-left">
      <h2>Fib position sizing</h2>

      {/* Input Section */}
      <div className="flex w-full flex-col gap-4">
        {/* Capital and Risk Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Capital"
            prefix="$"
            placeholder={DEFAULT_VALUES.capital}
            value={capitalState}
            onChange={setCapital}
            min={0}
            max={100e6}
          />
          <Input
            type="number"
            label="Risk amount"
            prefix={
              <div className="px-1 py-1" tabIndex={-1}>
                <PopoverButton
                  title={riskIsPercent ? '%' : '$'}
                  closeOnPopoverClick
                >
                  <div className="flex flex-col gap-1 p-1">
                    <Button
                      size="sm"
                      {...(riskIsPercent
                        ? { outline: true }
                        : { filled: true })}
                      onClick={() => {
                        if (riskIsPercent) {
                          setRiskIsPercent(undefined);
                          setRisk(riskAmount);
                        }
                      }}
                      tabIndex={-1}
                    >
                      $
                    </Button>
                    <Button
                      size="sm"
                      {...(!riskIsPercent
                        ? { outline: true }
                        : { filled: true })}
                      onClick={() => {
                        if (!riskIsPercent) {
                          setRiskIsPercent(true);
                          setRisk(riskPercent);
                        }
                      }}
                      tabIndex={-1}
                    >
                      %
                    </Button>
                  </div>
                </PopoverButton>
              </div>
            }
            placeholder={
              riskIsPercent ? DEFAULT_VALUES.riskPercent : DEFAULT_VALUES.risk
            }
            value={riskState}
            onChange={setRisk}
            min={0}
            max={capital}
            status={
              riskIsPercent
                ? `≈ $${formatNumber(riskAmount)}`
                : `≈ %${formatNumber(riskPercent)}`
            }
          />
          <Input
            type="number"
            label="Max leverage"
            prefix="X"
            placeholder={DEFAULT_VALUES.maxLeverage}
            value={maxLeverageState}
            onChange={setMaxLeverage}
            min={0}
            max={100e6}
          />
          <Field label="Stop loss">
            {/* <ToggleButtons
              items={STOP_LOSS_LEVELS.map((value, idx) => ({
                label: value.toString(),
                isActive: idx === slLevel,
                onClick: () =>
                  setSlLevel(idx === DEFAULT_VALUES.slLevel ? undefined : idx)
              }))}
            /> */}
            <Menu
              title={`${STOP_LOSS_LEVELS[slLevel]}`}
              options={STOP_LOSS_LEVELS.map((value, idx) => ({
                label: `${value}`,
                value: `${idx}`,
                onClick: () =>
                  setSlLevel(idx === DEFAULT_VALUES.slLevel ? undefined : idx)
              }))}
            />
          </Field>
          <Input
            type="number"
            label="Low"
            prefix="$"
            placeholder={DEFAULT_VALUES.low}
            value={lowState}
            onChange={setLow}
            min={0}
            max={100e6}
          />
          <Input
            type="number"
            label="High"
            prefix="$"
            placeholder={DEFAULT_VALUES.high}
            value={highState}
            onChange={setHigh}
            min={0}
            max={100e6}
          />
          <Field label="Position type">
            <ToggleButtons
              items={[
                {
                  label: 'Long',
                  isActive: isLong,
                  onClick: () => setIsShort(undefined)
                },
                {
                  label: 'Short',
                  isActive: !isLong,
                  onClick: () => setIsShort(true)
                }
              ]}
            />
          </Field>
        </div>
      </div>

      <div className="mx-auto min-w-[50%] rounded-2xl bg-gradient-to-tl from-gray-100 to-zinc-200 px-6 py-4 text-center dark:bg-gradient-to-tl dark:from-slate-600 dark:to-slate-700">
        <h3>Order summary</h3>
        <Pairs
          data={[
            {
              label: 'Entry price',
              content: (
                <PrettyNumber value={entry} prefix="$" decimals={2} strong />
              )
            },
            {
              label: 'Stop loss',
              content: (
                <PrettyNumber value={stopLoss} prefix="$" decimals={2} strong />
              )
            },
            {
              label: 'Leverage',
              content: (
                <PrettyNumber
                  value={positionValue / capital}
                  decimals={2}
                  suffix="X"
                  strong
                />
              )
            },
            {
              label: 'Quantity',
              content: <PrettyNumber value={positionSize} decimals={2} strong />
            }
          ]}
        />
      </div>

      {/* Order Summary Section */}
      <div className="w-full">
        <div className="min-w-full overflow-auto" tabIndex={-1}>
          <table className="mt-4 min-w-full font-bold">
            <thead className="text-center">
              <tr className="border-b border-b-gray-500">
                <th>Fib</th>
                <th>Price</th>
                <th>Profit</th>
                <th>Risk/Reward</th>
              </tr>
            </thead>
            <tbody>
              {FIB_LEVELS.map(level => {
                const lvlProfit = positionSize * Math.abs(fib(level) - entry);

                return (
                  <tr className="text-center">
                    <td>
                      <strong>{level}</strong>
                    </td>
                    <td>
                      <PrettyNumber
                        value={fib(level)}
                        prefix="$"
                        decimals={2}
                        strong
                      />
                    </td>
                    <td>
                      <PrettyNumber
                        value={lvlProfit}
                        prefix="$"
                        strong
                        hiddenIfZero
                      />
                    </td>
                    <td>
                      <PrettyNumber
                        value={lvlProfit / actualRisk}
                        decimals={1}
                        suffix="R"
                        hiddenIfZero
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
