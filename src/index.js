const ws = new WebSocket('ws://localhost:8080');
const objSendMessage = document.getElementById('sendMessage');
const objReceiveMessage = document.getElementById('receiveMessage');

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

ws.onmessage = (e) => {
    objReceiveMessage.value += e.data + '\n';

    if (e.data.startsWith('20MW')) {
        setMemoryBankTable(e.data);
    }
}

function send() {
    ws.send(objSendMessage.value);
    return false;
}

function send2(msg) {
    ws.send(msg);
    return false;
}

function clearReceiveMessage() {
    objReceiveMessage.value = '';
    return false;
}

async function loadMemoryBank() {
    for (let i = 0; i <= 39; i++) {
        send2('MW' + ('0' + i).substr(-2));
        await _sleep(200);
    }
    return false;
}

function setMemoryBankTable(msg) {
    let _number, _protect, _title, _$tr;
    _number = msg.substr(4, 2);
    _protect = msg.substr(9, 1);
    switch (_protect) {
        case '0':
            _protect = 'OFF';
            break;
        case '1':
            _protect = 'ON';
            break;
    }
    _title = msg.substr(13);
    _$tr = $('#memoryBankTable tbody tr').filter(function() {
        return $(this).data('memory-bank-number') === _number
    });
    _$tr.find('td').filter(function() {
        return $(this).data('for') === 'bank-protect'
    }).text(_protect);
    _$tr.find('td').filter(function() {
        return $(this).data('for') === 'bank-title'
    }).text(_title);
}

function saveMemoryBank() {
    return false;
}