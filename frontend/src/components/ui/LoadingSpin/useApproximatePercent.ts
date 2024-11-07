import { useEffect, useState } from 'react';
import { config } from '@/config';
import { Ms } from '@/util/independent/ms.ts';


export type UsePercentArgs = {
  isSlow?: boolean;
};

const STAGES = {
  default: [
    [50, Ms.second(5)],
    [75, Ms.second(10)],
    [93, Ms.minute()],
  ],
  slow: [
    [50, Ms.second(30)],
    [75, Ms.minute()],
    [93, Ms.minute(4)],
  ],
};

export function useApproximatePercent({ isSlow }: UsePercentArgs): number {
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    const stages = isSlow ? STAGES.slow : STAGES.default;

    let stageIdx = 0;
    let stageStartedAt = Date.now();
    const updatePercent = () => setPercent(() => {
      const now = Date.now();
      const [progressLimitPrev] = stages[stageIdx - 1] ?? [0];
      const [progressLimit, stageTime] = stages[stageIdx] ?? [100, Infinity];

      const stageCompleteness = (now - stageStartedAt) / stageTime;
      const stageSize = progressLimit - progressLimitPrev;
      const next = Math.min(100, progressLimitPrev + stageCompleteness * stageSize);

      if (next >= progressLimit) {
        stageIdx += 1;
        stageStartedAt = now;
      }
      if (next >= 100 || stageTime === Infinity) clearInterval(timeoutId);
      return next;
    });

    updatePercent();
    const timeoutId = setInterval(updatePercent, config.frameTime * (isSlow ? 30 : 5));
    return () => clearInterval(timeoutId);
  }, [isSlow]);

  return percent;
}
