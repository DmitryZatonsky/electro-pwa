// Регистрация Service Worker для PWA + авто-версия
function formatVersionFromDate(dateValue) {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return null;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `v${yyyy}.${mm}.${dd}-${hh}${min}`;
}

async function getAutoVersionToken() {
    try {
        const response = await fetch('./sw.js', { method: 'HEAD', cache: 'no-store' });
        const lastModified = response.headers.get('last-modified');
        const fromDate = lastModified ? formatVersionFromDate(lastModified) : null;
        if (fromDate) return fromDate;

        const etag = response.headers.get('etag');
        if (etag) return `v${etag.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 16)}`;
    } catch (err) {
        console.warn('Не удалось получить авто-версию', err);
    }
    return 'v-dev';
}

function setAppVersionLabel(versionToken) {
    const versionEl = document.getElementById('appVersion');
    if (!versionEl) return;
    versionEl.textContent = `Версия: ${versionToken || 'dev'}`;
}

async function registerServiceWorkerWithVersion() {
    if (!('serviceWorker' in navigator)) return;
    const versionToken = await getAutoVersionToken();
    setAppVersionLabel(versionToken);
    const swUrl = `./sw.js?v=${encodeURIComponent(versionToken)}`;
    navigator.serviceWorker
        .register(swUrl)
        .then((reg) => reg.update())
        .catch(err => console.error(err));
}

registerServiceWorkerWithVersion();
// Данные ПУЭ: Медь
const CABLE_DATA_CU = [
    { section: 1.5, air: 23, pipe: 15 },
    { section: 2.5, air: 30, pipe: 21 },
    { section: 4.0, air: 41, pipe: 27 },
    { section: 6.0, air: 50, pipe: 34 },
    { section: 10, air: 80, pipe: 50 },
    { section: 16, air: 100, pipe: 80 },
    { section: 25, air: 140, pipe: 100 },
    { section: 35, air: 170, pipe: 135 },
    { section: 50, air: 215, pipe: 175 },
    { section: 70, air: 270, pipe: 215 },
    { section: 95, air: 325, pipe: 260 },
    { section: 120, air: 385, pipe: 300 },
    { section: 150, air: 440, pipe: 350 },
    { section: 185, air: 510, pipe: 405 },
    { section: 240, air: 605, pipe: 480 },
];

// Данные ПУЭ: Алюминий
const CABLE_DATA_AL = [
    { section: 2.5, air: 24, pipe: 16 },
    { section: 4.0, air: 32, pipe: 21 },
    { section: 6.0, air: 39, pipe: 26 },
    { section: 10, air: 60, pipe: 38 },
    { section: 16, air: 75, pipe: 60 },
    { section: 25, air: 105, pipe: 75 },
    { section: 35, air: 130, pipe: 100 },
    { section: 50, air: 165, pipe: 135 },
    { section: 70, air: 210, pipe: 165 },
    { section: 95, air: 255, pipe: 200 },
    { section: 120, air: 295, pipe: 230 },
    { section: 150, air: 340, pipe: 275 },
    { section: 185, air: 390, pipe: 320 },
    { section: 240, air: 460, pipe: 380 },
];

