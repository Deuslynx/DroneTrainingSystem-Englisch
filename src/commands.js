// ----- commands.js -----
// The DTS wire protocol (hidden-message commands, beep commands, chat
// commands), plus all the status/action-menu chat-log rendering that those
// commands trigger.

import {
    bindLevelStrings, bodyLevelStrings, bodyPartStrings, bodyPartDisplayStrings,
    typeDisplayStrings, ArousalDisplayStrings, changeLog
} from "./constants.js";
import { charaterInstalledScript_isDrone, setPverPos, showedEnterHelp, setShowedEnterHelp, showChangeLog } from "./state.js";
import {
    sleep, waitFor, findIndices, SendMessageToSelf, SendActionText, styleButton,
    styleProgressBar, ClearTagMessage, ClearAllMessage, IsInArea, RandomPosOfArea, MovePlayer
} from "./utils.js";
import {
    PlayerDroneInfo, CheckPlayerDroneInfoExistAndIsDrone, DoPunishment, DoOrgasm, DoVibe,
    DoSetBodyOrBindStatus, RefreshBinds, RemoveRestrains, WearEquips, SetToDroneAccept,
    SetStatusHint, SetIdentityHint, SendBatteryHelp, RefreshBatteryTag, RefreshPlayerEffect
} from "./drone.js";
import { ItemInfo } from "./items.js";
import { InitMapFaci, PrivateRoom, PrivateRoomCrate, MissionInfo, ShowAvailableModify, DoModifyByOwner } from "./rooms.js";

// v1.5 used the misspelled protocol field "recive". Send and accept both so
// v1.5 and new clients can still discover each other in the same room.
export function DTSHeartBeatPayload(requestResponse, isDrone) {
    return {
        receive: requestResponse,
        recive: requestResponse,
        isDrone: isDrone
    };
}

export const MsgCmds = {
    HeartBeatPack: {
        Command: (sender, param) => {
            if (sender.MemberNumber == Player.MemberNumber) return;
            if (param.isDrone != undefined) {
                charaterInstalledScript_isDrone[sender.MemberNumber] = param.isDrone;
            }
            if (param.receive || param.recive) {
                SendDTSMsg(sender, new MsgInfo("HeartBeatPack", DTSHeartBeatPayload(false, PlayerDroneInfo().isDrone)));
            }
        }
    },
    SetStatus: {
        Command: (sender, param) => {
            if (param.length < 3) return;
            var type = param[0];
            var part = param[1];
            var level = param[2];
            DoSetBodyOrBindStatus(type, part, level, sender);
        }
    },
    BatteryHelp: {
        Command: (sender, param) => {
            if (ChatRoomMapViewIsActive() == false) {
                SendMessageToSelf(`Received a charging assistance signal from Drone ${sender.MemberNumber}`);
            }
            else {
                var xDiff = sender.MapData.Pos.X - Player.MapData.Pos.X;
                var yDiff = sender.MapData.Pos.Y - Player.MapData.Pos.Y;
                SendMessageToSelf(`Charging help signal received from Drone ${sender.MemberNumber} (${Math.abs(xDiff)} tiles ${xDiff > 0 ? "right" : "left"} and ${Math.abs(yDiff)} tiles ${yDiff > 0 ? "below" : "above"})`);
            }
        }
    },
    DoPunishment: {
        Command: (sender, param) => {
            if (param == null || param.length < 2) {
                var pdi = PlayerDroneInfo();
                DoPunishment(pdi.shockLevel, pdi.shockCount);
            }
            else {
                var power = param[0];
                var count = param[1];
                SendMessageToSelf(`Punishment command received from ${sender.Name}`);
                DoPunishment(power, count);
            }
        }
    },
    DoVibe: {
        Command: (sender, param) => {
            if (param.length < 1) return;
            var power = param[0];
            SendMessageToSelf(`Vibration-device command received from ${sender.Name}`);
            DoVibe(power);
        }
    },
    DoOrgasm: {
        Command: (sender, param) => {
            SendMessageToSelf(`Received Forced-orgasm command from ${sender.Name}`);
            DoOrgasm();
        }
    },
    RequestStatus: {
        Command: (sender, param) => {
            ResponseRequestStatus(sender, param);
        }
    },
    ReceivedStatus: {
        Command: (sender, param) => {
            ShowStatus(param);
        }
    },
    ReceivedStatusModify: {
        Command: (sender, param) => {
            if (ShowAvailableModify != undefined) {
                ShowAvailableModify(param);
            }
        }
    },
    DoModifyByOwner: {
        Command: (sender, param) => {
            if (DoModifyByOwner != undefined) {
                DoModifyByOwner(param);
            }
        }
    },
    BatteryCharge: {
        Command: (sender, param) => {
            ResponseBatteryCharge(param);
        }
    },
    AddArousal: {
        Command: (sender, param) => {
            ActivityTimerProgress(Player, param);
        }
    },
    ReqOwnerRight: {
        Command: (sender, param) => {
            if (param) {
                PlayerDroneInfo().ownerId = -1;
                SendMessageToSelf(`Operator${sender.MemberNumber} has revoked control over this unit`);
                SendDTSMsg(sender, new MsgInfo("RespOwnerRight", param));
            }
            else {
                SendMessageToSelf(`Operator${sender.MemberNumber} requests control permission for this unit. Click: ${styleButton("Accept", SetToDroneAccept, sender)}`);
            }
        }
    },
    RespOwnerRight: {
        Command: (sender, param) => {
            SendMessageToSelf(`${param ? "Revoked" : "Acquired"} control permission for Drone ${sender.MemberNumber}`);
        }
    },
    SetDisplayTalk: {
        Command: (sender, param) => {
            ResponseSetDisplayTalk(sender, param);
        }
    },
    SendMissionHelp: {
        Command: (sender, param) => {
            ShowMissionsString(param, `"Mission help request received from Drone ${sender.MemberNumber}:`);
        }
    },
    PutMission: {
        Command: (sender, param) => {
            SendMessageToSelf(`Mission received from Operator ${sender.MemberNumber}`);
            TakeMission();
        }
    },
    CallToPos: {
        Command: (sender, param) => {
            var pdi = PlayerDroneInfo();
            if (pdi.isDrone) {
                SendMessageToSelf(`Call request received from Operator ${sender.MemberNumber}. Moving to specified location...`);
                ClearTagMessage("CallToPos");
                MovePlayer(param, true);
            }
            else {
                SendMessageToSelf(`Call request received from Operator ${sender.MemberNumber}. ${styleButton("Move to specified location", () => {
                    ClearTagMessage("CallToPos");
                    MovePlayer(param, true);
                })}`, "CallToPos");
                setTimeout(() => { ClearTagMessage("CallToPos"); }, 30000);
            }
        }
    }
};

