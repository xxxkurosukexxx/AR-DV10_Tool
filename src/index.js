const ws = new WebSocket('ws://localhost:8080');

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

ws.onmessage = (e) => {
    $('#receiveMessage').val($('#receiveMessage').val() + '---> ' + e.data + '\n');

    if (e.data.startsWith('20MW')) {
        setMemoryBankTable(e.data);
    } else if (e.data.startsWith('21MX') || e.data.startsWith('20MX')) {
        setMemoryChannelTable(e.data);
    }
}

async function listen() {
    let _vfo, _frequency, _mode;
    _vfo = $('#receiveVfo').val();
    _frequency = $('#receiveFrequency').val();
    _mode = $('#receiveMode').val();

    if (_frequency == '') {
        return;
    }

    if (_frequency.indexOf('.') === -1) {
        _frequency += '.0';
    }

    send2('VF' + _vfo + ' RF' + _frequency);
    send2('MD' + _mode);
    send2('IF0');
}

function send() {
    send2($('#sendMessage').val());
    return false;
}

function send2(msg) {
    //$('#sendMessage').val(msg);
    $('#receiveMessage').val($('#receiveMessage').val() + '<--- ' + msg + '\n');
    ws.send(msg);
    return false;
}

function clearReceiveMessage() {
    $('#receiveMessage').val('');
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

function getPassHtml(pass) {
    let _pass;
    switch (pass) {
        case '0':
            _pass = '<span uk-icon="minus"></span>';
            break;
        case '1':
            _pass = '<span uk-icon="check"></span>';
            break;
    }
    return _pass;
}

function getModeText(mode) {
    let _mode;
    switch (mode.substr(1, 1)) {
        case 'F':
            switch (mode.substr(2, 1)) {
                case '0':
                    _mode = 'FM';
                    break;
                case '1':
                    _mode = 'AM';
                    break;
                case '2':
                    _mode = 'SAH';
                    break;
                case '3':
                    _mode = 'SAL';
                    break;
                case '4':
                    _mode = 'USB';
                    break;
                case '5':
                    _mode = 'LSB';
                    break;
                case '6':
                    _mode = 'CW';
                    break;
            }
            break;
        case '0':
            _mode = 'AUTO';
            break;
        case '1':
            _mode = 'D-STAR';
            break;
        case '2':
            _mode = 'YAESU';
            break;
        case '3':
            _mode = 'ALINCO';
            break;
        case '4':
            _mode = 'D-CR/NXDN';
            break;
        case '5':
            _mode = 'P25';
            break;
        case '6':
            _mode = 'dPMR';
            break;
        case '7':
            _mode = 'DMR';
            break;
        case '8':
            _mode = 'T-DM';
            break;
        case '9':
            _mode = 'T-TC';
            break;
    }
    return _mode;
}

// 
// ----- MemoryBank -----
// 
async function loadMemoryBank() {
    let _progress;
    _progress = document.getElementById('memoryBankProgress');
    _progress.value = 0;
    clearMemoryBankTable();
    for (let i = 0; i <= 39; i++) {
        send2('MW' + ('0' + i).substr(-2));
        _progress.value += 1;
        await _sleep(200);
    }
    return false;
}

function clearMemoryBankTable() {
    $('#memoryBankTable tbody tr td:not([data-for="bank-number"])').text('');
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

// 
// ----- MemoryChannel -----
// 
async function loadMemoryChannel() {
    let _progress;
    _progress = document.getElementById('memoryChannelProgress');
    _progress.value = 0;
    clearMemoryChannelTable();
    let _bank = $('#memoryChannelBankSelect').val();
    for (let i = 0; i <= 49; i++) {
        send2('MA' + _bank + ('0' + i).substr(-2));
        _progress.value += 1;
        await _sleep(200);
    }
    return false;
}

function clearMemoryChannelTable() {
    $('#memoryChannelTable tbody tr td:not([data-for="channel-number"])').text('');
}

function setMemoryChannelTable(msg) {
    let _number, _pass, _receiveFrequency, _adjustFrequency, _stepAdjustFrequency, _mode, _protect, _title, _$tr;
    if (msg.split(' ')[1] == '---') {
        _number = msg.substr(6, 2);
        _pass = '';
        _receiveFrequency = '---';
        _adjustFrequency = '';
        _stepAdjustFrequency = '';
        _mode = '';
        _protect = '';
        _title = '';
    } else {
        _number = msg.substr(6, 2);
        _pass = getPassHtml(msg.substr(11, 1));
        _receiveFrequency = msg.substr(15, 10) + ' MHz';
        _adjustFrequency = msg.substr(28, 6) + ' kHz';
        _stepAdjustFrequency = msg.substr(37, 6) + ' kHz';
        _mode = getModeText(msg.substr(46, 3));
        _protect = getProtectHtml(msg.substr(52, 1));
        _title = msg.substr(56);
    }
    _$tr = $('#memoryChannelTable tbody').find('tr[data-memory-channel-number="' + _number + '"]');
    _$tr.find('td[data-for="channel-pass"]').html(_pass);
    _$tr.find('td[data-for="channel-receive-frequency"]').text(_receiveFrequency);
    _$tr.find('td[data-for="channel-adjust-frequency"]').text(_adjustFrequency);
    _$tr.find('td[data-for="channel-step-adjust-frequency"]').text(_stepAdjustFrequency);
    _$tr.find('td[data-for="channel-mode"]').text(_mode);
    _$tr.find('td[data-for="channel-protect"]').html(_protect);
    _$tr.find('td[data-for="channel-title"]').text(_title);
}

function saveMemoryChannel() {
    // TODO
    return false;
}