// Потребители для расчета мощности объекта
const OBJECT_CONSUMERS = [
    {
        room: 'Отдельные линии',
        items: [
            { name: 'Электроплита', power: 7000, priority: 'must', diffAuto: true },
            { name: 'Духовой шкаф', power: 3500, priority: 'must', diffAuto: true },
            { name: 'Посудомоечная машина', power: 1800, priority: 'must', diffAuto: true },
            { name: 'Стиральная машина', power: 2200, priority: 'must', diffAuto: true },
            { name: 'Водонагреватель', power: 2000, priority: 'must', diffAuto: true },
            { name: 'Бойлер', power: 2000, priority: 'must', diffAuto: true },
            { name: 'Теплый пол', power: 1500, priority: 'optional' },
            { name: 'Холодильник', power: 500, priority: 'must', diffAuto: true },
            { name: 'Розетки кухня', power: 2200, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Розетки санузел', power: 2200, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Электрокотел', power: 9000, priority: 'must' },
            { name: 'Кондиционер', power: 2500, priority: 'must' },
            { name: 'Розетки комната', power: 1500, priority: 'optional', fixedSection: 2.5, minBreaker: 16 },
            { name: 'Освещение', power: 300, priority: 'must', fixedSection: 1.5, minBreaker: 10 },
        ],
    },
    {
        room: 'Остальное',
        items: [
            { name: 'Чайник', power: 2200, priority: 'optional' },
            { name: 'Микроволновка', power: 1200, priority: 'optional' },
            { name: 'Измельчитель', power: 800, priority: 'optional' },
            { name: 'Вытяжка', power: 250, priority: 'optional' },
            { name: 'Телевизор', power: 250, priority: 'optional' },
            { name: 'Компьютер/рабочее место', power: 600, priority: 'must' },
            { name: 'Подсветка зеркала', power: 60, priority: 'optional' },
            { name: 'Вентиляция', power: 100, priority: 'optional' },
            { name: 'Полотенцесушитель', power: 600, priority: 'optional' },
            { name: 'Насос/скважина', power: 1500, priority: 'must' },
            { name: 'Гараж/мастерская', power: 3000, priority: 'optional' },
            { name: 'Уличное освещение', power: 500, priority: 'optional' },
        ],
    },
];

// Базовые константы расчетов
const BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];
const DEFAULT_COS_PHI = 0.85;
const SQRT_3 = 1.732;
const RESISTIVITY = { Cu: 0.0175, Al: 0.0281 };
const OBJECT_DIVERSITY_FACTOR = 0.6;
const OBJECT_DETAIL_VOLTAGE = 230;
const OBJECT_DETAIL_MATERIAL = 'Cu';
const OBJECT_DETAIL_ROUTING = 'pipe';

// Ссылки на DOM-элементы
const el = {
    screens: document.querySelectorAll('.screen'),
    netType: document.getElementById('netType'),
    voltageFixed: document.getElementById('voltageFixed'),
    voltageSelect: document.getElementById('voltageSelect'),
    material: document.getElementById('material'),
    routing: document.getElementById('routing'),
    inputType: document.getElementById('inputType'),
    cosPhiToggleGroup: document.getElementById('cosPhiToggleGroup'),
    manualCosPhiCheck: document.getElementById('manualCosPhiCheck'),
    cosPhiGroup: document.getElementById('cosPhiGroup'),
    cosPhiInput: document.getElementById('cosPhiInput'),
    inputValue: document.getElementById('inputValue'),
    calcDropCheck: document.getElementById('calcDropCheck'),
    lengthGroup: document.getElementById('lengthGroup'),
    cableLength: document.getElementById('cableLength'),
    dropResultBlock: document.getElementById('dropResultBlock'),
    resultBlock: document.getElementById('resultBlock'),
    resCurrent: document.getElementById('resCurrent'),
    resPower: document.getElementById('resPower'),
    resBreaker: document.getElementById('resBreaker'),
    resCable: document.getElementById('resCable'),
    resMaxCurrent: document.getElementById('resMaxCurrent'),
    resMaxPower: document.getElementById('resMaxPower'),
    resMargin: document.getElementById('resMargin'),
    resDropVolts: document.getElementById('resDropVolts'),
    resDropPercent: document.getElementById('resDropPercent'),
    calcBtn: document.getElementById('calcBtn'),
    consumerRooms: document.getElementById('consumerRooms'),
    selectedConsumersBlock: document.getElementById('selectedConsumersBlock'),
    selectedConsumers: document.getElementById('selectedConsumers'),
    calcObjectBtn: document.getElementById('calcObjectBtn'),
    objectResult: document.getElementById('objectResult'),
    objectDetailCard: document.getElementById('objectDetailCard'),
    objectDetailRows: document.getElementById('objectDetailRows'),
    materialsCard: document.getElementById('materialsCard'),
    materialsList: document.getElementById('materialsList'),
    resPeakPower: document.getElementById('resPeakPower'),
    resDiversityPower: document.getElementById('resDiversityPower'),
    resObjectCurrent: document.getElementById('resObjectCurrent'),
    resObjectBreaker: document.getElementById('resObjectBreaker'),
};

const selectedObjectConsumers = [];
let selectedEntryIdCounter = 0;
const expandedRooms = new Set();
let currentScreenId = (document.querySelector('.screen.active') || {}).id || 'homeScreen';
const knownScreenIds = new Set(Array.from(el.screens).map((screen) => screen.id));

