// ----- drone.js -----
// Equipment definitions, the DroneInfo settings class + persistence,
// and all the low-level "drone body" operations: wear/remove restraints,
// refresh binds, punishment/vibe/orgasm, battery, and the upgrade catalog.

import { 
    script_version, DTS_SETTINGS_KEY, DTS_LEGACY_SETTINGS_KEYS, bodyPartStrings, 
    bodyPartDisplayStrings, bindLevelStrings, bodyLevelStrings, typeStrings, 
    typeDisplayStrings, ArousalDisplayStrings 
} from "./constants.js";
import { 
    sleep, DTSCloneSettings, SendMessageToSelf, SendActionText, styleButton, styleProgressBar 
} from "./utils.js";
import { 
    setShowChangeLog, isRefreshBinding, setIsRefreshBinding, lastRefreshBindsTime, setLastRefreshBindsTime 
} from "./state.js";
// SendDTSMsg/MsgInfo/DTSHeartBeatPayload are only ever invoked from inside
// function bodies below (never at module top-level), so this static import
// is safe despite commands.js importing back from drone.js.
import { SendDTSMsg, MsgInfo, DTSHeartBeatPayload } from "./commands.js";

// ----- Drone Restraints -----
//{
//    "Item": "",
//        "AssetGroup": "",
//            "Color": ,
//    "Lock": "HighSecurityPadlock",
//        "Private": false,
//            "ItemProperty": { },
//    "Type": null,
//        "Property": "Normal",
//            "TypeRecord": ,
//    "MemberName": "Drone master-control core",
//        "MemberNumber": 50051
//},
export var Crate = {
    "Item": "FuturisticCrate",
    "AssetGroup": "ItemDevices",
    "Color": [
        "#222222", "Default", "#444444", "Default", "Default", "#FF1199",
        "Default", "#444444", "#555555", "#3B7F2C", "Default", "Default",
        "#BBBBFF", "Default"
    ],
    "Lock": "HighSecurityPadlock",
    "Private": false,
    "ItemProperty": {},
    "Type": null,
    "Property": "Normal",
    "TypeRecord": { "w": 1, "l": 0, "a": 0, "d": 0, "t": 0, "h": 0 },
    "MemberName": "Drone master-control core",
    "MemberNumber": 50051
};
export var CrateBind = {
    "Item": "FuturisticCrate",
    "AssetGroup": "ItemDevices",
    "Color": [
        "#222222", "Default", "#444444", "Default", "Default", "#FF1199",
        "Default", "#444444", "#555555", "#3B7F2C", "Default", "Default",
        "#BBBBFF", "Default"
    ],
    "Lock": "HighSecurityPadlock",
    "Private": false,
    "ItemProperty": {},
    "Type": null,
    "Property": "Normal",
    "TypeRecord": { "w": 1, "l": 3, "a": 3, "d": 0, "t": 0, "h": 0 },
    "MemberName": "Drone master-control core",
    "MemberNumber": 50051
};
export var OneBar = {
    "Item": "OneBarPrison",
    "AssetGroup": "ItemDevices",
    "Color": ["Default"],
    "Lock": "HighSecurityPadlock",
    "Private": false,
    "ItemProperty": {},
    "Type": null,
    "Property": "Normal",
    "MemberName": "Drone master-control core",
    "MemberNumber": 50051
};

