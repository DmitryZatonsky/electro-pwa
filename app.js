// Регистрация Service Worker для PWA + авто-версия
// Функция formatVersionFromDate: Формирует строку версии из даты в формате vYYYY.MM.DD-HHMM.
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

// Функция getAutoVersionToken: Пытается получить авто-версию приложения по заголовкам Service Worker.
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

// Функция setAppVersionLabel: Обновляет текст версии приложения в интерфейсе.
function setAppVersionLabel(versionToken) {
    const versionEl = document.getElementById('appVersion');
    if (!versionEl) return;
    versionEl.textContent = `Версия: ${versionToken || 'dev'}`;
}

// Функция registerServiceWorkerWithVersion: Регистрирует Service Worker и добавляет к URL токен версии.
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
            { name: 'Посудомоечная машина', power: 1800, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Стиральная машина', power: 2200, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Водонагреватель', power: 2000, priority: 'must', diffAuto: true },
            { name: 'Бойлер', power: 2000, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Теплый пол', power: 1500, priority: 'optional', fixedSection: 2.5, minBreaker: 16 },
            { name: 'Холодильник', power: 500, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Розетки кухня', power: 0, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Розетки санузел', power: 0, priority: 'must', fixedSection: 2.5, diffAuto: true, minBreaker: 16 },
            { name: 'Электрокотел', power: 9000, priority: 'must' },
            { name: 'Кондиционер', power: 2500, priority: 'must', fixedSection: 2.5, minBreaker: 16 },
            { name: 'Розетки комната', power: 0, priority: 'optional', fixedSection: 2.5, minBreaker: 16 },
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
const SHIELD_MODULE_STEP = 12;
const MAX_RELAY_DIRECT_AMP = 63;
const DEFAULT_PROTECTION_CURVE = 'C';
const HYBRID_INVERTER_STEPS_KW = [1, 1.5, 2, 3, 3.6, 5, 6, 8, 10, 12, 15, 20];
const RESISTANCE_CHECK_DEFAULT = { Cu: 0.007, Al: 0.0112 };
const RESISTANCE_LIMIT_PER_M = {
    Cu: [
        { section: 1.5, resistancePerMeter: 0.0121 },
        { section: 2.5, resistancePerMeter: 0.00741 },
        { section: 4, resistancePerMeter: 0.00461 },
        { section: 6, resistancePerMeter: 0.00308 },
        { section: 10, resistancePerMeter: 0.00183 },
        { section: 16, resistancePerMeter: 0.00115 },
        { section: 25, resistancePerMeter: 0.000727 },
        { section: 35, resistancePerMeter: 0.000524 },
        { section: 50, resistancePerMeter: 0.000387 },
        { section: 70, resistancePerMeter: 0.000268 },
        { section: 95, resistancePerMeter: 0.000193 },
        { section: 120, resistancePerMeter: 0.000153 },
    ],
    Al: [
        { section: 2.5, resistancePerMeter: 0.0115 },
        { section: 4, resistancePerMeter: 0.00714 },
        { section: 6, resistancePerMeter: 0.00477 },
        { section: 10, resistancePerMeter: 0.00299 },
        { section: 16, resistancePerMeter: 0.00187 },
        { section: 25, resistancePerMeter: 0.001184 },
        { section: 35, resistancePerMeter: 0.000853 },
        { section: 50, resistancePerMeter: 0.000630 },
        { section: 70, resistancePerMeter: 0.000437 },
        { section: 95, resistancePerMeter: 0.000310 },
        { section: 120, resistancePerMeter: 0.000245 },
    ],
};
const CONSUMABLES = {
    clipStepMeters: 0.5,
    wagoPerLine: 3,
    markingPerLine: 2,
    fastenerStepMeters: 0.5,
};

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
    inputValueLabel: document.getElementById('inputValueLabel'),
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
    includeConsumablesCheck: document.getElementById('includeConsumablesCheck'),
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
    shieldInputBasis: document.getElementById('shieldInputBasis'),
    shieldSectionGroup: document.getElementById('shieldSectionGroup'),
    shieldPowerGroup: document.getElementById('shieldPowerGroup'),
    shieldCableSection: document.getElementById('shieldCableSection'),
    shieldPowerKw: document.getElementById('shieldPowerKw'),
    shieldPhases: document.getElementById('shieldPhases'),
    shieldMaterial: document.getElementById('shieldMaterial'),
    shieldRouting: document.getElementById('shieldRouting'),
    calcShieldBtn: document.getElementById('calcShieldBtn'),
    shieldResult: document.getElementById('shieldResult'),
    resShieldBreaker: document.getElementById('resShieldBreaker'),
    resShieldRelay: document.getElementById('resShieldRelay'),
    resShieldRcd: document.getElementById('resShieldRcd'),
    resShieldTotalModules: document.getElementById('resShieldTotalModules'),
    resShieldBoardSize: document.getElementById('resShieldBoardSize'),
    shieldEquipmentCard: document.getElementById('shieldEquipmentCard'),
    shieldEquipmentRows: document.getElementById('shieldEquipmentRows'),
    shieldManualModuleName: document.getElementById('shieldManualModuleName'),
    shieldManualModuleCount: document.getElementById('shieldManualModuleCount'),
    shieldAddManualModuleBtn: document.getElementById('shieldAddManualModuleBtn'),
    recalcShieldBtn: document.getElementById('recalcShieldBtn'),
    shieldExtraModulesList: document.getElementById('shieldExtraModulesList'),
    shieldMainRooms: document.getElementById('shieldMainRooms'),
    shieldLineCandidates: document.getElementById('shieldLineCandidates'),
    hybridConsumptionBasis: document.getElementById('hybridConsumptionBasis'),
    hybridEnergyLabel: document.getElementById('hybridEnergyLabel'),
    hybridEnergyValue: document.getElementById('hybridEnergyValue'),
    hybridAutonomyHours: document.getElementById('hybridAutonomyHours'),
    hybridBatteryVoltage: document.getElementById('hybridBatteryVoltage'),
    hybridBatteryType: document.getElementById('hybridBatteryType'),
    hybridInverterReserve: document.getElementById('hybridInverterReserve'),
    hybridPeakLoadKw: document.getElementById('hybridPeakLoadKw'),
    calcHybridBtn: document.getElementById('calcHybridBtn'),
    hybridResult: document.getElementById('hybridResult'),
    resHybridDailyKwh: document.getElementById('resHybridDailyKwh'),
    resHybridAvgPower: document.getElementById('resHybridAvgPower'),
    resHybridInverterPower: document.getElementById('resHybridInverterPower'),
    resHybridSurgePower: document.getElementById('resHybridSurgePower'),
    resHybridAutonomyEnergy: document.getElementById('resHybridAutonomyEnergy'),
    resHybridInverterSelfUse: document.getElementById('resHybridInverterSelfUse'),
    resHybridTotalAutonomyEnergy: document.getElementById('resHybridTotalAutonomyEnergy'),
    resHybridBatteryEnergy: document.getElementById('resHybridBatteryEnergy'),
    resHybridBatteryAh: document.getElementById('resHybridBatteryAh'),
    resHybridMinSoc: document.getElementById('resHybridMinSoc'),
    resHybridAssumptions: document.getElementById('resHybridAssumptions'),
    resistanceMaterial: document.getElementById('resistanceMaterial'),
    resistanceLength: document.getElementById('resistanceLength'),
    measuredResistance: document.getElementById('measuredResistance'),
    calcResistanceSectionBtn: document.getElementById('calcResistanceSectionBtn'),
    resistanceSectionResult: document.getElementById('resistanceSectionResult'),
    resCalculatedSection: document.getElementById('resCalculatedSection'),
    resTabularSection: document.getElementById('resTabularSection'),
    resAllowedResistance: document.getElementById('resAllowedResistance'),
    resResistanceDeviation: document.getElementById('resResistanceDeviation'),
    resAllowedDeviationRow: document.getElementById('resAllowedDeviationRow'),
    resAllowedDeviation: document.getElementById('resAllowedDeviation'),
};

