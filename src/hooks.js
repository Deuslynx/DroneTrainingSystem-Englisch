// ----- hooks.js -----
// ModSDK / legacy hook installation plumbing, plus every hook callback
// that reacts to core Bondage Club functions (CanWalk, IsMounted, blind
///deaf levels, chat message routing, voice commands, activity events...).

import { script_version } from "./constants.js";
import {
    charaterInstalledScript_isDrone, resetCharaterInstalledScript,
    showedEnterHelp, setShowedEnterHelp, isRefreshBinding
} from "./state.js";
import { findIndices, SendMessageToSelf, SendActionText, styleButton, ClearTagMessage } from "./utils.js";
import { 
    PlayerDroneInfo, CheckPlayerDroneInfoExistAndIsDrone, DoPunishment, 
    DoOrgasm, DoSetBodyOrBindStatus, HintBatteryHelp 
} from "./drone.js";
import { MissionInfo, RequireActivityinfo, RequirePoseinfo, PlayerMovedFaci } from "./rooms.js";
import { 
    MsgInfo, MsgCmds, ResponseRequestStatus, GetStatusAndVoiceCmdString, ResponseSetDisplayTalk, 
    ShowStatus, ShowActionButtons, ShowPlayerEnterHelp 
} from "./commands.js";

var hookMap = new Map();
var dtsModApi = null;
var dtsModApiAttempted = false;

/**
 * Use the shared Bondage Club ModSDK when it is available (for example through
 * LSCG). DTS keeps its legacy hook wrapper as a fallback when running alone.
 */
export function DTSGetModApi() {
    if (dtsModApi) return dtsModApi;
    if (dtsModApiAttempted) return null;

    const sdk = globalThis.bcModSdk;
    if (!sdk || typeof sdk.registerMod !== "function") return null;
    dtsModApiAttempted = true;

    try {
        dtsModApi = sdk.registerMod({
            name: "DTS",
            fullName: "Drone Training System English",
            version: script_version
        });
        console.log("DTS: shared ModSDK hooks enabled (LSCG compatible).");
    }
    catch (error) {
        console.warn("DTS: ModSDK registration failed; using legacy hooks.", error);
        dtsModApi = null;
    }
    return dtsModApi;
}

export function DTSHookTarget(funcName, context) {
    if (context === Player) return `Player.${funcName}`;
    if (context == null || context === globalThis || context === window) return funcName;
    return null;
}

export function DTSInstallLegacyHook(funcName, context, beforeFn, afterFn, tag = "") {
    const ctx = context != null ? context : globalThis;
    const hookKey = context === Player ? `Player.${funcName}` : funcName;
    let entry = hookMap.get(hookKey);

    if (!entry) {
        if (typeof ctx[funcName] !== "function") {
            throw new Error(`[DTS] Cannot hook non-function ${hookKey}.`);
        }
        entry = {
            originalFn: ctx[funcName],
            beforeFnList: {},
            afterFnList: {}
        };
        hookMap.set(hookKey, entry);
    }

    if (typeof beforeFn === "function") {
        entry.beforeFnList[(beforeFn.name || "before") + tag] = beforeFn;
    }
    if (typeof afterFn === "function") {
        entry.afterFnList[(afterFn.name || "after") + tag] = afterFn;
    }

    const hookedFn = function (...args) {
        let result;
        let skipOriginal = false;

        for (const before of Object.values(entry.beforeFnList)) {
            const beforeResult = before.apply(this, args);
            if (beforeResult !== undefined) {
                result = beforeResult;
                skipOriginal = true;
            }
        }
        if (!skipOriginal) result = entry.originalFn.apply(this, args);
        for (const after of Object.values(entry.afterFnList)) {
            result = after.call(this, result, ...args);
        }
        return result;
    };

    ctx[funcName] = hookedFn;
    return hookedFn;
}

/**
 * Register shared game hooks in ModSDK's chain so LSCG and DTS cannot replace
 * each other based on load order. Priority 0 leaves LSCG's higher-priority
 * state and interaction hooks in their expected order.
 */
export function InstallHook(funcName, context, beforeFn, afterFn, tag = "") {
    const modApi = DTSGetModApi();
    const target = DTSHookTarget(funcName, context);

    if (modApi && target && typeof modApi.hookFunction === "function") {
        return modApi.hookFunction(target, 0, function (args, next) {
            const thisArg = context != null ? context : (this ?? globalThis);
            let result;
            let skipOriginal = false;

            if (typeof beforeFn === "function") {
                const beforeResult = beforeFn.apply(thisArg, args);
                if (beforeResult !== undefined) {
                    result = beforeResult;
                    skipOriginal = true;
                }
            }
            if (!skipOriginal) result = next(args);
            if (typeof afterFn === "function") {
                result = afterFn.call(thisArg, result, ...args);
            }
            return result;
        });
    }
    return DTSInstallLegacyHook(funcName, context, beforeFn, afterFn, tag);
}

