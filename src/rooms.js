// ----- rooms.js -----
// The training-facility map: room zone definitions and their Enter/Leave
// handlers, the training/education mini-games, the upgrade ("Modify")
// catalog, mission/activity/pose requirement tracking, and the top-level
// PlayerMovedFaci/InitMapFaci orchestration.

import { bodyPartDisplayStrings, bodyPartStrings } from "./constants.js";
import {
    sleep, waitFor, styleButton, styleProgressBar, SendMessageToSelf, SendActionText,
    ClearTagMessage, ClearAllMessage, IsInZone, IsInArea, RandomPosOfArea, MovePlayer, GetDistance
} from "./utils.js";
import {
    PlayerDroneInfo, CheckPlayerDroneInfoExistAndIsDrone, DoOrgasm, DoPunishment, DoVibe,
    WearEquips, RemoveRestrainByOneAssetGroup, RemoveRestrainsWithAssetGroup, Crate, CrateBind, OneBar,
    DTSSyncSettings
} from "./drone.js";
import { ItemInfo, allItem } from "./items.js";
import {
    trainingProcess, setTrainingProcess, addTrainingProcess,
    isTraining, setIsTraining, isEducationing, setIsEducationing, pverPos, setPverPos,
    initComplete
} from "./state.js";
// TakeMission is invoked from WorkInnerRoomEnter below; it's only used
// inside a function body so this circular import with commands.js is safe.
import { TakeMission, SendDTSMsg, MsgInfo } from "./commands.js";

// ----- Mission tracking -----
export class MissionInfo {
    constructor(name, text, reward) {
        this.name = name;
        this.text = text;
        this.desc = "";
        this.reward = reward;
        this.id = Date.now() + Math.floor(Math.random() * 10000);
        this.complete = null;
    }

    static ProgressAdd(name) {
        var pdi = PlayerDroneInfo();
        for (var mission of pdi.missions) {
            if (mission.name == name) {
                mission.progress += 1;
                if (mission.progress >= mission.target) {
                    MissionInfo.MissionComplete(mission);
                }
            }
        }
    }

    static MissionComplete(mission, ...parmas) {
        var pdi = PlayerDroneInfo();
        SendMessageToSelf(`Mission: ${mission.text} complete, reward ${mission.reward} quota points`);
        pdi.coin += mission.reward;
        if (mission.complete != null) {
            MissionInfo[mission.complete](mission, ...parmas);
        }
        pdi.missions = pdi.missions.filter(mi => mission.id != mi.id);
    }

    static StockRoomMission() {
        var from = Math.floor(Math.random() * 60);
        var to = Math.floor(Math.random() * 60);
        var mission = new MissionInfo("StockRoom", "Transport cargo", 10);
        mission.from = from;
        mission.to = to;
        mission.complete = "StockRoomMissionComplete";
        mission.desc = `Transport the goods from ${String.fromCharCode(65 + Math.floor(from / 5))}${from % 5 + 1} to ${String.fromCharCode(65 + Math.floor(to / 5))}${to % 5 + 1}`;
        return mission;
    }

    static StockRoomMissionComplete(mission) {
        var pdi = PlayerDroneInfo();
        pdi.items = pdi.items.filter(item => !(item.name == "StockRoom" && item.index == mission.from));
    }

    static OrgasmMission() {
        var mission = new MissionInfo("OrgasmResist", "Orgasm resistance mission", 10);
        mission.target = 3;
        mission.progress = 0;
        mission.desc = `Resist orgasm three times`;
        return mission;
    }
    static SpankMission() {
        var mission = new MissionInfo("Spank", "Receive-spanking mission", 10);
        mission.target = 3;
        mission.progress = 0;
        mission.desc = `Be spanked by an Operator or Visitor three times`;
        return mission;
    }
    static OwnerSpankMission() {
        var mission = new MissionInfo("OwnerSpank", "Spanking mission", 10);
        mission.target = 3;
        mission.progress = 0;
        mission.desc = `Spank a Drone three times`;
        return mission;
    }
    static PetHeadMission() {
        var mission = new MissionInfo("PetHead", "Receive-head-pat mission", 10);
        mission.target = 3;
        mission.progress = 0;
        mission.desc = `Be patted on the head by an Operator or Visitor three times`;
        return mission;
    }
    static OwnerPetHeadMission() {
        var mission = new MissionInfo("OwnerPetHead", "Head-pat mission", 10);
        mission.target = 3;
        mission.progress = 0;
        mission.desc = `Pat a Drone's head three times`;
        return mission;
    }
    static ChargeMission() {
        var mission = new MissionInfo("Charge", "Charging-station mission", 10);
        mission.target = 1;
        mission.progress = 0;
        mission.desc = `Use a charging station once`;
        return mission;
    }
    static TrainMission() {
    }
    static Education() {
    }
}

// ----- Activity/pose requirement tracking (used by training) -----
export class RequireActivityinfo {
    constructor(FocusGroupNames, ActivityNames, param, timeLimit, count, calltrainingProcess) {
        this.FocusGroupNames = FocusGroupNames;
        this.ActivityNames = ActivityNames;
        this.param = param;
        this.timeLimitUntil = Date.now() + timeLimit;
        this.target = count;
        this.progress = 0;
        this.completed = false;
        this.calltrainingProcess = calltrainingProcess;
    }
    static RequireActivity = [];
    static CheckAllActivityComplete(SourceCharacter, TargetCharacter, param, FocusGroupName, ActivityName) {
        for (var info of RequireActivityinfo.RequireActivity) {
            if (info.complete == true) continue;
            if (param != info.param) continue;
            if (info.FocusGroupNames.length > 0 && info.FocusGroupNames.findIndex((i) => { return i == FocusGroupName; }) == -1) continue;
            if (info.ActivityNames.length > 0 && info.ActivityNames.findIndex((i) => { return i == ActivityName; }) == -1) continue;
            info.progress++;
            if (info.progress >= info.target) {
                info.completed = true;
                if (info.calltrainingProcess) {
                    addTrainingProcess(1);
                    info.calltrainingProcess = false;
                }
            }
        }
        RequireActivityinfo.ClearAllPoseCompleted();
    }
    static CheckAllActivityIncomplete() {
        for (var info of RequireActivityinfo.RequireActivity) {
            if (Date.now() > info.timeLimitUntil && info.progress < info.target) {
                SendMessageToSelf("Action not completed within the time limit - executing punishment");
                DoPunishment(2, 3);
                info.completed = true;
            }
        }
        RequireActivityinfo.ClearAllPoseCompleted();
    }
    static ClearAllPoseCompleted() {
        RequireActivityinfo.RequireActivity = RequireActivityinfo.RequireActivity.filter((i) => { return (i.completed == false); });
    }

    static RequireDroneActivity(FocusGroupNameArray, ActivityNameArray, param, timeLimit, count, calltrainingProcess = false) {
        RequireActivityinfo.RequireActivity.push(new RequireActivityinfo(FocusGroupNameArray, ActivityNameArray, param, timeLimit, count, calltrainingProcess));
    }
}
export class RequirePoseinfo {
    constructor(poseNameArray, timeLimit, calltrainingProcess) {
        this.poseNameArray = poseNameArray;
        this.timeLimitUntil = Date.now() + timeLimit;
        this.completed = false;
        this.calltrainingProcess = calltrainingProcess;
    }
    static RequirePose = [];
    static RequireDronePose(poseNameArray, timeLimit, calltrainingProcess = false) {
        RequirePoseinfo.RequirePose.push(new RequirePoseinfo(poseNameArray, timeLimit, calltrainingProcess));
    }

    static CheckPose() {
        for (var reqPose of RequirePoseinfo.RequirePose) {
            if (reqPose.complete == true) continue;
            var isPose = false;
            for (var pose of reqPose.poseNameArray) {
                if (Player.Pose.findIndex((i) => { return i == pose; }) != -1) {
                    isPose = true;
                    break;
                }
            }
            if (isPose) {
                reqPose.completed = true;
                if (reqPose.calltrainingProcess) {
                    addTrainingProcess(1);
                }
            }
            else if (Date.now() > reqPose.timeLimitUntil) {
                SendMessageToSelf("Action not completed within the time limit - executing punishment");
                DoPunishment(2, 3);
                reqPose.completed = true;
            }
        }
        RequirePoseinfo.ClearAllPoseCompleted();
    }
    static ClearAllPoseCompleted() {
        RequirePoseinfo.RequirePose = RequirePoseinfo.RequirePose.filter((i) => { return (i.completed == false); });
    }
}