const selectedObjectConsumers = [];
let selectedEntryIdCounter = 0;
const expandedRooms = new Set();
let currentScreenId = (document.querySelector('.screen.active') || {}).id || 'homeScreen';
const knownScreenIds = new Set(Array.from(el.screens).map((screen) => screen.id));
let lastDetailRows = [];
const selectedShieldExtras = [];
let shieldExtraIdCounter = 0;
const expandedShieldRooms = new Set();
const expandedShieldMainRooms = new Set();

// Навигация между экранами
// Функция showScreen: Переключает активный экран приложения и обновляет историю переходов.
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

// Функция goScreenBack: Переходит на предыдущий экран через браузерную историю.
function goScreenBack() {
    window.history.back();
}

// Функция goScreenForward: Переходит на следующий экран через браузерную историю.
function goScreenForward() {
    window.history.forward();
}

// Функция getCableDataSet: Возвращает таблицу допустимых токов кабеля по материалу.
function getCableDataSet(material) {
    return material === 'Cu' ? CABLE_DATA_CU : CABLE_DATA_AL;
}

// Функция scrollIntoViewSmart: Прокручивает элемент в область видимости с учетом reduced-motion.
function scrollIntoViewSmart(target, block = 'start') {
    if (!target) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        target.scrollIntoView({ block });
        return;
    }
    target.scrollIntoView({ behavior: 'smooth', block });
}

// Расчетные функции для кабеля и автомата
// Функция getVoltage: Возвращает рабочее напряжение по выбранному типу сети.
function getVoltage(netType) {
    if (netType === 'AC3') return 400;
    if (netType === 'DC') return parseFloat(el.voltageSelect.value);
    return 230;
}

// Функция calcLoad: Считает мощность и ток нагрузки по исходным данным пользователя.
function calcLoad({ inputType, inputValue, netType, voltage, cosPhi }) {
    if (inputType === 'power') {
        // В UI мощность вводится в кВт, для расчетов переводим в Вт.
        const powerWatts = inputValue * 1000;
        if (netType === 'DC') return { calcPower: powerWatts, calcCurrent: powerWatts / voltage };
        if (netType === 'AC1') return { calcPower: powerWatts, calcCurrent: powerWatts / (voltage * cosPhi) };
        return { calcPower: powerWatts, calcCurrent: powerWatts / (SQRT_3 * voltage * cosPhi) };
    }

    if (netType === 'DC') return { calcPower: voltage * inputValue, calcCurrent: inputValue };
    if (netType === 'AC1') return { calcPower: voltage * inputValue * cosPhi, calcCurrent: inputValue };
    return { calcPower: SQRT_3 * voltage * inputValue * cosPhi, calcCurrent: inputValue };
}

// Функция pickBreaker: Подбирает ближайший стандартный номинал автомата по расчетному току.
function pickBreaker(calcCurrent) {
    return BREAKERS.find((b) => b >= calcCurrent) || null;
}

// Функция pickCable: Подбирает минимальное сечение кабеля под выбранный автомат.
function pickCable({ material, routing, breaker }) {
    if (!breaker) return { selectedCableSection: null, selectedCableMaxCurrent: 0 };

    const dataSet = getCableDataSet(material);
    const cable = dataSet.find((c) => breaker <= (routing === 'air' ? c.air : c.pipe) * 0.8);
    if (!cable) return { selectedCableSection: null, selectedCableMaxCurrent: 0 };

    const selectedCableMaxCurrent = routing === 'air' ? cable.air : cable.pipe;
    return { selectedCableSection: cable.section, selectedCableMaxCurrent };
}