export function DoHook(arg, next, funcBefore, funcAfter) {
    let result;
    let skipOriginal = false;
    if (typeof func === 'function') {
        const beforeResult = funcBefore(args);
        if (beforeResult !== undefined) {
            result = beforeResult;
            skipOriginal = true;
        }
    }
    if (!skipOriginal) {
        result = next(args);
    }
    if (typeof funcAfter === 'function') {
        result = funcAfter(result, args);
    }
    return result;
}

export function ChatRoomMessageReceived(result, data) {
    // Make sure the message is valid (needs a Sender and Content)
    if ((data != null) && (typeof data === "object") && (data.Content != null) && (typeof data.Content === "string") && (data.Content != "") && (data.Sender != null) && (typeof data.Sender === "number")) {

        // Make sure the sender is in the room
        var SenderCharacter = null;
        for (var C = 0; C < ChatRoomCharacter.length; C++)
            if (ChatRoomCharacter[C].MemberNumber == data.Sender) {
                SenderCharacter = ChatRoomCharacter[C];
                break;
            }

        // If we found the sender
        if (SenderCharacter != null) {
            var pdi = PlayerDroneInfo();
            // Replace < and > characters to prevent HTML injections
            var msg = data.Content;
            while (msg.indexOf("<") > -1) msg = msg.replace("<", "&lt;");
            while (msg.indexOf(">") > -1) msg = msg.replace(">", "&gt;");
            if (data.Content == "DTS" && data.Type == 'Hidden') {
                DoHiddenMessage(SenderCharacter, msg, data.Dictionary);
                return result;
            }
            else if (data.Type == 'Activity') {
                // Executed upon receiving the action
                if (data.Dictionary.length >= 4) {
                    if (typeof data.Dictionary[0].SourceCharacter == 'number' &&
                        typeof data.Dictionary[1].TargetCharacter == 'number' &&
                        data.Dictionary[2].FocusGroupName &&
                        data.Dictionary[3].ActivityName
                    ) {
                        GroupActivityReceived(data.Dictionary[0].SourceCharacter, data.Dictionary[1].TargetCharacter, data.Dictionary[2].FocusGroupName, data.Dictionary[3].ActivityName);
                    }
                }
                // Supercharged climax
                if (data.Content.startsWith("Orgasm") && data.Dictionary.length >= 1 && typeof data.Dictionary[0].SourceCharacter == 'number') {
                    if (CheckPlayerDroneInfoExistAndIsDrone()) {
                        if (data.Dictionary[0].SourceCharacter == Player.MemberNumber) {
                            SendMessageToSelf("This unit's orgasm restored some power");
                            MsgCmds["BatteryCharge"].Command(null, pdi.orgasmBatteryGet);
                        }
                        else {
                            SendMessageToSelf("A nearby individual's orgasm restored a little power");
                            MsgCmds["BatteryCharge"].Command(null, pdi.orgasmBatteryGet * 0.1);
                        }
                    }
                    if (data.Dictionary[0].SourceCharacter == Player.MemberNumber) {
                        SelfOrgasmed(data.Content.startsWith("OrgasmResist") || data.Content.startsWith("OrgasmFail"));
                    }
                }
            }
            else if (data.Type == 'Action' && msg == "ServerEnter" && SenderCharacter.MemberNumber == Player.MemberNumber) {
                PlayerEnterRoom();
            }
            else if ((msg.startsWith("ServerLeave")) || (msg.startsWith("ServerDisconnect")) || (msg.startsWith("ServerBan")) || (msg.startsWith("ServerKick"))) {
                if (charaterInstalledScript_isDrone[SenderCharacter.MemberNumber] != undefined) {
                    delete charaterInstalledScript_isDrone[SenderCharacter.MemberNumber];
                }
            }
            var lowerContent = msg.toLowerCase();
            var MemberNumberStr = Player.MemberNumber.toString();
            var reg = new RegExp("(Drone|id) ?" + MemberNumberStr);
            var res = reg.exec(lowerContent);
            if (res != null && CheckPlayerDroneInfoExistAndIsDrone()) {
                DoVoiceCommand(SenderCharacter, msg);
                return result;
            }
        }
    }
}

