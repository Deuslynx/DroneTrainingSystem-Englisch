// ----- state.js -----
// Small pieces of shared mutable state that multiple modules need to read
// and write. Kept in one place so every module imports the same live
// bindings instead of each module owning its own local copy.

export let secAfterStart = 0;
export function setSecAfterStart(v) { secAfterStart = v; }

export let timeEventInterval = -1;
export function setTimeEventInterval(v) { timeEventInterval = v; }

export let charaterInstalledScript_isDrone = new Map();
export function resetCharaterInstalledScript() { charaterInstalledScript_isDrone = new Map(); }

export let showedEnterHelp = false;
export function setShowedEnterHelp(v) { showedEnterHelp = v; }

export let showChangeLog = false;
export function setShowChangeLog(v) { showChangeLog = v; }

export let initComplete = false;
export function setInitComplete(v) { initComplete = v; }

export let isRefreshBinding = false;
export function setIsRefreshBinding(v) { isRefreshBinding = v; }

export let lastRefreshBindsTime = new Date();
export function setLastRefreshBindsTime(v) { lastRefreshBindsTime = v; }

export let lastBattery = null;
export function setLastBattery(v) { lastBattery = v; }

export let trainingProcess = 0;
export function setTrainingProcess(v) { trainingProcess = v; }
export function addTrainingProcess(v = 1) { trainingProcess += v; }

export let isTraining = false;
export function setIsTraining(v) { isTraining = v; }

export let isEducationing = false;
export function setIsEducationing(v) { isEducationing = v; }

export let pverPos = null;
export function setPverPos(v) { pverPos = v; }

export let selectModify = "";
export function setSelectModify(v) { selectModify = v; }

export let _PlayerDroneInfo = null;
export function set_PlayerDroneInfo(v) { _PlayerDroneInfo = v; }