// Функция pickCableByDropLimit: Подбирает сечение кабеля с учетом ограничения по падению напряжения.
function pickCableByDropLimit({ material, routing, breaker, calcCurrent, cableLength, voltage, cosPhi, dropLimitPercent }) {
    const dataSet = getCableDataSet(material);
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

// Функция calcMaxAllowedPower: Считает максимально допустимую мощность для выбранного тока.
function calcMaxAllowedPower(netType, voltage, maxCurrent, cosPhi) {
    if (netType === 'DC') return voltage * maxCurrent;
    if (netType === 'AC1') return voltage * maxCurrent * cosPhi;
    return SQRT_3 * voltage * maxCurrent * cosPhi;
}

// Функция calcVoltageDrop: Рассчитывает падение напряжения на линии.
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

// Функция getDropPercentColor: Возвращает цветовой индикатор по величине падения напряжения.
function getDropPercentColor(dropPercent) {
    if (dropPercent <= 3) return '#28a745';
    if (dropPercent <= 5) return '#d39e00';
    return '#e44d4d';
}

// Рендер результатов расчета кабеля
// Функция renderVoltageDrop: Отрисовывает блок результатов падения напряжения.
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

// Функция renderMainResult: Отрисовывает карточку итогов по кабелю и автомату.
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
// Функция updateVoltageUI: Переключает элементы ввода напряжения в зависимости от типа сети.
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

// Функция updateCosPhiUI: Показывает или скрывает блок ручного ввода cos φ.
function updateCosPhiUI(netType) {
    if (netType === 'DC') {
        el.cosPhiToggleGroup.style.display = 'none';
        el.cosPhiGroup.style.display = 'none';
        return;
    }

    el.cosPhiToggleGroup.style.display = 'block';
    el.cosPhiGroup.style.display = el.manualCosPhiCheck.checked ? 'block' : 'none';
}

// Функция updateInputPlaceholder: Обновляет подпись и placeholder поля исходного значения.
function updateInputPlaceholder(inputType) {
    const isCurrent = inputType === 'current';
    if (el.inputValueLabel) {
        el.inputValueLabel.textContent = isCurrent
            ? 'Ток потребителя (А)'
            : 'Мощность потребителя (кВт)';
    }
    el.inputValue.placeholder = isCurrent
        ? 'Например: 10'
        : 'Например: 5,5';
}

// Основной расчет: сечение провода и номинал автомата
// Функция calculate: Выполняет основной расчет сечения кабеля и номинала автомата.
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
    scrollIntoViewSmart(el.resultBlock, 'start');
}

// Функция updateHybridEnergyLabel: Меняет подпись поля потребления для суточного/месячного режима.
function updateHybridEnergyLabel() {
    if (!el.hybridConsumptionBasis || !el.hybridEnergyLabel || !el.hybridEnergyValue) return;
    const isMonthly = el.hybridConsumptionBasis.value === 'monthly';
    el.hybridEnergyLabel.textContent = isMonthly
        ? 'Месячное потребление (кВт·ч)'
        : 'Суточное потребление (кВт·ч)';
    el.hybridEnergyValue.placeholder = isMonthly ? 'Например: 450' : 'Например: 18';
}

// Функция getHybridBatteryProfile: Возвращает профиль АКБ: DoD и КПД по выбранному типу.
function getHybridBatteryProfile(type) {
    if (type === 'agm') {
        return { dod: 0.5, efficiency: 0.8, label: 'AGM/GEL: DoD 50%, КПД 80%' };
    }
    return { dod: 0.9, efficiency: 0.94, label: 'LiFePO4: DoD 90%, КПД 94%' };
}

// Функция pickHybridInverterPower: Округляет требуемую мощность до ближайшей стандартной модели инвертора.
function pickHybridInverterPower(requiredKw) {
    return HYBRID_INVERTER_STEPS_KW.find((powerKw) => powerKw >= requiredKw)
        || HYBRID_INVERTER_STEPS_KW[HYBRID_INVERTER_STEPS_KW.length - 1];
}

// Функция estimateInverterSelfUseWatts: Оценивает собственное потребление инвертора в ваттах.
function estimateInverterSelfUseWatts(inverterKw) {
    // Типичный диапазон собственного потребления инвертора при работе.
    const estimated = inverterKw * 18;
    return Math.min(120, Math.max(20, estimated));
}

// Функция revealHybridResultCard: Показывает карточку результата подбора гибридной системы и прокручивает к ней.
function revealHybridResultCard() {
    if (!el.hybridResult) return;

    el.hybridResult.style.display = 'block';
    el.hybridResult.classList.remove('result-card-animate');
    // Перезапуск CSS-анимации при повторном расчете.
    void el.hybridResult.offsetWidth;
    el.hybridResult.classList.add('result-card-animate');

    requestAnimationFrame(() => {
        scrollIntoViewSmart(el.hybridResult, 'start');
    });
}

// Функция calculateHybridSystem: Считает подбор гибридного инвертора и аккумуляторов.
function calculateHybridSystem() {
    const basis = el.hybridConsumptionBasis.value;
    const inputEnergyKwh = parseFloat(el.hybridEnergyValue.value);
    const autonomyHours = parseFloat(el.hybridAutonomyHours.value);
    const batteryVoltage = parseFloat(el.hybridBatteryVoltage.value);
    const batteryType = el.hybridBatteryType.value;
    const reservePercent = parseFloat(el.hybridInverterReserve.value);
    const peakLoadKw = parseFloat(el.hybridPeakLoadKw.value);

    if (!Number.isFinite(inputEnergyKwh) || inputEnergyKwh <= 0) {
        alert('Введите корректное потребление электроэнергии.');
        return;
    }
    if (!Number.isFinite(autonomyHours) || autonomyHours <= 0) {
        alert('Введите корректное время автономии.');
        return;
    }
    if (!Number.isFinite(batteryVoltage) || batteryVoltage <= 0) {
        alert('Введите корректное напряжение АКБ.');
        return;
    }
    if (!Number.isFinite(reservePercent) || reservePercent < 0 || reservePercent > 200) {
        alert('Запас мощности инвертора должен быть от 0 до 200%.');
        return;
    }

    const dailyKwh = basis === 'monthly' ? inputEnergyKwh / 30 : inputEnergyKwh;
    const avgPowerKw = dailyKwh / 24;
    const autonomyEnergyKwh = dailyKwh * (autonomyHours / 24);

    const reserveFactor = 1 + (reservePercent / 100);
    const powerFromAverageKw = avgPowerKw * reserveFactor;
    const targetInverterKw = Number.isFinite(peakLoadKw) && peakLoadKw > 0
        ? Math.max(peakLoadKw, powerFromAverageKw)
        : powerFromAverageKw;
    const inverterKw = pickHybridInverterPower(targetInverterKw);
    const surgeKw = inverterKw * 2;
    const inverterSelfUseW = estimateInverterSelfUseWatts(inverterKw);
    const inverterSelfUseKwh = (inverterSelfUseW * autonomyHours) / 1000;
    const totalAutonomyEnergyKwh = autonomyEnergyKwh + inverterSelfUseKwh;

    const batteryProfile = getHybridBatteryProfile(batteryType);
    const minSocPercent = (1 - batteryProfile.dod) * 100;
    const nominalBatteryEnergyKwh = totalAutonomyEnergyKwh / (batteryProfile.dod * batteryProfile.efficiency);
    const batteryAh = (nominalBatteryEnergyKwh * 1000) / batteryVoltage;

    el.resHybridDailyKwh.innerText = `${dailyKwh.toFixed(2)} кВт·ч/сут`;
    el.resHybridAvgPower.innerText = `${avgPowerKw.toFixed(2)} кВт`;
    el.resHybridInverterPower.innerText = `${inverterKw.toFixed(1)} кВт`;
    el.resHybridSurgePower.innerText = `не менее ${surgeKw.toFixed(1)} кВт (кратковременно)`;
    el.resHybridAutonomyEnergy.innerText = `${autonomyEnergyKwh.toFixed(2)} кВт·ч`;
    el.resHybridInverterSelfUse.innerText = `${inverterSelfUseW.toFixed(0)} Вт (${inverterSelfUseKwh.toFixed(2)} кВт·ч за ${autonomyHours.toFixed(1)} ч)`;
    el.resHybridTotalAutonomyEnergy.innerText = `${totalAutonomyEnergyKwh.toFixed(2)} кВт·ч`;
    el.resHybridBatteryEnergy.innerText = `${nominalBatteryEnergyKwh.toFixed(2)} кВт·ч`;
    el.resHybridBatteryAh.innerText = `${Math.ceil(batteryAh)} А·ч @ ${batteryVoltage} В`;
    el.resHybridMinSoc.innerText = `не ниже ${minSocPercent.toFixed(0)}%`;
    el.resHybridAssumptions.innerText = batteryProfile.label;
    revealHybridResultCard();
}