// Навигация между экранами
function showScreen(screenId, options = {}) {
    const { record = true, fromPopState = false } = options;
    if (!screenId || screenId === currentScreenId) return;

    el.screens.forEach((screen) => {
        screen.classList.toggle('active', screen.id === screenId);
    });

    currentScreenId = screenId;

    if (record && !fromPopState) {
        window.history.pushState({ screenId }, '');
    }
}

function goScreenBack() {
    window.history.back();
}

function goScreenForward() {
    window.history.forward();
}

// Расчетные функции для кабеля и автомата
function getVoltage(netType) {
    if (netType === 'AC3') return 400;
    if (netType === 'DC') return parseFloat(el.voltageSelect.value);
    return 230;
}

function calcLoad({ inputType, inputValue, netType, voltage, cosPhi }) {
    if (inputType === 'power') {
        if (netType === 'DC') return { calcPower: inputValue, calcCurrent: inputValue / voltage };
        if (netType === 'AC1') return { calcPower: inputValue, calcCurrent: inputValue / (voltage * cosPhi) };
        return { calcPower: inputValue, calcCurrent: inputValue / (SQRT_3 * voltage * cosPhi) };
    }

    if (netType === 'DC') return { calcPower: voltage * inputValue, calcCurrent: inputValue };
    if (netType === 'AC1') return { calcPower: voltage * inputValue * cosPhi, calcCurrent: inputValue };
    return { calcPower: SQRT_3 * voltage * inputValue * cosPhi, calcCurrent: inputValue };
}

function pickBreaker(calcCurrent) {
    return BREAKERS.find((b) => b >= calcCurrent) || null;
}

function pickCable({ material, routing, breaker }) {
    if (!breaker) return { selectedCableSection: null, selectedCableMaxCurrent: 0 };

    const dataSet = material === 'Cu' ? CABLE_DATA_CU : CABLE_DATA_AL;
    const cable = dataSet.find((c) => breaker <= (routing === 'air' ? c.air : c.pipe) * 0.8);
    if (!cable) return { selectedCableSection: null, selectedCableMaxCurrent: 0 };

    const selectedCableMaxCurrent = routing === 'air' ? cable.air : cable.pipe;
    return { selectedCableSection: cable.section, selectedCableMaxCurrent };
}

function pickCableByDropLimit({ material, routing, breaker, calcCurrent, cableLength, voltage, cosPhi, dropLimitPercent }) {
    const dataSet = material === 'Cu' ? CABLE_DATA_CU : CABLE_DATA_AL;
    const routingKey = routing === 'air' ? 'air' : 'pipe';

    if (!breaker) {
        return { selectedCableSection: null, drop: null };
    }

    const base = pickCable({ material, routing, breaker });
    if (!base.selectedCableSection) {
        return { selectedCableSection: null, drop: null };
    }

    const startIndex = dataSet.findIndex((c) => c.section === base.selectedCableSection);
    if (startIndex === -1) {
        return { selectedCableSection: base.selectedCableSection, drop: null };
    }

    let chosen = dataSet[startIndex];
    let drop = null;

    for (let i = startIndex; i < dataSet.length; i += 1) {
        const candidate = dataSet[i];
        if (breaker > candidate[routingKey] * 0.8) continue;

        const candidateDrop = (Number.isFinite(cableLength) && cableLength > 0)
            ? calcVoltageDrop({
                netType: 'AC1',
                material,
                calcCurrent,
                cableLength,
                selectedCableSection: candidate.section,
                voltage,
                cosPhi,
            })
            : null;

        chosen = candidate;
        drop = candidateDrop;

        if (!candidateDrop || candidateDrop.dropPercent <= dropLimitPercent) break;
    }

    return { selectedCableSection: chosen.section, drop };
}

function calcMaxAllowedPower(netType, voltage, maxCurrent, cosPhi) {
    if (netType === 'DC') return voltage * maxCurrent;
    if (netType === 'AC1') return voltage * maxCurrent * cosPhi;
    return SQRT_3 * voltage * maxCurrent * cosPhi;
}

