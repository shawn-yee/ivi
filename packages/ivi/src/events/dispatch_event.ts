import { OpState } from "../vdom/state";
import { DispatchTarget } from "./dispatch_target";
import { EventHandlerFlags } from "./event_handler";
import { SyntheticEvent } from "./synthetic_event";

export const enum DispatchEventDirective {
  StopPropagation = 1,
}

/**
 * dispatchEventToTarget dispatches event to `DispatchTarget`.
 *
 * @param target Dispatch target.
 * @param event Event to dispatch.
 * @param dispatch Dispatch handler.
 */
export function dispatchEventToTarget<E extends SyntheticEvent>(
  target: DispatchTarget,
  event: E,
  dispatch: (target: DispatchTarget, ev: E) => DispatchEventDirective,
): DispatchEventDirective {
  event.node = target.t as OpState;
  return dispatch(target, event);
}

/**
 * dispatchEvent dispatches event to the list of dispatch targets.
 *
 * Simplified version of w3 Events flow algorithm. This algorithm doesn't include target phase, only capture and
 * bubbling phases. We don't care too much about w3 events compatibility, and there aren't any use cases that require
 * target phase.
 *
 * https://www.w3.org/TR/DOM-Level-3-Events/#event-flow
 *
 * @param targets Dispatch targets.
 * @param event Event to dispatch.
 * @param bubble Use bubbling phase.
 * @param dispatch Dispatch handler.
 */
export function dispatchEvent<E extends SyntheticEvent>(
  targets: DispatchTarget[],
  event: E,
  bubble: boolean,
  dispatch: (target: DispatchTarget, ev: E) => DispatchEventDirective,
): void {
  let target;
  let i = targets.length;

  // capture phase
  while (--i >= 0) {
    target = targets[i];
    if ((target.h.d.flags & EventHandlerFlags.Capture) !== 0) {
      if ((dispatchEventToTarget(target, event, dispatch) & DispatchEventDirective.StopPropagation) !== 0) {
        return;
      }
    }
  }

  // bubble phase
  if (bubble) {
    while (++i < targets.length) {
      target = targets[i];
      if ((target.h.d.flags & EventHandlerFlags.Bubble) !== 0) {
        if ((dispatchEventToTarget(target, event, dispatch) & DispatchEventDirective.StopPropagation) !== 0) {
          return;
        }
      }
    }
  }
}