export const CommandsAction = {
    findtarget: {
        Command: (param) => {
            var mn = parseInt(param[0]);
            if (isNaN(mn) == false) {
                var char = ChatRoomCharacter.find(c => c.MemberNumber === mn);
                if (char) {
                    DoFindTatget(char);
                }
                else {
                    SendMessageToSelf("Target not found!");
                }
            }
            else {
                SendMessageToSelf("Target not found!");
            }
        }
    },
    findtargetmodify: {
        Command: (param) => {
            var mn = parseInt(param[0]);
            if (isNaN(mn) == false) {
                var char = ChatRoomCharacter.find(c => c.MemberNumber === mn);
                if (char) {
                    DoFindTatget(char, "ReceivedStatusModify");
                }
                else {
                    SendMessageToSelf("Target not found!");
                }
            }
            else {
                SendMessageToSelf("Target not found!");
            }
        }
    },
    findtargetoprivate: {
        Command: (param) => {
            var mn = parseInt(param[0]);
            if (isNaN(mn) == false) {
                var char = ChatRoomCharacter.find(c => c.MemberNumber === mn);
                if (char) {
                    var index = -1;
                    if (PrivateRoom != undefined && PrivateRoomCrate != undefined) {
                        for (var i in PrivateRoom.Areas) {
                            if (IsInArea(Player.MapData.Pos, PrivateRoom.Areas[i])) {
                                index = i;
                                break;
                            }
                        }
                    }
                    var pos = Object.assign({}, Player.MapData.Pos);
                    if (index != -1) {
                        pos = PrivateRoomCrate.Areas[index];
                    }
                    SendDTSMsg(char, new MsgInfo("CallToPos", pos));
                }
                else {
                    SendMessageToSelf("Target not found!");
                }
            }
            else {
                SendMessageToSelf("Target not found!");
            }
        }
    }
};

