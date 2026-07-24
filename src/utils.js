// ----- utils.js -----
// Generic helpers with no dependency on Drone/room/command state:
// sleeping/waiting, geometry helpers, chat-log rendering (messages,
// buttons, progress bars).
//
// NOTE: MovePlayer has a circular dependency with hooks.js/rooms.js
// (DTSPlayerMoved / PlayerMovedFaci call geometry helpers from this file,
// and are themselves called from here). This is safe in ESM because all
// three are hoisted function declarations - by the time MovePlayer() is
// actually invoked at runtime, every module has finished evaluating.
import { DTSPlayerMoved } from "./hooks.js";
import { PlayerMovedFaci } from "./rooms.js";
import { setPverPos } from "./state.js";

export function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function waitFor(func, cancelFunc = () => false) {
    while (!func()) {
        if (cancelFunc()) {
            return false;
        }
        // eslint-disable-next-line no-await-in-loop
        await sleep(10);
    }
    return true;
}

export function findIndices(str, ...strArrays) {
    var map = strArrays.map(arr =>
        arr.map(s => str.indexOf(s))
    );
    var result = [];
    for (var i = 0; i < map.length; i++) {
        var found = false;
        for (var j = 0; j < map[i].length; j++) {
            if (map[i][j] != -1) {
                found = true;
                result.push(j);
                break;
            }
        }
        if (found == false) {
            result.push(-1);
        }
    }
    return result;
}

// ----- Geometry / zones -----
export function IsInZone(Pos, Zone) {
    var isIn = false;
    for (let areaKey in Zone.Areas) {
        if (IsInArea(Pos, Zone.Areas[areaKey])) {
            isIn = areaKey;
            break;
        }
    }
    if (isIn) {
        for (let areaKey in Zone.Exclude) {
            if (IsInArea(Pos, Zone.Exclude[areaKey])) {
                isIn = false;
                break;
            }
        }
    }
    return isIn;
}
export function IsInArea(Pos, Area) {
    var isIn = false;
    if (Area.X != undefined) {
        isIn = IsAtTile(Pos, Area);
    }
    else if (Area.leftUp != undefined) {
        isIn = IsInLURD(Pos, Area);
    }
    else if (Area instanceof Array) {
        isIn = IsAtTileArray(Pos, Area);
    }
    return isIn;
}
export function IsAtTile(Pos, Tile) {
    return (Pos.X == Tile.X && Pos.Y == Tile.Y);
}
export function IsInLURD(Pos, LURD) {
    return (Pos.X >= LURD.leftUp.X && Pos.Y >= LURD.leftUp.Y && Pos.X <= LURD.rightDown.X && Pos.Y <= LURD.rightDown.Y);
}
export function IsAtTileArray(Pos, Tiles) {
    for (var tile of Tiles) {
        if (IsAtTile(Pos, tile)) {
            return true;
        }
    }
    return false;
}
export function RandomPosOfArea(Area) {
    if (Area.X != undefined) {
        return Object.assign({}, Area);
    }
    else if (Area.leftUp != undefined) {
        return {
            X: Math.floor(Math.random() * (Area.rightDown.X - Area.leftUp.X + 1)) + Area.leftUp.X,
            Y: Math.floor(Math.random() * (Area.rightDown.Y - Area.leftUp.Y + 1)) + Area.leftUp.Y,
        };
    }
    else if (Area instanceof Array) {
        return Object.assign({}, Area[Math.floor(Math.random() * Area.length)]);
    }
}
export function GetDistance(Pos, Pos2) {
    return Math.abs(Pos.X - Pos2.X) + Math.abs(Pos.Y - Pos2.Y);
}

export function MovePlayer(Pos, triggerPlayerMoved = false) {
    if (Pos.X == undefined || Pos.Y == undefined) return;
    Player.MapData.Pos = Object.assign({}, Pos);
    ServerSend("ChatRoomCharacterMapDataUpdate", { Pos: Object.assign({}, Pos) });
    if (triggerPlayerMoved) {
        DTSPlayerMoved();
        PlayerMovedFaci();
    }
    else {
        setPverPos(Object.assign({}, Player.MapData.Pos));
    }
}

export function DTSCloneSettings(settings) {
    try {
        if (typeof structuredClone === "function") return structuredClone(settings);
        return JSON.parse(JSON.stringify(settings));
    }
    catch (error) {
        console.warn("DTS: legacy settings could only be shallow-copied.", error);
        return Object.assign({}, settings);
    }
}

