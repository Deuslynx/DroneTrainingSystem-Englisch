// ----- missions.js -----
// Mission definitions and progress/completion tracking.

import { PlayerDroneInfo } from "./drone.js";
import { SendMessageToSelf } from "./utils.js";

export const missionLists = [
    ["StockRoomMission", "OrgasmMission", "SpankMission", "PetHeadMission", "ChargeMission", "TrainMission", "EducationMission"],
    ["StockRoomMission", "OwnerSpankMission", "OwnerPetHeadMission"],
];

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
        var mission = new MissionInfo("Train", "Training mission", 15);
        mission.target = 1;
        mission.progress = 0;
        mission.desc = `Complete one training course`;
        return mission;
    }
    static EducationMission() {
        var mission = new MissionInfo("Educate", "Education mission", 15);
        mission.target = 1;
        mission.progress = 0;
        mission.desc = `Complete one education course`;
        return mission;
    }
}