// Функция updateMeasuredResistanceDefault: Подставляет типовое значение сопротивления на 1 м по материалу.
function updateMeasuredResistanceDefault() {
    if (!el.resistanceMaterial || !el.measuredResistance) return;
    const value = RESISTANCE_CHECK_DEFAULT[el.resistanceMaterial.value];
    if (!Number.isFinite(value)) return;
    el.measuredResistance.value = value.toFixed(4);
}

// Функция pickNearestResistanceLimit: Подбирает ближайшее табличное сечение по рассчитанному значению.
function pickNearestResistanceLimit(material, section) {
    const variants = RESISTANCE_LIMIT_PER_M[material] || [];
    if (!variants.length || !Number.isFinite(section)) return null;
    return variants.reduce((best, item) => {
        if (!best) return item;
        const currentDiff = Math.abs(item.section - section);
        const bestDiff = Math.abs(best.section - section);
        return currentDiff < bestDiff ? item : best;
    }, null);
}

// Функция calculateSectionByResistance: Считает фактическое сечение по измеренному сопротивлению.
function calculateSectionByResistance() {
    if (!el.resistanceMaterial || !el.resistanceLength || !el.measuredResistance) return;

    const material = el.resistanceMaterial.value;
    const length = parseFloat(el.resistanceLength.value);
    const resistance = parseFloat(el.measuredResistance.value);
    const rho = RESISTIVITY[material];

    if (!Number.isFinite(length) || length <= 0) {
        alert('Введите корректную длину кабеля.');
        return;
    }
    if (!Number.isFinite(resistance) || resistance <= 0) {
        alert('Введите корректное измеренное сопротивление.');
        return;
    }
    if (!Number.isFinite(rho) || rho <= 0) {
        alert('Не удалось определить материал кабеля.');
        return;
    }

    const section = (rho * length) / resistance;
    if (!Number.isFinite(section) || section <= 0) {
        alert('Не удалось рассчитать сечение. Проверьте введенные данные.');
        return;
    }

    el.resCalculatedSection.innerText = `${section.toFixed(3)} мм²`;

    const tableEntry = pickNearestResistanceLimit(material, section);
    if (tableEntry && el.resTabularSection && el.resAllowedResistance && el.resResistanceDeviation && el.resAllowedDeviation && el.resAllowedDeviationRow) {
        const idealResistance = (rho * length) / tableEntry.section;
        const allowedResistance = tableEntry.resistancePerMeter * length;
        const deviationPercent = ((resistance - idealResistance) / idealResistance) * 100;
        const allowedDeviationPercent = ((resistance - allowedResistance) / allowedResistance) * 100;
        const isWithinLimit = resistance <= allowedResistance;

        el.resTabularSection.innerText = `${tableEntry.section} мм²`;
        el.resAllowedResistance.innerText = `${allowedResistance.toFixed(6)} Ом`;
        el.resResistanceDeviation.innerText = `${deviationPercent >= 0 ? '+' : ''}${deviationPercent.toFixed(1)}%`;
        el.resResistanceDeviation.style.color = isWithinLimit ? '#28a745' : '#dc3545';
        el.resAllowedDeviation.innerText = `${allowedDeviationPercent >= 0 ? '+' : ''}${allowedDeviationPercent.toFixed(1)}%`;
        el.resAllowedDeviation.style.color = isWithinLimit ? '' : '#dc3545';
        el.resAllowedDeviationRow.style.display = isWithinLimit ? 'none' : 'flex';
    } else if (el.resAllowedDeviationRow) {
        el.resAllowedDeviationRow.style.display = 'none';
    }

    el.resistanceSectionResult.style.display = 'block';
    el.resistanceSectionResult.classList.remove('result-card-animate');
    void el.resistanceSectionResult.offsetWidth;
    el.resistanceSectionResult.classList.add('result-card-animate');
    scrollIntoViewSmart(el.resistanceSectionResult, 'start');
}

// Функция updateShieldInputUI: Переключает режим ввода данных для расчета щита.
function updateShieldInputUI() {
    const bySection = el.shieldInputBasis.value === 'section';
    el.shieldSectionGroup.style.display = bySection ? 'block' : 'none';
    el.shieldPowerGroup.style.display = bySection ? 'none' : 'block';
}