function calcVoltageDrop({ netType, material, calcCurrent, cableLength, selectedCableSection, voltage, cosPhi }) {
    const rho = RESISTIVITY[material];
    let deltaU = 0;

    if (netType === 'DC') {
        deltaU = 2 * calcCurrent * rho * (cableLength / selectedCableSection);
    } else if (netType === 'AC1') {
        deltaU = 2 * calcCurrent * rho * (cableLength / selectedCableSection) * cosPhi;
    } else {
        deltaU = SQRT_3 * calcCurrent * rho * (cableLength / selectedCableSection) * cosPhi;
    }

    return { deltaU, dropPercent: (deltaU / voltage) * 100 };
}

function getDropPercentColor(dropPercent) {
    if (dropPercent <= 3) return '#28a745';
    if (dropPercent <= 5) return '#d39e00';
    return '#e44d4d';
}

// Рендер результатов расчета кабеля
function renderVoltageDrop(drop) {
    if (!drop) {
        el.dropResultBlock.style.display = 'none';
        return;
    }

    el.resDropVolts.innerText = `${drop.deltaU.toFixed(2)} В`;
    el.resDropPercent.innerText = `${drop.dropPercent.toFixed(2)} %`;

    el.resDropPercent.style.color = getDropPercentColor(drop.dropPercent);

    el.dropResultBlock.style.display = 'block';
}

function renderMainResult({ calcCurrent, calcPower, breaker, selectedCableSection, selectedCableMaxCurrent, material, maxAllowedPower, marginPercent }) {
    el.resCurrent.innerText = `${calcCurrent.toFixed(2)} А`;
    el.resPower.innerText = `${Math.round(calcPower)} Вт`;

    if (breaker && selectedCableSection) {
        el.resBreaker.innerText = `${breaker} А`;
        el.resCable.innerText = `${selectedCableSection} мм² (${material})`;
        el.resMaxCurrent.innerText = `${selectedCableMaxCurrent} А`;
        el.resMaxPower.innerText = `${Math.round(maxAllowedPower)} Вт`;
        el.resMargin.innerText = `+${Math.round(marginPercent)}%`;
    } else {
        el.resBreaker.innerText = 'Ошибка';
        el.resCable.innerText = 'Вне диапазона';
        el.resMaxCurrent.innerText = '-';
        el.resMaxPower.innerText = '-';
        el.resMargin.innerText = '-';
    }

    el.resultBlock.style.display = 'block';
}

// Обновление UI формы расчета кабеля
function updateVoltageUI(netType) {
    if (netType === 'DC') {
        el.voltageFixed.style.display = 'none';
        el.voltageSelect.style.display = 'block';
        return;
    }

    el.voltageFixed.style.display = 'block';
    el.voltageSelect.style.display = 'none';
    el.voltageFixed.value = netType === 'AC3' ? '400 В' : '230 В';
}

function updateCosPhiUI(netType) {
    if (netType === 'DC') {
        el.cosPhiToggleGroup.style.display = 'none';
        el.cosPhiGroup.style.display = 'none';
        return;
    }

    el.cosPhiToggleGroup.style.display = 'block';
    el.cosPhiGroup.style.display = el.manualCosPhiCheck.checked ? 'block' : 'none';
}

// Основной расчет: сечение провода и номинал автомата
function calculate() {
    const netType = el.netType.value;
    const material = el.material.value;
    const routing = el.routing.value;
    const inputType = el.inputType.value;
    const inputValue = parseFloat(el.inputValue.value);
    const isManualCosPhi = el.manualCosPhiCheck.checked;
    const cosPhiInput = parseFloat(el.cosPhiInput.value);
    const calcDropCheck = el.calcDropCheck.checked;
    const cableLength = parseFloat(el.cableLength.value);

    if (!Number.isFinite(inputValue) || inputValue <= 0) {
        alert('Введите корректное значение нагрузки!');
        return;
    }

    const cosPhi = isManualCosPhi ? cosPhiInput : DEFAULT_COS_PHI;
    if (netType !== 'DC' && (!Number.isFinite(cosPhi) || cosPhi <= 0 || cosPhi > 1)) {
        alert('Введите корректный cos φ (от 0.01 до 1)!');
        return;
    }

    const voltage = getVoltage(netType);
    const { calcPower, calcCurrent } = calcLoad({ inputType, inputValue, netType, voltage, cosPhi });
    const breaker = pickBreaker(calcCurrent);
    const { selectedCableSection, selectedCableMaxCurrent } = pickCable({ material, routing, breaker });

    let maxAllowedPower = 0;
    let marginPercent = 0;
    if (selectedCableSection) {
        maxAllowedPower = calcMaxAllowedPower(netType, voltage, selectedCableMaxCurrent, cosPhi);
        marginPercent = ((selectedCableMaxCurrent - calcCurrent) / selectedCableMaxCurrent) * 100;
    }

    const drop = (calcDropCheck && cableLength > 0 && selectedCableSection)
        ? calcVoltageDrop({ netType, material, calcCurrent, cableLength, selectedCableSection, voltage, cosPhi })
        : null;

    renderVoltageDrop(drop);
    renderMainResult({
        calcCurrent,
        calcPower,
        breaker,
        selectedCableSection,
        selectedCableMaxCurrent,
        material,
        maxAllowedPower,
        marginPercent,
    });
}