export var BasicDroneBinds = [
    // 0
    {
        "Item": "LatexCatsuit", "AssetGroup": "Suit",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },
    {
        "Item": "LatexCatsuit", "AssetGroup": "SuitLower",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },

    // 2
    {
        "Item": "FuturisticHarness", "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen; high-torque servos control Drone posture to prevent movement errors",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "HighSecurityHarness", "AssetGroup": "ItemTorso2",
        "Color": ["#444444", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen; high-torque servos control Drone posture to prevent movement errors",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },

    //4
    {
        "Item": "FuturisticVibrator", "AssetGroup": "ItemVulva",
        "Color": ["#454545", "#555555", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "vibrating": 0 },
        "Name": "Drone main power supply and power interface",
        "Description": "The Drone main power supply supports basic activity; the external power interface can receive external charging or orgasm-based charging",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },

    // 5
    {
        "Item": "VibeHeartClitPiercing", "AssetGroup": "ItemVulvaPiercings",
        "Color": ["#595959", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the nipples; uses physical vibration to induce arousal for hormone regulation",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "LockingVibePlug", "AssetGroup": "ItemButt",
        "Color": ["Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the anus; uses physical vibration to induce arousal for hormone regulation",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "VibeHeartPiercings", "AssetGroup": "ItemNipplesPiercings",
        "Color": ["#6C6C6C", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the clitoris; uses physical vibration to induce arousal for hormone regulation",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "ShockClamps", "AssetGroup": "ItemNipples",
        "Color": ["#Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone punishment device",
        "Description": "Implanted in the nipples; uses electric current to punish Drone errors",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },

    // 9
    {
        "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis",
        "Color": ["#454545", "#202020", "#878787", "#202020", "#878787", "#878787", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "c": 3, "i": 0, "o": 0, "s": 0 },
        "Name": "Drone internal-cycle control hub",
        "Description": "Implanted in the lower abdomen; controls all internal-cycle devices and includes orgasm-function restriction",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "FuturisticBra", "AssetGroup": "ItemBreast",
        "Color": ["#4A4A4A", "#FFFFFF", "#FFFFFF", "#4B4B4B", "#363636"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone physiological monitor",
        "Description": "Implanted in the chest; monitors temperature, heart rate, and arousal for physiological regulation",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },

    // 11
    {
        "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet",
        "Color": ["Default", "#494949", "#303030", "#FFFFFF"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the ankles; prevents unauthorized movement and can assist movement when needed",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs",
        "Color": ["#Default", "#4A4A4A", "#383838", "#FFFFFF"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the legs; prevents unauthorized movement and can assist movement when needed",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "FuturisticMittens", "AssetGroup": "ItemHands",
        "Color": ["#777777", "#6E6E6E", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 1 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the hands; prevents unauthorized movement and can assist movement when needed",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "FuturisticHeels2", "AssetGroup": "ItemBoots",
        "Color": ["#212121", "#4A4A4A", "#383838", "#3D3D3D", "#404040", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the feet; prevents unauthorized movement and can assist movement when needed",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "FuturisticCuffs", "AssetGroup": "ItemArms",
        "Color": ["#4F4F4F", "#353535", "#FFFFFF"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the arms; prevents unauthorized movement and can assist movement when needed",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },

    //16
    {
        "Item": "DroneMask", "AssetGroup": "ItemHood",
        "Color": ["#222222", "#CCCCCC", "#7F7F7F", "#00F4FD", "#E700CA"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal",
        "TypeRecord": { "m": 0, "e": 0, "p": 1, "g": 2, "s": 1, "h": 0, "j": 5, "b": 0 },
        "OverridePriority": {
            "EyeSmile": 0, "EyeSmileShine": 0, "Base": 12, "Shine": 12, "Barcode": 12, "Text": 12,
            "EyeSpiral": 0, "EyeSculpted": 0, "EyeRegular": 0, "EyeHoles": 0, "EyeRegularGlow": 0,
            "EyeSculptedGlow": 0, "EyeSmileGlow": 0, "EyeSpiralGlow": 0, "EyeConcaveShine": 0,
            "EyeRegularShine": 0, "EyeHolesShine": 0, "EyeSculptedShine": 0, "EyeSpiralShine": 0
        },
        "Name": "Drone individual-identification device",
        "Description": "Implanted on the face; disables the body's original facial identification and uses a barcode instead",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },

    // 17
    {
        "Item": "OTNPlugGag", "AssetGroup": "ItemMouth",
        "Color": ["#665D5D", "#514D57", "Default", "#979595"],
        "Lock": "HighSecurityPadlock", "Private": false,
        "ItemProperty": { "OverridePriority": { "Base": 0, "Straps": 0, "StrapsLong": 0 } },
        "Type": null, "Property": "Normal", "TypeRecord": { typed: 1 },
        "Name": "Drone digestive-system external interface",
        "Description": "Connected to the mouth and digestive system; allows Drone nutrition blocks and can be used sexually",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "InteractiveVisor", "AssetGroup": "ItemHead",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone visual-system external interface",
        "Description": "Connected to the face and visual system; receives system instructions directly and can block excess visual information",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "LatexRespirator", "AssetGroup": "ItemMouth2",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal",
        "TypeRecord": { "f": 2, "g": 1, "s": 0, "m": 2, "l": 1 },
        "Name": "Drone respiratory-system external interface",
        "Description": "Connected to the nasal cavity and respiratory system; limits breathing to medicated Drone gas and blocks mouth breathing",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "FuturisticEarphones", "AssetGroup": "ItemEars",
        "Color": ["#898989", "#2A2A2A", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal", "TypeRecord": { "typed": 0 },
        "Name": "Drone auditory-system external interface",
        "Description": "Connected to the ears and auditory system; continuously plays training courses and can block excess audio",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },

    // 21
    {
        "Item": "ShockCollar", "AssetGroup": "ItemNeck",
        "Color": ["Default", "Default"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal",
        "Name": "Drone punishment device",
        "Description": "Implanted at the neck; uses electric current to punish Drone errors",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    {
        "Item": "ElectronicTag", "AssetGroup": "ItemNeckAccessories",
        "Color": ["#595959", "Default", "#000000"],
        "Lock": "HighSecurityPadlock", "Private": false, "ItemProperty": {},
        "Type": null, "Property": "Normal",
        "Name": "Drone display",
        "Description": "Implanted at the neck; displays Drone output and shows remaining battery when idle",
        "MemberName": "Drone master-control core", "MemberNumber": 50051
    },
    // 23
    {
        "Item": "Antenna", "AssetGroup": "HairAccessory1",
        "TypeRecord": { "typed": 5 },
        "Color": [
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8",
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8"
        ],
    },
];

export var BasicDroneeyes = [
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 0 } }],
    [{
        "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 1 },
        "OverridePriority": { "Base": 12, "EyeRegularShine": 0, "Shine": 12, "Text": 12, "EyeRegular": 0 },
    }],
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 3 } }],
];
export var BasicDroneears = [
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 0 } }],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 1 } }],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 3 } }],
];
export var BasicDronemouth = [
    [{ "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 0 } }],
    [{ "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 1 } }],
    [{ "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 1 } }]
];
export var BasicDronebody = [
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 0 } }],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 2 } }],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 1 } }],
];
export var BasicDronehands = [
    [
        { "Item": "FuturisticCuffs", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 0 } },
        { "Item": "FuturisticMittens", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 1 } }
    ],
    [
        { "Item": "FuturisticCuffs", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 1 } },
        { "Item": "FuturisticMittens", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 0 } }
    ],
    [
        { "Item": "FuturisticCuffs", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 3 } },
        { "Item": "FuturisticMittens", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 0 } }
    ]
];
export var BasicDronelegs = [
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 0 } },
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 0 } }
    ],
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 2 } },
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 2 } }
    ],
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 1 } },
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 1 } }
    ],
];