/* Areas:
Entrance (South),
Construction Zone (West),
Cargo Handling (Map Corners),
Obedience Training (North-East),
Hypnosis Training (South-East),
Body Modification (North-West),
Item Sales (North-East),
Operator Lounge (South-Central),
Drone Dormitory (North-Central)
*/

// ----- Stock room -----
export const StockRoom = {
    Areas: [
        { leftUp: { X: 0, Y: 2 }, rightDown: { X: 4, Y: 6 } },
        { leftUp: { X: 35, Y: 2 }, rightDown: { X: 39, Y: 6 } },
        { leftUp: { X: 0, Y: 27 }, rightDown: { X: 4, Y: 31 } },
        { leftUp: { X: 35, Y: 27 }, rightDown: { X: 39, Y: 31 } },
    ],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function StockRoomEnter() {
    SendMessageToSelf(`You have entered the stockroom area. At the cabinet, you can ${styleButton("Pick up", StockRoomAction, true)} or ${styleButton("Put down", StockRoomAction, false)} goods.`, "StockRoom");
}
export function StockRoomLeave() {
    ClearTagMessage("StockRoom");
}
export function StockRoomAction(isTake, isSkipCanInteract = false) {
    var pdi = PlayerDroneInfo();
    if (!IsInZone(Player.MapData.Pos, StockRoom)) {
        SendMessageToSelf(`Not in the StockRoom area`, "StockRoom");
        return;
    }
    if (Player.CanInteract() == false && !isSkipCanInteract) {
        if (Player.IsMounted()) {
            SendMessageToSelf(`Arms and legs are simultaneously unavailable... attempting to call the dispatch system to perform the operation instead ${styleProgressBar("Calling", "Completed", 30000, StockRoomAction, isTake, true)}`, "StockRoom");
        }
        else {
            SendMessageToSelf(`Arms unavailable... attempting to adjust posture to operate using legs and feet ${styleProgressBar("Adjusting", "Complete", 10000, StockRoomAction, isTake, true)}`, "StockRoom");
        }
        return;
    }
    if (isTake) {
        if (pdi.items.length < pdi.itemsMax) {
            var index = GetStockIndex();
            pdi.items.push(ItemInfo.StockRoomItem(index));
            SendMessageToSelf(`Item retrieved successfully - item ID: ${String.fromCharCode(65 + Math.floor(index / 5))}${index % 5 + 1}`, "StockRoom");
        }
        else {
            SendMessageToSelf("Storage unit full... retrieval failed", "StockRoom");
        }
    }
    else {
        var success = false;
        var here = GetStockIndex();
        for (var i = pdi.missions.length - 1; i >= 0; i--) {
            var mission = pdi.missions[i];
            if (mission.name == "StockRoom") {
                for (var j = pdi.items.length - 1; j >= 0; j--) {
                    var item = pdi.items[j];
                    if (item.name == "StockRoom") {
                        if (item.index == mission.from && here == mission.to)
                            success = true;
                    }
                    if (success) {
                        SendMessageToSelf(`Placement successful!`, "StockRoom");
                        MissionInfo.MissionComplete(mission);
                        break;
                    }
                }
            }
            if (success) {
                break;
            }
        }
        if (!success) {
            SendMessageToSelf("Not carrying the cargo that should be placed here", "StockRoom");
            SendMessageToSelf(`You are not carrying cargo that belongs here`, "StockRoom");
        }
    }
}
export function GetStockIndex() {
    var i;
    for (i = 0; i < StockRoom.Areas.length; i++) {
        if (IsInArea(Player.MapData.Pos, StockRoom.Areas[i])) break;
    }
    var xdiff = Player.MapData.Pos.X - StockRoom.Areas[i].leftUp.X;
    var ydiff = Player.MapData.Pos.Y - StockRoom.Areas[i].leftUp.Y;
    var index = i * 15 + Math.floor(ydiff / 2) * 5 + xdiff;
    if (index < 0) index = 0;
    if (index >= 60) index = 59;
    return index;
}

// ----- Elevator -----
export const Elevator = {
    Areas: [
        { leftUp: { X: 18, Y: 35 }, rightDown: { X: 20, Y: 37 } },
        { leftUp: { X: 30, Y: 35 }, rightDown: { X: 32, Y: 37 } },
        { leftUp: { X: 22, Y: 35 }, rightDown: { X: 24, Y: 37 } },
        { leftUp: { X: 30, Y: 30 }, rightDown: { X: 32, Y: 32 } },
    ],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export async function ElevatorEnter(nowInZone) {
    var pdi = PlayerDroneInfo();
    switch (nowInZone) {
        case "0": {
            if (pdi.isDrone) {
                SendMessageToSelf("Drone entered facility elevator. Transferring to standby area...", "Elevator");
                await sleep(3000);
                var xAdd4 = Object.assign({}, Player.MapData.Pos);
                xAdd4.X += 4;
                if (IsInArea(xAdd4, Elevator.Areas[2]) == false) {
                    xAdd4 = Object.assign({}, Elevator.Areas[2].leftUp);
                }
                MovePlayer(xAdd4);
                await sleep(3000);
                WearEquips(Player, [Crate]);
                SendMessageToSelf("Containment pod deployed!", "Elevator");
                await sleep(3000);
                MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]));
                SendMessageToSelf("Moved to standby area! Waiting for system call...", "Elevator");
                SendMessageToSelf(styleProgressBar("Waiting", "Called", 30000, async () => {
                    SendMessageToSelf("System call received! Moving to main facility area...", "Elevator");
                    await sleep(1000);
                    MovePlayer(RandomPosOfArea(Elevator.Areas[3]));
                    RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
                }));
            }
            else if (pdi.isOwner) {
                SendMessageToSelf("Operator entered facility elevator. Transferring to main facility area...", "Elevator");
                var xAdd12 = Object.assign({}, Player.MapData.Pos);
                xAdd12.X += 12;
                if (IsInArea(xAdd12, Elevator.Areas[1]) == false) {
                    xAdd12 = Object.assign({}, Elevator.Areas[1].leftUp);
                }
                MovePlayer(xAdd12);
                RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
            }
            else {
                SendMessageToSelf("Visitors do not have facility access! Register as a Drone or Operator and try again.", "Elevator");
            }
        }
            break;
        case "1": {
            if (pdi.isOwner) {
                SendMessageToSelf("Operator entered facility elevator! Transferring to facility entrance...", "Elevator");
                var xAdd12b = Object.assign({}, Player.MapData.Pos);
                xAdd12b.X -= 12;
                if (IsInArea(xAdd12b, Elevator.Areas[0]) == false) {
                    xAdd12b = Object.assign({}, Elevator.Areas[0].leftUp);
                }
                MovePlayer(xAdd12b);
            }
            else if (pdi.isDrone) {
                SendMessageToSelf("Drones may not use the Operator elevator. Executing punishment!", "Elevator");
                DoPunishment(2, 3);
            }
            else {
                SendMessageToSelf("Visitors do not have facility access. Register as a Drone or Operator and try again.", "Elevator");
            }
        }
            break;
        case "3": {
            if (pdi.isDrone) {
                SendMessageToSelf("Drone entered facility elevator. Transferring to standby area...", "Elevator");
                await sleep(3000);
                var xAdd3 = Object.assign({}, Player.MapData.Pos);
                xAdd3.X += 3;
                if (IsInArea(xAdd3, Elevator.Areas[2]) == false) {
                    xAdd3 = Object.assign({}, Elevator.Areas[2].leftUp);
                }
                MovePlayer(xAdd3);
                await sleep(3000);
                WearEquips(Player, [Crate]);
                SendMessageToSelf("Containment pod deployed!", "Elevator");
                await sleep(3000);
                MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]));
                SendMessageToSelf("Moved to standby area. Waiting for system call...", "Elevator");
                SendMessageToSelf(styleProgressBar("Waiting", "Called", 30000, async () => {
                    SendMessageToSelf("System call received! Moving to facility entrance...", "Elevator");
                    await sleep(1000);
                    MovePlayer(RandomPosOfArea(Elevator.Areas[0]));
                    RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
                }));
            }
            else if (pdi.isOwner) {
                SendMessageToSelf("Operators should use the southern Operator elevator.", "Elevator");
            }
            else {
                SendMessageToSelf("Visitors do not have facility access! Register as a Drone or Operator and try again.", "Elevator");
            }
        }
            break;
    }
}
export function ElevatorLeave() {
    ClearTagMessage("Elevator");
}