// ----- Chat log message rendering -----
export var clearLastTag = ["status", "items", "actions", "missions"];

export function ClearMessageByFunc(func) {
    var elements = document.getElementById('TextAreaChatLog').children;

    for (let i = elements.length - 1; i >= 0; i--) {
        var remove = false;
        var child = elements[i];
        if (child?.children[1]?.dataset?.timestamp != false && child?.children[1]?.dataset?.timestamp != false) {
            if (func(child) == true) {
                remove = true;
            }
            else {
                remove = false;
            }
        }
        else {
            remove = false;
        }
        if (remove) {
            elements[i].remove();
        }
    }
}
export function ClearOldMessage() {
    ClearMessageByFunc((child) => {
        if (child?.children[1]?.dataset?.timestamp) {
            var diff = new Date().getTime() - parseInt(child.children[1].dataset.timestamp);
            return diff > 120 * 1000;
        }
        else {
            return false;
        }
    });
}
export function ClearLastMessage() {
    ClearMessageByFunc((child) => {
        return child?.children[1]?.dataset?.clearatnext == "true";
    });
}
export function ClearTagMessage(tag) {
    ClearMessageByFunc((child) => {
        return child?.children[1]?.dataset?.cleartag == tag;
    });
}
export function ClearAllMessage() {
    ClearMessageByFunc((child) => { return true; });
}

export function styleMessage(message, tag = "", cantClear = false, clearAtNext = false) {
    var timestamp = new Date().getTime();
    if (cantClear) timestamp = false;
    const hiddenString = "styleMessage";
    ClearLastMessage();
    if (clearLastTag.findIndex((t) => { return t == tag; }) > -1) {
        ClearTagMessage(tag);
    }

    return `<div
    data-timestamp="${timestamp}"
    data-style-message="${hiddenString}"
    data-clearatnext="${clearAtNext}"
    data-cleartag="${tag}"
    style='
  background: #000000;
  padding: 8px;
  border: 1px solid #3C3C3C;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
  font-family: Consolas, "Courier New", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  border-radius: 2px;
  color: #00FF00;
  display: flex;
  align-items: baseline;
  gap: 0.4em;
  line-height: 1.5;
'><span style="font-size: 1.2vw;">■</span><span style="
  font-size: 1.6vw;
  white-space: pre-wrap;
  flex: 1;
  line-height: inherit;
  margin: 0;
">${message}_</span></div>`;
}

export function SendMessageToSelf(message, tag = "", cantClear = false, clearAtNext = false) {
    ChatRoomSendLocal(styleMessage(message, tag, cantClear, clearAtNext));
}

export function SendActionText(message, target = null) {
    if (target) {
        ServerSend("ChatRoomChat", {
            Content: "DTS_ACTION_TAG", Type: "Action",
            Dictionary: [
                {
                    Tag: "MISSING TEXT IN \"Interface.csv\": DTS_ACTION_TAG",
                    Text: message
                }
            ],
            Target: target.MemberNumber
        });
    }
    else {
        ServerSend("ChatRoomChat", {
            Content: "DTS_ACTION_TAG", Type: "Action",
            Dictionary: [
                {
                    Tag: "MISSING TEXT IN \"Interface.csv\": DTS_ACTION_TAG",
                    Text: message
                }
            ]
        });
    }
}

// Global callback registry for inline chat-log buttons
const _buttonCallbacks = new Map();
let _globalListenerAttached = false;
/**
 * Generate inline buttons embeddable in terminal text.
 * @param {string} buttonText - Text displayed on the button
 * @param {Function|string} clickHandler - Function to execute upon clicking
 * @returns {string} HTML string for inline buttons
 */
