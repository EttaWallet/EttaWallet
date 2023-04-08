/**
 * @fileOverview adapter for ReactNative TCP module
 * This module mimics the nodejs net api and is intended to work in RN environment.
 * @see https://github.com/Rapsssito/react-native-tcp-socket
 */

import TcpSocket from 'react-native-tcp-socket';
import TcpSockets from 'react-native-tcp-socket/lib/types/Socket';
/**
 * Constructor function. Resulting object has to act as it was a real socket (basically
 * conform to nodejs/net api)
 *
 * @constructor
 */

interface ISocket {
  _socket: TcpSockets | undefined;
  _noDelay: boolean;
  _listeners: {};
  setNoDelay: Function;
  connect: Function;
  _passOnEvent: Function;
  on: Function;
  removeListener: Function;
  end: Function;
  destroy: Function;
  write: Function;
  setTimeout?: Function;
  setEncoding?: Function;
  setKeepAlive?: Function;
}

function Socket(this: ISocket): void {
  this._socket = undefined; // reference to socket that will be created later
  // defaults:
  this._noDelay = true;

  this._listeners = {};

  this.setTimeout = (): void => {};
  this.setEncoding = (): void => {};
  this.setKeepAlive = (): void => {};

  // proxying call to real socket object:
  this.setNoDelay = (noDelay): void => {
    if (this._socket) {
      this._socket.setNoDelay(noDelay);
    }
    this._noDelay = noDelay;
  };

  this.connect = (port, host, callback): void => {
    this._socket = TcpSocket.createConnection(
      {
        port,
        host,
        tls: false,
      },
      callback
    );

    this._socket.on('data', (data): void => {
      this._passOnEvent('data', data);
    });
    this._socket.on('error', (data): void => {
      this._passOnEvent('error', data);
    });
    this._socket.on('close', (data): void => {
      this._passOnEvent('close', data);
    });
    // @ts-ignore
    this._socket.on('connect', (data): void => {
      this._passOnEvent('connect', data);
      if (this._socket) {
        this._socket.setNoDelay(this._noDelay);
      }
    });
    // @ts-ignore
    this._socket.on('connection', (data): void => {
      this._passOnEvent('connection', data);
    });
  };

  this._passOnEvent = (event, data): void => {
    this._listeners[event] = this._listeners[event] || [];
    for (const savedListener of this._listeners[event]) {
      savedListener(data);
    }
  };

  this.on = (event, listener): void => {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(listener);
  };

  this.removeListener = (event, listener): void => {
    this._listeners[event] = this._listeners[event] || [];
    const newListeners = [];

    let found = false;
    for (const savedListener of this._listeners[event]) {
      if (savedListener === listener) {
        // found our listener
        found = true;
        // we just skip it
      } else {
        // other listeners should go back to original array
        // @ts-ignore
        newListeners.push(savedListener);
      }
    }

    if (found) {
      this._listeners[event] = newListeners;
    } else {
      // something went wrong, lets just cleanup all listeners
      this._listeners[event] = [];
    }
  };

  this.end = (): void => {
    if (this._socket) {
      // @ts-ignore
      this._socket.end();
    }
  };

  this.destroy = (): void => {
    if (this._socket) {
      this._socket.destroy();
    }
  };

  this.write = (data): void => {
    if (this._socket) {
      this._socket.write(data);
    }
  };
}

module.exports = {
  Socket,
};