//param 0: Self -> Self 1: Others -> Self 2: Self -> Others 3: Others -> Others
export var ActivityFunc = {
    ItemButtSpank: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
        if (param == 1) {
            if (charaterInstalledScript_isDrone[SourceCharacter] == undefined || charaterInstalledScript_isDrone[SourceCharacter] == false) {
                MissionInfo.ProgressAdd("Spank");
            }
        }
        if (param == 2) {
            if (charaterInstalledScript_isDrone[TargetCharacter] == true) {
                MissionInfo.ProgressAdd("OwnerSpank");
            }
        }
    },
    ItemHeadPet: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
        if (param == 1) {
            if (charaterInstalledScript_isDrone[SourceCharacter] == undefined || charaterInstalledScript_isDrone[SourceCharacter] == false) {
                MissionInfo.ProgressAdd("PetHead");
                var pdi = new PlayerDroneInfo();
                if (pdi.isDrone && pdi.modifys["training1"] == true) {
                    RequirePoseinfo.RequireDronePose(["Kneel"], 20000);
                }
                if (pdi.isDrone && pdi.modifys["education1"] == true) {
                    if (Math.random() < 0.1) {
                        DoOrgasm(false);
                    }
                }
            }
        }
        if (param == 2) {
            if (charaterInstalledScript_isDrone[TargetCharacter] == true) {
                MissionInfo.ProgressAdd("OwnerPetHead");
            }
        }
    },
    ItemPelvisCaress: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
        if (param == 1) {
            if (charaterInstalledScript_isDrone[SourceCharacter] == undefined || charaterInstalledScript_isDrone[SourceCharacter] == false) {
                var pdi = new PlayerDroneInfo();
                if (pdi.isDrone && pdi.modifys["training1"] == true) {
                    RequireActivityinfo.RequireDroneActivity([], ["Caress"], 0, 20000, 3);
                }
            }
        }
    },
    ItemMouthPinch: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
        if (param == 1) {
            if (charaterInstalledScript_isDrone[SourceCharacter] == undefined || charaterInstalledScript_isDrone[SourceCharacter] == false) {
                var pdi = new PlayerDroneInfo();
                if (pdi.isDrone && pdi.modifys["training1"] == true) {
                    RequirePoseinfo.RequireDronePose(["BaseLower", "LegsClosed"], 20000);
                    RequirePoseinfo.RequireDronePose(["BaseUpper"], 20000);
                }
            }
        }
    },
    ItemPelvisPinch: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
        if (param == 1) {
            if (charaterInstalledScript_isDrone[SourceCharacter] == undefined || charaterInstalledScript_isDrone[SourceCharacter] == false) {
                var pdi = new PlayerDroneInfo();
                if (pdi.isDrone && pdi.modifys["training2"] == true) {
                    RequirePoseinfo.RequireDronePose(["LegsClosed"], 20000);
                    RequirePoseinfo.RequireDronePose(["BackBoxTie", "BackElbowTouch"], 20000);
                }
            }
        }
    },
    Wiggle: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
        if (param == 3) {
            var pdi = new PlayerDroneInfo();
            if (pdi.isDrone && pdi.modifys["training2"] == true) {
                if (SourceCharacter == TargetCharacter) {
                    var character = ChatRoomGetCharacter(SourceCharacter);
                    if (character != undefined) {
                        if (ChatRoomIsViewActive("Map") && !ChatRoomMapViewCharacterOnInteractionRange(character)) {
                            return;
                        }
                        RequireActivityinfo.RequireDroneActivity([FocusGroupName], ["GaggedKiss"], 2, 20000, 1);
                    }
                }
            }
        }
    },
    ItemNeck: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
        if (param == 0) {
            ShowStatus(PlayerDroneInfo());
        }
        else if (param == 1) {
            ResponseRequestStatus({ MemberNumber: SourceCharacter });
        }
    }
};

export function GroupActivityReceived(SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) {
    var param = (SourceCharacter == Player.MemberNumber ? 0 : 1) + (TargetCharacter == Player.MemberNumber ? 0 : 2);
    if (ActivityFunc[FocusGroupName]) {
        ActivityFunc[FocusGroupName](param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName);
    }
    if (ActivityFunc[ActivityName]) {
        ActivityFunc[ActivityName](param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName);
    }
    if (ActivityFunc[FocusGroupName + ActivityName]) {
        ActivityFunc[FocusGroupName + ActivityName](param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName);
    }
    RequireActivityinfo.CheckAllActivityComplete(SourceCharacter, TargetCharacter, param, FocusGroupName, ActivityName);
}