export var BasicDroneSet = {
    Binds: BasicDroneBinds,
    eyes: BasicDroneeyes,
    ears: BasicDroneears,
    mouth: BasicDronemouth,
    body: BasicDronebody,
    hands: BasicDronehands,
    legs: BasicDronelegs,
};
export var AllEquipSets = {
    BasicDrone: BasicDroneSet,
};

export const shockItems = [
    { "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis" },
    { "Item": "ShockClamps", "AssetGroup": "ItemNipples" },
    { "Item": "ShockCollar", "AssetGroup": "ItemNeck" }
];
export const vibeItem = [
    { "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis" },
    { "Item": "FuturisticVibrator", "AssetGroup": "ItemVulva" },
    { "Item": "VibeHeartClitPiercing", "AssetGroup": "ItemVulvaPiercings" },
    { "Item": "LockingVibePlug", "AssetGroup": "ItemButt" },
    { "Item": "VibeHeartPiercings", "AssetGroup": "ItemNipplesPiercings" }
];

// ----- Wear/remove helpers -----
export function RemoveClothes(sender, refresh = true, removeUnderwear = true, removeCosplay = false) {
    CharacterNaked(sender);
    if (refresh == true) {
        CharacterLoadEffect(sender);
        ChatRoomCharacterUpdate(sender);
    }
}
// Remove all constraints
export function RemoveRestrains(sender, refresh = true) {
    RemoveRestrainsWithAssetGroup(sender, AssetGroup, refresh);
}
export function RemoveRestrainByOneAssetGroup(sender, assetGroup, refresh = true) {
    RemoveRestrainsWithAssetGroup(sender, [assetGroup], refresh);
}
export function RemoveRestrainsWithAssetGroup(sender, group, refresh = true) {
    if (sender == null) return;
    for (var ag of group) {
        if ((ag.Name ?? false) == false) {
            if (ag.startsWith("Item")) {
                InventoryRemove(sender, ag);
            }
        }
        else {
            if (ag.Name.startsWith("Item")) {
                InventoryRemove(sender, ag.Name);
            }
        }
    }
    if (refresh == true) {
        CharacterLoadEffect(sender);
        ChatRoomCharacterUpdate(sender);
    }
}
export function AllAssetGroupName() {
    let result = [];
    for (let obj of AssetGroup) {
        result.push(obj.Name);
    }
    return result;
}
export function GetAllInventory(sender) {
    for (let ag of AssetGroup) {
        if (ag.Name.startsWith("Item")) {
            let geted = InventoryGet(sender, ag.Name);
            if (geted ?? false) {
                console.log(geted);
                if ((geted.Property ?? false) && (geted.Property.TypeRecord ?? false)) {
                    console.log(geted.Property.TypeRecord);
                }
                console.log(geted.Asset.Name);
                console.log(ag.Name);
            }
        }
    }
}

