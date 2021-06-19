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
    send2(objSendMessage.value);
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

function getProtectHtml(protect) {
    let _protect;
    switch (protect) {
        case '0':
            _protect = '<span uk-icon="unlock"></span>';
            break;
        case '1':
            _protect = '<span uk-icon="lock"></span>';
            break;
    }
    return _protect;
}

// 
// ----- MemoryBank -----
// 
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
    _protect = getProtectHtml(msg.substr(9, 1));
    _title = msg.substr(13);
    _$tr = $('#memoryBankTable tbody').find('tr[data-memory-bank-number="' + _number + '"]');
    _$tr.find('td[data-for="bank-protect"]').html(_protect);
    _$tr.find('td[data-for="bank-title"]').text(_title);
}

function saveMemoryBank() {
    // TODO
    return false;
}