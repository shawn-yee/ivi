export type OnErrorHook = (error: Error) => void;

export type OnBeforeTestHook = () => void;

export type OnAfterTestHook = () => void;

export interface DevModeHooks {
  /**
   * onError hook is invoked when unhandled exception is thrown.
   */
  onError: OnErrorHook[] | null;
  /**
   * onBeforeTest hook is invoked before each test.
   */
  onBeforeTestHook: OnBeforeTestHook[] | null;
  /**
   * onAfterTest hook is invoked after each test.
   */
  onAfterTestHook: OnAfterTestHook[] | null;
}

export let DEV_HOOKS: DevModeHooks;

if (__IVI_DEV__) {
  DEV_HOOKS = {
    onError: null,
    onBeforeTestHook: null,
    onAfterTestHook: null,
  };
}

export function devModeAddHook<T>(hooks: T[] | null, hook: T): T[] {
  if (hooks === null) {
    hooks = [];
  }
  hooks.push(hook);
  return hooks;
}

export function devModeOnError(e: Error): void {
  if (__IVI_DEV__) {
    if (DEV_HOOKS.onError) {
      for (const hook of DEV_HOOKS.onError) {
        hook(e);
      }
    }
  }
}

export function devModeOnBeforeTest(): void {
  if (__IVI_DEV__) {
    if (DEV_HOOKS.onBeforeTestHook !== null) {
      for (const hook of DEV_HOOKS.onBeforeTestHook) {
        hook();
      }
    }
  }
}

export function devModeOnAfterTest(): void {
  if (__IVI_DEV__) {
    if (DEV_HOOKS.onAfterTestHook !== null) {
      for (const hook of DEV_HOOKS.onAfterTestHook) {
        hook();
      }
    }
  }
}