export async function WearEquips(target, EquipList, refresh = true, craft = true, difficulty = 1000) {
    var sender = ChatRoomGetCharacter(target.MemberNumber);
    if (sender == undefined) return;
    var pushList = [];
    for (let i = 0; i < EquipList.length; i++) {
        let res = Object.assign({}, EquipList[i]);
        const ID = CharacterAppearanceGetCurrentValue(sender, res.AssetGroup, "ID");
        if (ID != "None") {
            sender.Appearance.splice(ID, 1);
        }
        let colors = [];
        if (res.Color != undefined) {
            if (Array.isArray(res.Color)) {
                colors = Object.assign([], res.Color);
            }
            else {
                colors = res.Color.replace(/\s*/g, "").split(",");
            }
        }
        else {
            colors = CharacterAppearanceGetCurrentValue(sender, res.AssetGroup, "Color");
        }
        const A = AssetGet(sender.AssetFamily, res.AssetGroup, res.Item);
        if (A != null) {
            let item = {
                Asset: A,
                Color: colors,
                Difficulty: difficulty,
            };
            ExtendedItemInit(sender, item, false, false);
            pushList.push(item);
        }
    }
    sender.Appearance.push(...pushList);
    if (craft) {
        for (let i of EquipList) {
            let res = Object.assign({}, i);
            let localAssetGroup = res["AssetGroup"];
            delete res.AssetGroup;
            if (Array.isArray(res.Color)) {
                var str = "";
                for (let c of res.Color) {
                    str += c;
                    str += ",";
                }
                res.Color = str;
            }
            InventoryCraft(sender, sender, localAssetGroup, res, false, true, false);
            await sleep(100);
        }
    }
    if (refresh) {
        CharacterLoadEffect(sender);
        ChatRoomCharacterUpdate(sender);
    }
}

export function RefreshPlayerEffect(sender = Player) {
    CharacterLoadEffect(sender);
    ChatRoomCharacterUpdate(sender);
}

// ----- Punishment / Vibe / Orgasm -----
export async function DoPunishment(power, count) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
    var pdi = PlayerDroneInfo();
    var itemsCanShock = [];
    for (var bind of shockItems) {
        var geted = InventoryGet(Player, bind.AssetGroup);
        if (geted == null || geted.Asset.Name == bind.Item) {
            geted.Property.ShockLevel = power;
            itemsCanShock.push(geted);
        }
    }
    if (itemsCanShock.length > 0) {
        SendMessageToSelf(`Executing punishment: ${power + 1} shock level ${count} times`);
        for (var i = 0; i < count; i++) {
            var index = Math.floor((Math.random() * itemsCanShock.length));
            PropertyShockPublishAction(Player, itemsCanShock[index]);
            sleep(300);
        }
        pdi.battery -= pdi.punishBatteryCost;
    }
    else {
        SendMessageToSelf(`No usable shock device found. Punishment failed!`);
    }
}

export async function DoVibe(power, skipCheck = false) {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false && !skipCheck) return;
    var itemsCanVibe = [];
    for (var bind of vibeItem) {
        var geted = InventoryGet(Player, bind.AssetGroup);
        var tr = Object.assign({}, geted.Property.TypeRecord);
        if (geted == null || geted.Asset.Name == bind.Item) {
            if (tr.vibrating != undefined) {
                tr.vibrating = power;
            }
            else if (tr.i != undefined) {
                tr.i = power;
            }
            itemsCanVibe.push(geted);
            ExtendedItemSetOptionByRecord(Player, geted, tr);
        }
    }
    if (itemsCanVibe.length > 0) {
        SendMessageToSelf(`Vibration device intensity set to ${power}`);
        RefreshPlayerEffect();
    }
    else {
        SendMessageToSelf(`No usable vibration device found. Vibe setting failed`);
    }
}
export async function DoOrgasm(showText = true) {
    if (showText) {
        SendMessageToSelf(`Executing forced orgasm`);
    }
    ActivityTimerProgress(Player, 10);
    ActivityOrgasmPrepare(Player);
}

export function DoSetBodyOrBindStatus(type, part, level, sender) {
    if (type == -1 || part == -1 || level == -1) return;
    var Drone = PlayerDroneInfo();
    if (Drone[typeStrings[type]] != undefined && Drone[typeStrings[type]][bodyPartStrings[part]] != undefined) {
        Drone[typeStrings[type]][bodyPartStrings[part]] = level;
        if (part == 3) {
            SendMessageToSelf(`${ArousalDisplayStrings[type]} was set by ${sender.Name} to ${[bindLevelStrings, bodyLevelStrings][0][level]}`);
            if (type == 1) {
                DoVibe(level * 2, true);
            }
        }
        else {
            SendMessageToSelf(`${bodyPartDisplayStrings[part] + typeDisplayStrings[type]} was set by ${sender.Name} to ${[bindLevelStrings, bodyLevelStrings][type][level]}`);
        }
        RefreshBinds(true);
    }
}

