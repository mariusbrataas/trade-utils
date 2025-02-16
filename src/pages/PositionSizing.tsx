import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Pairs, Strong } from '@/components/Helpers';
import { formatNumber, PrettyNumber } from '@/components/Num';
import { PopoverButton } from '@/components/PopoverButton';
import { Input } from '@/components/Textfield';
import { useSearchParam } from '@/hooks/useSearchParameter';
import { round } from '@/lib/utils';
import { IoMdTrash } from 'react-icons/io';

const DEFAULT_VALUES = {
  entry: 193.67,
  takeProfit: 191.29,
  stopLoss: 193.94,
  capital: 1000,
  riskPercent: 5,
  maxLeverage: 100
};

/**
 * Returns an emoji based on the given risk/reward ratio.
 */
function riskEmoji(rr: number) {
  if (rr >= 10) return '🤑';
  if (rr >= 7) return '🚀';
  if (rr >= 4) return '🔥';
  if (rr >= 3) return '🧐';
  if (rr >= 2.5) return '😬';
  if (rr >= 2) return '💩';
  return '☠️';
}

export default function PositionSizing() {
  /**
   * Input states, kept in the URL search parameters
   */
  const [entryState, setEntry] = useSearchParam<number>('entry');
  const [takeProfitState, setTakeProfit] = useSearchParam<number>('tp');
  const [stopLossState, setStopLoss] = useSearchParam<number>('sl');
  const [capitalState, setCapital] = useSearchParam<number>('capital');
  const [discrete, setDiscrete] = useSearchParam<boolean>('discrete');
  const [riskState, setRisk] = useSearchParam<number>('ra');
  const [riskIsDollars, setRiskIsDollars] = useSearchParam<boolean | undefined>(
    'rd'
  );
  const [maxLeverage, setMaxLeverage] = useSearchParam<number>('ml');
  const [trailingStops, setTrailingStops] = useSearchParam<
    [triggerR: number, lockR: number][]
  >('ts', [
    [2, 0],
    [4, 1]
  ]);

  /**
   * Fallback to default values if state is undefined.
   */
  const entry = entryState ?? DEFAULT_VALUES.entry;
  const takeProfit = takeProfitState ?? DEFAULT_VALUES.takeProfit;
  const stopLoss = stopLossState ?? DEFAULT_VALUES.stopLoss;
  const capital = capitalState ?? DEFAULT_VALUES.capital;
  const effectiveMaxLeverage = maxLeverage ?? DEFAULT_VALUES.maxLeverage;

  const isValid =
    (stopLoss < entry && entry < takeProfit) ||
    (stopLoss > entry && entry > takeProfit);
  const isShort = entry < stopLoss;

  /**
   * Risk calculations
   */
  const riskAmount = riskIsDollars
    ? riskState == null
      ? (DEFAULT_VALUES.riskPercent / 100) * capital
      : riskState
    : capital *
      ((riskState == null ? DEFAULT_VALUES.riskPercent : riskState) / 100);
  const riskPercent = (riskAmount / capital) * 100;
  const riskUnit = Math.abs(entry - stopLoss);

  /**
   * Position sizing calculations
   */
  const computedPositionSize = riskAmount / riskUnit;
  const maxAllowedPositionSize = (capital * effectiveMaxLeverage) / entry;
  const leverageLimitsRisk = computedPositionSize > maxAllowedPositionSize;

  let positionSize = Math.min(computedPositionSize, maxAllowedPositionSize);
  if (discrete) positionSize = Math.floor(positionSize);

  const actualRisk = positionSize * riskUnit;
  const positionValue = entry * positionSize;

  /**
   * Profit and reward calculations
   */
  const potentialWin = Math.abs(positionSize * (takeProfit - entry));
  const riskRewardRatio = Math.abs(takeProfit - entry) / riskUnit;

  return (
    <div className="flex w-[600px] max-w-full flex-col items-start justify-between gap-7 text-left">
      <h2>Position sizing</h2>

      {/* Input Section */}
      <div className="flex w-full flex-col gap-4">
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
                  title={riskIsDollars ? '$' : '%'}
                  closeOnPopoverClick
                >
                  <div className="flex flex-col gap-1 p-1">
                    <Button
                      size="sm"
                      {...(riskIsDollars
                        ? { filled: true }
                        : { outline: true })}
                      onClick={() => {
                        if (!riskIsDollars) {
                          setRiskIsDollars(true);
                          setRisk(riskState == null ? undefined : riskAmount);
                        }
                      }}
                      tabIndex={-1}
                    >
                      $
                    </Button>
                    <Button
                      size="sm"
                      {...(riskIsDollars
                        ? { outline: true }
                        : { filled: true })}
                      onClick={() => {
                        if (riskIsDollars) {
                          setRiskIsDollars(undefined);
                          setRisk(riskState == null ? undefined : riskPercent);
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
            placeholder={formatNumber(
              riskIsDollars
                ? (DEFAULT_VALUES.riskPercent / 100) * capital
                : DEFAULT_VALUES.riskPercent
            )}
            value={riskState}
            onChange={setRisk}
            min={0}
            max={capital}
            status={
              riskIsDollars
                ? `≈ %${formatNumber(riskPercent)}`
                : `≈ $${formatNumber(riskAmount)}`
            }
          />
          <Input
            type="number"
            label="Entry price"
            prefix="$"
            placeholder={DEFAULT_VALUES.entry}
            value={entryState}
            onChange={setEntry}
            min={0}
            max={100e6}
          />
          <Input
            type="number"
            label="Stop-loss"
            prefix="$"
            placeholder={DEFAULT_VALUES.stopLoss}
            value={stopLossState}
            onChange={setStopLoss}
            min={0}
            max={100e6}
          />
          <Input
            type="number"
            label="Take profit"
            prefix="$"
            placeholder={DEFAULT_VALUES.takeProfit}
            value={takeProfitState}
            onChange={setTakeProfit}
            status={`Price change ≈ ${round(Math.abs(((takeProfit - entry) / entry) * 100), 2)}%`}
            min={0}
            max={100e6}
          />
          <Input
            type="number"
            label="Max leverage"
            prefix="X"
            placeholder={DEFAULT_VALUES.maxLeverage}
            value={maxLeverage}
            onChange={setMaxLeverage}
            min={1}
            step={0.1}
          />
        </div>

        <Checkbox
          label="Use discrete units for position size?"
          checked={discrete}
          onChange={setDiscrete}
        />
      </div>

      {/* Summary Section */}
      <div className="mx-auto rounded-2xl bg-gradient-to-tl from-gray-100 to-zinc-200 px-6 py-4 text-center dark:bg-gradient-to-tl dark:from-slate-600 dark:to-slate-700">
        {isValid ? (
          <div className="flex flex-col gap-3">
            <div className="text-xl">
              <div>{`${formatNumber(riskRewardRatio, 1)}R ${riskEmoji(round(riskRewardRatio, 1))}`}</div>
              <div>
                Potential profit ={' '}
                <Strong>
                  <PrettyNumber value={potentialWin} prefix="$" />
                </Strong>
              </div>
            </div>
            {leverageLimitsRisk && (
              <div>
                <em>
                  Note: Due to the <Strong>max leverage limit</Strong>, you are
                  effectively risking{' '}
                  <Strong>
                    <PrettyNumber value={actualRisk} prefix="$" />
                  </Strong>{' '}
                  instead of your full risk amount of{' '}
                  <Strong>
                    <PrettyNumber value={riskAmount} prefix="$" />
                  </Strong>
                  .
                </em>
              </div>
            )}
          </div>
        ) : (
          <div className="text-lg">Check your numbers</div>
        )}
      </div>

      {/* Order Summary Section */}
      <div className="w-full">
        <h3>Position summary</h3>
        <div className="min-w-full overflow-auto" tabIndex={-1}>
          <Pairs
            divide
            data={[
              {
                label: 'Quantity',
                content: (
                  <Strong>
                    <PrettyNumber value={positionSize} />
                  </Strong>
                )
              },
              {
                label: 'Leverage',
                content: (
                  <Strong>
                    <PrettyNumber
                      value={positionValue / capital}
                      decimals={2}
                      suffix="X"
                    />
                  </Strong>
                )
              },
              {
                label: 'Value',
                content: (
                  <Strong>
                    <PrettyNumber value={positionValue} prefix="$" />
                  </Strong>
                )
              }
            ]}
          />
          {/* <Pairs
            divide
            data={[
              {
                label: 'Leverage',
                content: (
                  <Strong>
                    <PrettyNumber
                      value={positionValue / capital}
                      decimals={2}
                      suffix="X"
                    />
                  </Strong>
                )
              },
              {
                label: 'Position',
                content: (
                  <>
                    <div>
                      Size:{' '}
                      <Strong>
                        <PrettyNumber value={positionSize} />
                      </Strong>
                    </div>
                    <div>
                      Value:{' '}
                      <Strong>
                        <PrettyNumber value={positionValue} prefix="$" />
                      </Strong>
                    </div>
                  </>
                )
              },
              {
                label: 'Unleveraged position',
                content: (
                  <>
                    <div>
                      Size:{' '}
                      <Strong>
                        <PrettyNumber value={unleveragedSize} />
                      </Strong>
                    </div>
                    <div>
                      Value:{' '}
                      <Strong>
                        <PrettyNumber value={unleveragedValue} prefix="$" />
                      </Strong>
                    </div>
                  </>
                )
              }
            ]}
          /> */}
        </div>
      </div>

      {/* Trailing Stops Section */}
      <div>
        <h3>Trailing stops</h3>
        <p>
          You can lock partial profits when the price changes beyond a given
          amount of risk units.
        </p>
        {trailingStops.length ? (
          <table>
            <thead>
              <tr>
                <th>Trigger</th>
                <th>Lock</th>
              </tr>
            </thead>
            {trailingStops.map(([triggerR, lockR], idx) => (
              <tbody key={idx}>
                <tr>
                  <td className="w-1/2">
                    <Input
                      id={`trailing-stop-trigger-${idx}`}
                      type="number"
                      placeholder="Trigger"
                      suffix="R"
                      value={triggerR}
                      onChange={newTriggerR => {
                        // Update trigger; ensure lockR does not exceed triggerR.
                        trailingStops[idx] = [
                          newTriggerR!,
                          newTriggerR ? Math.min(newTriggerR, lockR) : lockR
                        ];
                        setTrailingStops([...trailingStops]);
                      }}
                      min={-1}
                      step={0.1}
                      filled
                    />
                  </td>
                  <td className="w-1/2">
                    <Input
                      type="number"
                      placeholder="Lock"
                      suffix="R"
                      value={lockR}
                      onChange={newLockR => {
                        // Update lock; ensure lockR is at least triggerR.
                        trailingStops[idx] = [
                          newLockR ? Math.max(triggerR, newLockR) : triggerR,
                          newLockR!
                        ];
                        setTrailingStops([...trailingStops]);
                      }}
                      min={-1}
                      max={Math.floor(riskRewardRatio * 10) / 10}
                      step={0.1}
                      filled
                    />
                  </td>
                  <td className="w-[1%]">
                    <div className="flex items-center justify-center">
                      <Button
                        tabIndex={-1}
                        gentle
                        onClick={() =>
                          setTrailingStops(
                            trailingStops.filter((_, i) => i !== idx)
                          )
                        }
                        className="hover:bg-red-600 dark:hover:bg-red-600"
                      >
                        <div className="h-6 w-6 p-0.5">
                          <IoMdTrash />
                        </div>
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="text-xs">
                  <td className="content-start pt-0">
                    Trigger =
                    <Strong>
                      <PrettyNumber
                        value={entry + triggerR * (entry - stopLoss)}
                        decimals={10}
                        prefix="$"
                      />
                    </Strong>
                  </td>
                  <td
                    className="flex flex-row flex-wrap gap-x-4 gap-y-0 pt-0"
                    colSpan={2}
                  >
                    <div className="whitespace-nowrap">
                      Limit =
                      <Strong>
                        <PrettyNumber
                          value={entry + lockR * (entry - stopLoss)}
                          decimals={10}
                          prefix="$"
                        />
                      </Strong>
                    </div>
                    <div className="whitespace-nowrap">
                      Change =
                      <Strong>
                        <PrettyNumber
                          value={
                            100 *
                            Math.abs(
                              (entry + lockR * (entry - stopLoss)) / entry - 1
                            )
                          }
                          suffix="%"
                        />
                      </Strong>
                    </div>
                    <div className="whitespace-nowrap">
                      {lockR > 0 ? (
                        <>
                          Min profit =
                          <Strong>
                            <PrettyNumber
                              value={positionSize * (riskUnit * lockR)}
                              prefix="$"
                            />
                          </Strong>
                        </>
                      ) : (
                        <>
                          Max loss =
                          <Strong>
                            <PrettyNumber
                              value={Math.abs(positionSize * riskUnit * lockR)}
                              prefix="$"
                            />
                          </Strong>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        ) : undefined}
        <Button
          filled
          onClick={() => {
            // Compute new trailing stop defaults based on existing stops and riskRewardRatio.
            const triggerR = Math.min(
              Math.floor(riskRewardRatio * 10) / 10,
              Math.max(0, ...trailingStops.map(ts => ts[0])) + 1
            );
            const lockR = Math.min(
              triggerR - 1,
              Math.max(0, ...trailingStops.map(ts => ts[1])) + 1
            );
            setTrailingStops([...trailingStops, [triggerR, lockR]]);
            document
              .getElementById(`trailing-stop-trigger-${trailingStops.length}`)
              ?.focus();
          }}
        >
          Add trailing stop
        </Button>
        <p>
          For example: Lock <Strong>2R</Strong> worth of profit when the price
          goes beyond <Strong>3R</Strong>.<br />
          With the current settings, this would ensure a minimum profit of
          <PrettyNumber prefix="$" value={2 * riskAmount} strong />
          once the price {isShort ? 'falls below' : 'rises above'}
          <PrettyNumber
            value={entry + riskUnit * 2 * (isShort ? -1 : 1)}
            prefix="$"
            strong
          />
        </p>
        <p>
          Keep in mind that setting <Strong>lock</Strong> to a value close to{' '}
          <Strong>trigger</Strong> increases the chance that small price
          movements might trigger the close.
        </p>
        <p>
          <Strong>Hint:</Strong>
          <br />
          Add a trailing stop with <Strong>lock</Strong> set to{' '}
          <Strong>0R</Strong> to reduce risk to
          <PrettyNumber value={0} prefix="$" strong />
          once the price reaches your <Strong>trigger</Strong>.
        </p>
      </div>
    </div>
  );
}