// Рендер списка потребителей по помещениям
function renderObjectConsumers() {
    const roomHtml = OBJECT_CONSUMERS.map((room) => {
        const isExpanded = expandedRooms.has(room.room);
        const sortedItems = [...room.items].sort((a, b) => {
            const weightA = a.priority === 'must' ? 0 : 1;
            const weightB = b.priority === 'must' ? 0 : 1;
            return weightA - weightB;
        });

        const rows = sortedItems.map((item) => {
            const priorityClass = item.diffAuto ? 'must' : 'optional';
            const consumerKey = `${room.room}::${item.name}`;
            const selectedCount = selectedObjectConsumers.filter((entry) => entry.key === consumerKey).length;
            const isSelected = selectedCount > 0;

            return `
                <div
                    class="consumer-row selectable ${isSelected ? 'selected' : ''}"
                    data-consumer-key="${consumerKey}"
                    data-room="${room.room}"
                    data-name="${item.name}"
                    data-priority="${item.priority}"
                    data-default-power="${item.power}"
                    data-fixed-section="${item.fixedSection || ''}"
                    data-diff-auto="${item.diffAuto ? '1' : ''}"
                    data-min-breaker="${item.minBreaker || ''}"
                >
                    <div>
                        <div class="consumer-name-row">
                            <span class="priority-dot ${priorityClass}" aria-hidden="true"></span>
                            <strong>${item.name}</strong>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="room-block">
                <button type="button" class="room-toggle" data-room-toggle="${room.room}">
                    <span>${room.room}</span>
                    <span class="room-arrow">${isExpanded ? '▾' : '▸'}</span>
                </button>
                <div class="room-content" style="display: ${isExpanded ? 'block' : 'none'};">
                    ${rows}
                </div>
            </div>
        `;
    }).join('');

    el.consumerRooms.innerHTML = roomHtml;
}

function toggleRoom(roomName) {
    if (!roomName) return;
    if (expandedRooms.has(roomName)) {
        expandedRooms.delete(roomName);
    } else {
        expandedRooms.add(roomName);
    }
    renderObjectConsumers();
}

function getNumberedSelectedEntries() {
    const totalByKey = new Map();
    selectedObjectConsumers.forEach((entry) => {
        totalByKey.set(entry.key, (totalByKey.get(entry.key) || 0) + 1);
    });

    const orderByKey = new Map();
    return selectedObjectConsumers.map((entry) => {
        const index = (orderByKey.get(entry.key) || 0) + 1;
        orderByKey.set(entry.key, index);
        const hasDuplicates = (totalByKey.get(entry.key) || 0) > 1;

        return {
            ...entry,
            displayName: hasDuplicates ? `${entry.name} ${index}` : entry.name,
        };
    });
}

function renderSelectedConsumers() {
    const selectedItems = getNumberedSelectedEntries();
    if (selectedItems.length === 0) {
        el.selectedConsumersBlock.style.display = 'none';
        el.selectedConsumers.innerHTML = '';
        return;
    }

    const selectedHtml = selectedItems.map((item) => {
        return `
            <div class="selected-row" data-entry-id="${item.id}">
                <div>
                    <div class="consumer-name-row">
                        <strong>${item.displayName}</strong>
                    </div>
                </div>
                <input
                    type="number"
                    class="selected-power-input"
                    min="1"
                    step="10"
                    value="${item.power}"
                    data-priority="${item.priority}"
                    aria-label="Мощность в ваттах: ${item.displayName}"
                >
                <button type="button" class="remove-selected-btn" data-remove-id="${item.id}" aria-label="Удалить ${item.displayName}">×</button>
            </div>
        `;
    }).join('');

    el.selectedConsumers.innerHTML = selectedHtml;
    el.selectedConsumersBlock.style.display = 'block';
}

function buildObjectLineDetail(entry) {
    const power = parseFloat(entry.power);
    const cableLength = parseFloat(entry.cableLength);
    const calcCurrent = power / (OBJECT_DETAIL_VOLTAGE * DEFAULT_COS_PHI);
    const pickedBreaker = pickBreaker(calcCurrent);
    const breakerValue = entry.minBreaker
        ? Math.max(entry.minBreaker, pickedBreaker || entry.minBreaker)
        : pickedBreaker;
    const picked = pickCableByDropLimit({
        material: OBJECT_DETAIL_MATERIAL,
        routing: OBJECT_DETAIL_ROUTING,
        breaker: breakerValue,
        calcCurrent,
        cableLength,
        voltage: OBJECT_DETAIL_VOLTAGE,
        cosPhi: DEFAULT_COS_PHI,
        dropLimitPercent: 5,
    });
    const selectedCableSection = entry.fixedSection || picked.selectedCableSection;
    const drop = (Number.isFinite(cableLength) && cableLength > 0 && selectedCableSection)
        ? calcVoltageDrop({
            netType: 'AC1',
            material: OBJECT_DETAIL_MATERIAL,
            calcCurrent,
            cableLength,
            selectedCableSection,
            voltage: OBJECT_DETAIL_VOLTAGE,
            cosPhi: DEFAULT_COS_PHI,
        })
        : null;

    return {
        id: entry.id,
        name: entry.displayName || entry.name,
        powerKw: `${(power / 1000).toFixed(2)} кВт`,
        cableLength: Number.isFinite(cableLength) && cableLength > 0 ? cableLength : '',
        cable: selectedCableSection ? `${selectedCableSection} мм²` : 'Вне диапазона',
        breaker: breakerValue ? `${entry.diffAuto ? 'Диф. автомат' : 'Автомат'} ${breakerValue} А` : 'Вне диапазона',
        dropPercent: drop ? `${drop.dropPercent.toFixed(2)} %` : '-',
        dropColor: drop ? getDropPercentColor(drop.dropPercent) : '#666',
        breakerAmp: breakerValue || null,
        protectionType: entry.diffAuto ? 'diff' : 'breaker',
        cableSection: selectedCableSection || null,
        cableLengthMeters: Number.isFinite(cableLength) && cableLength > 0 ? cableLength : 0,
    };
}

function renderObjectDetailRows(rows) {
    if (!rows.length) {
        el.objectDetailRows.innerHTML = '';
        el.objectDetailCard.style.display = 'none';
        return;
    }

    const html = rows.map((row) => `
        <tr>
            <td>${row.name}</td>
            <td>${row.powerKw}</td>
            <td>
                <input
                    type="number"
                    class="line-length-input"
                    min="1"
                    step="1"
                    value="${row.cableLength}"
                    data-entry-id="${row.id}"
                    aria-label="Длина кабеля для ${row.name}"
                >
            </td>
            <td>${row.cable}</td>
            <td>${row.breaker}</td>
            <td style="color: ${row.dropColor}; font-weight: 700;">${row.dropPercent}</td>
        </tr>
    `).join('');

    el.objectDetailRows.innerHTML = html;
    el.objectDetailCard.style.display = 'block';
}

function renderMaterialsSummary(rows) {
    if (!rows.length) {
        el.materialsList.innerHTML = '';
        el.materialsCard.style.display = 'none';
        return;
    }

    const protectionMap = new Map();
    const cableMap = new Map();

    rows.forEach((row) => {
        if (row.breakerAmp) {
            const key = `${row.protectionType || 'breaker'}:${row.breakerAmp}`;
            protectionMap.set(key, (protectionMap.get(key) || 0) + 1);
        }
        if (row.cableSection && row.cableLengthMeters > 0) {
            cableMap.set(row.cableSection, (cableMap.get(row.cableSection) || 0) + row.cableLengthMeters);
        }
    });

    const lines = [];

    Array.from(protectionMap.keys()).sort((a, b) => {
        const [typeA, ampA] = a.split(':');
        const [typeB, ampB] = b.split(':');
        if (typeA !== typeB) return typeA.localeCompare(typeB);
        return Number(ampA) - Number(ampB);
    }).forEach((key) => {
        const [type, amp] = key.split(':');
        const label = type === 'diff' ? 'Диф. автомат' : 'Автомат';
        lines.push(`${label} ${amp} А - ${protectionMap.get(key)} шт`);
    });

    Array.from(cableMap.keys()).sort((a, b) => a - b).forEach((section) => {
        const totalWithReserve = cableMap.get(section) * 1.15;
        lines.push(`Кабель ВВГнг-LS 3x${section} мм² - ${totalWithReserve.toFixed(1)} м (+15%)`);
    });

    if (!lines.length) {
        lines.push('Недостаточно данных для подсчета материалов');
    }

    el.materialsList.innerHTML = lines.map((line) => `<li>${line}</li>`).join('');
    el.materialsCard.style.display = 'block';
}

function invalidateObjectCalculation() {
    el.objectResult.style.display = 'none';
    el.objectDetailCard.style.display = 'none';
    el.materialsCard.style.display = 'none';
}

function toggleObjectConsumerSelection(card) {
    const key = card.dataset.consumerKey;
    if (!key) return;

    selectedObjectConsumers.push({
        id: ++selectedEntryIdCounter,
        key,
        room: card.dataset.room,
        name: card.dataset.name,
        priority: card.dataset.priority,
        power: parseFloat(card.dataset.defaultPower),
        cableLength: 25,
        fixedSection: card.dataset.fixedSection ? parseFloat(card.dataset.fixedSection) : null,
        diffAuto: card.dataset.diffAuto === '1',
        minBreaker: card.dataset.minBreaker ? parseInt(card.dataset.minBreaker, 10) : null,
    });

    renderObjectConsumers();
    renderSelectedConsumers();
    invalidateObjectCalculation();
}

// Расчет мощности объекта
function calculateObjectPower() {
    const selectedRows = el.selectedConsumers.querySelectorAll('.selected-row');
    let peakPower = 0;

    selectedRows.forEach((row) => {
        const input = row.querySelector('.selected-power-input');
        if (!input) return;
        const power = parseFloat(input.value);
        if (!Number.isFinite(power) || power <= 0) return;

        const entryId = parseInt(row.dataset.entryId, 10);
        const selected = selectedObjectConsumers.find((entry) => entry.id === entryId);
        if (selected) selected.power = power;

        peakPower += power;
    });

    if (peakPower <= 0) {
        alert('Выберите хотя бы одного потребителя.');
        return;
    }

    const diversityPower = peakPower * OBJECT_DIVERSITY_FACTOR;
    const objectCurrent = diversityPower / 230;
    const breaker = pickBreaker(objectCurrent);

    const formatPowerKw = (watts) => `${(watts / 1000).toFixed(2)} кВт`;

    el.resPeakPower.innerText = formatPowerKw(peakPower);
    el.resDiversityPower.innerText = formatPowerKw(diversityPower);
    el.resObjectCurrent.innerText = `${objectCurrent.toFixed(2)} А`;
    el.resObjectBreaker.innerText = breaker ? `${breaker} А` : 'Вне диапазона';
    el.objectResult.style.display = 'block';
    const detailRows = getNumberedSelectedEntries().map(buildObjectLineDetail);
    renderObjectDetailRows(detailRows);
    renderMaterialsSummary(detailRows);
    el.objectResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Обработчики навигации
document.querySelectorAll('[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
        showScreen(btn.dataset.screen);
    });
});