export function styleButton(buttonText, clickHandler, ...extraArgs) {
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    const safeText = escapeHtml(buttonText);

    const clickId = 'btn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);

    if (typeof clickHandler === 'function') {
        _buttonCallbacks.set(clickId, { handler: clickHandler, args: extraArgs });
    } else if (clickHandler !== undefined) {
        console.warn('styleButton: clickHandler must be a function, click binding ignored');
    }

    if (!_globalListenerAttached) {
        document.addEventListener('click', (event) => {
            const targetButton = event.target.closest('[data-click-id]');
            if (targetButton) {
                const id = targetButton.getAttribute('data-click-id');
                const callbackInfo = _buttonCallbacks.get(id);
                if (callbackInfo) {
                    const { handler, args } = callbackInfo;
                    handler.call(targetButton, ...args);
                }
            }
        });
        _globalListenerAttached = true;
    }

    return `<button
        data-click-id="${clickId}"
        style="
            display: inline-flex;
            align-items: baseline;
            cursor: pointer;
            background: transparent;
            border: solid;
            border-color: #33CC33;
            border-width: 1px;
            color: #00FF00;
            transition: all 0.1s ease;
            white-space: nowrap;
            font-family: inherit;
        "
        onmouseover="this.style.background='rgba(0, 255, 0, 0.1)'; this.style.borderColor='#00FF00';"
        onmouseout="this.style.background='transparent'; this.style.borderColor='#33CC33';"
        onmousedown="this.style.background='rgba(0, 255, 0, 0.2)';"
        onmouseup="this.style.background='rgba(0, 255, 0, 0.1)'; this.style.borderColor='#00FF00';"
    >
        <span>▸</span>${safeText}
    </button>`;
}

// ========== Global text progress bar manager (supports callback parameters) ==========
const _textProgressManager = {
    items: new Map(),
    intervalMs: 30,

    register(id, duration, onComplete, onCompleteParams, textSpan, messageSpan, container, completionMessage) {
        const startTime = performance.now();
        const intervalId = setInterval(() => {
            if (!container.isConnected) {
                this.unregister(id);
                return;
            }
            const elapsed = performance.now() - startTime;
            let progress = Math.min(1, elapsed / duration);
            this.updateText(textSpan, progress);
            if (progress >= 1) {
                if (completionMessage && messageSpan) {
                    const escapeHtml = (text) => {
                        const div = document.createElement('div');
                        div.textContent = text;
                        return div.innerHTML;
                    };
                    messageSpan.innerHTML = escapeHtml(completionMessage);
                }
                if (typeof onComplete === 'function') {
                    onComplete(...onCompleteParams);
                }
                this.unregister(id);
            }
        }, this.intervalMs);
        this.items.set(id, { intervalId, onComplete, textSpan, container });
    },

    updateText(spanElement, progress) {
        const barWidth = 20;
        const filled = Math.floor(progress * barWidth);
        const empty = barWidth - filled;
        const bar = '#'.repeat(filled) + '_'.repeat(empty);
        const percent = Math.floor(progress * 100);
        spanElement.textContent = `[${bar}] ${percent}%`;
    },

    unregister(id) {
        const item = this.items.get(id);
        if (item) {
            clearInterval(item.intervalId);
            this.items.delete(id);
        }
    },

    clearAll() {
        for (const [id, item] of this.items) {
            clearInterval(item.intervalId);
        }
        this.items.clear();
    }
};

window.addEventListener('beforeunload', () => _textProgressManager.clearAll());

/**
 * Generate a console-style string progress bar
 */
export function styleProgressBar(message, completionMessage, duration = 3000, onComplete = null, ...onCompleteParams) {
    const progressId = 'txtpb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    const safeMessage = escapeHtml(message);
    const safeCompletionMessage = completionMessage ? escapeHtml(completionMessage) : null;

    const html = `<div data-text-progress-id="${progressId}" style="
            background: #000000;
            padding: 8px;
            border: 1px solid #3C3C3C;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
            font-family: Consolas, 'Courier New', monospace;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            border-radius: 2px;
            color: #00FF00;
            display: inline-flex;
            align-items: baseline;
            gap: 0.8em;
            line-height: 1.5;
        ">
            <span class="text-progress-message-${progressId}" style="font-size: 1.6vw; white-space: pre-wrap; flex-shrink: 0;">${safeMessage}</span>
            <span class="text-progress-${progressId}" style="
                font-family: inherit;
                font-size: 1.6vw;
                letter-spacing: 1px;
                white-space: pre;
            ">[${'#'.repeat(20)}] 0%</span>
        </div>`;

    setTimeout(() => {
        const container = document.querySelector(`[data-text-progress-id="${progressId}"]`);
        if (!container) return;
        const textSpan = container.querySelector(`.text-progress-${progressId}`);
        const messageSpan = container.querySelector(`.text-progress-message-${progressId}`);
        if (textSpan && messageSpan) {
            _textProgressManager.register(
                progressId, duration, onComplete, onCompleteParams,
                textSpan, messageSpan, container, safeCompletionMessage
            );
        }
    }, 0);

    return html;
}