export const BeepCmds = {
    cometoroom: {
        Command: async (senderMn, param, options) => {
            if (options.chatRoomName == undefined || options.chatRoomName == null) return;
            var pdi = PlayerDroneInfo();
            var moveToRoom = async () => {
                ClearTagMessage("CallToPos");
                if (ChatRoomData.Name.toLowerCase() !== options.chatRoomName.toLowerCase()) {
                    try {
                        await JoinRoom(options.chatRoomName);
                    }
                    catch {
                        return;
                    }
                }
                if (ChatRoomIsViewActive("Map") == false) return;
                try {
                    var pos = ChatRoomGetCharacter(senderMn).MapData.Pos;
                    MovePlayer(pos);
                }
                catch {
                    return;
                }
            };
            if (pdi.isDrone && pdi.ownerId == senderMn) {
                SendMessageToSelf(`Remote call request received from Operator ${senderMn}. Moving to their room...`);
                moveToRoom();
            }
            else {
                SendMessageToSelf(`Received a remote call request from Operator ${senderMn}, ${styleButton("Move to their room", () => {
                    moveToRoom();
                })}`, "CallToPos");
                setTimeout(() => { ClearTagMessage("CallToPos"); }, 30000);
            }
        }
    }
};

export function SendDTSMsg(targetPlayer, Dict) {
    if (targetPlayer) {
        ServerSend("ChatRoomChat", { Content: "DTS", Type: "Hidden", Dictionary: Dict, Target: targetPlayer.MemberNumber });
    }
    else {
        ServerSend("ChatRoomChat", { Content: "DTS", Type: "Hidden", Dictionary: Dict });
    }
}

export class MsgInfo {
    constructor(type, param) {
        this.type = type;
        this.param = param;
    }
    static DoCmd(sender, msgInfo) {
        MsgCmds[msgInfo.type].Command(sender, msgInfo.param);
    }
    static DoBeepCmd(MemberNumber, msgInfo, options) {
        BeepCmds[msgInfo.type].Command(MemberNumber, msgInfo.param, options);
    }
}
export class CommandInfo {
    constructor(command, commandText) {
        this.command = command;
        this.commandText = commandText;
    }
    static DoCmd(commandInfo) {
        CommandsAction[commandInfo.command].Command(commandInfo.commandText);
    }
}

export function ResponseRequestStatus(sender, param = null) {
    var handle = "ReceivedStatus";
    if (param != null) {
        handle = param;
    }
    if (charaterInstalledScript_isDrone[sender.MemberNumber] != undefined) {
        SendDTSMsg(sender, new MsgInfo(handle, PlayerDroneInfo()));
    }
    else if (CheckPlayerDroneInfoExistAndIsDrone()) {
        SendActionText(GetStatusAndVoiceCmdString(), sender);
    }
}
export function ResponseBatteryCharge(param) {
    var pdi = PlayerDroneInfo();
    pdi.battery += param;
    if (pdi.battery > pdi.batteryMax) {
        pdi.battery = pdi.batteryMax;
    }
    RefreshBatteryTag();
    RefreshPlayerEffect();
}
export function ResponseSetDisplayTalk(sender, param) {
    PlayerDroneInfo().disPlayTalk = param;
    SendMessageToSelf(`Display talk was set by ${sender.Name} to ${param ? "enabled" : "disabled"}`);
}

