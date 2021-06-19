'use strict';

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM5', {
    baudRate: 115200,
});
const parser = port.pipe(new Readline({
    delimiter: '\r\n'
}));

const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 8080
});

let connections = [];

wss.on('connection', (_ws) => {
    console.log('[WS] connected.');

    connections.push(_ws);
    connectionCountNotice();

    // Browser -> (WebSocket) -> Node -> (SerialPort) -> Receiver
    _ws.on('message', (msg) => {
        console.log('[->WS] ' + msg);
        port.write(msg + '\r');
    });

    _ws.on('close', () => {
        console.log('[WS] close.');
        connections = connections.filter((conn, i) => {
            return (conn === _ws) ? false : true;
        });
        connectionCountNotice();
    });

});

// Receiver -> (SerialPort) -> Node -> (WebSocket) -> Browser
parser.on('data', (data) => {
    console.log('[->SP] ' + data);
    connections.forEach((conn, i) => {
        conn.send(data);
    });
});

function connectionCountNotice() {
    console.log('have ' + connections.length + ' connection(s).');
}