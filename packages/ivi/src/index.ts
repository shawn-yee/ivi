/**
 * Common types and functions re-exported from ivi-core.
 */
export { KeyCode, KeyLocation, MouseButtons } from "ivi-core";

/**
 * Virtual DOM
 */
export { StatefulComponent, StatelessComponent, Component, isComponentAttached } from "./vdom/component";
export { ConnectDescriptor } from "./vdom/connect_descriptor";
export {
  VNode,
  getDOMInstanceFromVNode, getComponentInstanceFromVNode,
  autofocus, stopDirtyChecking,
} from "./vdom/vnode";
export { fragment, map, mapRange } from "./vdom/vnode_collections";
export { element } from "./vdom/element";
export { statefulComponent, statelessComponent, withShouldUpdate, context, connect } from "./vdom/vnode_factories";

/**
 * API available only in browser environment
 */
export { VNodeFlags } from "./vdom/flags";
export { render, renderNextFrame, update, updateNextFrame } from "./vdom/root";