export function ShowStatus(info = null) {
    if (!info) {
        info = PlayerDroneInfo();
    }
    var playerIsOwner = ((info.ownerId == -1 && info.MemberNumber != Player.MemberNumber) || info.ownerId == Player.MemberNumber);
    var char = ChatRoomCharacter.find(c => c.MemberNumber === info.MemberNumber);
    var { bpm, breathing, temp } = InventoryItemBreastFuturisticBraUpdate(char);
    var progress = 0;
    var temp = 37;
    if (char.ArousalSettings && char.ArousalSettings.Progress > 0) {
        temp += (char.ArousalSettings.Progress / 100) * 3;
        progress = char.ArousalSettings.Progress;
    }
    var sleepString = "";
    if (info.sleepUntil != null) {
        sleepString += "\nSleeping until:";
        sleepString += new Date(info.sleepUntil).toLocaleString();
    }

    var ShowString = "";
    if (info.isDrone) {
        var exString = GetExString(info);
        ShowString =
            `——————Basic Info——————
Drone ID: ${info.MemberNumber}
Drone model: ${info.type}V${info.level}
quota points: ${info.coin}
Remaining battery: ${info.battery}/${info.batteryMax}
Operator ID: ${info.ownerId == -1 ? 'No Operator' : info.ownerId}
System version: ${info.scriptVersion}${sleepString}
——————Physiology——————
Heart rate: ${bpm}BPM
Temperature: ${temp}℃
Arousal state: ${(breathing === "Action" || breathing === "High") ? "Aroused" : "Not aroused"}
Current arousal: ${progress}%
Pleasure device: ${bindLevelStrings[info.bodyStatus.body]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 1, 3) : ""}
Orgasm limit: ${bindLevelStrings[info.bindStatus.body]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 0, 3) : ""}
——————Device Info——————
Eye restraint: ${bindLevelStrings[info.bindStatus.eyes]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 0, 0) : ""}
Ear restraint: ${bindLevelStrings[info.bindStatus.ears]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 0, 1) : ""}
Mouth restraint: ${bindLevelStrings[info.bindStatus.mouth]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 0, 2) : ""}
Hand restraint: ${bindLevelStrings[info.bindStatus.hands]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 0, 4) : ""}
Leg/foot restraint: ${bindLevelStrings[info.bindStatus.legs]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 0, 5) : ""}
——————Function Info——————
Eye function: ${bodyLevelStrings[info.bodyStatus.eyes]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 1, 0) : ""}
Ear function: ${bodyLevelStrings[info.bodyStatus.ears]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 1, 1) : ""}
Mouth function: ${bodyLevelStrings[info.bodyStatus.mouth]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 1, 2) : ""}
Hand function: ${bodyLevelStrings[info.bodyStatus.hands]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 1, 4) : ""}
Leg/foot function: ${bodyLevelStrings[info.bodyStatus.legs]} ${playerIsOwner ? styleButton("Adjust", SetStatusHint, info, 1, 5) : ""}
——————Available Programs——————${exString}
${styleButton("Available actions", ShowActionButtons, info)}`;
    }
    else if (info.isOwner) {
        ShowString =
            `——————Basic Info——————
Operator ID: ${info.MemberNumber}
Operator permission level: ${info.level}
quota points: ${info.coin}
System version: ${info.scriptVersion}
——————Physiology——————
Heart rate: ${bpm}BPM
Temperature: ${temp}℃
————————————————
${styleButton("Available actions", ShowActionButtons, info)}`;
    }
    else {
        ShowString =
            `——————Basic Info——————
Visitor ID: ${info.MemberNumber}
quota points: ${info.coin}
System version: ${info.scriptVersion}
——————Physiology——————
Heart rate: ${bpm}BPM
Temperature: ${temp}℃
————————————————
${styleButton("Available actions", ShowActionButtons, info)}`;
    }
    SendMessageToSelf(ShowString, "status");
}

export function GetExString(info) {
    var exString = ``;
    if (info.modifys["training1"]) {
        exString += `\nObedience command: When an Operator pats the head, switch to obedience pose`;
        exString += `\nReset command: When an Operator pinches the cheek, reset posture`;
        exString += `\nSelf-check command: When an Operator caresses the lower abdomen/belly, perform self-check`;
    }
    if (info.modifys["training2"]) {
        exString += `\nStandby command: When an Operator pinches the lower abdomen/belly, switch to standby pose`;
        exString += `\nService command: When an Operator wiggles the body part to be served, kiss that part with the mouth plug`;
    }
    if (info.modifys["education1"]) {
        exString += `\nReward program: Being patted on the head has a chance to trigger orgasm`;
    }
    if (info.modifys["education2"]) {
        exString += `\nGuilt program: Failing to resist orgasm raises a random restraint by 1`;
    }
    return exString;
}