// Поддержка системной кнопки "Назад" (Android)
window.history.replaceState({ screenId: currentScreenId }, '');
window.addEventListener('popstate', (e) => {
    const targetScreen = e.state && e.state.screenId;
    if (!targetScreen || !knownScreenIds.has(targetScreen)) return;
    showScreen(targetScreen, { record: false, fromPopState: true });
});

// Свайп-навигация экранов: слева направо - назад, справа налево - вперед
let swipeStartX = 0;
let swipeStartY = 0;
let swipeStartTime = 0;
let swipeEdge = null;

function resetSwipeState() {
    swipeStartX = 0;
    swipeStartY = 0;
    swipeStartTime = 0;
    swipeEdge = null;
}

function isInteractiveTarget(target) {
    return Boolean(target.closest('input, textarea, select, button, [contenteditable="true"]'));
}

document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    if (isInteractiveTarget(e.target)) return;

    const touch = e.touches[0];
    const viewportWidth = window.innerWidth;
    const edgeSize = Math.min(40, viewportWidth * 0.08);

    if (touch.clientX <= edgeSize) {
        swipeEdge = 'left';
    } else if (touch.clientX >= viewportWidth - edgeSize) {
        swipeEdge = 'right';
    } else {
        resetSwipeState();
        return;
    }

    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    swipeStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!swipeEdge || e.changedTouches.length !== 1) {
        resetSwipeState();
        return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    const duration = Date.now() - swipeStartTime;
    const isHorizontalSwipe = Math.abs(deltaY) < 70 && duration < 700;

    if (isHorizontalSwipe && swipeEdge === 'left' && deltaX > 70) {
        goScreenBack();
    } else if (isHorizontalSwipe && swipeEdge === 'right' && deltaX < -70) {
        goScreenForward();
    }

    resetSwipeState();
}, { passive: true });

