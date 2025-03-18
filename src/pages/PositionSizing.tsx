import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Drawer } from '@/components/Drawer';
import { Pairs, Strong } from '@/components/Helpers';
import { formatNumber, PrettyNumber } from '@/components/Num';
import { PopoverButton } from '@/components/PopoverButton';
import { Input } from '@/components/Textfield';
import { useSearchParam } from '@/hooks/useSearchParameter';
import { round } from '@/lib/utils';

const DEFAULT_VALUES = {
  entry: 193.67,
  takeProfit: 191.29,
  stopLoss: 193.94,
  capital: 1000,
  riskPercent: 5,
  maxLeverage: 100,
  trailingStopPrice: 2,
  trailingStopLock: 0
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
  const [trailingStopPriceState, setTrailingStopPrice] =
    useSearchParam<number>('tsprice');
  const [trailingStopLockState, setTrailingStopLock] =
    useSearchParam<number>('tslock');

  /**
   * Fallback to default values if state is undefined.
   */
  const entry = entryState ?? DEFAULT_VALUES.entry;
  const takeProfit = takeProfitState ?? DEFAULT_VALUES.takeProfit;
  const stopLoss = stopLossState ?? DEFAULT_VALUES.stopLoss;
  const capital = capitalState ?? DEFAULT_VALUES.capital;
  const effectiveMaxLeverage = maxLeverage ?? DEFAULT_VALUES.maxLeverage;
  const trailingStopPrice =
    trailingStopPriceState ?? DEFAULT_VALUES.trailingStopPrice;
  const trailingStopLock =
    trailingStopLockState ?? DEFAULT_VALUES.trailingStopLock;

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
      <div className="flex w-full flex-1 flex-row items-center justify-between">
        <h2>Position sizing</h2>
        <InfoButton />
      </div>

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
            filled
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
            filled
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
            filled
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
            filled
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
            filled
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
            filled
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
                Potential profit =
                <PrettyNumber value={potentialWin} prefix="$" strong />
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
        </div>
      </div>

      {/* Trailing Stops Section */}
      <div>
        <h3>Trailing stop</h3>
        <p>
          You can lock partial profits when the price changes beyond a given
          amount of risk units.
        </p>

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
          <Strong>Hint:</Strong>
          <br />
          Add a trailing stop with <Strong>lock</Strong> set to{' '}
          <Strong>0R</Strong> to reduce risk to
          <PrettyNumber value={0} prefix="$" strong />
          once the price reaches your <Strong>trigger</Strong>.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              type="number"
              label="Trigger price"
              placeholder={DEFAULT_VALUES.trailingStopPrice}
              suffix="R"
              value={trailingStopPriceState}
              onChange={setTrailingStopPrice}
              min={-1}
              step={0.1}
              filled
            />
            <div className="text-xs">
              <div>
                Trigger =
                <Strong>
                  <PrettyNumber
                    value={entry + trailingStopPrice * (entry - stopLoss)}
                    decimals={10}
                    prefix="$"
                  />
                </Strong>
              </div>
            </div>
          </div>
          <div>
            <Input
              type="number"
              label="Lock profit"
              placeholder={DEFAULT_VALUES.trailingStopLock}
              suffix="R"
              value={trailingStopLockState}
              onChange={setTrailingStopLock}
              min={-1}
              max={Math.floor(riskRewardRatio * 10) / 10}
              step={0.1}
              filled
            />
            <div className="text-xs">
              <div>
                Limit =
                <Strong>
                  <PrettyNumber
                    value={entry + trailingStopLock * (entry - stopLoss)}
                    decimals={10}
                    prefix="$"
                  />
                </Strong>
              </div>
              <div>
                Change =
                <Strong>
                  <PrettyNumber
                    value={
                      100 *
                      Math.abs(
                        (entry + trailingStopLock * (entry - stopLoss)) /
                          entry -
                          1
                      )
                    }
                    suffix="%"
                  />
                </Strong>
              </div>
              <div>
                {trailingStopLock > 0 ? (
                  <>
                    Min profit =
                    <Strong>
                      <PrettyNumber
                        value={positionSize * (riskUnit * trailingStopLock)}
                        prefix="$"
                      />
                    </Strong>
                  </>
                ) : (
                  <>
                    Max loss =
                    <Strong>
                      <PrettyNumber
                        value={Math.abs(
                          positionSize * riskUnit * trailingStopLock
                        )}
                        prefix="$"
                      />
                    </Strong>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <p>
          Keep in mind that setting <Strong>lock</Strong> to a value close to{' '}
          <Strong>trigger</Strong> increases the chance that small price
          movements might trigger the close.
        </p>
      </div>
    </div>
  );
}

function InfoButton() {
  const [show, setShow] = useSearchParam<boolean>('i');
  return (
    <>
      <button
        className="h-10 w-10 flex-none rounded-full border-1 border-slate-300 p-1 text-lg text-slate-600 transition-colors hover:border-slate-500 hover:text-slate-800 dark:text-slate-500"
        onClick={() => setShow(true)}
      >
        ?
      </button>
      {show ? (
        <Drawer onClosed={() => setShow(undefined)}>
          <Drawer.Content>
            <div>
              <h2 className="mb-4">
                Position Sizing Calculator – How It Works
              </h2>

              <p>
                This tool helps you determine the optimal number of asset units
                to trade based on your risk preferences and market entry
                parameters. It’s designed to assist in managing risk by ensuring
                that the amount you risk is appropriate relative to your trading
                capital.
              </p>

              <h3>Risk Management</h3>
              <p>
                First, input your <Strong>capital</Strong> and the{' '}
                <Strong>risk amount</Strong> (as a dollar value or a percentage)
                to set your maximum risk per trade. Then, enter your{' '}
                <Strong>entry price</Strong> and <Strong>stop-loss</Strong> to
                define the “risk unit” – the absolute difference between these
                prices. Your <Strong>position size</Strong> is calculated by
                dividing your risk amount by the risk unit, which tells you how
                many units you can trade safely.
              </p>

              <h3>Leverage Considerations</h3>
              <p>
                The calculator factors in your chosen{' '}
                <Strong>max leverage</Strong> to ensure that your position size
                doesn’t exceed what your capital and leverage allow. If you opt
                for <Strong>discrete units</Strong>, the computed position size
                will be rounded down to a whole number.
              </p>

              <h3>Reward Insights</h3>
              <p>
                The tool estimates your <Strong>potential profit</Strong> based
                on the difference between your entry and take profit prices and
                computes a <Strong>risk/reward ratio</Strong>.
              </p>

              <h3>Trailing Stop</h3>
              <p>
                An additional utility to help you calculate levels at which to
                lock in partial profits as the market moves in your favor by
                dynamically adjusting your stop-loss. Set your{' '}
                <Strong>Trigger Price</Strong> in risk multiples (R) to define
                when the trailing stop should activate, and define the{' '}
                <Strong>Lock Profit</Strong> level (also in R) to secure part of
                your gains once the trigger is hit.
              </p>

              <h3>Additional Information</h3>
              <p>
                Always double-check your inputs to ensure they reflect your
                intended trade parameters. Remember, this calculator is a tool
                for visualizing risk and sizing positions—it does not guarantee
                profitable trades, as trading inherently involves risk.
              </p>
              <p>
                <Strong>Disclaimer:</Strong> This tool is for educational
                purposes only and should not be considered financial advice.
                Always do your own research.
              </p>

              <p>Happy Trading!</p>
            </div>

            <div className="mt-6 text-center text-sm">
              Made with ❤️ by{' '}
              <a href="https://github.com/mariusbrataas" className="underline">
                Marius Brataas
              </a>
            </div>
          </Drawer.Content>
        </Drawer>
      ) : undefined}
    </>
  );
}
