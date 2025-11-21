import { NativeModules } from "react-native";
import { Buffer } from "buffer";

export default class RNEventSource {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.listeners = {};
    this.closed = false;

    this._connect();
  }

  _connect() {
    fetch(this.url, {
      method: "GET",
      headers: this.options.headers || {
        Accept: "text/event-stream",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("SSE connection failed");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";

        const read = async () => {
          const { value, done } = await reader.read();
          if (done || this.closed) return;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop();

          for (let part of parts) {
            if (part.startsWith("data:")) {
              const data = part.replace("data:", "").trim();
              this._emit("message", { data });
            }
          }

          read();
        };

        read();
      })
      .catch((err) => {
        this._emit("error", err);
      });

    this._emit("open");
  }

  addEventListener(event, callback) {
    this.listeners[event] = callback;
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event](data);
    }
  }

  close() {
    this.closed = true;
  }
}