// ----- Battery -----
export function RefreshBatteryTag() {
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
    var pdi = PlayerDroneInfo();
    var tag = InventoryGet(Player, "ItemNeckAccessories");
    if (tag?.Property?.Text != undefined) {
        var percent = Math.floor((pdi.battery * 100 / pdi.batteryMax));
        tag.Property.Text = percent.toString();
        if (percent > 50) {
            tag.Color[0] = '#40812c';
        }
        else if (percent > 20) {
            tag.Color[0] = '#cccc33';
        }
        else {
            tag.Color[0] = '#cc3333';
        }
    }
}

export function HintBatteryHelp() {
    SendMessageToSelf("Battery low. You can ask nearby players for " + styleButton("help", SendBatteryHelp) + "Charging");
}
export function SendBatteryHelp() {
    SendDTSMsg(null, new MsgInfo("BatteryHelp", null));
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

// ----- Binds refresh -----
export async function RefreshBinds(canRefresh = false) {
    var nowDate = new Date();
    if (nowDate - lastRefreshBindsTime <= 1000) return;
    setLastRefreshBindsTime(nowDate);
    if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
    setIsRefreshBinding(true);
    try {
        var pdi = PlayerDroneInfo();
        var type = pdi.type;
        if (!type) var type = "BasicDrone";
        var refresh = false;
        var binds = Object.assign([], AllEquipSets[type].Binds);
        var toWear = [];
        if (!binds) var binds = Object.assign([], AllEquipSets["BasicDrone"].Binds);
        for (var bind of binds) {
            var geted = InventoryGet(Player, bind.AssetGroup);
            if (geted == null || geted.Asset.Name != bind.Item || geted.Craft == undefined) {
                toWear.push(bind);
                refresh = true;
            }
        }
        if (refresh) {
            WearEquips(Player, toWear, false);
        }
        for (var part of bodyPartStrings) {
            var settings = Object.assign({}, AllEquipSets[type][part]);
            if (!settings) continue;
            var level = pdi.bindStatus[part];
            var usingSeeting = Object.assign([], settings[level]);
            for (var bind of usingSeeting) {
                var geted = InventoryGet(Player, bind.AssetGroup);
                var tr = Object.assign({}, geted.Property.TypeRecord);
                for (var typed in bind.TypeRecord) {
                    tr[typed] = bind.TypeRecord[typed];
                }
                ExtendedItemSetOptionByRecord(Player, geted, tr);
                await sleep(100);
            }
        }
        if (refresh || canRefresh) {
            RefreshPlayerEffect();
        }
    }
    catch {
        // intentionally swallowed, matches original behavior
    }
    setIsRefreshBinding(false);
}

// ----- Settings persistence -----
export function DTSMigrateLegacySettings() {
    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
    if (Player.ExtensionSettings[DTS_SETTINGS_KEY]) return false;

    for (const legacyKey of DTS_LEGACY_SETTINGS_KEYS) {
        const legacySettings = Player.ExtensionSettings[legacyKey];
        if (!legacySettings) continue;

        Player.ExtensionSettings[DTS_SETTINGS_KEY] = DTSCloneSettings(legacySettings);
        ServerPlayerExtensionSettingsSync(DTS_SETTINGS_KEY);
        console.log(`DTS: migrated legacy settings from ${legacyKey}.`);
        return true;
    }
    return false;
}

export function DTSSyncSettings() {
    ServerPlayerExtensionSettingsSync(DTS_SETTINGS_KEY);
}

export class DroneInfo {
    constructor() {
        this.scriptVersion = Number(script_version.split(".").slice(0, 2).join("."));
        this.MemberNumber = Player.MemberNumber;
        this.isDrone = false;
        this.isOwner = false;
        this.level = 0;
        this.type = "BasicDrone";

        this.battery = 1000;
        this.batteryMax = 1000;

        this.moveBatteryCost = 1;
        this.chatBatteryCost = 50;
        this.miniteBatteryCost = 10;
        this.punishBatteryCost = 100;
        this.orgasmBatteryGet = 100;

        this.shockLevel = 1;
        this.shockCount = 3;

        this.coin = 0;
        this.ownerId = -1;

        // 0 = No restriction, 1 = Restricted, 2 = Disabled
        this.bodyStatus = { eyes: 0, ears: 0, mouth: 0, body: 0, hands: 0, legs: 0 };
        this.bodyStatusMax = { eyes: 0, ears: 0, mouth: 0, body: 0, hands: 0, legs: 0 };
        this.bindStatus = { eyes: 0, ears: 0, mouth: 0, body: 0, hands: 0, legs: 0 };
        this.disPlayTalk = false;

        this.facilityMapEntered = false;

        this.items = [];
        this.itemsMax = 3;

        this.missions = [];
        this.missionsMax = 3;

        this.modifys = new Map();

        this.lastLoginDate = 0;
        this.todaysMission = 0;
        this.todaysWork = 0;
        this.workMax = 30;

        this.sleepUntil = null;
    }
    FromPlayerSetting() {
        DTSMigrateLegacySettings();
        if (Player.ExtensionSettings[DTS_SETTINGS_KEY] != undefined) {
            return Player.ExtensionSettings[DTS_SETTINGS_KEY];
        }
        return new DroneInfo();
    }
    SaveToPlayerSetting() {
        Player.ExtensionSettings[DTS_SETTINGS_KEY] = this;
        DTSSyncSettings();
    }
}

export function addMissingProperties(target, source) {
    for (let key in source) {
        if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
}

export function PlayerDroneInfo() {
    DTSMigrateLegacySettings();
    if (!Player.ExtensionSettings[DTS_SETTINGS_KEY]) {
        Player.ExtensionSettings[DTS_SETTINGS_KEY] = new DroneInfo();
        DTSSyncSettings();
    }
    else if (!Number.isFinite(Number(Player.ExtensionSettings[DTS_SETTINGS_KEY].scriptVersion)) ||
        Number(Player.ExtensionSettings[DTS_SETTINGS_KEY].scriptVersion) < new DroneInfo().scriptVersion) {
        addMissingProperties(Player.ExtensionSettings[DTS_SETTINGS_KEY], new DroneInfo());
        setShowChangeLog(true);
        Player.ExtensionSettings[DTS_SETTINGS_KEY].scriptVersion = new DroneInfo().scriptVersion;
        DTSSyncSettings();
    }
    return Player.ExtensionSettings[DTS_SETTINGS_KEY];
}

export function CheckPlayerDroneInfoExistAndIsDrone() {
    var pdi = PlayerDroneInfo();
    if (pdi === undefined) return false;
    return pdi.isDrone;
}

// ----- Identity registration -----
export async function StartDrone() {
    var waitTime = 2000;
    var waitTimeShort = 1000;
    SendMessageToSelf(`Received body-to-Drone registration request. Starting Drone conversion sequence...`);
    await sleep(waitTime);
    SendMessageToSelf(`Starting upgrade-unit deployment...\n${styleProgressBar("Deploying", "Deployment complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, [Crate]);
    SendMessageToSelf(`Upgrade unit deployed! Body containment complete!`);
    await sleep(waitTime);
    SendMessageToSelf(`Starting solvent spray...\n${styleProgressBar("Spraying", "Spray complete", waitTime)}`);
    await sleep(waitTime);
    RemoveClothes(Player, false);
    var group = Object.assign([], AssetGroup);
    group = group.filter(item => item.Name !== "ItemDevices");
    RemoveRestrainsWithAssetGroup(Player, group);
    RefreshPlayerEffect();
    SendMessageToSelf(`Body clothing and restraints dissolved!`);
    await sleep(waitTime);
    SendMessageToSelf(`Applying new body restraint...\n${styleProgressBar("Restraining", "Restraint complete", waitTime)}`);
    await sleep(waitTime);
    ExtendedItemSetOptionByRecord(Player, InventoryGet(Player, Crate.AssetGroup), {
        "w": 1, "l": 3, "a": 3, "d": 0, "t": 0, "h": 0
    });
    await sleep(waitTime);
    SendMessageToSelf(`Body restraint complete!`);
    await sleep(waitTimeShort);
    SendMessageToSelf(`Starting latex coating...\n${styleProgressBar("Coating", "Coating complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(0, 2));
    SendMessageToSelf(`Latex coating complete!`);
    await sleep(waitTimeShort);
    SendMessageToSelf(`Starting main power supply installation...\n${styleProgressBar("Installing", "Installation failed", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`Main power supply installation failed! Estimated cause: Anxiety-induced body skeletal-muscle tremors and vaginal obstruction.`);
    await sleep(waitTime);
    SendMessageToSelf(`Starting posture-control device installation...\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(2, 4));
    SendMessageToSelf(`Posture-control device implanted in the body's shoulders, back, and abdomen. Installation complete!`);
    await sleep(waitTime);
    SendMessageToSelf(`Posture-control device started on external power, actively suppressing body skeletal-muscle tremors.\n${styleProgressBar("Starting", "Startup complete", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`Starting main power supply installation: Inserting installation tube into the vagina...`);
    ExtendedItemSetOptionByRecord(Player, InventoryGet(Player, Crate.AssetGroup), {
        "w": 1, "l": 3, "a": 3, "d": 1, "t": 0, "h": 0, "d1": 0
    });
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    SendMessageToSelf(`Vaginal dilation smooth! Inserting the main power installation tube further...`);
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    SendMessageToSelf(`Main power installation tube reached the cervix! Starting insertion of main power supply into the uterus...\n${styleProgressBar("Inserting", "Insertion complete", waitTime)}`);
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    SendMessageToSelf(`Main power supply inserted successfully! Starting battery-fluid injection...\n${styleProgressBar("Injecting", "Injection complete", waitTime)}`);
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    SendMessageToSelf(`Injection smooth! Main power supply expansion rate increasing normally...\n${styleProgressBar("Injecting", "Injection abnormal", waitTime)}`);
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    SendMessageToSelf(`Main power supply expansion obstruction detected. Estimated cause: It has expanded to fill the uterus...`);
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    SendMessageToSelf(`Increasing battery-fluid injection pressure! Main power supply expansion rate is slow...\n${styleProgressBar("Injecting", "Injection complete", waitTime)}`);
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    SendMessageToSelf(`Battery-fluid injection complete! Main power supply fully expanded! Sealing injection port and connecting power interface!`);
    await sleep(waitTime);
    ActivityTimerProgress(Player, 10);
    WearEquips(Player, BasicDroneBinds.slice(4, 5));
    ExtendedItemSetOptionByRecord(Player, InventoryGet(Player, Crate.AssetGroup), {
        "w": 1, "l": 3, "a": 3, "d": 0, "t": 0, "h": 0
    });
    SendMessageToSelf(`Main power installation tube withdrawn. Power interface expanded to fill the vagina. Main power installation complete. Starting orgasm-charging test...`);
    await sleep(waitTime);
    DoOrgasm();
    await sleep(waitTime * 3);
    SendMessageToSelf(`Main power supply charged successfully! Orgasm-charging test complete!`);

    await sleep(waitTime);
    SendMessageToSelf(`Starting internal-cycle control device installation...\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(5, 9));
    SendMessageToSelf(`Internal-cycle control device implanted in the body's nipples, clitoris, and anus. Installation complete!`);

    await sleep(waitTime);
    SendMessageToSelf(`Starting internal-cycle master control system and physiological monitor installation...\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(9, 11));
    SendMessageToSelf(`Master control system implanted in the lower abdomen! Physiological monitor implanted in the chest! Starting function test...`);
    await sleep(waitTime);
    DoVibe(2, true);
    SendMessageToSelf(`Internal-cycle control device started... Vibration function normal! Physiological monitor detected increased temperature and heart rate. Monitoring function normal!`);

    await sleep(waitTime);
    SendMessageToSelf(`Starting motion-control device installation...\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(11, 16));
    SendMessageToSelf(`Motion-control device implanted in the body's hands, arms, legs, ankles, and feet. Installation complete!`);

    await sleep(waitTime);
    SendMessageToSelf(`Starting individual-identification device installation...\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(16, 17));
    SendMessageToSelf(`Individual-identification device implanted in the face. Printing Drone ID on the device...`);

    await sleep(waitTime);
    SendMessageToSelf(`Abnormal body movement detected! Estimated cause: Panic from body hypoxia`);
    await sleep(waitTime);
    SendMessageToSelf(`Starting motion-control device to suppress abnormal body movement...\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);

    await sleep(waitTime);
    SendMessageToSelf(`Starting installation of visual, auditory, digestive, and respiratory external interfaces on the identification device.\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(17, 21));
    SendMessageToSelf(`External interface installation complete! Abnormal body movement eased.`);

    await sleep(waitTime);
    SendMessageToSelf(`Starting display and signal receiver installation...\n${styleProgressBar("Installing", "Installation complete", waitTime)}`);
    await sleep(waitTime);
    WearEquips(Player, BasicDroneBinds.slice(21, 24));
    SendMessageToSelf(`Display installation complete! Signal receiver installation complete!`);

    await sleep(waitTime);
    SendMessageToSelf(`All devices installed! Drone registration complete! Starting Drone education program...`);
    await sleep(waitTime);
    SendMessageToSelf(`@$@##$%$%$\n${styleProgressBar("@$@##", "$%$%$", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`#@#%$##$%%\n${styleProgressBar("#@#%", "##$%%", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`#@$%#@$%#@\n${styleProgressBar("#@$%#", "@$%#@", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`@#$$$%%%$$\n${styleProgressBar("@#$$$", "%%%$$", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`#$%%%$%$$@\n${styleProgressBar("#$%%%", "$%$$@", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`@@@#%$#@@%\n${styleProgressBar("@@@#%", "$#@@%", waitTime)}`);
    await sleep(waitTime);
    SendMessageToSelf(`Drone education program complete! Drone conversion sequence fully complete! Releasing Drone...`);
    InventoryRemove(Player, Crate.AssetGroup);
    RefreshPlayerEffect();

    PlayerDroneInfo().isDrone = true;
    SendDTSMsg(sender, new MsgInfo("HeartBeatPack", DTSHeartBeatPayload(false, PlayerDroneInfo().isDrone)));
}

export function SetToDrone(target, isUndo) {
    if (target.MemberNumber == Player.MemberNumber) {
        if (!isUndo) {
            StartDrone();
        }
    }
    else {
        SendDTSMsg(target, new MsgInfo("ReqOwnerRight", isUndo));
        SendMessageToSelf(`Command sent`);
    }
}

export function SetToDroneAccept(targetChar) {
    PlayerDroneInfo().ownerId = targetChar.MemberNumber;
    SendDTSMsg(targetChar, new MsgInfo("RespOwnerRight", false));
}

export function SetToOwner(target, isUndo) {
    if (target.MemberNumber == Player.MemberNumber) {
        PlayerDroneInfo().isOwner = !isUndo;
        SendMessageToSelf(`Operator status ${isUndo ? "revoked" : "registered"}!`);
    }
}

export function SetIdentityHint(target, isSetDrone, isUndo) {
    var pdi = PlayerDroneInfo();
    if (target.MemberNumber == Player.MemberNumber && isSetDrone && isUndo && pdi.isDrone) {
        SendMessageToSelf("Drones may not unregister their own identity. Executing punishment!");
        DoPunishment(2, 3);
        return;
    }
    if (pdi.ownerId != -1 && pdi.ownerId != target.MemberNumber) {
        SendMessageToSelf("Drones may not unregister their own identity. Executing punishment!");
        DoPunishment(2, 3);
        return;
    }
    if (target.MemberNumber == Player.MemberNumber) {
        if (isSetDrone && !isUndo && !target.isDrone) {
            SendMessageToSelf(`About to accept Drone conversion. Click: ${styleButton("Confirm", SetToDrone, target, isUndo)}`);
            return;
        }
        if (!isSetDrone && !isUndo && !target.isOwner) {
            SendMessageToSelf(`About to register as an Operator. Click: ${styleButton("Confirm", SetToOwner, target, isUndo)}`);
            return;
        }
        if (!isSetDrone && isUndo && target.isOwner) {
            SendMessageToSelf(`About to unregister Operator identity. Click: ${styleButton("Confirm", SetToOwner, target, isUndo)}`);
            return;
        }
    }
    else {
        if (target.ownerId == -1 || target.ownerId == Player.MemberNumber) {
            if (isSetDrone && !isUndo && target.isDrone) {
                SendMessageToSelf(`About to request control permission from them. Click: ${styleButton("Confirm", SetToDrone, target, isUndo)}`);
                return;
            }
            if (isSetDrone && isUndo && target.isDrone) {
                SendMessageToSelf(`About to clear control permission over them. Click: ${styleButton("Confirm", SetToDrone, target, isUndo)}`);
                return;
            }
        }
        else {
            SendMessageToSelf(`You do not have permission to operate this Drone. Please contact the Operator ${target.ownerId} to transfer operational permissions.`);
        }
    }
}

export function SetStatusHint(info, type, part) {
    var buttons = [];
    var textType = type;
    if (part == 3) {
        textType = 0;
    }
    var levelStrings = [bindLevelStrings, bodyLevelStrings];
    for (var i = 0; i < 3; i++) {
        buttons.push(styleButton(levelStrings[textType][i], SetStatusSend, info, type, part, i));
    }
    SendMessageToSelf("Set to " + buttons[0] + buttons[1] + buttons[2]);
}

export function SetStatusSend(info, type, part, level) {
    if ((type == 1 && info.bodyStatusMax[bodyPartStrings[part]] < level) && part != 3) {
        SendMessageToSelf("This Drone has not received the upgrade for that part and cannot be set to the specified state!");
        return;
    }
    SendDTSMsg(info, new MsgInfo("SetStatus", [type, part, level]));
    SendMessageToSelf("Set command sent");
}