document.addEventListener('touchcancel', resetSwipeState, { passive: true });

// Обработчики формы расчета кабеля
el.netType.addEventListener('change', (e) => {
    updateVoltageUI(e.target.value);
    updateCosPhiUI(e.target.value);
});
el.manualCosPhiCheck.addEventListener('change', (e) => {
    el.cosPhiGroup.style.display = e.target.checked ? 'block' : 'none';
});
el.calcDropCheck.addEventListener('change', (e) => {
    el.lengthGroup.style.display = e.target.checked ? 'block' : 'none';
});
el.consumerRooms.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.room-toggle[data-room-toggle]');
    if (toggleBtn) {
        toggleRoom(toggleBtn.dataset.roomToggle);
        return;
    }

    const row = e.target.closest('.consumer-row[data-consumer-key]');
    if (!row) return;
    toggleObjectConsumerSelection(row);
});
el.selectedConsumers.addEventListener('input', (e) => {
    if (!e.target.classList.contains('selected-power-input')) return;
    const row = e.target.closest('.selected-row');
    if (!row) return;
    const entryId = parseInt(row.dataset.entryId, 10);
    const selected = selectedObjectConsumers.find((entry) => entry.id === entryId);
    if (!selected) return;
    selected.power = parseFloat(e.target.value);
    invalidateObjectCalculation();
});
el.selectedConsumers.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-selected-btn');
    if (!removeBtn) return;
    const entryId = parseInt(removeBtn.dataset.removeId, 10);
    if (!Number.isFinite(entryId)) return;
    const index = selectedObjectConsumers.findIndex((entry) => entry.id === entryId);
    if (index === -1) return;
    selectedObjectConsumers.splice(index, 1);
    renderObjectConsumers();
    renderSelectedConsumers();
    invalidateObjectCalculation();
});
el.objectDetailRows.addEventListener('focusout', (e) => {
    if (!e.target.classList.contains('line-length-input')) return;
    const entryId = parseInt(e.target.dataset.entryId, 10);
    if (!Number.isFinite(entryId)) return;
    const selected = selectedObjectConsumers.find((entry) => entry.id === entryId);
    if (!selected) return;

    const length = parseFloat(e.target.value);
    selected.cableLength = Number.isFinite(length) && length > 0 ? length : '';

    if (el.objectDetailCard.style.display === 'block') {
        const detailRows = getNumberedSelectedEntries().map(buildObjectLineDetail);
        renderObjectDetailRows(detailRows);
        renderMaterialsSummary(detailRows);
    }
});
el.calcBtn.addEventListener('click', calculate);
el.calcObjectBtn.addEventListener('click', calculateObjectPower);

// Первичная инициализация UI
renderObjectConsumers();
renderSelectedConsumers();
updateVoltageUI(el.netType.value);
updateCosPhiUI(el.netType.value);