// Функция pickInputBreakerBySection: Подбирает вводной автомат по сечению, материалу и типу прокладки кабеля.
function pickInputBreakerBySection({ material, routing, section }) {
    const dataSet = getCableDataSet(material);
    const cable = dataSet.find((entry) => entry.section >= section);
    if (!cable) return null;
    const maxCurrent = routing === 'air' ? cable.air : cable.pipe;
    const allowedBreaker = maxCurrent * 0.8;
    const variants = BREAKERS.filter((breaker) => breaker <= allowedBreaker);
    return variants.length ? variants[variants.length - 1] : null;
}

// Функция calcInputCurrentFromPower: Считает вводной ток по расчетной мощности и количеству фаз.
function calcInputCurrentFromPower(powerKw, phases) {
    const powerW = powerKw * 1000;
    if (phases === 3) return powerW / (SQRT_3 * 400 * DEFAULT_COS_PHI);
    return powerW / (230 * DEFAULT_COS_PHI);
}

// Функция getRelayRecommendation: Формирует рекомендацию по реле напряжения.
function getRelayRecommendation(breaker, phases) {
    const poles = phases === 3 ? '4P' : '2P';
    if (breaker > MAX_RELAY_DIRECT_AMP) {
        return `${poles}, ${MAX_RELAY_DIRECT_AMP} А + контактор (катушка через реле)`;
    }
    return `${poles}, не менее ${breaker} А`;
}

// Функция getRcdRecommendation: Формирует рекомендацию по вводному УЗО.
function getRcdRecommendation(breaker, phases) {
    const poles = phases === 3 ? '4P' : '2P';
    const rcdNominal = BREAKERS.find((value) => value >= breaker) || breaker;
    return `${poles}, ${rcdNominal} А, 100 мА, тип S`;
}

// Функция getBaseShieldModules: Возвращает базовое количество модулей щита для выбранной фазности.
function getBaseShieldModules(phases) {
    if (phases === 3) return 12;
    return 6;
}

// Функция getLineModuleCount: Определяет число модулей на одну линию в щите.
function getLineModuleCount(row) {
    if (!row) return 0;
    return row.protectionType === 'diff' ? 2 : 1;
}

// Функция getShieldMainConsumerGroups: Готовит группы основных линий для раздела щита.
function getShieldMainConsumerGroups() {
    return OBJECT_CONSUMERS
        .map((room) => ({
            room: room.room,
            items: [...room.items].sort((a, b) => {
                const weightA = a.priority === 'must' ? 0 : 1;
                const weightB = b.priority === 'must' ? 0 : 1;
                return weightA - weightB;
            }),
        }))
        .filter((room) => room.items.length);
}

// Функция pickShieldMainProtection: Подбирает защиту линии щита по мощности потребителя.
function pickShieldMainProtection(item) {
    const power = parseFloat(item.power);
    const calcCurrent = Number.isFinite(power) && power > 0
        ? power / (OBJECT_DETAIL_VOLTAGE * DEFAULT_COS_PHI)
        : null;
    const pickedBreaker = Number.isFinite(calcCurrent) ? pickBreaker(calcCurrent) : null;
    const amp = item.minBreaker
        ? Math.max(item.minBreaker, pickedBreaker || item.minBreaker)
        : pickedBreaker;

    return {
        type: item.diffAuto ? 'diff' : 'breaker',
        amp: Number.isFinite(amp) ? amp : null,
        curve: DEFAULT_PROTECTION_CURVE,
    };
}