export function GetStatusAndVoiceCmdString() {
    var info = PlayerDroneInfo();
    var playerIsOwner = ((info.ownerId == -1 && info.MemberNumber != Player.MemberNumber) || info.ownerId == Player.MemberNumber);
    var char = ChatRoomCharacter.find(c => c.MemberNumber === info.MemberNumber);
    var { bpm, breathing, temp } = InventoryItemBreastFuturisticBraUpdate(char);
    var progress = 0;
    var temp = 37;
    var exString = GetExString(info);
    if (char.ArousalSettings && char.ArousalSettings.Progress > 0) {
        temp += (char.ArousalSettings.Progress / 100) * 3;
        progress = char.ArousalSettings.Progress;
    }
    return `——————Basic Info——————
Drone ID: ${info.MemberNumber}
Drone model: ${info.type}V${info.level}
quota points: ${info.coin}
Remaining battery: ${info.battery}/${info.batteryMax}
Operator ID: ${info.ownerId == -1 ? 'No Operator' : info.ownerId}
System version: ${info.scriptVersion}
——————Physiology——————
Heart rate: ${bpm}BPM
Temperature: ${temp}℃
Arousal state: ${(breathing === "Action" || breathing === "High") ? "Aroused" : "Not aroused"}
Current arousal: ${progress}%
Pleasure device: ${bindLevelStrings[info.bodyStatus.body]}
Orgasm limit: ${bodyLevelStrings[info.bindStatus.body]}
——————Device Info——————
Eye restraint: ${bindLevelStrings[info.bindStatus.eyes]}
Ear restraint: ${bindLevelStrings[info.bindStatus.ears]}
Mouth restraint: ${bindLevelStrings[info.bindStatus.mouth]}
Hand restraint: ${bindLevelStrings[info.bindStatus.hands]}
Leg/foot restraint: ${bindLevelStrings[info.bindStatus.legs]}
——————Function Info——————
Eye function: ${bodyLevelStrings[info.bodyStatus.eyes]}
Ear function: ${bodyLevelStrings[info.bodyStatus.ears]}
Mouth function: ${bodyLevelStrings[info.bodyStatus.mouth]}
Hand function: ${bodyLevelStrings[info.bodyStatus.hands]}
Leg/foot function: ${bodyLevelStrings[info.bodyStatus.legs]}
——————Voice commands——————
Drone${info.MemberNumber} show status
Drone${info.MemberNumber} (eyes|ears|mouth|arms|legs) restraint set to (off|on|maximum)
Drone${info.MemberNumber} (eyes|ears|mouth|arms|legs) function set to (available|restricted|offline)
Drone${info.MemberNumber} (open|close) the display screen
Drone${info.MemberNumber} pleasure device set to (off|active|maximum)
Drone${info.MemberNumber} set climax limit to (off|active|maximum)
Drone${info.MemberNumber} orgasm reward
Drone${info.MemberNumber} shock punishment
Drone${info.MemberNumber} deploy charging crank
Note: If the Drone cannot receive voice commands due to hearing limitations (such as ear-related restrictions or battery levels below 20%), you can try sending *command content or (command content) to bypass these limitations.
——————Available Programs——————${exString}
`;
}

export function ShowActionButtons(info = null) {
    var string = "";
    if (!info) {
        info = PlayerDroneInfo();
    }
    // To yourself
    if (info.MemberNumber == Player.MemberNumber) {
        if (info.isDrone) string = ShowStringsToSelf(0, info);
        else if (info.isOwner) string = ShowStringsToSelf(1, info);
        else string = ShowStringsToSelf(2, info);
    }
    // Towards others
    else {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            if (info.isDrone) string = ShowStringsToOther(0, info);
            else if (info.MemberNumber == pdi.ownerId) string = ShowStringsToOther(1, info);
            else string = ShowStringsToOther(2, info);
        }
        else if (pdi.isOwner) {
            if (info.isDrone) string = ShowStringsToOther(3, info);
            else string = ShowStringsToOther(5, info);
        }
        else {
            if (info.isDrone) string = ShowStringsToOther(4, info);
            else string = ShowStringsToOther(5, info);
        }
    }
    SendMessageToSelf(string, "actions");
}

export function ShowStringsToSelf(index, info) {
    var pdi = PlayerDroneInfo();
    switch (index) {
        case 0:
            return `This unit's available actions:
Show this unit's status:${styleButton("Run", ShowStatus)}
Find unit status:${styleButton("Run", FindPlayerHint)}
Show carried items:${styleButton("Run", ShowItemsList)}
Show mission progress:${styleButton("Run", ShowMissionProcess)}
Send charging help request:${styleButton("Run", SendBatteryHelp)}
Move to training facility:${styleButton("Run", GoToFacility)}
Call rescue/unstuck:${styleButton("Run", ExitFromStack)}
Show this panel again:${styleButton("Run", ShowActionButtons)}`;
        case 1:
            return `Operator available actions:
Show Operator status:${styleButton("Run", ShowStatus)}
Find unit status:${styleButton("Run", FindPlayerHint)}
Show carried items:${styleButton("Run", ShowItemsList)}
Show mission progress:${styleButton("Run", ShowMissionProcess)}
Unregister Operator identity:${styleButton("Run", SetIdentityHint, info, false, true)}
Move to training facility:${styleButton("Run", GoToFacility)}
Call rescue/unstuck:${styleButton("Run", ExitFromStack)}
Show this panel again:${styleButton("Run", ShowActionButtons)}`;
        case 2:
            return `Visitor available actions:
Show own status:${styleButton("Run", ShowStatus)}
Find unit status:${styleButton("Run", FindPlayerHint)}
Register as Drone:${styleButton("Run", SetIdentityHint, info, true, false)}
Register as Operator:${styleButton("Run", SetIdentityHint, info, false, false)}
Move to training facility:${styleButton("Run", GoToFacility)}
Call rescue/unstuck:${styleButton("Run", ExitFromStack)}
Show this panel again:${styleButton("Run", ShowActionButtons)}`;
        default:
            return "";
    }
}

