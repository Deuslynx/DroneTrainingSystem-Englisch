// ----- main.js -----
// Entry point: installs all game hooks, registers the /DTS chat command,
// starts the per-second/10-second timers, exposes the facility Enter/Leave
// callbacks on window for userscript managers, and boots the whole thing.

import { DTS_LOADER_FLAG, DTS_LEGACY_LOADER_FLAG } from "./constants.js";
import { setTimeEventInterval, setInitComplete } from "./state.js";
import { sleep, waitFor, ClearOldMessage, SendMessageToSelf } from "./utils.js";
import {
    PlayerDroneInfo, RefreshBinds, RefreshPlayerEffect, RefreshBatteryTag,
    CheckPlayerDroneInfoExistAndIsDrone, DTSSyncSettings
} from "./drone.js";
import {
    InstallHook,
    ChatRoomMessageReceived, ChatRoomMapViewUpdatePlayerFlagAfter, CanWalkAfter, IsMountedAfter,
    GetBlindLevelAfter, GetDeafLevelAfter, CanInteractAfter, DialogCanUnlockBefore,
    SpeechTransformDeafenIntensityBefore, ChatRoomSendChatMessageBefore, ChatRoomPlayerIsAdminBefore,
    ServerShowBeepBefore, ChatRoomFirstTimeHelpBefore
} from "./hooks.js";
import { CommandInfo, MsgInfo, SendDTSMsg, DTSHeartBeatPayload } from "./commands.js";
import {
    RequireActivityinfo, RequirePoseinfo, CheckSleepUntil, ExpendInit,
    StockRoomEnter, StockRoomLeave, ElevatorEnter, ElevatorLeave,
    SleepEnterZoneEnter, SleepEnterZoneLeave, ModifyRoomEnter, ModifyRoomLeave, ModifyTileEnter,
    ShopRoomEnter, ShopRoomLeave, ShopInnerRoomEnter, ShopInnerRoomLeave,
    WorkRoomEnter, WorkRoomLeave, WorkInnerRoomEnter, OperRoomEnter, OperRoomLeave, CatEnter,
    PrivateRoomEnter, TrainingRoomEnter, TrainingRoomLeave,
    EducationRoomEnter, EducationRoomLeave, ChargeRoomEnter, ChargeRoomLeave
} from "./rooms.js";

function Init() {
    InstallHook("ChatRoomMessage", null, null, ChatRoomMessageReceived);
    InstallHook("ChatRoomMapViewUpdatePlayerFlag", null, null, ChatRoomMapViewUpdatePlayerFlagAfter);
    InstallHook("CanWalk", Player, null, CanWalkAfter);
    InstallHook("IsMounted", Player, null, IsMountedAfter);
    InstallHook("GetBlindLevel", Player, null, GetBlindLevelAfter);
    InstallHook("GetDeafLevel", Player, null, GetDeafLevelAfter);
    InstallHook("CanInteract", Player, null, CanInteractAfter);
    InstallHook("DialogCanUnlock", null, DialogCanUnlockBefore, null);
    InstallHook("SpeechTransformDeafenIntensity", null, SpeechTransformDeafenIntensityBefore, null);
    InstallHook("ChatRoomSendChatMessage", null, ChatRoomSendChatMessageBefore, null);
    InstallHook("ChatRoomPlayerIsAdmin", null, ChatRoomPlayerIsAdminBefore, null);
    InstallHook("ServerShowBeep", null, ServerShowBeepBefore, null);
    InstallHook("ChatRoomFirstTimeHelp", null, ChatRoomFirstTimeHelpBefore, null);

    CommandCombine([
        {
            Tag: "DTS",
            Description: "DroneTrainingSystem",
            Action: function (text) {
                const command = text.split(" ")[0];
                const commandText = text.replace('[', "").replace(']', "").split(" ").slice(1);

                CommandInfo.DoCmd(new CommandInfo(command, commandText));
            },
        },
    ]);
    setTimeEventInterval(setInterval(() => {
        try {
            if (ChatRoomData) {
                TimeEvent();
            }
        }
        catch {
            // matches original: swallow errors from the per-second tick
        }
    }, 1000));
    PlayerDroneInfo();
    setInitComplete(true);
}

// ----- Scheduled events -----
var secAfterStart = 0;
function TimeEvent() {
    secAfterStart += 1;
    // Executed every second
    {
        DoPerSec();
    }
    // Execute every 10 seconds
    if (secAfterStart % 10 == 0) {
        DoPer10Sec();
    }
    // Execute every minute
    if (secAfterStart % 60 == 0) {
        DoPerMin();
    }
    // Execute every 10 minutes
    if (secAfterStart % 600 == 0) {
        DoPer10Min();
    }
    // Execute every hour
    if (secAfterStart % 3600 == 0) {
        DoPerHour();
        secAfterStart = 0;
    }
}

