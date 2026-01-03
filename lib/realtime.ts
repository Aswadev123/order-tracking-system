import { EventEmitter } from "events";

class Realtime extends EventEmitter {
  publish(channel: string, payload: any) {
    this.emit(channel, payload);
  }
}

// Singleton instance used by server routes
const realtime = global.__ORDER_TRACKING_REALTIME__ as Realtime || new Realtime();
// expose globally to avoid multiple instances in dev/hot-reload
if (!global.__ORDER_TRACKING_REALTIME__) (global as any).__ORDER_TRACKING_REALTIME__ = realtime;

export default realtime;