export function SelfOrgasmed(Resist) {
    if (Resist) {
        MissionInfo.ProgressAdd("OrgasmResist");
    }
    else {
        MissionInfo.ProgressAdd("Orgasm");
        var pdi = PlayerDroneInfo();
        if (CheckPlayerDroneInfoExistAndIsDrone() && pdi.modifys["education2"] == true) {
            var randindex = Math.floor(Math.random() * 6);
            var bodyPartStringsLocal = ["eyes", "ears", "mouth", "body", "hands", "legs"];
            var targetnum = pdi.bindStatus[bodyPartStringsLocal[randindex]] + 1;
            if (targetnum >= 2) {
                targetnum = 2;
            }
            DoSetBodyOrBindStatus(0, randindex, targetnum, { Name: "Guilt program" });
        }
    }
}

export function PlayerEnterRoom() {
    setShowedEnterHelp(false);
    resetCharaterInstalledScript();
    ShowPlayerEnterHelp();
}

export function DoHiddenMessage(ChatRoomCharacter, msg, dict) {
    if (charaterInstalledScript_isDrone[ChatRoomCharacter.MemberNumber] == undefined) {
        charaterInstalledScript_isDrone[ChatRoomCharacter.MemberNumber] = false;
    }
    MsgInfo.DoCmd(ChatRoomCharacter, dict);
}

export function DoVoiceCommand(ChatRoomCharacter, msg) {
    var pdi = PlayerDroneInfo();
    var cmd = findIndices(msg, ["Show status", "Deploy charging crank", "Orgasm reward", "Shock punishment", "Set to ", "Display screen message"]);
    // Operator privileges are required to speak via the display screen
    if (cmd >= 4 && pdi.ownerId != -1 && pdi.ownerId != ChatRoomCharacter.MemberNumber) {
        SendActionText(`You do not have permission to operate this Drone. Please contact the Operator ${pdi.ownerId} to transfer operational permissions`, ChatRoomCharacter);
        return;
    }
    switch (cmd[0]) {
        // Show status
        case 0: {
            ResponseRequestStatus(ChatRoomCharacter);
        }
            break;
        // deploy charging crank
        case 1: {
            if (pdi.battery >= pdi.batteryMax * 0.3) {
                SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target.MemberNumber}. Since Drone ${target.MemberNumber} already held a certain amount of charge, the crank spins on its own, rapidly draining a large amount of power.`);
            }
            else {
                SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target.MemberNumber} and turns it vigorously. The kinetic energy converts into electrical energy, flowing through the vaginal canal to the power source inside the womb, while the kinetic and electrical energy cause her body to tremble violently.`);
            }
            diff = Math.floor(pdi.batteryMax * 0.3) - pdi.battery;
            MsgCmds["BatteryCharge"].Command(null, diff);
        }
            break;
        // Orgasm reward
        case 2: {
            DoOrgasm();
        }
            break;
        // Shock punishment
        case 3: {
            DoPunishment(pdi.shockLevel, pdi.shockCount);
        }
            break;
        // Set to
        case 4: {
            var typeDisplayStringsLocal = ["Restraint", "Function"];
            var bodyPartDisplayStringsLocal = ["Eyes", "Ears", "Mouth", "Body", "Hands", "Legs"];
            var bindLevelStringsLocal = ["Off", "On", "Maximum"];
            var bodyLevelStringsLocal = ["Available", "Restricted", "Offline"];
            var ArousalDisplayStringsLocal = ["Orgasm limit", "Pleasure device"];
            var params = findIndices(msg, typeDisplayStringsLocal, bodyPartDisplayStringsLocal, bindLevelStringsLocal, bodyLevelStringsLocal, ArousalDisplayStringsLocal);
            switch (params[0]) {
                case 0: {
                    DoSetBodyOrBindStatus(0, params[1], params[2], ChatRoomCharacter);
                    return;
                }
                    break;
                case 1: {
                    DoSetBodyOrBindStatus(1, params[1], params[3], ChatRoomCharacter);
                    return;
                }
                    break;
            }
            switch (params[4]) {
                case 0: {
                    DoSetBodyOrBindStatus(0, 3, params[2], ChatRoomCharacter);
                    return;
                }
                    break;
                case 1: {
                    DoSetBodyOrBindStatus(1, 3, params[2], ChatRoomCharacter);
                    return;
                }
                    break;
            }
        }
            break;
        // Display screen message
        case 5: {
            var params = findIndices(msg, ["Open", "Off"]);
            if (params[0] != -1) {
                ResponseSetDisplayTalk(ChatRoomCharacter, params[0] == 0);
            }
        }
            break;
    }
}

