# Development Mode Extensions

ivi provides a series of hooks that available in Development Mode, extensions can attach to this hooks and implement
additional functionality.

```ts
type OnErrorHook = (error: Error) => void;

type OnComponentCreatedHook = (instance: Component<any>) => void;

type OnComponentDisposedHook = (instance: Component<any>) => void;

interface DevModeHooks {
    onError: OnErrorHook[] | null;
    onComponentCreated: OnComponentCreatedHook[] | null;
    onComponentDisposed: OnComponentDisposedHook[] | null;
}
```

If you have an interesting idea for an extension that needs more hooks, just let us know and they will be added.