// Функция renderShieldMainLines: Отрисовывает список основных линий для добавления в щит.
function renderShieldMainLines() {
    const groups = getShieldMainConsumerGroups();
    if (!groups.length) {
        el.shieldMainRooms.innerHTML = '<p class="hint">Основные линии не найдены.</p>';
        return;
    }

    const selectedByKey = new Map();
    selectedShieldExtras.forEach((item) => {
        if (!item.sourceKey || !item.sourceKey.startsWith('main::')) return;
        selectedByKey.set(item.sourceKey, (selectedByKey.get(item.sourceKey) || 0) + 1);
    });

    const html = groups.map((group) => {
        const isExpanded = expandedShieldMainRooms.has(group.room);
        const rowsHtml = group.items.map((item) => {
            const key = `main::${group.room}::${item.name}`;
            const isSelected = (selectedByKey.get(key) || 0) > 0;
            const moduleCount = item.diffAuto ? 2 : 1;
            const priorityClass = item.diffAuto ? 'must' : 'optional';
            const protection = pickShieldMainProtection(item);

            return `
                <div
                    class="consumer-row selectable ${isSelected ? 'selected' : ''}"
                    data-shield-main-key="${key}"
                    data-shield-main-room="${group.room}"
                    data-shield-main-name="${item.name}"
                    data-shield-main-modules="${moduleCount}"
                    data-shield-main-protection-type="${protection.type}"
                    data-shield-main-protection-amp="${protection.amp || ''}"
                    data-shield-main-protection-curve="${protection.curve}"
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
                <button type="button" class="room-toggle" data-shield-main-room-toggle="${group.room}">
                    <span>${group.room}</span>
                    <span class="room-arrow">${isExpanded ? '▾' : '▸'}</span>
                </button>
                <div class="room-content" style="display: ${isExpanded ? 'block' : 'none'};">
                    ${rowsHtml}
                </div>
            </div>
        `;
    }).join('');

    el.shieldMainRooms.innerHTML = html;
}

// Функция toggleShieldMainRoom: Сворачивает или разворачивает группу основных линий щита.
function toggleShieldMainRoom(roomName) {
    if (!roomName) return;
    if (expandedShieldMainRooms.has(roomName)) {
        expandedShieldMainRooms.delete(roomName);
    } else {
        expandedShieldMainRooms.add(roomName);
    }
    renderShieldMainLines();
}

// Функция renderShieldExtras: Отрисовывает список вручную добавленных модулей щита.
function renderShieldExtras() {
    if (!selectedShieldExtras.length) {
        el.shieldExtraModulesList.innerHTML = '<p class="hint">Дополнительные модули не добавлены.</p>';
        return;
    }

    const totalByBaseName = new Map();
    selectedShieldExtras.forEach((item) => {
        const baseName = item.baseName || item.name;
        totalByBaseName.set(baseName, (totalByBaseName.get(baseName) || 0) + 1);
    });

    const orderByBaseName = new Map();
    const numberedItems = selectedShieldExtras.map((item) => {
        const baseName = item.baseName || item.name;
        const currentOrder = (orderByBaseName.get(baseName) || 0) + 1;
        orderByBaseName.set(baseName, currentOrder);
        const shouldNumber = (totalByBaseName.get(baseName) || 0) > 1;

        return {
            ...item,
            displayName: shouldNumber ? `${baseName} ${currentOrder}` : baseName,
        };
    });

    const html = numberedItems.map((item) => (
        `
            <div class="consumer-row">
                <div>
                    <div class="consumer-name-row">
                        <strong>${item.displayName}</strong>
                    </div>
                </div>
                <button type="button" class="remove-selected-btn" data-remove-shield-extra-id="${item.id}" aria-label="Удалить ${item.displayName}">×</button>
            </div>
        `
    )).join('');
    el.shieldExtraModulesList.innerHTML = html;
}

// Функция renderShieldLineCandidates: Отрисовывает кандидатов линий из расчета объекта для добавления в щит.
function renderShieldLineCandidates() {
    if (!el.shieldLineCandidates) return;

    const sourceRows = lastDetailRows.length
        ? lastDetailRows
        : getNumberedSelectedEntries().map(buildObjectLineDetail);
    const availableRows = sourceRows.filter((row) => row.breakerAmp);
    if (!availableRows.length) {
        el.shieldLineCandidates.innerHTML = '<p class="hint">Добавьте потребителей в разделе "Расчет мощности объекта", чтобы получить список линий.</p>';
        return;
    }

    const grouped = new Map();
    availableRows.forEach((row) => {
        const room = row.room || 'Без группы';
        if (!grouped.has(room)) grouped.set(room, []);
        grouped.get(room).push(row);
    });

    Array.from(expandedShieldRooms).forEach((room) => {
        if (!grouped.has(room)) expandedShieldRooms.delete(room);
    });

    const html = Array.from(grouped.keys()).map((room) => {
        const isExpanded = expandedShieldRooms.has(room);
        const rowsHtml = grouped.get(room).map((row) => {
            const moduleCount = getLineModuleCount(row);
            const protectionCurve = DEFAULT_PROTECTION_CURVE;
            return `
                <button
                    type="button"
                    class="menu-btn shield-line-btn"
                    data-add-line-module-id="${row.id}"
                    data-add-line-module-name="${row.name}"
                    data-add-line-module-count="${moduleCount}"
                    data-add-line-protection-type="${row.protectionType || 'breaker'}"
                    data-add-line-protection-amp="${row.breakerAmp || ''}"
                    data-add-line-protection-curve="${protectionCurve}"
                >
                    ${row.name}: ${row.breaker} (${moduleCount} мод.)
                </button>
            `;
        }).join('');

        return `
            <div class="room-block">
                <button type="button" class="room-toggle" data-shield-room-toggle="${room}">
                    <span>${room}</span>
                    <span class="room-arrow">${isExpanded ? '▾' : '▸'}</span>
                </button>
                <div class="room-content" style="display: ${isExpanded ? 'block' : 'none'};">
                    ${rowsHtml}
                </div>
            </div>
        `;
    }).join('');

    el.shieldLineCandidates.innerHTML = html;
}

// Функция toggleShieldRoom: Сворачивает или разворачивает группу кандидатов линий щита.
function toggleShieldRoom(roomName) {
    if (!roomName) return;
    if (expandedShieldRooms.has(roomName)) {
        expandedShieldRooms.delete(roomName);
    } else {
        expandedShieldRooms.add(roomName);
    }
    renderShieldLineCandidates();
}

// Функция addShieldExtra: Добавляет модуль или линию в дополнительные элементы щита.
function addShieldExtra(baseName, modules, sourceKey = '', protection = null) {
    if (!baseName || !Number.isFinite(modules) || modules <= 0) return;
    selectedShieldExtras.push({
        id: ++shieldExtraIdCounter,
        name: baseName,
        baseName,
        modules,
        sourceKey,
        protectionType: protection && protection.type ? protection.type : null,
        protectionAmp: protection && Number.isFinite(protection.amp) ? protection.amp : null,
        protectionCurve: protection && protection.curve ? protection.curve : DEFAULT_PROTECTION_CURVE,
    });
    renderShieldExtras();
    renderShieldMainLines();
    if (el.shieldResult.style.display === 'block') {
        calculateShield({ scrollToResult: false });
    }
}

// Функция renderShieldEquipmentList: Формирует таблицу закупки оборудования для щита.
function renderShieldEquipmentList({ poles, breaker, relay, rcd, boardSize }) {
    if (!el.shieldEquipmentRows || !el.shieldEquipmentCard) return false;

    const rows = [
        { name: `Вводной автомат ${poles} ${DEFAULT_PROTECTION_CURVE}${breaker} А`, spec: '1 шт' },
        { name: `Реле напряжения ${relay}`, spec: '1 шт' },
        { name: `УЗО вводное ${rcd}`, spec: '1 шт' },
        { name: `Щит ${boardSize} мод.`, spec: '1 шт' },
    ];

    if (selectedShieldExtras.length) {
        const protectionMap = new Map();
        const fallbackByName = new Map();

        selectedShieldExtras.forEach((item) => {
            if (item.protectionType && Number.isFinite(item.protectionAmp)) {
                const curve = item.protectionCurve || DEFAULT_PROTECTION_CURVE;
                const key = `${item.protectionType}:${curve}:${item.protectionAmp}`;
                protectionMap.set(key, (protectionMap.get(key) || 0) + 1);
                return;
            }

            const baseName = item.baseName || item.name;
            fallbackByName.set(baseName, (fallbackByName.get(baseName) || 0) + 1);
        });

        Array.from(protectionMap.keys()).sort((a, b) => {
            const [typeA, curveA, ampA] = a.split(':');
            const [typeB, curveB, ampB] = b.split(':');
            if (typeA !== typeB) return typeA.localeCompare(typeB);
            if (curveA !== curveB) return curveA.localeCompare(curveB);
            return Number(ampA) - Number(ampB);
        }).forEach((key) => {
            const [type, curve, amp] = key.split(':');
            const label = type === 'diff' ? 'Диф. автомат' : 'Автомат';
            rows.push({
                name: `${label} ${curve}${amp} А`,
                spec: `${protectionMap.get(key)} шт`,
            });
        });

        Array.from(fallbackByName.keys()).sort((a, b) => a.localeCompare(b, 'ru')).forEach((name) => {
            rows.push({ name, spec: `${fallbackByName.get(name)} шт` });
        });
    }

    el.shieldEquipmentRows.innerHTML = rows.map((row) => (
        `<tr><td>${row.name}</td><td>${row.spec}</td></tr>`
    )).join('');
    el.shieldEquipmentCard.style.display = 'block';
    return true;
}

// Функция calculateShield: Выполняет расчет вводного щита и выводит рекомендации.
function calculateShield(options = {}) {
    const { scrollToResult = true } = options;
    const basis = el.shieldInputBasis.value;
    const phases = parseInt(el.shieldPhases.value, 10);
    const material = el.shieldMaterial.value;
    const routing = el.shieldRouting.value;

    let breaker = null;
    if (basis === 'section') {
        const section = parseFloat(el.shieldCableSection.value);
        if (!Number.isFinite(section) || section <= 0) {
            alert('Введите корректное сечение вводного кабеля.');
            return;
        }
        breaker = pickInputBreakerBySection({ material, routing, section });
        if (!breaker) {
            alert('Для указанного сечения не удалось подобрать вводной автомат. Проверьте сечение и материал.');
            return;
        }
    } else {
        const powerKw = parseFloat(el.shieldPowerKw.value);
        if (!Number.isFinite(powerKw) || powerKw <= 0) {
            alert('Введите корректную расчетную мощность.');
            return;
        }
        const calcCurrent = calcInputCurrentFromPower(powerKw, phases);
        breaker = pickBreaker(calcCurrent);
        if (!breaker) {
            alert('Расчетный ток вне диапазона поддерживаемых автоматов.');
            return;
        }
    }

    const relay = getRelayRecommendation(breaker, phases);
    const rcd = getRcdRecommendation(breaker, phases);
    const baseModules = getBaseShieldModules(phases);
    const extraModules = selectedShieldExtras.reduce((sum, item) => sum + item.modules, 0);
    const totalModules = baseModules + extraModules;
    const boardSize = Math.ceil(totalModules / SHIELD_MODULE_STEP) * SHIELD_MODULE_STEP;
    const poles = phases === 3 ? '4P' : '2P';

    el.resShieldBreaker.innerText = `${poles}, ${breaker} А`;
    el.resShieldRelay.innerText = relay;
    el.resShieldRcd.innerText = rcd;
    el.resShieldTotalModules.innerText = `${totalModules} мод.`;
    el.resShieldBoardSize.innerText = `${boardSize} мод.`;
    const hasEquipmentCard = renderShieldEquipmentList({ poles, breaker, relay, rcd, boardSize });
    el.shieldResult.style.display = 'block';
    if (scrollToResult) {
        if (hasEquipmentCard && el.shieldEquipmentCard) {
            el.shieldEquipmentCard.style.display = 'block';
            scrollIntoViewSmart(el.shieldEquipmentCard, 'start');
        } else {
            scrollIntoViewSmart(el.shieldResult, 'start');
        }
    }
}

// Рендер списка потребителей по помещениям
// Функция renderObjectConsumers: Отрисовывает список потребителей по помещениям.
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

// Функция toggleRoom: Сворачивает или разворачивает группу потребителей помещения.
function toggleRoom(roomName) {
    if (!roomName) return;
    if (expandedRooms.has(roomName)) {
        expandedRooms.delete(roomName);
    } else {
        expandedRooms.add(roomName);
    }
    renderObjectConsumers();
}

// Функция getNumberedSelectedEntries: Возвращает выбранные потребители с нумерацией повторов.
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

// Функция renderSelectedConsumers: Отрисовывает список выбранных потребителей для расчета объекта.
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

// Функция buildObjectLineDetail: Собирает расчетные параметры одной линии объекта.
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
        room: entry.room || 'Без группы',
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

// Функция renderObjectDetailRows: Отрисовывает таблицу расчета линий объекта.
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

// Функция renderMaterialsSummary: Формирует свод материалов и расходников по линиям.
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
    const pushGroupTitle = (title) => {
        lines.push(`<li class="materials-group-title">${title}</li>`);
    };

    pushGroupTitle('Защита');
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

    pushGroupTitle('Кабель');
    Array.from(cableMap.keys()).sort((a, b) => a - b).forEach((section) => {
        const totalWithReserve = cableMap.get(section) * 1.15;
        lines.push(`Кабель ВВГнг-LS 3x${section} мм² - ${totalWithReserve.toFixed(1)} м (+15%)`);
    });

    if (el.includeConsumablesCheck && el.includeConsumablesCheck.checked) {
        const linesCount = rows.length;
        const totalCableMeters = rows.reduce((sum, row) => sum + (row.cableLengthMeters || 0), 0);
        const clipsQty = Math.ceil(totalCableMeters / CONSUMABLES.clipStepMeters);
        const wagoQty = linesCount * CONSUMABLES.wagoPerLine;
        const markingQty = linesCount * CONSUMABLES.markingPerLine;
        const fastenerQty = Math.ceil(totalCableMeters / CONSUMABLES.fastenerStepMeters);
        pushGroupTitle('Расходники');
        lines.push(`Клипсы/хомуты - ${clipsQty} шт (шаг ${CONSUMABLES.clipStepMeters} м)`);
        lines.push(`Клеммы WAGO - ${wagoQty} шт (${CONSUMABLES.wagoPerLine} шт/линия)`);
        lines.push(`Маркировка/бирки - ${markingQty} шт (${CONSUMABLES.markingPerLine} шт/линия)`);
        lines.push(`Саморез+дюбель - ${fastenerQty} компл (шаг ${CONSUMABLES.fastenerStepMeters} м)`);
    }

    if (!lines.length) {
        lines.push('Недостаточно данных для подсчета материалов');
    }

    el.materialsList.innerHTML = lines.map((line) => (
        line.startsWith('<li ') ? line : `<li>${line}</li>`
    )).join('');
    el.materialsCard.style.display = 'block';
}

// Функция invalidateObjectCalculation: Сбрасывает результаты расчета объекта при изменении входных данных.
function invalidateObjectCalculation() {
    el.objectResult.style.display = 'none';
    el.objectDetailCard.style.display = 'none';
    el.materialsCard.style.display = 'none';
    lastDetailRows = [];
    renderShieldLineCandidates();
}

// Функция toggleObjectConsumerSelection: Добавляет выбранного потребителя в список расчета объекта.
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
// Функция calculateObjectPower: Выполняет расчет суммарной мощности и тока объекта.
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
    lastDetailRows = detailRows;
    renderObjectDetailRows(detailRows);
    renderMaterialsSummary(detailRows);
    renderShieldLineCandidates();
    scrollIntoViewSmart(el.objectResult, 'start');
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

// Функция resetSwipeState: Сбрасывает внутреннее состояние свайп-навигации.
function resetSwipeState() {
    swipeStartX = 0;
    swipeStartY = 0;
    swipeStartTime = 0;
    swipeEdge = null;
}

// Функция isInteractiveTarget: Проверяет, является ли элемент интерактивным для блокировки свайпа.
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
el.inputType.addEventListener('change', (e) => {
    updateInputPlaceholder(e.target.value);
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
        lastDetailRows = detailRows;
        renderObjectDetailRows(detailRows);
        renderMaterialsSummary(detailRows);
        renderShieldLineCandidates();
    }
});
el.includeConsumablesCheck.addEventListener('change', () => {
    if (!lastDetailRows.length || el.materialsCard.style.display !== 'block') return;
    renderMaterialsSummary(lastDetailRows);
});
el.shieldInputBasis.addEventListener('change', updateShieldInputUI);
el.calcShieldBtn.addEventListener('click', calculateShield);
if (el.hybridConsumptionBasis) {
    el.hybridConsumptionBasis.addEventListener('change', updateHybridEnergyLabel);
}
if (el.calcHybridBtn) {
    el.calcHybridBtn.addEventListener('click', calculateHybridSystem);
}
if (el.resistanceMaterial) {
    el.resistanceMaterial.addEventListener('change', updateMeasuredResistanceDefault);
}
if (el.calcResistanceSectionBtn) {
    el.calcResistanceSectionBtn.addEventListener('click', calculateSectionByResistance);
}
if (el.shieldAddManualModuleBtn) {
    el.shieldAddManualModuleBtn.addEventListener('click', () => {
        const name = (el.shieldManualModuleName.value || '').trim();
        const modules = parseInt(el.shieldManualModuleCount.value, 10);
        if (!name) {
            alert('Введите название модуля.');
            return;
        }
        if (!Number.isFinite(modules) || modules <= 0) {
            alert('Введите корректное количество модулей.');
            return;
        }
        addShieldExtra(name, modules);
        el.shieldManualModuleName.value = '';
        el.shieldManualModuleCount.value = '';
    });
}
if (el.recalcShieldBtn) {
    el.recalcShieldBtn.addEventListener('click', calculateShield);
}
el.shieldExtraModulesList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-shield-extra-id]');
    if (!removeBtn) return;
    const id = parseInt(removeBtn.dataset.removeShieldExtraId, 10);
    if (!Number.isFinite(id)) return;
    const index = selectedShieldExtras.findIndex((item) => item.id === id);
    if (index === -1) return;
    selectedShieldExtras.splice(index, 1);
    renderShieldExtras();
    renderShieldMainLines();
    if (el.shieldResult.style.display === 'block') {
        calculateShield({ scrollToResult: false });
    }
});
el.shieldMainRooms.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-shield-main-room-toggle]');
    if (toggleBtn) {
        toggleShieldMainRoom(toggleBtn.dataset.shieldMainRoomToggle);
        return;
    }

    const row = e.target.closest('[data-shield-main-key]');
    if (!row) return;
    const key = row.dataset.shieldMainKey;
    const name = row.dataset.shieldMainName;
    const modules = parseInt(row.dataset.shieldMainModules, 10);
    const protectionType = row.dataset.shieldMainProtectionType || 'breaker';
    const protectionAmp = parseInt(row.dataset.shieldMainProtectionAmp, 10);
    const protectionCurve = row.dataset.shieldMainProtectionCurve || DEFAULT_PROTECTION_CURVE;
    if (!Number.isFinite(modules) || modules <= 0) return;
    addShieldExtra(name, modules, key, {
        type: protectionType,
        amp: Number.isFinite(protectionAmp) ? protectionAmp : null,
        curve: protectionCurve,
    });
});
if (el.shieldLineCandidates) {
    el.shieldLineCandidates.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('[data-shield-room-toggle]');
        if (toggleBtn) {
            toggleShieldRoom(toggleBtn.dataset.shieldRoomToggle);
            return;
        }

        const addBtn = e.target.closest('[data-add-line-module-id]');
        if (!addBtn) return;
        const id = parseInt(addBtn.dataset.addLineModuleId, 10);
        const name = addBtn.dataset.addLineModuleName;
        const modules = parseInt(addBtn.dataset.addLineModuleCount, 10);
        const protectionType = addBtn.dataset.addLineProtectionType || 'breaker';
        const protectionAmp = parseInt(addBtn.dataset.addLineProtectionAmp, 10);
        const protectionCurve = addBtn.dataset.addLineProtectionCurve || DEFAULT_PROTECTION_CURVE;
        if (!Number.isFinite(id) || !name || !Number.isFinite(modules) || modules <= 0) return;
        addShieldExtra(name, modules, `object::${id}`, {
            type: protectionType,
            amp: Number.isFinite(protectionAmp) ? protectionAmp : null,
            curve: protectionCurve,
        });
    });
}
el.calcBtn.addEventListener('click', calculate);
el.calcObjectBtn.addEventListener('click', calculateObjectPower);

// Первичная инициализация UI
renderObjectConsumers();
renderSelectedConsumers();
updateVoltageUI(el.netType.value);
updateCosPhiUI(el.netType.value);
updateInputPlaceholder(el.inputType.value);
updateShieldInputUI();
updateHybridEnergyLabel();
renderShieldExtras();
renderShieldMainLines();
renderShieldLineCandidates();
updateMeasuredResistanceDefault();