// ----- Sleep zone / sleep room -----
export const SleepEnterZone = {
    Areas: [{ leftUp: { X: 24, Y: 18 }, rightDown: { X: 27, Y: 25 } }],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export const SleepEnterTiles = {
    Areas: [
        { X: 27, Y: 18 },
        { X: 27, Y: 20 },
        { X: 27, Y: 22 },
        { X: 27, Y: 24 },
    ],
    Exclude: [],
};
export function SleepEnterZoneEnter() {
    SendMessageToSelf(`Entered Drone sleep area. On the inner pads you can ${styleButton("Sleep", SleepEnterZoneDoSleep, true)} to gain quota points.`, "SleepEnterZone");
}
export function SleepEnterZoneLeave() {
    ClearTagMessage("SleepEnterZone");
}
export function SleepEnterZoneDoSleep() {
    var i = IsInZone(Player.MapData.Pos, SleepEnterTiles);
    if (i === false) {
        SendMessageToSelf("Not on a pad", "SleepEnterZone");
        return;
    }
    var index = Number.parseInt(i);
    SendMessageToSelf(`About to sleep for ${(index + 1) * 6} hours. Time still counts while offline. ${styleButton("Start sleep", async (index) => {
        ClearTagMessage("SleepEnterZone");
        SendMessageToSelf(`Sleep started. Gained ${(index + 1) * 10} quota points`);
        var pdi = PlayerDroneInfo();
        pdi.coin += (index + 1) * 10;
        await sleep(1000);
        WearEquips(Player, [Crate]);
        SendMessageToSelf(`Sleep pod deployed! Moving to standby area to begin sleep.`);
        await sleep(2000);
        MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]), true);
        pdi.sleepUntil = Date.now() + (index + 1) * 6 * 3600 * 1000;
        DTSSyncSettings();
    }, index)}`, "SleepEnterZone");
}
export const SleepRoom = {
    Areas: [{ leftUp: { X: 34, Y: 34 }, rightDown: { X: 39, Y: 39 } }],
    Exclude: [],
};

// ----- Modify (upgrade) room -----
export const ModifyRoom = {
    Areas: [{ leftUp: { X: 15, Y: 2 }, rightDown: { X: 18, Y: 7 } }],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export const ModifyInnerRoom = {
    Areas: [{ leftUp: { X: 8, Y: 2 }, rightDown: { X: 14, Y: 7 } }],
    Exclude: [],
};
export function ModifyRoomEnter() {
    SendMessageToSelf(`Entered upgrade workshop, ${styleButton("Show available upgrades", ShowAvailableModify)}`, "ModifyRoom");
}
export function ModifyRoomLeave() {
    if (IsInZone(Player.MapData.Pos, ModifyInnerRoom) == false) {
        ClearTagMessage("ModifyRoom");
    }
}

export var allModify = {
    eyes1: {
        id: "eyes1", name: "Implant contact-lens display",
        desc: "Eye function can be set to a restricted mode.", price: 10,
        effect: (pdi) => { pdi.bodyStatusMax.eyes = 1; }, front: []
    },
    ears1: {
        id: "ears1", name: "Implant ear-canal filler",
        desc: "Ear function can be set to a restricted mode.", price: 10,
        effect: (pdi) => { pdi.bodyStatusMax.ears = 1; }, front: []
    },
    mouth1: {
        id: "mouth1", name: "Implant jaw-control motor",
        desc: "Mouth function can be set to a restricted mode.", price: 10,
        effect: (pdi) => { pdi.bodyStatusMax.mouth = 1; }, front: []
    },
    hands1: {
        id: "hands1", name: "Implant shoulder/elbow control motor",
        desc: "Arm function can be set to a restricted mode.", price: 10,
        effect: (pdi) => { pdi.bodyStatusMax.hands = 1; }, front: []
    },
    legs1: {
        id: "legs1", name: "Implant knee/ankle control motor",
        desc: "Leg function can be set to a restricted mode.", price: 10,
        effect: (pdi) => { pdi.bodyStatusMax.legs = 1; }, front: []
    },
    level1: {
        id: "level1", name: "System upgrade to version 1.0",
        desc: "Flash next system firmware version and unlock more functions", price: 15,
        effect: (pdi) => { pdi.level = 1; },
        front: ["eyes1", "ears1", "mouth1", "hands1", "legs1", "education1", "training1"]
    },

    eyes2: {
        id: "eyes2", name: "Replace with artificial electronic eyeballs",
        desc: "Eye function can be set to offline mode.", price: 20,
        effect: (pdi) => { pdi.bodyStatusMax.eyes = 2; }, front: ["level1"]
    },
    ears2: {
        id: "ears2", name: "Implant cochlear damper",
        desc: "Ear function can be set to offline mode.", price: 20,
        effect: (pdi) => { pdi.bodyStatusMax.ears = 2; }, front: ["level1"]
    },
    mouth2: {
        id: "mouth2", name: "Implant vocal-cord control device",
        desc: "Mouth function can be set to offline mode.", price: 20,
        effect: (pdi) => { pdi.bodyStatusMax.mouth = 2; }, front: ["level1"]
    },
    hands2: {
        id: "hands2", name: "Implant hand-control motor",
        desc: "Arm function can be set to offline mode.", price: 20,
        effect: (pdi) => { pdi.bodyStatusMax.hands = 2; }, front: ["level1"]
    },
    legs2: {
        id: "legs2", name: "Implant hip-control motor",
        desc: "Leg function can be set to offline mode.", price: 20,
        effect: (pdi) => { pdi.bodyStatusMax.legs = 2; }, front: ["level1"]
    },
    level2: {
        id: "level2", name: "System upgrade to version 2.0",
        desc: "Flash next system firmware version and unlock more functions", price: 25,
        effect: (pdi) => { pdi.level = 2; },
        front: ["eyes2", "ears2", "mouth2", "hands2", "legs2", "education2", "training2"]
    },

    battery1: {
        id: "battery1", name: "Install extra bladder power supply",
        desc: "Increase endurance by 50%", price: 20,
        effect: (pdi) => { pdi.batteryMax = 1500; }, front: []
    },
    battery2: {
        id: "battery2", name: "Install extra intestinal power supply",
        desc: "Increase endurance by 66%", price: 30,
        effect: (pdi) => { pdi.batteryMax = 2500; }, front: ["level1", "battery1"]
    },

    itemsMax1: {
        id: "itemsMax1", name: "Storage-unit expansion",
        desc: "Increase item slot limit by one", price: 20,
        effect: (pdi) => { pdi.itemsMax = 4; }, front: []
    },
    itemsMax2: {
        id: "itemsMax2", name: "Advanced storage-unit expansion",
        desc: "Increase item slot limit by one", price: 30,
        effect: (pdi) => { pdi.itemsMax = 5; }, front: ["level1", "itemsMax1"],
    },

    missionsMax1: {
        id: "missionsMax1", name: "Memory-unit expansion",
        desc: "Increase mission slot limit and daily mission limit by one", price: 20,
        effect: (pdi) => { pdi.missionsMax = 4; }, front: []
    },
    missionsMax2: {
        id: "missionsMax2", name: "Advanced memory-unit expansion",
        desc: "Increase mission slot limit and daily mission limit by one", price: 30,
        effect: (pdi) => { pdi.missionsMax = 5; }, front: ["level1", "missionsMax1"]
    },

    orgasmBatteryGet1: {
        id: "orgasmBatteryGet1", name: "Upgrade orgasm-charging component",
        desc: "Increase battery gained from orgasm by 100%", price: 20,
        effect: (pdi) => { pdi.orgasmBatteryGet = 200; }, front: []
    },
    orgasmBatteryGet2: {
        id: "orgasmBatteryGet2", name: "Further upgrade orgasm-charging component",
        desc: "Increase battery gained from orgasm by 50%", price: 30,
        effect: (pdi) => { pdi.orgasmBatteryGet = 300; }, front: ["level1", "orgasmBatteryGet1"]
    },

    displayTalkCost1: {
        id: "displayTalkCost1", name: "Install high-performance display",
        desc: "Reduce display screen cost", price: 20,
        effect: (pdi) => { pdi.chatBatteryCost = 30; }, front: []
    },
    displayTalkCost2: {
        id: "displayTalkCost2", name: "Install top-tier display",
        desc: "Further reduce display screen cost", price: 30,
        effect: (pdi) => { pdi.chatBatteryCost = 15; }, front: ["level1", "displayTalkCost1"]
    },
    dontShow: {
        id: "dontShow", name: "Not displayed; for annotation purposes only.",
        desc: "The following can be obtained in the training room: training1, training2, training3, education1, education2, education3.",
        price: 30, effect: (pdi) => { }, front: ["dontShow"]
    }
};

export var selectModify = "";
export function ShowAvailableModify(target = null) {
    var pdi = PlayerDroneInfo();
    if (pdi.isDrone == false && target == null) {
        var input = (document.getElementById("InputChat"));
        input.value = '/DTS findtargetmodify []';
        SendMessageToSelf("Enter the target ID inside the brackets and send the command to get the target Drone's available upgrades.", "ModifyRoom");
        return;
    }
    var list = [];
    for (var mod in allModify) {
        if (CanModify(allModify[mod], target) == false) continue;
        list.push(Object.assign({}, allModify[mod]));
    }
    var string = "";
    for (var mod of list) {
        string += "\n";
        string += mod.name;
        if (target == null) {
            string += styleButton("Select", (id, desc, price) => {
                selectModify = id;
                SendMessageToSelf(`Upgrade effect: ${desc}\n Required quota points: ${price}\nEnter the upgrade pod in the left room to start upgrading.`, "ModifyRoom");
            }, mod.id, mod.desc, mod.price);
        }
        else {
            string += styleButton("Select", (id, desc, price) => {
                SendMessageToSelf(`Upgrade effect: ${desc}\n Required quota points: ${price}\nFor this Drone: ${styleButton("Apply upgrade", () => {
                    if (target.ownerId != -1 && target.ownerId != Player.MemberNumber) {
                        SendMessageToSelf(`You do not have permission to operate this Drone!`, "ModifyRoom");
                        return;
                    }
                    if (price > pdi.coin) {
                        SendMessageToSelf(`Not enough quota points to upgrade!`, "ModifyRoom");
                        return;
                    }
                    else {
                        pdi.coin -= price;
                    }
                    SendDTSMsg(target, new MsgInfo("DoModifyByOwner", id));
                    SendMessageToSelf(`Upgrade command sent!`, "ModifyRoom");
                })}`, "ModifyRoom");
            }, mod.id, mod.desc, mod.price);
        }
    }
    SendMessageToSelf(`Available upgrades:${string}`, "ModifyRoom");
}

export function CanModify(mod, target = null) {
    var pdi = null;
    if (target == null) {
        pdi = PlayerDroneInfo();
    }
    else {
        pdi = target;
    }
    if (pdi.modifys[mod.id] != undefined) return false;
    for (var front of mod.front) {
        if (!pdi.modifys[front]) return false;
    }
    return true;
}

export const ModifyTile = {
    Areas: [{ X: 10, Y: 5 }],
    Exclude: [],
    Enter: undefined
};
export function ModifyTileEnter(nowInZone, paid = false) {
    var pdi = PlayerDroneInfo();
    MovePlayer(ModifyTile.Areas[0]);
    if (pdi.isDrone == false) {
        SendMessageToSelf(`Only drones can be upgraded!`, "ModifyRoom");
        return;
    }
    if (!allModify[selectModify]) {
        SendMessageToSelf(`No upgrade selected!`, "ModifyRoom");
        return;
    }
    if (CanModify(allModify[selectModify]) == false) {
        SendMessageToSelf(`Selected upgrade is unavailable!`, "ModifyRoom");
        return;
    }
    if (paid == false) {
        if (allModify[selectModify].price > pdi.coin) {
            SendMessageToSelf(`Not enough quota points to upgrade. Executing punishment!`, "ModifyRoom");
            DoPunishment(2, 3);
            return;
        }
        else {
            pdi.coin -= allModify[selectModify].price;
        }
    }
    WearEquips(Player, [Crate]);
    var select = selectModify;
    selectModify = "";
    SendMessageToSelf(`Drone entered upgrade pod. Closing pod door and starting upgrade...${styleProgressBar("Upgrading", "Upgrade complete", 30000, (select) => {
        var pdi = PlayerDroneInfo();
        var mod = Object.assign({}, allModify[select]);
        mod.effect(pdi);
        pdi.modifys[select] = true;
        SendMessageToSelf(`Upgrade complete. Opening pod door`, "ModifyRoom");
        RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
    }, select)}`);
}
export function DoModifyByOwner(Modifyid) {
    selectModify = Modifyid;
    ModifyTileEnter(0, true);
}

// ----- Shop -----
export const ShopRoom = {
    Areas: [{ leftUp: { X: 20, Y: 2 }, rightDown: { X: 32, Y: 7 } }],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function ShopRoomEnter() {
    SendMessageToSelf(`Entered shop. Move into the inner room to shop`, "ShopRoom");
}
export function ShopRoomLeave() {
    ClearTagMessage("ShopRoom");
}

export const ShopInnerRoom = {
    Areas: [
        { leftUp: { X: 25, Y: 2 }, rightDown: { X: 27, Y: 3 } },
        { leftUp: { X: 30, Y: 2 }, rightDown: { X: 32, Y: 3 } },
    ],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function ShopInnerRoomEnter() {
    var string = "Purchasable items:";
    for (var itemAndPrice of allItem) {
        var i = ItemInfo[itemAndPrice.item]();
        string += "\n";
        string += i.text;
        string += " Price: " + itemAndPrice.price;
        string += styleButton("Buy", (item, price) => {
            var pdi = PlayerDroneInfo();
            if (pdi.coin < price) {
                SendMessageToSelf(`Not enough quota points - cannot buy`, "ShopInnerRoom");
                return;
            }
            if (pdi.items.length >= pdi.itemsMax) {
                SendMessageToSelf(`Storage unit full - cannot buy`, "ShopInnerRoom");
                return;
            }
            pdi.items.push(ItemInfo[item.item]());
            pdi.coin -= price;
            SendMessageToSelf(`Purchase successful`, "ShopInnerRoom");
        }, itemAndPrice, itemAndPrice.price);
    }
    SendMessageToSelf(string, "ShopInnerRoom");
}
export function ShopInnerRoomLeave() {
    ClearTagMessage("ShopInnerRoom");
}

// ----- Work room -----
export const WorkRoom = {
    Areas: [{ leftUp: { X: 0, Y: 12 }, rightDown: { X: 6, Y: 22 } }],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function WorkRoomEnter() {
    SendMessageToSelf(`Entered office. Move to an inner workstation to work`, "WorkRoom");
}
export function WorkRoomLeave() {
    ClearTagMessage("WorkRoom");
    ClearTagMessage("WorkRoomWork");
}

export const WorkInnerRoom = {
    Areas: [
        { leftUp: { X: 0, Y: 12 }, rightDown: { X: 1, Y: 13 } },
        { leftUp: { X: 5, Y: 12 }, rightDown: { X: 6, Y: 13 } },
        { leftUp: { X: 0, Y: 16 }, rightDown: { X: 1, Y: 17 } },
        { leftUp: { X: 0, Y: 20 }, rightDown: { X: 1, Y: 21 } },
        { leftUp: { X: 5, Y: 20 }, rightDown: { X: 6, Y: 21 } },
    ],
    Exclude: [],
    Enter: undefined,
};
export function WorkInnerRoomEnter() {
    SendMessageToSelf(`${styleButton("Take mission", TakeMission)}${styleButton("Do office work", DoWork)}`, "WorkRoom");
}
export function DoWork() {
    var p1 = Math.floor(Math.random() * 100);
    var p2 = Math.floor(Math.random() * 100);
    var p3 = Math.floor(Math.random() * 4);
    switch (p3) {
        case 0: { p3 = "+"; } break;
        case 1: { p3 = "-"; } break;
        case 2: { p3 = "*"; } break;
        case 3: { p3 = "/"; } break;
        default: { p3 = "+"; } break;
    }
    var string = `${p1} ${p3} ${p2}`;
    var result = (new Function("return " + string))();
    var resultIndex = Math.floor(Math.random() * 4);
    var worngResult = [
        (result + Math.floor(Math.random() * 100 - 50)).toFixed(2),
        (result + Math.floor(Math.random() * 100 - 50)).toFixed(2),
        (result + Math.floor(Math.random() * 100 - 50)).toFixed(2),
    ];
    result = result.toFixed(2);
    string += ` = ?\n`;

    for (var i = 0; i < worngResult.length; i++) {
        if (i == resultIndex) {
            string += styleButton(result.toString(), () => {
                var pdi = PlayerDroneInfo();
                var reword = pdi.todaysWork >= pdi.workMax ? 0 : 2;
                pdi.coin += reword;
                pdi.todaysWork += reword;
                SendMessageToSelf(`Correct answer. Gained ${reword} quota points${reword == 0 ? ", daily limit reached" : ""}`, "WorkRoom");
                ClearTagMessage("WorkRoomWork");
            });
        }
        string += styleButton(worngResult[i].toString(), () => {
            SendMessageToSelf(`Wrong answer`, "WorkRoom");
            ClearTagMessage("WorkRoomWork");
        });
    }
    if (resultIndex == 3) {
        string += styleButton(result.toString(), () => {
            var pdi = PlayerDroneInfo();
            var reword = pdi.todaysWork >= pdi.workMax ? 0 : 2;
            pdi.todaysWork += reword;
            SendMessageToSelf(`Correct answer. Gained ${reword} quota points${reword == 0 ? ", daily limit reached" : ""}`, "WorkRoom");
            ClearTagMessage("WorkRoomWork");
        });
    }
    SendMessageToSelf(string, "WorkRoomWork");
}

// ----- Operator lounge / cat / dancer -----
export const OperRoomCrate = {
    Areas: [{ X: 13, Y: 20 }],
    Exclude: [],
};
export const OperRoom = {
    Areas: [{ leftUp: { X: 12, Y: 18 }, rightDown: { X: 22, Y: 25 } }],
    Exclude: [{ leftUp: { X: 14, Y: 18 }, rightDown: { X: 18, Y: 19 } }],
    Enter: undefined,
    Leave: undefined
};
export function OperRoomEnter() {
    SendMessageToSelf(`Entered Operator lounge`, "OperRoom");
}
export function OperRoomLeave() {
    ClearTagMessage("OperRoom");
}

export const Cat = {
    Areas: [{ X: 19, Y: 24 }],
    Exclude: [],
    Enter: undefined,
};
export function CatEnter() {
    SendMessageToSelf(`This is a cat`, "OperRoom");
}

// WIP
export const DancerRoom = {
    Areas: [{ leftUp: { X: 14, Y: 18 }, rightDown: { X: 18, Y: 19 } }],
    Exclude: [],
};

// ----- Private rooms -----
export const PrivateRoomCrate = {
    Areas: [
        { X: 12, Y: 12 },
        { X: 20, Y: 12 },
        { X: 22, Y: 12 },
    ],
    Exclude: [],
};
export const PrivateRoom = {
    Areas: [
        { leftUp: { X: 12, Y: 12 }, rightDown: { X: 15, Y: 16 } },
        { leftUp: { X: 17, Y: 12 }, rightDown: { X: 20, Y: 16 } },
        { leftUp: { X: 22, Y: 12 }, rightDown: { X: 27, Y: 16 } },
    ],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function PrivateRoomEnter() {
    var pdi = PlayerDroneInfo();
    if (pdi.isDrone) {
        SendMessageToSelf(`Entered private room.`, "PrivateRoom");
    }
    else {
        SendMessageToSelf(`Entered private room. ${styleButton("Call Drone to private room", CallDroneToPrivateRoom)}`, "PrivateRoom");
    }
}
export function CallDroneToPrivateRoom() {
    var input = (document.getElementById("InputChat"));
    input.value = '/DTS findtargetoprivate []';
    SendMessageToSelf("Enter the target ID inside the brackets and send the command.");
}

// ----- Training room -----
export const TrainingRoomBlackTile = {
    Areas: [
        { X: 34, Y: 13 },
        { X: 38, Y: 13 },
    ],
    Exclude: [],
};
export const TrainingRoom = {
    Areas: [
        { leftUp: { X: 33, Y: 12 }, rightDown: { X: 35, Y: 14 } },
        { leftUp: { X: 37, Y: 12 }, rightDown: { X: 39, Y: 14 } },
    ],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function TrainingRoomEnter(nowInZone) {
    SendMessageToSelf(`Entered training room. Stand on a black tile and ${styleButton("Start training", StartTraining, nowInZone)}`, "TrainingRoom");
}
export function TrainingRoomLeave(pverInZone) {
    if (isTraining) {
        SendMessageToSelf("You may not leave the training room before training completes.", "TrainingRoom");
        MovePlayer(TrainingRoomBlackTile.Areas[pverInZone]);
    }
    else {
        ClearTagMessage("TrainingRoom");
    }
}

export var trainingMenu = [
    async () => {
        var pdi = PlayerDroneInfo();
        var waitTime = 3000;
        var waitTimeShort = 1000;
        SendMessageToSelf("Basic training started.", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Training 1: Obedience training", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("When an Operator pats the head, the Drone should execute the obedience command: kneel immediately and switch to obedience pose. Time limit: 20 seconds", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Entering practice phase...", "TrainingRoom");
        await sleep(waitTimeShort);
        var result = await WaitTrainingProcess(
            () => {
                SendMessageToSelf(`${styleProgressBar("Head being patted...", "End", 20000)}`, "TrainingProc");
                RequirePoseinfo.RequireDronePose(["Kneel"], 20000, true);
            },
            () => {
                SendMessageToSelf("Kneeling not detected. Returning to previous step...", "TrainingRoom");
            },
            1
        );
        if (result == false) {
            return;
        }
        SendMessageToSelf("Training 2: Reset training", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("When an Operator pinches the cheek, the Drone should execute the reset command: stand with closed legs and place hands in front to reset posture. Time limit: 20 seconds", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Entering practice phase...", "TrainingRoom");
        await sleep(waitTimeShort);
        var result = await WaitTrainingProcess(
            () => {
                SendMessageToSelf(`${styleProgressBar("Cheek being pinched...", "End", 20000)}`, "TrainingProc");
                RequirePoseinfo.RequireDronePose(["BaseLower", "LegsClosed"], 20000, true);
                RequirePoseinfo.RequireDronePose(["BaseUpper"], 20000, true);
            },
            () => {
                SendMessageToSelf("Standing up not detected. Returning to previous step...", "TrainingRoom");
            },
            2
        );
        if (result == false) {
            return;
        }
        SendMessageToSelf("Second training task completed. Proceeding to the next task...", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Training 3: Self-check training", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("When an Operator caresses the lower abdomen/belly, the Drone should execute the self-check command: touch any part of itself three times. Time limit: 20 seconds", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Entering practice phase...", "TrainingRoom");
        await sleep(waitTimeShort);
        var result = await WaitTrainingProcess(
            () => {
                SendMessageToSelf(`${styleProgressBar("Lower abdomen being caressed...", "End", 20000)}`, "TrainingProc");
                RequireActivityinfo.RequireDroneActivity([], ["Caress"], 0, 20000, 3, true);
            },
            () => {
                SendMessageToSelf("Self-check not detected. Returning to previous step...", "TrainingRoom");
            },
            1
        );
        if (result == false) {
            return;
        }
        SendMessageToSelf("Training 3 complete. Basic training fully complete!", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("In real use, no progress bar is shown when a command is received. Follow the command on your own or receive a punishment.", "TrainingRoom");
        pdi.modifys["training1"] = true;
    },
    async () => {
        var pdi = PlayerDroneInfo();
        var waitTime = 3000;
        var waitTimeShort = 1000;
        SendMessageToSelf("Advanced training started.", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Training 1: Standby training", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("When an Operator pinches the lower abdomen/belly, the Drone should execute the standby command: put hands behind the back, close legs, and switch to standby pose. Time limit: 20 seconds", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Entering practice phase...", "TrainingRoom");
        await sleep(waitTimeShort);
        var result = await WaitTrainingProcess(
            () => {
                SendMessageToSelf(`${styleProgressBar("Lower abdomen being pinched...", "End", 20000)}`, "TrainingProc");
                RequirePoseinfo.RequireDronePose(["LegsClosed"], 20000, true);
                RequirePoseinfo.RequireDronePose(["BackBoxTie", "BackElbowTouch"], 20000, true);
            },
            () => {
                SendMessageToSelf("Standby behavior not detected. Returning to previous step...", "TrainingRoom");
            },
            2
        );
        if (result == false) {
            return;
        }
        SendMessageToSelf("First training task completed. Proceeding to the next task...", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Training 2: Service training", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("When a nearby Operator wiggles any body part, the Drone should execute the service command: kiss the corresponding part with its mouth plug. Time limit: 20 seconds. Detection range: 3x3 tiles", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("In this training, wiggling the corresponding part substitutes for kissing it with the mouth plug.", "TrainingRoom");
        await sleep(waitTime);
        SendMessageToSelf("Entering practice phase...", "TrainingRoom");
        await sleep(waitTimeShort);
        var result = await WaitTrainingProcess(
            () => {
                SendMessageToSelf(`${styleProgressBar("Wiggle foot", "End", 20000)}`, "TrainingProc");
                RequireActivityinfo.RequireDroneActivity(["ItemBoots"], ["Wiggle"], 0, 20000, 1, true);
            },
            () => {
                SendMessageToSelf("Service behavior not detected. Returning to previous step...", "TrainingRoom");
            },
            1
        );
        if (result == false) {
            return;
        }
        await sleep(waitTime);
        SendMessageToSelf("Service behavior detected. Continuing to next practice", "TrainingRoom");
        await sleep(waitTime);
        var result = await WaitTrainingProcess(
            () => {
                SendMessageToSelf(`${styleProgressBar("Wiggle fingers", "End", 20000)}`, "TrainingProc");
                RequireActivityinfo.RequireDroneActivity(["ItemHands"], ["Wiggle"], 0, 20000, 1, true);
            },
            () => {
                SendMessageToSelf("Service behavior not detected. Returning to previous step...", "TrainingRoom");
            },
            1
        );
        if (result == false) {
            return;
        }
        SendMessageToSelf("Training 2 complete. Advanced training fully complete!", "TrainingRoom");
        pdi.modifys["training2"] = true;
    },
];

export async function WaitTrainingProcess(DoAtStart, DoAtFail, maxTrainingProcess) {
    var toNext = false;
    var retryCount = 0;
    var pdi = PlayerDroneInfo();
    while (toNext == false) {
        setTrainingProcess(0);
        DoAtStart();
        for (var i = 0; i < 20; i++) {
            await sleep(1000);
            if (pdi.battery < pdi.batteryMax / 2) {
                pdi.battery = pdi.batteryMax / 2;
            }
            if (trainingProcess >= maxTrainingProcess) {
                toNext = true;
                break;
            }
        }
        if (toNext == false) {
            retryCount++;
            if (retryCount >= 3) {
                SendMessageToSelf("Multiple retries failed; training aborted", "TrainingRoom");
                ClearTagMessage("TrainingProc");
                return false;
            }
            DoAtFail();
            ClearTagMessage("TrainingProc");
        }
    }
    return true;
}

export async function StartTraining(nowInZone) {
    if (IsInArea(Player.MapData.Pos, TrainingRoomBlackTile.Areas[nowInZone]) == false) {
        SendMessageToSelf("Not on a black tile.", "TrainingRoom");
        return;
    }
    ClearTagMessage("TrainingRoom");
    var pdi = PlayerDroneInfo();
    var trainingIndex = pdi.level;
    if (pdi.isDrone == false) {
        SendMessageToSelf("Trainee is not a Drone. Running basic training...", "TrainingRoom");
        trainingIndex = 0;
    }
    if (trainingIndex >= trainingMenu.length) {
        trainingIndex = trainingMenu.length - 1;
    }
    setIsTraining(true);
    await trainingMenu[trainingIndex]();
    setIsTraining(false);
}

// ----- Education room -----
export const EducationRoom = {
    Areas: [[{ X: 34, Y: 22 }, { X: 36, Y: 22 }, { X: 38, Y: 22 }]],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function EducationRoomEnter(nowInZone) {
    SendMessageToSelf(`Entered education room, ${styleButton("Start education", StartEducation)}`, "EducationRoom");
}
export function EducationRoomLeave(pverInZone) {
    ClearTagMessage("EducationRoom");
}

export var educationMenu = [
    async () => {
        var pdi = PlayerDroneInfo();
        var waitTime = 2000;
        WearEquips(Player, [CrateBind]);
        SendMessageToSelf("Basic education started!", "EducationRoom");
        await sleep(waitTime);
        SendMessageToSelf("Hypnosis device deployed. Starting hypnosis...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis Device Unit—Complete. Activate hypnosis...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis phase complete! Initiating sleep...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis ..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("........, ....", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("....., ..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("我—身份—，—人—，人——", "EducationRoomClear");
        SendMessageToSelf("My Identity..., human..., fading...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        await WaitEducationProcess("My identity is ", "Drone", "Human");
        await WaitEducationProcess("My purpose is ", "Obey", "Seek selfhood");
        await WaitEducationProcess("When my owner pats my head, I should ", "Feel aroused", "Feel nothing");
        SendMessageToSelf(`${styleProgressBar("Head being patted", "End", waitTime * 2)}`, "EducationRoomClear");
        await sleep(waitTime);
        DoOrgasm();
        await sleep(15000);
        SendMessageToSelf(`${styleProgressBar("Head being patted", "End", waitTime * 2)}`, "EducationRoomClear");
        await sleep(waitTime);
        DoOrgasm();
        await sleep(15000);
        SendMessageToSelf(`${styleProgressBar("Head being patted", "End", waitTime * 2)}`, "EducationRoomClear");
        await sleep(waitTime);
        DoOrgasm();
        await sleep(15000);
        await WaitEducationProcess("This unit's identity is ", "Drone", "Human");
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("My Identity..., human..., fading...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("....., ..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Process Complete! Installation Successful!", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis sequence complete! Reward program installed!", "EducationRoomClear");
        await sleep(waitTime);
        SendMessageToSelf("When head is patted, there is a chance to trigger orgasm.", "EducationRoomClear");
        RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
        if (pdi.battery < pdi.batteryMax / 2) {
            pdi.battery = pdi.batteryMax / 2;
        }
        pdi.modifys["education1"] = true;
    },
    async () => {
        var pdi = PlayerDroneInfo();
        var waitTime = 2000;
        WearEquips(Player, [CrateBind]);
        SendMessageToSelf("Advanced education started!", "EducationRoom");
        await sleep(waitTime);
        SendMessageToSelf("Hypnosis device deployed. Starting hypnosis...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis Device Unit—Complete. Activate hypnosis...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis phase complete. Initiating sleep...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("........, ....", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("....., ..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("My Identity..., human..., fading...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        await WaitEducationProcess("This unit's identity is ", "Drone", "Human");
        await WaitEducationProcess("This unit's name is ", `Drone${Player.MemberNumber}`, Player.Name);
        await WaitEducationProcess("When this unit is about to orgasm, this unit should ", `Resist`, `Indulge`);
        await WaitEducationProcess("If this unit orgasms accidentally, this unit should feel ", `Guilt`, `Pleasure`);
        DoOrgasm();
        await sleep(15000);
        DoOrgasm();
        await sleep(15000);
        DoOrgasm();
        await sleep(15000);
        await WaitEducationProcess("This unit's identity is ", "Drone", "Drone");
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("My Identity..., human..., fading...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("....., ..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis..., ...", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Process complete! Installation successful!", "EducationRoomClear");
        await sleep(waitTime);
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf("Hypnosis sequence complete! Guilt program installed!", "EducationRoomClear");
        await sleep(waitTime);
        SendMessageToSelf("When failing to resist orgasm, a random restraint level increases by 1.", "EducationRoomClear");
        RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
        if (pdi.battery < pdi.batteryMax / 2) {
            pdi.battery = pdi.batteryMax / 2;
        }
        pdi.modifys["education2"] = true;
    },
];

export async function WaitEducationProcess(text1, text2, text3) {
    var toNext = false;
    var choiced = false;
    var waitTime = 2000;
    while (toNext == false) {
        var choiced = false;
        ClearTagMessage("EducationRoomClear");
        SendMessageToSelf(`${text1}${styleButton(text2, () => { toNext = true; choiced = true; })}，${styleButton(text3, () => { DoPunishment(2, 3); choiced = true; })}`, "EducationRoomClear");
        await waitFor(() => { return choiced == true; });
        ClearTagMessage("EducationRoomClear");
        await sleep(waitTime);
    }
}

export async function StartEducation(nowInZone) {
    ClearTagMessage("EducationRoom");
    var pdi = PlayerDroneInfo();
    var educationIndex = pdi.level;
    if (pdi.isDrone == false) {
        SendMessageToSelf("Student is not a Drone. Running basic education!", "EducationRoom");
        educationIndex = 0;
    }
    if (educationIndex >= trainingMenu.length) {
        educationIndex = trainingMenu.length - 1;
    }
    setIsEducationing(true);
    await educationMenu[educationIndex]();
    setIsEducationing(false);
}

// ----- Charge room -----
export const ChargeRoom = {
    Areas: [[
        { X: 1, Y: 10 },
        { X: 38, Y: 10 },
        { X: 1, Y: 25 },
        { X: 38, Y: 25 },
        { X: 8, Y: 30 },
        { X: 18, Y: 30 },
    ]],
    Exclude: [],
    Enter: undefined,
    Leave: undefined
};
export function ChargeRoomEnter() {
    var pdi = PlayerDroneInfo();
    SendMessageToSelf(`On a charging station. ${styleButton(`Start Charging`, ChargeRoomCharge)}`, "ChargeRoom");
}
export function ChargeRoomLeave() {
    ClearTagMessage("ChargeRoom");
    var inv = InventoryGet(Player, "ItemDevices");
    if (inv?.Asset?.Name == "OneBarPrison") {
        RemoveRestrainByOneAssetGroup(Player, "ItemDevices");
    }
}
export function ChargeRoomCharge() {
    WearEquips(Player, [OneBar]);
    SendMessageToSelf(styleProgressBar("Charging", "Charge Complete", 60000, ChargeComplete), "ChargeRoom");
}
export function ChargeComplete() {
    var pdi = PlayerDroneInfo();
    pdi.battery = pdi.batteryMax;
    RemoveRestrainByOneAssetGroup(Player, "ItemDevices");
    MissionInfo.ProgressAdd("Charge");
}

// Wire up Enter/Leave handlers now that all the handler functions above
// have been declared (they're hoisted, so this is just for clarity/parity
// with the original single-file layout, which assigned these inline).
StockRoom.Enter = StockRoomEnter;
StockRoom.Leave = StockRoomLeave;
Elevator.Enter = ElevatorEnter;
Elevator.Leave = ElevatorLeave;
SleepEnterZone.Enter = SleepEnterZoneEnter;
SleepEnterZone.Leave = SleepEnterZoneLeave;
ModifyRoom.Enter = ModifyRoomEnter;
ModifyRoom.Leave = ModifyRoomLeave;
ModifyTile.Enter = ModifyTileEnter;
ShopRoom.Enter = ShopRoomEnter;
ShopRoom.Leave = ShopRoomLeave;
ShopInnerRoom.Enter = ShopInnerRoomEnter;
ShopInnerRoom.Leave = ShopInnerRoomLeave;
WorkRoom.Enter = WorkRoomEnter;
WorkRoom.Leave = WorkRoomLeave;
WorkInnerRoom.Enter = WorkInnerRoomEnter;
OperRoom.Enter = OperRoomEnter;
OperRoom.Leave = OperRoomLeave;
Cat.Enter = CatEnter;
PrivateRoom.Enter = PrivateRoomEnter;
TrainingRoom.Enter = TrainingRoomEnter;
TrainingRoom.Leave = TrainingRoomLeave;
EducationRoom.Enter = EducationRoomEnter;
EducationRoom.Leave = EducationRoomLeave;
ChargeRoom.Enter = ChargeRoomEnter;
ChargeRoom.Leave = ChargeRoomLeave;

export var AllZoneList = [
    StockRoom, Elevator, SleepRoom, ModifyRoom, ModifyTile, ShopRoom, ShopInnerRoom,
    WorkRoom, WorkInnerRoom, OperRoom, Cat, DancerRoom, PrivateRoom, TrainingRoom,
    EducationRoom, ChargeRoom, SleepEnterZone, SleepEnterTiles
];

export var map = {
    "Type": "Always",
    "Tiles": "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҲҲҲҴҴҲҲҲҴҴҴҴҴҴҴ¬yyyyyҴҴҴҳҳҳҴҴҴyyyyтyyyҴҴªªªҴҴªªªтyyyyyyyyyyyyҴҴҳ«««ҳҴтyyyyтyyyҴҴªªªҴҴªªªтyyyyyyyyyyyyҴҴ«ҳ«ҳ«ҴКyyyyтyyyҴҴҴҴҴҴҴҴҴҴтyyyyyyyyyyyyҴҴ«««««ҴҴyyyyтyyyyyyyyyyyyyтyyyyyyyyyyyyҴҴ«ҳ«ҳ«ÇÇyyyyтyyyyyyyyyyyyyтyyyyyyyyyyyyҴҴҳ«««ҴҴтyyyyтyyyyyyyyyyyyyтyyyyyyҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҳ«ҳyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyҳ«ҳ«¬«yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy«¬«ҲҲҴҴҴҲҲҴyyyҴААААҴААААҴААААААҴyyyҴҳҳҳҴҳҳҳªªҴҴҴªªҴyyyҴҴҴҴyyyҴ«««Ҵ«««ªªҴҴҴªªҴyyyҴҴҴҴyyyҴ«¬«Ҵ«¬«¬¬¬¬¬¬¬ҴyyyҴҴҴҴyyyҴ«««Ҵ«««ҲҲҴ¬ҴҴҴҴyyyҴҴҴҴyyyҴҴҴҴҴҴҴҴªªҴ¬¬¬¬ҴyyyҴҴҴҴyyyҴyyyyyyyªªҴ¬¬¬¬ҴyyyҴҴҴЮЮЮЮЮҴҴҴҴҴҳҳҳҳҴyyyҴyyyyyyy¬¬¬¬¬¬¬ÇyyyҴxЮ¬¬¬Юxxxҳ«««ҴyyyÇyyyyyyyҲҲҴ¬ҴҲҲҴyyyҴxЮЮxxxҳ««ҳҳҴyyyҴҳ¬ҳ¬ҳ¬ҳªªҴ¬ҴªªҴyyyҴxxxxxxxxxxxҳ«««ҴyyyҴҴҳҴҳҴҳҴªªҴ¬ҴªªҴyyyҴxxxxxxxxxxxҳ««ҳҳҴyyyҴҴ«Ҵ«Ҵ«Ҵ¬¬¬¬¬¬¬ҴyyyҴxxxxxxxxxxxҳ«««ҴyyyҴҴ«Ҵ«Ҵ«ҴҴҴҴҴҴҴҴҴyyyҴxxxxxxxxxxxҳ««ҳҳҴyyyҴҴҴҴҴҴҴҴҳ«ҳyyyyyyyyҴxxxxxxxxxxxҳ«««Ҵyyyyyyyyҳ«ҳ«¬«yyyyyyyyҴxxxxxxxxxxxҳ««ҳҳҴyyyyyyyy«¬«ҴҴҴҴҴҴҴyyyyҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴyyyyҴҴҴҴҴҴҴyyyyyyҴyyyyyyyyyyyyyyyyyyyyyyyyyyҴyyyyyyyyyyyyҴyyyyyyyyyyyyyyyyyyyyyyyyyyҴyyyyyyyyyyyyҴҳ«ҳyyyyyyyҳ«ҳyyyyyyyyyҳҳҳҳҴyyyyyyyyyyyyҴ«¬«yyyyyyy«¬«yyyyyyyyyҳ«««ҴyyyyyyyyyyyyҴҳ«ҳyyyyyyyҳ«ҳyyyyyyyyyҳ«««ҴyyyyyyyyyyyyҴyyyyyyyyyyyyyyyyyyyyyyÇ«««ҴyyyyyyҴҴҴҴҴҴҴҴҴҴҴҴЮЮЮЮЮҴҴҴҴҴҴҴҴҴҴyҴҴҴҴҴҴҳҳҳҳҳҳææëëëðëëëææҴxxxxxҴҲҲҲҲҳҳҳҳҴҴҴҴҲҲҲҴ««««««ææëëëðëëëææҴxxxxxҴªªªҲ«««ҳ¬¬¬ҴªªªҴ««««««ææëëëëëëëææҴxxxxxҴªªªҲ«««ҳ¬¬¬ҲªªªҴ««««««ææëëëðëëëææÇxxxxxÇªªªҲ«««ҳ¬¬¬ÇªªªҴ««««««ææëëëðëëëææҴxxxxxҴҲҲҲҳҳҳҳҳҳҳҳҴҲҲҲҴ««««««ææëëëëëëëææҴЮЮЮЮЮҴyyұ«ҳ«ҳ«ҳ«ҳyyyyҴ««««««",
    "Objects": "ҴӄӃҶұҳҹddddddddddddddddddddddddddddddddddddddddddddddddddd೥ddddddd೦೧ddd೦೧dddddddƂƂƂƂƂұdddddddddшшшddŀddddшddddшdddҴƂƂƂƂƂdddddddddddddddddddddиddddddddddddddddddƂƂƂƂƂҲdddddddddžſddddƀƁddd೥ྴddd೥ྴdҵƂƂƂƂƂddddddddddшddྴྴdddddddddddddddddddddddddƂƂƂƂƂҳddddddddddddddddddddddddddddҶƂƂƂƂƂdddddddddddddddŀdddddddddddddddddddddddddddddྴdddddddddddྴdddྴddddddddddddྴddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd೦೧ddd೦೧dddddd௪ddddd௪ddddd௪dddddddd೥ddd೥džſdddžſdddddшżdddddżшdшd࠲żdddddddиdшdиdшddddddddddddddːːdːːdddddddːːdddddddddddddddddddddddddddϼdϼdddddddddϼdddddddddddd೦೧ddd೥ddddddࠖࠖdddddࠖࠖdࠖࠖdd˚˚ddddddྴdddྴdžſdddddddddddddŀdŀdddddddddŀdddddddddddddddddddྴddddྶdddddddྶdྶdddddddddྴdddddddddddddddddddїdтdтdтdјdљdіќdddddddddddddd೦೧ddd೦೧dddddddࠖࠖࠖࠖࠖdddddddddddddddddddddžſdddžſddddddшdddddŀddddїјddddddddྴdྴdྴddddddddddddddddˤˤˤdżdddddddddddddddddddddddddddddddddddˆˆˆddddddїўddddddddшdшdшdddddddddddddddddddddddddddddddddddddddddddddddddddddddƂƂddddd̪ddddјњddddddddddddddddddddddddddžſdddddddddddddddddddddddddddddddྴdddddddddddddddྶྐྵdྸdddddddddྴdddddƂƂƂƂƂҷddddddddddddddddddddddddddddҺƂƂƂƂƂddddddddddddddddddddddddddddddddddddddddƂƂƂƂƂҸddddddddddddddddddddddddddddһƂƂƂƂƂddddddddddddddddddddddddddddddddddddddddƂƂƂƂƂҹdddddddddddddddddddddddྸddddҼƂƂƂƂƂddddddddddddddddddddddddddddddddddddddddೋdddddddddೋdddddddddddddddddddddddddddddnsdddddddddddиdddddddddddddྴddddddшшшшшшddddddddddddƀƁddddddddddddddddddddшшшшшшdddddddddddྴdddddྷdddddddddddྐྵddddшшшшшшddddddddddddddddddddddddddddddddddшшшшшшdddddddddddd࠲d࠲d࠲dddddddddddddddddшшшшшшddddddddddddddddddddddddddddddddddшшшшшш"
};

export async function ExpendInit() {
    await waitFor(() => initComplete == true);
    //InitMap();
}

export async function InitMapFaci() {
    ChatRoomData.Name = "DroneFacility 2.0";
    ChatRoomData.desc = `In development... testing and gathering ideas for the mod.
All info on github: tinyurl.com/DroneTrainingSystem
If something isn't clear just ask RoomTester or someone who has the mod already~`;
    ChatRoomData.Limit = 20;
    ChatRoomData.Access = ['All'];
    ChatRoomData.Visibility = ['All'];
    ChatRoomData.Private = false;
    ChatRoomData.MapData = Object.assign({}, map);
    ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: ChatRoomGetSettings(ChatRoomData), Action: "Update" });
    for (var char of ChatRoomCharacter) {
        ChatRoomMapViewTeleport(char.MemberNumber, { X: 1, Y: 37 });
        await sleep(200);
    }
    MovePlayer({ X: 1, Y: 37 });
}

export async function PlayerMovedFaci() {
    // Validate whether the map is correct
    if (ChatRoomData.MapData.Objects.startsWith("ҴӄӃҶұҳҹ") == false) return;
    var pdi = PlayerDroneInfo();
    Player.MapData.PrivateState.HasKeyBronze = true;
    Player.MapData.PrivateState.HasKeyGold = pdi.isOwner;
    Player.MapData.PrivateState.HasKeySilver = pdi.isDrone;

    var currentPverPos = pverPos;
    if (currentPverPos == null) {
        currentPverPos = { X: 0, Y: 0 };
    }
    for (let zoneKey in AllZoneList) {
        if ((AllZoneList[zoneKey].Enter ?? false) == false &&
            (AllZoneList[zoneKey].Leave ?? false) == false &&
            (AllZoneList[zoneKey].Moved ?? false) == false)
            continue;
        let nowInZone = IsInZone(Player.MapData.Pos, AllZoneList[zoneKey]);
        let pverInZone = IsInZone(currentPverPos, AllZoneList[zoneKey]);
        if (AllZoneList[zoneKey].Enter) {
            if (nowInZone !== false && pverInZone === false)
                AllZoneList[zoneKey].Enter(nowInZone);
        }
        if (AllZoneList[zoneKey].Leave && nowInZone === false && pverInZone !== false) {
            AllZoneList[zoneKey].Leave(pverInZone);
        }
        if (AllZoneList[zoneKey].Moved && nowInZone !== false) {
            AllZoneList[zoneKey].Moved(nowInZone);
        }
    }
    setPverPos(Object.assign({}, Player.MapData.Pos));
}

export async function CheckSleepUntil() {
    if (ChatRoomData.MapData.Objects.startsWith("ҴӄӃҶұҳҹ") == false) return;
    var pdi = PlayerDroneInfo();
    if (pdi.sleepUntil == null) return;
    if (pdi.sleepUntil < Date.now()) {
        pdi.sleepUntil = null;
        SendMessageToSelf(`Sleep complete; moving to main facility area`);
        await sleep(2000);
        MovePlayer(RandomPosOfArea(Elevator.Areas[3]));
        RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
        return;
    }
    if (IsInZone(Player.MapData.Pos, SleepRoom) === false) {
        WearEquips(Player, [Crate]);
        MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]), true);
    }
}