export function ChatRoomMapViewUpdatePlayerFlagAfter(result, UpdateTimeOffset) {
    DTSPlayerMoved();
    PlayerMovedFaci();
}
// Power consumption after moving
export function DTSPlayerMoved() {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
    var pdi = PlayerDroneInfo();
    pdi.battery -= pdi.moveBatteryCost;
}

export function CanWalkAfter(result) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
    var pdi = PlayerDroneInfo();
    var droneResult = !(pdi.battery <= pdi.batteryMax * 0.2 || pdi.bodyStatus.legs >= 1);
    return (result && droneResult);
}

export function IsMountedAfter(result) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
    var pdi = PlayerDroneInfo();
    var droneResult = (pdi.battery <= 0 || pdi.bodyStatus.legs >= 2);
    return (result || droneResult);
}

export function GetBlindLevelAfter(result) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
    var droneResult = 0;
    var pdi = PlayerDroneInfo();
    if (pdi.battery <= 0 || pdi.bodyStatus.eyes == 2) {
        droneResult = 3.5;
    }
    if (pdi.battery <= pdi.batteryMax * 0.2 || pdi.bodyStatus.eyes == 1) {
        droneResult = 2;
    }
    return Math.max(result, droneResult);
}

export function GetDeafLevelAfter(result) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
    var droneResult = 0;
    var pdi = PlayerDroneInfo();
    if (pdi.battery <= 0 || pdi.bodyStatus.ears == 2) {
        droneResult = 7;
    }
    if (pdi.battery <= pdi.batteryMax * 0.2 || pdi.bodyStatus.ears == 1) {
        droneResult = 3;
    }
    return Math.max(result, droneResult);
}

export function CanInteractAfter(result) {
    if (isRefreshBinding) {
        return true;
    }
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
    var pdi = PlayerDroneInfo();
    var droneResult = !(pdi.battery <= pdi.batteryMax * 0.2 || pdi.bodyStatus.hands >= 1);
    return (result && droneResult);
}

export function DialogCanUnlockBefore() {
    if (isRefreshBinding) {
        return true;
    }
}

export function SpeechTransformDeafenIntensityBefore(C) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
    if (C.MemberNumber != Player.MemberNumber) return;
    var pdi = PlayerDroneInfo();
    if (pdi.battery <= 0 || pdi.bodyStatus.mouth == 2) {
        return 20;
    }
    if (pdi.battery <= pdi.batteryMax * 0.2 || pdi.bodyStatus.mouth == 1) {
        return 8;
    }
}

export function ChatRoomSendChatMessageBefore(msg) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
    var pdi = PlayerDroneInfo();
    if (pdi.battery <= 0) {
        HintBatteryHelp();
        return true;
    }
    if (pdi.disPlayTalk) {
        if (pdi.battery <= 0 || pdi.bodyStatus.mouth == 2) {
            SendActionText("The indicator light on 'Drone'" + Player.MemberNumber + "flashes. It attempted to speak but failed.");
        }
        else {
            if (pdi.modifys["education1"]) {
                msg.replace(/I|Me|We|Our/g, "This unit");
                msg.replace(Player.Name, `Drone ${Player.MemberNumber}`);
            }
            SendActionText(`Drone ${Player.MemberNumber}'s display shows:\n` + msg);
            pdi.battery -= pdi.chatBatteryCost;
            return true;
        }
    }
}

// Disabled in training facilities
export function ChatRoomPlayerIsAdminBefore() {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
    if (ChatRoomData?.MapData?.Objects?.startsWith("ҴӄӃҶұҳҹ") && ChatRoomData?.Name?.startsWith("DroneFacility")) return false;
}

export function ServerShowBeepBefore(message, duration, options, title) {
    if (PlayerDroneInfo() === undefined) return;
    if (message.startsWith("DTSBeep")) {
        var memberNumber = -1;
        memberNumber = options.memberNumber;
        var params = message.split(' ');
        if (params.length > 2) {
            MsgInfo.DoBeepCmd(memberNumber, new MsgInfo(params[1], params.slice(2)), options);
        }
        else {
            MsgInfo.DoBeepCmd(memberNumber, new MsgInfo(params[1], null), options);
        }
        return 0;
    }
}

export function ChatRoomFirstTimeHelpBefore() {
    if (!ChatRoomHelpSeen) {
        ShowPlayerEnterHelp();
    }
}