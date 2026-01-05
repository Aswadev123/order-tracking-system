import { EventEmitter } from "events";

// Extend the global type to include our property
declare global {
  var __ORDER_TRACKING_REALTIME__: Realtime | undefined;
}

class Realtime extends EventEmitter {
  publish(channel: string, payload: any) {
    this.emit(channel, payload);
  }
}

// Singleton instance used by server routes
const realtime = global.__ORDER_TRACKING_REALTIME__ || new Realtime();

// expose globally to avoid multiple instances in dev/hot-reload
if (!global.__ORDER_TRACKING_REALTIME__) {
  global.__ORDER_TRACKING_REALTIME__ = realtime;
}

export default realtime;