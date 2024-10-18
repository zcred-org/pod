import { Divider, Progress, CardBody, Card, CardHeader, CardFooter, Button, cn } from '@nextui-org/react';
import { type ReadonlySignal, batch } from '@preact/signals-react';
import { useEffect, useMemo } from 'react';
import { IconStatusEnum, IconStatus } from '@/components/icons/IconStatus.tsx';
import { computed, signal } from '@/util/signals/signals-dev-tools.ts';


type Props = {
  status: IconStatusEnum;
  redirectURL?: string;
  message?: string;
};

export function VerificationTerminatedCard(props: Props) {
  const redirector = useMemo(() => props.redirectURL ? new Redirector(props.redirectURL, props.status) : null, [props.redirectURL, props.status]);

  useEffect(() => {
    redirector?.restart();
    return redirector?.clear;
  }, [redirector]);

  return (
    <Card
      onMouseEnter={redirector?.clear}
      onMouseLeave={redirector?.restart}
    >
      <CardHeader className="flex flex-col justify-center">
        <IconStatus status={props.status} className="w-24 h-24 mx-auto" />
        <p className="text-xl font-bold">{'Verification '}{props.status === IconStatusEnum.Ok ? 'successful' : 'NOT passed'}</p>
      </CardHeader>
      {props.message && (<>
        <Divider />
        <CardBody className="items-center text-center gap-1">
          <p>{props.message}</p>
        </CardBody>
      </>)}
      <Divider />
      <CardFooter className={cn('flex flex-col items-center text-center', { 'p-0': Boolean(redirector) })}>
        {redirector ? (<>
            <Button
              as="a"
              className="flex flex-col w-full px-2 py-2 h-auto rounded-t-none rounded-b-large !transform-none"
              onClick={redirector.redirect}
              variant="light"
              color="primary"
              href={props.redirectURL}
            >
              {!redirector.$isTicking.value
                ? `Redirect to ${redirector.host}`
                : (<>
                  <span>Redirecting to {redirector.host}...</span>
                  {computed(() => <Progress
                    size="sm"
                    value={redirector.$progressMs.value}
                    minValue={0}
                    maxValue={redirector.totalDelayMs}
                    disableAnimation
                    color="default"
                  />)}
                </>)}
            </Button>
          </>)
          : (
            <p className="text-gray-400">You can close this window</p>
          )}
      </CardFooter>
    </Card>
  );
}

class Redirector {
  readonly host: string;
  readonly totalDelayMs: number;

  #intervalId: ReturnType<typeof setInterval> | undefined;
  readonly #$isRedirected = signal(false);
  readonly #$progressMs = signal(0);
  readonly #$isTicking = signal(false);
  readonly #intervalMs = 1e3 / 60; // 60 FPS

  get $progressMs(): ReadonlySignal<number> {
    return this.#$progressMs;
  }

  get $isTicking(): ReadonlySignal<boolean> {
    return this.#$isTicking;
  }

  constructor(private readonly redirectURL: string, status: IconStatusEnum) {
    this.host = new URL(redirectURL).host;
    this.totalDelayMs = status === IconStatusEnum.Ok ? 1e3 : 3e3;

    this.restart = this.restart.bind(this);
    this.redirect = this.redirect.bind(this);
    this.clear = this.clear.bind(this);
  }

  restart() {
    if (this.#$isRedirected.peek()) return;
    batch(() => {
      this.clear();
      this.#$isTicking.value = true;
    });
    let past = Date.now();
    this.#intervalId = setInterval(() => {
      const now = Date.now();
      this.#$progressMs.value += now - past;
      past = now;
      if (this.#$progressMs.peek() >= this.totalDelayMs) {
        this.redirect();
      }
    }, this.#intervalMs);
  }

  clear() {
    clearInterval(this.#intervalId);
    batch(() => {
      this.#$isTicking.value = false;
      this.#$progressMs.value = -300;
    });
  }

  redirect() {
    this.clear();
    window.location.replace(this.redirectURL);
    this.#$isRedirected.value = true;
  }
}
