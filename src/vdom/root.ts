import { Context } from "../common/types";
import { USER_AGENT, UserAgentFlags } from "../common/user_agent";
import { NOOP } from "../common/noop";
import { nextFrame, syncFrameUpdate } from "../scheduler/frame";
import { SyncFlags } from "./flags";
import { IVNode, getDOMInstanceFromVNode } from "./ivnode";
import { VNode, $t } from "./vnode";
import { renderVNode, syncVNode, removeVNode, augmentVNode, updateComponents } from "./implementation";

/**
 * Root.
 */
export interface Root {
    container: Element;
    currentVNode: IVNode<any> | null;
    currentContext: Context | null;
    newVNode: IVNode<any> | null;
    newContext: Context | null;
    domNode: Node | null;
    invalidated: boolean;
    syncFlags: SyncFlags;
}

export const ROOTS = [] as Root[];

/**
 * Default Context object.
 */
const DEFAULT_CONTEXT: Context = {};

/**
 * Find Root node in container.
 *
 * @param container DOM Node that contains root node.
 * @returns root node or undefined when root node doesn't exist.
 */
export function findRoot(container: Element): Root | undefined {
    for (let i = 0; i < ROOTS.length; i++) {
        const r = ROOTS[i];
        if (r.container === container) {
            return r;
        }
    }

    return;
}

/**
 * Fix for the Mouse Event bubbling on iOS devices.
 *
 * #quirks
 *
 * http://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
 */
function iOSFixEventBubbling(container: Element): void {
    if (USER_AGENT & UserAgentFlags.iOS) {
        (container as HTMLElement).onclick = NOOP;
    }
}

/**
 * Render VNode into container.
 *
 * @param root Root data.
 * @returns rendered Node.
 */
function _render(root: Root): void {
    const currentVNode = root.currentVNode;
    let newVNode = root.newVNode;
    const newContext = root.newContext;

    if (newVNode) {
        if (newVNode.constructor !== VNode) {
            newVNode = $t("");
        }
        if (currentVNode) {
            const syncFlags = root.currentContext === newContext ?
                root.syncFlags :
                root.syncFlags | SyncFlags.DirtyContext;
            syncVNode(root.container, currentVNode, newVNode, root.newContext!, syncFlags);
        } else {
            renderVNode(root.container, null, newVNode!, root.newContext!);
            iOSFixEventBubbling(root.container);
        }
        root.currentVNode = newVNode;
        root.currentContext = newContext;
        root.domNode = getDOMInstanceFromVNode(newVNode);
    } else if (currentVNode) {
        removeVNode(root.container, currentVNode);
        const last = ROOTS.pop();
        if (last !== root && ROOTS.length) {
            ROOTS[ROOTS.indexOf(root)] = last!;
        }
    }

    root.newVNode = null;
    root.newContext = null;
    root.invalidated = false;
    root.syncFlags = 0;
}

/**
 * Render VNode into container.
 *
 * @param node VNode to render.
 * @param container DOM Node that will contain rendered node.
 * @param syncFlags Sync Flags.
 * @param context root context.
 */
export function render(
    node: IVNode<any> | null,
    container: Element,
    syncFlags: SyncFlags = 0,
    context: Context = DEFAULT_CONTEXT,
): void {
    renderNextFrame(node, container, syncFlags, context);
    syncFrameUpdate();
}

/**
 * Render VNode into container on the next frame.
 *
 * @param node VNode to render.
 * @param container DOM Node that will contain rendered node.
 * @param syncFlags Sync Flags.
 * @param context root context.
 */
export function renderNextFrame(
    node: IVNode<any> | null,
    container: Element,
    syncFlags: SyncFlags = 0,
    context: Context = DEFAULT_CONTEXT,
): void {
    if (__IVI_DEV__) {
        if (container === document.body) {
            throw new Error("Rendering in the <body> aren't allowed, create an element inside body that will contain " +
                "your application.");
        }
        if (!document.body.contains(container)) {
            throw new Error("Container element should be attached to the document.");
        }
    }

    let root = findRoot(container);
    if (root) {
        root.newVNode = node;
        root.newContext = context;
    } else {
        root = {
            container: container,
            currentVNode: null,
            currentContext: null,
            newVNode: node,
            newContext: context,
            domNode: null,
            invalidated: false,
            syncFlags: syncFlags,
        };
        ROOTS.push(root);
    }
    if (!root.invalidated) {
        root.invalidated = true;
        nextFrame().write(function () {
            if (root!.invalidated) {
                _render(root!);
            }
        });
    }
}

/**
 * Augment existing DOM tree with a Virtual DOM tree.
 *
 * Augmentation is separated from `render` function to reduce code size when web application doesn't use augmentation.
 * Optimizing javascript compiler should remove all code associated with augmentation when it isn't used.
 *
 * @param node Root VNode.
 * @param container Container DOM Node.
 * @param context root context.
 */
export function augment(
    node: IVNode<any> | null,
    container: Element,
    context: Context = DEFAULT_CONTEXT,
): void {
    if (__IVI_DEV__) {
        if (container === document.body) {
            throw new Error("Rendering in the <body> aren't allowed, create an element inside body that will contain " +
                "your application.");
        }
        if (!document.body.contains(container)) {
            throw new Error("Container element should be attached to the document.");
        }

        if (findRoot(container)) {
            throw new Error("Failed to augment, container is associated with a Virtual DOM.");
        }
    }

    if (node) {
        ROOTS.push({
            container: container,
            currentVNode: node,
            currentContext: context,
            newVNode: null,
            newContext: null,
            domNode: container.firstChild!,
            invalidated: false,
            syncFlags: 0,
        });

        nextFrame().write(function augment() {
            augmentVNode(container, container.firstChild!, node, context);
            iOSFixEventBubbling(container);
        });

        syncFrameUpdate();
    }
}

export function update() {
    for (let i = 0; i < ROOTS.length; i++) {
        const root = ROOTS[i];
        updateComponents(root.container, root.currentVNode!, DEFAULT_CONTEXT);
    }
}