function DoPerSec() {
    RefreshBatteryTag();
    SendBatteryWarning();
    RequireActivityinfo.CheckAllActivityIncomplete();
    RequirePoseinfo.CheckPose();
}

var lastBattery = null;
function SendBatteryWarning() {
    var pdi = PlayerDroneInfo();
    if (lastBattery == null) {
        lastBattery = pdi.battery;
    }
    if (lastBattery > pdi.batteryMax * 0.2 && pdi.battery <= pdi.batteryMax * 0.2) {
        SendMessageToSelf("Drone battery is below 20%. Entering power-saving mode!");
    }
    if (lastBattery < pdi.batteryMax * 0.2 && pdi.battery >= pdi.batteryMax * 0.2) {
        SendMessageToSelf("Drone battery is above 20%. Leaving power-saving mode!");
    }
    if (lastBattery > 0 && pdi.battery <= 0) {
        SendMessageToSelf("Drone battery is below 0%. Disabling all non-life-support functions.");
    }
    if (lastBattery < pdi.batteryMax * 0.2 && pdi.battery >= pdi.batteryMax) {
        SendMessageToSelf("Drone battery is above 0%. Re-enabling functions disabled by battery depletion.");
    }
    lastBattery = pdi.battery;
}

function DoPer10Sec() {
    RefreshBinds();
    if (CheckPlayerDroneInfoExistAndIsDrone()) {
        RefreshPlayerEffect();
    }
    DTSSyncSettings();
    SendDTSMsg(null, new MsgInfo("HeartBeatPack", DTSHeartBeatPayload(true, PlayerDroneInfo().isDrone)));
    var pdi = PlayerDroneInfo();
    if (pdi.modifys["education2"]) {
        var name = `Drone${Player.MemberNumber}`;
        if (Player.Nickname != name) {
            Player.Nickname = name;
            ServerAccountUpdate.QueueData({ Nickname: name });
        }
    }
    CheckSleepUntil();
}
function DoPerMin() {
    var pdi = PlayerDroneInfo();
    pdi.battery -= pdi.miniteBatteryCost;
    ClearOldMessage();
}
function DoPer10Min() {
    // TODO?
}
function DoPerHour() {
    // TODO?
}

async function DTSWaitForLSCGModSdk() {
    if (globalThis.bcModSdk?.registerMod) return;

    // Let other document-end userscripts append their loader first.
    await sleep(250);
    const lscgIsLoading = Boolean(
        globalThis.LSCG_VERSION ||
        Player?.LSCG ||
        Array.from(document.scripts).some(script => /littlesera\.github\.io\/LSCG\//i.test(script.src))
    );
    if (!lscgIsLoading) return;

    const deadline = Date.now() + 10000;
    while (!globalThis.bcModSdk?.registerMod && Date.now() < deadline) {
        await sleep(50);
    }
}

async function WaitEnable() {
    // Treat the original loader flag as an alias so old and new DTS versions
    // cannot accidentally initialize together on the same page.
    if (!window[DTS_LOADER_FLAG] && !window[DTS_LEGACY_LOADER_FLAG]) {
        console.log(`Loading complete`);
        window[DTS_LOADER_FLAG] = true;
        window[DTS_LEGACY_LOADER_FLAG] = true;
        await waitFor(() => typeof window.Player?.MemberNumber === "number");
        await DTSWaitForLSCGModSdk();
        Init();
    }
}

// ---- Begin pinned facility extension ----
// Bridge for userscript managers that wrap @grant none scripts: the original
// remote page scripts exposed these callbacks on window. (PrivateRoomLeave
// was referenced in the original bridge list too, but no such function was
// ever defined there either - preserved here as a no-op absence.)
(function DTSExposeFacilityCallbacks() {
    const callbacks = {
        StockRoomEnter, StockRoomLeave,
        ElevatorEnter, ElevatorLeave,
        SleepEnterZoneEnter, SleepEnterZoneLeave,
        ModifyRoomEnter, ModifyRoomLeave,
        ModifyTileEnter,
        ShopRoomEnter, ShopRoomLeave,
        ShopInnerRoomEnter, ShopInnerRoomLeave,
        WorkRoomEnter, WorkRoomLeave,
        WorkInnerRoomEnter,
        OperRoomEnter, OperRoomLeave,
        CatEnter,
        PrivateRoomEnter,
        TrainingRoomEnter, TrainingRoomLeave,
        EducationRoomEnter, EducationRoomLeave,
        ChargeRoomEnter, ChargeRoomLeave
    };
    for (const [name, fn] of Object.entries(callbacks)) {
        if (typeof fn === "function") {
            window[name] = fn;
            globalThis[name] = fn;
        }
    }
})();

WaitEnable();
ExpendInit();