export function ShowStringsToOther(index, info) {
    switch (index) {
        case 0: // Drone to Drone
            return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Send mission help request:${styleButton("Run", SendMissionHelp, info)}
Share battery:${styleButton("Run", DoBatteryHelp, info, 0)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
        case 1: // Drone to its own Operator
            return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Send mission help request:${styleButton("Run", SendMissionHelp, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
        case 2: // Drones relative to non-operators or visitors
            return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Send mission help request:${styleButton("Run", SendMissionHelp, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
        case 3: // Operator to Drone
            return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Show voice commands:${styleButton("Run", ShowVoiceCommand, info)}
Shock punishment:${styleButton("Run", ReqDoPunishment, info)}
Orgasm reward:${styleButton("Run", ReqDoOrgasm, info)}
Set mission:${styleButton("Run", SetMissionToDrone, info)}
Connect charger:${styleButton("Run", DoBatteryHelp, info, 1)}
Hand-crank charging:${styleButton("Run", DoBatteryHelp, info, 2)}
Set display screen:${styleButton("Run", SetDisplayTalk, info)}
Request control permission:${styleButton("Run", SetIdentityHint, info, true, false)}
Clear control permission:${styleButton("Run", SetIdentityHint, info, true, true)}
Discard this Drone:${styleButton("Run", () => { SendMessageToSelf("In development"); })}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
        case 4: // Tourists' views on drones
            return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Show voice commands:${styleButton("Run", ShowVoiceCommand, info)}
Shock punishment:${styleButton("Run", ReqDoPunishment, info)}
Orgasm reward:${styleButton("Run", ReqDoOrgasm, info)}
Set mission:${styleButton("Run", SetMissionToDrone, info)}
Hand-crank charging:${styleButton("Run", DoBatteryHelp, info, 2)}
Set display screen:${styleButton("Run", SetDisplayTalk, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
        case 5: // Operator or Visitor to Operator or Visitor
            return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
        default:
            return "";
    }
}

export function ShowItemsList() {
    var pdi = PlayerDroneInfo();
    var string = "Item list:";
    for (var item of pdi.items) {
        string += "\n";
        string += item.text;
        if (item.use != null) {
            if (item.param.length == 0) {
                string += styleButton("Use", () => {
                    ItemInfo[item.use](item);
                    ShowItemsList();
                });
            }
            else {
                string += "\n";
                for (var p of item.param) {
                    string += styleButton(p.name, (id) => {
                        ItemInfo[item.use](item, id);
                        ShowItemsList();
                    }, p.id);
                }
            }
        }
        string += styleButton("Drop", (item) => { ItemInfo.RemoveThis(item); ShowItemsList(); }, item);
    }
    SendMessageToSelf(string, "items", false);
}

export function ShowMissionProcess() {
    var pdi = PlayerDroneInfo();
    ShowMissionsString(pdi.missions, "Mission list:");
}

export function ShowMissionsString(missions, head) {
    var string = head;
    for (var mission of missions) {
        string += "\n";
        string += mission.text + ": " + mission.desc;
        if (mission.target != undefined && mission.progress != undefined) {
            string += ` (${mission.progress}/${mission.target})`;
        }
    }
    SendMessageToSelf(string, "missions", false);
}

export function FindPlayerHint() {
    var input = (document.getElementById("InputChat"));
    input.value = '/DTS findtarget []';
    SendMessageToSelf("Enter the target ID inside the brackets and send the command or touch the target collar (including yourself)");
}
export function DoFindTatget(target, param = null) {
    SendDTSMsg(target, new MsgInfo("RequestStatus", param));
}

export function SendMissionHelp(info) {
    SendDTSMsg(info, new MsgInfo("SendMissionHelp", Object.assign([], PlayerDroneInfo().missions)));
    SendMessageToSelf("Mission help request sent!");
}

// WIP
export function SetMissionToDrone(info) {
    SendDTSMsg(info, new MsgInfo("PutMission", null));
    SendMessageToSelf("Mission assignment command sent!");
}

export async function GoToFacility() {
    if (ChatRoomData?.MapData?.Objects?.startsWith("ҴӄӃҶұҳҹ") && ChatRoomData?.Name?.startsWith("DroneFacility")) {
        SendMessageToSelf(`Already in the training facility. No movement needed.`);
        return;
    }
    const SearchData = {
        Query: "DroneFacility".toUpperCase().trim(),
        Language: ChatSearchLanguage,
        Space: ChatSearchGetSpace() ?? "",
        Game: ChatSearchGame,
        FullRooms: Player.ChatSearchSettings.FullRooms,
        ShowLocked: Player.ChatSearchSettings.ShowLocked,
        MapTypes: Player.ChatSearchSettings.MapTypes ? [Player.ChatSearchSettings.MapTypes] : [],
        SearchDescs: Player.ChatSearchSettings.SearchDescriptions,
    };
    var result = await ServerRoomSearch("DroneFacility", SearchData);
    if (result.error == null && result.value.length > 0) {
        for (var room of result.value) {
            var result2 = ChatSearchGridRoomCanJoin(room);
            if (result2) {
                await JoinRoom(room.Name);
                SendMessageToSelf(`Arrived at the training facility`);
                return;
            }
        }
    }
    else if (ChatRoomData.Admin.indexOf(Player.MemberNumber) != -1) {
        SendMessageToSelf(`No available room found - Update the current room into the training facility? All current room settings will be lost ${styleButton("Yes", () => {
            ClearAllMessage();
            InitMapFaci();
        })}${styleButton("No", () => {
            ClearTagMessage("GoToFacilityClear");
        })}`, "GoToFacilityClear");
        return;
    }
    SendMessageToSelf(`No available room found`);
}

export async function ExitFromStack() {
    var pdi = PlayerDroneInfo();
    if (pdi.isDrone) {
        SendMessageToSelf(`Drone rescue costs 20 credit quota. If you have less than 20, it will go negative. ${styleButton("Run", DoExitFromStack, 20)}`);
    }
    else {
        SendMessageToSelf(`Rescue costs 5 credit quota. If you have less than 5, it will go negative. ${styleButton("Run", DoExitFromStack, 20)}`);
    }
}

export async function DoExitFromStack(price) {
    var pdi = PlayerDroneInfo();
    SendMessageToSelf(styleProgressBar("Calling", "Complete", 120 * 1000, async () => {
        RemoveRestrains(Player);
        await sleep(1000);
        await RefreshBinds(true);
        await sleep(1000);
        if (ChatRoomData?.MapData?.Objects?.startsWith("ҴӄӃҶұҳҹ")) {
            MovePlayer({ X: 1, Y: 37 });
        }
        pdi.coin -= price;
    }));
}

export async function JoinRoom(RoomName) {
    await ChatRoomAttemptLeave();
    await sleep(1000);
    await ServerRoomJoin(RoomName);
    await sleep(1000);
    await waitFor(() => { return ChatRoomData != null; });
}

export function GetMission(pdi, missionStr = null) {
    // Deferred import to avoid a hard top-level cycle with rooms.js, which
    // itself imports several command helpers.
    var missionLists = [
        ["StockRoomMission", "OrgasmMission", "SpankMission", "PetHeadMission", "ChargeMission"],
        ["StockRoomMission", "OwnerSpankMission", "OwnerPetHeadMission"],
    ];
    var index = -1;
    if (missionStr != null) {
        index = missionLists[pdi.isDrone ? 0 : 1].findIndex(missionStr);
    }
    if (index == -1) {
        index = Math.floor(Math.random() * missionLists[pdi.isDrone ? 0 : 1].length);
    }
    var mission = MissionInfo[missionLists[pdi.isDrone ? 0 : 1][index]]();
    return mission;
}

export function TakeMission(missionStr = null) {
    var pdi = PlayerDroneInfo();
    if (pdi.todaysMission >= pdi.missionsMax) {
        SendMessageToSelf("Daily mission limit reached... can not take another.", "WorkRoom");
        return;
    }
    if (pdi.missions.length >= pdi.missionsMax) {
        SendMessageToSelf("Mission slots full... can not take another.", "WorkRoom");
        return;
    }
    var mission = GetMission(pdi, missionStr);
    pdi.missions.push(mission);
    pdi.todaysMission++;
    SendMessageToSelf(`Mission accepted: ${mission.text}`, "WorkRoom");
}

export function SetDisplayTalk(info) {
    SendDTSMsg(info, new MsgInfo("SetDisplayTalk", !info.disPlayTalk));
    SendMessageToSelf("Command sent: target Drone display screen set to " + (info.disPlayTalk ? "Off" : "On"));
}

export function ShowVoiceCommand(info = null) {
    if (!info) {
        info = { MemberNumber: "(Target ID)" };
    }
    SendMessageToSelf(`
——————Voice commands——————
Drone${info.MemberNumber} Show status
Drone${info.MemberNumber} (eyes|ears|mouth|arms|legs) restraint set to (off|on|maximum)
Drone${info.MemberNumber} (eyes|ears|mouth|arms|legs) function set to (available|restricted|offline)
Drone${info.MemberNumber} (open|close) the display screen
Drone${info.MemberNumber} pleasure device set to (off|active|maximum)
Drone${info.MemberNumber} set climax limit to (off|active|maximum)
Drone${info.MemberNumber} orgasm reward
Drone${info.MemberNumber} shock punishment
Drone${info.MemberNumber} deploy charging crank
Note: If the Drone cannot receive voice commands due to hearing limitations (such as ear-related restrictions or battery levels below 20%), you can try sending *command content or (command content) to bypass these limitations.`);
}

// type: 0 for average charge level, 1 for fully charged, 2 for 20% charge.
export function DoBatteryHelp(target, type) {
    var char = ChatRoomCharacter.find(c => c.MemberNumber === target.MemberNumber);
    if (!char) {
        SendMessageToSelf("Target lost");
        return;
    }
    if (ChatRoomIsViewActive("Map") && !ChatRoomMapViewCharacterOnInteractionRange(char)) {
        SendMessageToSelf("Target is too far away!");
        return;
    }
    var diff = 0;
    var pdi = PlayerDroneInfo();
    switch (type) {
        case 0: {
            SendActionText(`Drone ${Player.MemberNumber} presses her lower abdomen against Drone ${target.MemberNumber}'s. The power unit within the womb begins to transfer charge. The faint current causes their bodies to tremble slightly.`);
            SendMessageToSelf("Battery sharing complete");
            diff = (Math.floor((target.battery + pdi.battery) / 2)) - target.battery;
            pdi.battery -= diff;
            SendDTSMsg(target, new MsgInfo("BatteryCharge", diff));
            SendDTSMsg(target, new MsgInfo("AddArousal", 10));
            ActivityTimerProgress(Player, 10);
            RefreshBatteryTag();
            RefreshPlayerEffect();
        }
            break;
        case 1: {
            SendActionText(`${Player.Name} connects the power cable to the power port located between the legs of Drone ${target.MemberNumber}. The current flows through the vaginal canal to the power source within her womb, causing her body to shudder.`);
            SendMessageToSelf("Charging complete");
            diff = target.batteryMax - target.battery;
            SendDTSMsg(target, new MsgInfo("BatteryCharge", diff));
            SendDTSMsg(target, new MsgInfo("AddArousal", 30));
        }
            break;
        case 2: {
            if (pdi.battery >= pdi.batteryMax * 0.3) {
                SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target.MemberNumber}. Since Drone ${target.MemberNumber} already held a certain amount of charge, the crank spins on its own, rapidly draining a large amount of power.`);
            }
            else {
                SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target.MemberNumber} and turns it vigorously. The kinetic energy converts into electrical energy, flowing through the vaginal canal to the power source inside the womb, while the kinetic and electrical energy cause her body to tremble violently.`);
            }
            SendMessageToSelf("Charging complete");
            diff = Math.floor(target.batteryMax * 0.3) - target.battery;
            SendDTSMsg(target, new MsgInfo("BatteryCharge", diff));
            SendDTSMsg(target, new MsgInfo("AddArousal", 50));
        }
            break;
    }
}

export function ReqDoPunishment(target) {
    SendDTSMsg(target, new MsgInfo("DoPunishment", null));
}
export function ReqDoOrgasm(target) {
    SendDTSMsg(target, new MsgInfo("DoOrgasm", null));
}

export function ShowPlayerEnterHelp() {
    if (showedEnterHelp) return;
    if (showChangeLog) {
        SendMessageToSelf(changeLog);
    }
    SendMessageToSelf(`Link to Drone Training System established. ${styleButton("Show status", ShowStatus)} ${styleButton("Available Functions", ShowActionButtons)}`, "", true);
    SendDTSMsg(null, new MsgInfo("HeartBeatPack", DTSHeartBeatPayload(true, PlayerDroneInfo().isDrone)));
    setShowedEnterHelp(true);

    var pdi = PlayerDroneInfo();
    var now = new Date();
    var date = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    if (date > pdi.lastLoginDate) {
        if (pdi.isDrone) {
            SendMessageToSelf("Daily login reward: 5 quota points");
            pdi.coin += 5;
        }
        else {
            SendMessageToSelf("Daily login reward: 30 quota points");
            pdi.coin += 30;
        }
        pdi.todaysMission = 0;
        pdi.todaysWork = 0;
        pdi.lastLoginDate = date;
    }
}