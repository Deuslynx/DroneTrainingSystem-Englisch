// ----- drone.js -----
// Drone restraints and equipment definitions

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

//#region BasicDrone
export var BasicDroneBinds = [
    // 0
    {
        "Item": "LatexCatsuit",
        "AssetGroup": "Suit",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },
    {
        "Item": "LatexCatsuit",
        "AssetGroup": "SuitLower",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },
    // 2
    {
        "Item": "FuturisticHarness",
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    /*
    {
        "Item": "HighSecurityHarness",
        "AssetGroup": "ItemTorso2",
        "Color": ["#444444", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },*/
    {
        "Item": "FuturisticHarness",
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    //4
    {
        "Item": "FuturisticVibrator",
        "AssetGroup": "ItemVulva",
        "Color": ["#454545", "#555555", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone main power supply and power interface",
        "Description": "The Drone main power supply which supports basic activity. The external power interface can receive external charging or orgasm-based charging.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    // 5
    {
        "Item": "VibeHeartClitPiercing",
        "AssetGroup": "ItemVulvaPiercings",
        "Color": ["#595959", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the clitoris. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LockingVibePlug",
        "AssetGroup": "ItemButt",
        "Color": ["Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the anus. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "VibeHeartPiercings",
        "AssetGroup": "ItemNipplesPiercings",
        "Color": ["#6C6C6C", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the nipples. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ShockClamps",
        "AssetGroup": "ItemNipples",
        "Color": ["#Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone punishment device",
        "Description": "Implanted in the nipples. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    // 9
    {
        "Item": "SciFiPleasurePanties",
        "AssetGroup": "ItemPelvis",
        "Color": ["#454545", "#202020", "#878787", "#202020", "#878787", "#878787", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "c": 3, "i": 0, "o": 0, "s": 0 },
        "Name": "Drone internal-cycle control hub",
        "Description": "Implanted in the lower abdomen. Controls all internal-cycle devices and includes orgasm-function restriction.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticBra",
        "AssetGroup": "ItemBreast",
        "Color": ["#4A4A4A", "#FFFFFF", "#FFFFFF", "#4B4B4B", "#363636"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone physiological monitor",
        "Description": "Implanted in the chest. Monitors temperature, heart rate, and arousal for physiological regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    // 11
    {
        "Item": "FuturisticAnkleCuffs",
        "AssetGroup": "ItemFeet",
        "Color": ["Default", "#494949", "#303030", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the ankles. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticLegCuffs",
        "AssetGroup": "ItemLegs",
        "Color": ["#Default", "#4A4A4A", "#383838", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the legs. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticMittens",
        "AssetGroup": "ItemHands",
        "Color": ["#777777", "#6E6E6E", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 1 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the hands. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticHeels2",
        "AssetGroup": "ItemBoots",
        "Color": ["#212121", "#4A4A4A", "#383838", "#3D3D3D", "#404040", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the feet. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticCuffs",
        "AssetGroup": "ItemArms",
        "Color": ["#4F4F4F", "#353535", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the arms. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    //16
    {
        "Item": "DroneMask",
        "AssetGroup": "ItemHood",
        "Color": ["#222222", "#CCCCCC", "#7F7F7F", "#00F4FD", "#E700CA"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "m": 0, "e": 0, "p": 1, "g": 2, "s": 1, "h": 0, "j": 5, "b": 0 },
        "OverridePriority": {
            "EyeSmile": 0,
            "EyeSmileShine": 0,
            "Base": 12,
            "Shine": 12,
            "Barcode": 12,
            "Text": 12,
            "EyeSpiral": 0,
            "EyeSculpted": 0,
            "EyeRegular": 0,
            "EyeHoles": 0,
            "EyeRegularGlow": 0,
            "EyeSculptedGlow": 0,
            "EyeSmileGlow": 0,
            "EyeSpiralGlow": 0,
            "EyeConcaveShine": 0,
            "EyeRegularShine": 0,
            "EyeHolesShine": 0,
            "EyeSculptedShine": 0,
            "EyeSpiralShine": 0
        },
        "Name": "Drone individual-identification device",
        "Description": "Implanted on the face. Disables the body's original facial identification and uses a barcode instead.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    // 17
    {
        "Item": "OTNPlugGag",
        "AssetGroup": "ItemMouth",
        "Color": ["#665D5D", "#514D57", "Default", "#979595"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": { "OverridePriority": { "Base": 0, "Straps": 0, "StrapsLong": 0 } },
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 1 },
        "Name": "Drone digestive-system external interface",
        "Description": "Connected to the mouth and digestive system. Allows Drone nutrition blocks and can be used sexually.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "InteractiveVisor",
        "AssetGroup": "ItemHead",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone visual-system external interface",
        "Description": "Connected to the face and visual system. Receives system instructions directly and can block excess visual information.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LatexRespirator",
        "AssetGroup": "ItemMouth2",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "f": 2, "g": 1, "s": 0, "m": 2, "l": 1 },
        "Name": "Drone respiratory-system external interface",
        "Description": "Connected to the nasal cavity and respiratory system. Blocks mouth breathing, limits nasal breathing and induces medicated Drone gas.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticEarphones",
        "AssetGroup": "ItemEars",
        "Color": ["#898989", "#2A2A2A", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone auditory-system external interface",
        "Description": "Connected to the ears and auditory system. Continuously plays training loops and can block excess audio.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    // 21
    {
        "Item": "ShockCollar",
        "AssetGroup": "ItemNeck",
        "Color": ["Default", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone punishment device",
        "Description": "Implanted at the neck. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ElectronicTag",
        "AssetGroup": "ItemNeckAccessories",
        "Color": ["#595959", "Default", "#000000"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone display",
        "Description": "Implanted at the neck. Displays Drone output and shows remaining battery when idle.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    // 23
    {
        "Item": "Antenna", "AssetGroup": "HairAccessory1",
        "TypeRecord": { "typed": 5 },
        "Color": [
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8",
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8"
        ],
    }
];
var BasicDroneeyes = [
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 0 } }],
    [{
        "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 1 },
        "OverridePriority": { "Base": 12, "EyeRegularShine": 0, "Shine": 12, "Text": 12, "EyeRegular": 0 },
    }],
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 3 } }]
];
var BasicDroneears = [
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 0 } }],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 1 } }],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 3 } }]
];
var BasicDronemouth = [
    [{ "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 0 } }],
    [{ "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 1 } }],
    [{ "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 1 } }]
];
var BasicDronebody = [
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 0 } }],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 2 } }],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 1 } }],
];
var BasicDronehands = [
    [
        //{ "Item": "FuturisticCuffs", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 0 } },
        { 
            "Item": "FuturisticArmbinder", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 0 },
            "Color": ['#202020', '#555555', '#777777', 'Default', 'Default'],
        },
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
var BasicDronelegs = [
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
var BasicDroneSet = {
    Binds: BasicDroneBinds,
    eyes: BasicDroneeyes,
    ears: BasicDroneears,
    mouth: BasicDronemouth,
    body: BasicDronebody,
    hands: BasicDronehands,
    legs: BasicDronelegs,
};
//#endregion
// TODO: might need change manually-annotated array indices
//#region MaidDrone
var MaidDroneBinds = [
    { "AssetGroup": "Cloth",  "Item": "MaidDress4", "Color": ["Default", "Default", "Default", "Default", "Default", "Default",],},
    { "AssetGroup": "Hat",  "Item": "MaidLatexHairband", "Color": ["Default", "#202020",]},
    //0
    {
        "Item": "LatexCatsuit", 
        "AssetGroup": "Suit",
        "TypeRecord": { "typed": 0},
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },
    {
        "Item": "LatexCatsuit",
        "AssetGroup": "SuitLower",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },

    //2
    {
        "Item": "FuturisticHarness", 
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {   // TODO: is this supposed to be the same or a HighSecurityHarness?
        "Item": "FuturisticHarness",
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //4
    {
        "Item": "FuturisticVibrator",
        "AssetGroup": "ItemVulva",
        "Color": ["#454545", "#555555", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone main power supply and power interface",
        "Description": "The Drone main power supply which supports basic activity. The external power interface can receive external charging or orgasm-based charging.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //5
    {
        "Item": "VibeHeartClitPiercing",
        "AssetGroup": "ItemVulvaPiercings",
        "Color": ["#595959", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the clitoris. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LockingVibePlug",
        "AssetGroup": "ItemButt",
        "Color": ["Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the anus. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "VibeHeartPiercings",
        "AssetGroup": "ItemNipplesPiercings",
        "Color": ["#6C6C6C", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the nipples. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ShockClamps",
        "AssetGroup": "ItemNipples",
        "Color": ["#Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone punishment device",
        "Description": "Implanted in the nipples. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //9
    {
        "Item": "SciFiPleasurePanties",
        "AssetGroup": "ItemPelvis",
        "Color": ["#454545", "#202020", "#878787", "#202020", "#878787", "#878787", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "c": 3, "i": 0, "o": 0, "s": 0 },
        "Name": "Drone internal-cycle control hub",
        "Description": "Implanted in the lower abdomen. Controls all internal-cycle devices and includes orgasm-function restriction.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticBra",
        "AssetGroup": "ItemBreast",
        "Color": ["#4A4A4A", "#FFFFFF", "#FFFFFF", "#4B4B4B", "#363636"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone physiological monitor",
        "Description": "Implanted in the chest. Monitors temperature, heart rate, and arousal for physiological regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //11
    {
        "Item": "FuturisticAnkleCuffs",
        "AssetGroup": "ItemFeet",
        "Color": ["Default", "#494949", "#303030", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the ankles. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticLegCuffs",
        "AssetGroup": "ItemLegs",
        "Color": ["#Default", "#4A4A4A", "#383838", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the legs. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticMittens",
        "AssetGroup": "ItemHands",
        "Color": ["#777777", "#6E6E6E", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 1 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the hands. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticHeels2",
        "AssetGroup": "ItemBoots",
        "Color": ["#212121","#4A4A4A", "#383838", "#3D3D3D", "#404040", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the feet. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticCuffs",
        "AssetGroup": "ItemArms",
        "Color": ["#4F4F4F", "#353535", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the arms. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //16
    {
        "Item": "DroneMask",
        "AssetGroup": "ItemHood",
        "Color": ["#222222", "#CCCCCC", "#7F7F7F", "#00F4FD", "#E700CA"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "m": 0, "e": 0, "p": 1, "g": 2, "s": 1, "h": 0, "j": 5, "b": 0 },
        "OverridePriority": {
            "EyeSmile": 0,
            "EyeSmileShine": 0,
            "Base": 12,
            "Shine": 12,
            "Barcode": 12,
            "Text": 12,
            "EyeSpiral": 0,
            "EyeSculpted": 0,
            "EyeRegular": 0,
            "EyeHoles": 0,
            "EyeRegularGlow": 0,
            "EyeSculptedGlow": 0,
            "EyeSmileGlow": 0,
            "EyeSpiralGlow": 0,
            "EyeConcaveShine": 0,
            "EyeRegularShine": 0,
            "EyeHolesShine": 0,
            "EyeSculptedShine": 0,
            "EyeSpiralShine": 0
        },
        "Name": "Drone individual-identification device",
        "Description": "Implanted on the face. Disables the body's original facial identification and uses a barcode instead.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //17
    {
        "Item": "OTNPlugGag",
        "AssetGroup": "ItemMouth",
        "Color": ["#665D5D", "#514D57", "Default", "#979595"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": { "OverridePriority": { "Base": 0, "Straps": 0, "StrapsLong": 0 } },
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 1 },
        "Name": "Drone digestive-system external interface",
        "Description": "Connected to the mouth and digestive system. Allows Drone nutrition blocks and can be used sexually.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "InteractiveVisor",
        "AssetGroup": "ItemHead",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone visual-system external interface",
        "Description": "Connected to the face and visual system. Receives system instructions directly and can block excess visual information.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LatexRespirator",
        "AssetGroup": "ItemMouth2",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "f": 2, "g": 1, "s": 0, "m": 2, "l": 1 },
        "Name": "Drone respiratory-system external interface",
        "Description": "Connected to the nasal cavity and respiratory system. Blocks mouth breathing, limits nasal breathing and induces medicated Drone gas.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticEarphones",
        "AssetGroup": "ItemEars",
        "Color": ["#898989", "#2A2A2A", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone auditory-system external interface",
        "Description": "Connected to the ears and auditory system. Continuously plays training loops and can block excess audio.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //21
    {
        "Item": "ShockCollar",
        "AssetGroup": "ItemNeck",
        "Color": ["Default", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone punishment device",
        "Description": "Implanted at the neck. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ElectronicTag",
        "AssetGroup": "ItemNeckAccessories",
        "Color": ["#595959", "Default", "#000000"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone display",
        "Description": "Implanted at the neck. Displays Drone output and shows remaining battery when idle.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //23
    {
        "Item": "Antenna", "AssetGroup": "HairAccessory1", "TypeRecord": { "typed": 5 },
        "Color": [
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8",
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8"
        ],
    },
];
var MaidDroneeyes = [
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 0 } }],
    [{
        "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 1},
        "OverridePriority": { "Base": 12, "EyeRegularShine": 0, "Shine": 12, "Text": 12, "EyeRegular": 0 },
    }],
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 3 } }],
];
var MaidDroneears = [
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 0 } }],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 1 } }],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 3 } }],
];
var MaidDronemouth = [
    [
        {
            "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 0 },
            "ItemProperty": { "OverridePriority": { "Base": 0, "Straps": 0, "StrapsLong": 0 } },
        },
        { "Item": "UnEquip", "AssetGroup": "ItemMisc" },
        { "Item": "UnEquip", "AssetGroup": "ItemMouth3" }
    ],
    [
        {
            "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 1 },
            "ItemProperty": { "OverridePriority": { "Base": 0, "Straps": 0, "StrapsLong": 0 } },
        },
        {
            "Item": "ServingTray",
            "AssetGroup": "ItemMisc",
            "Color": ["Default", "Default",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "ItemProperty": {},
            "Type": null,
            "Property": "Normal",
            "TypeRecord": { "typed": 1 },
            "Name": "Drone work-assistive equipment",
            "Description": "This modular attachment for the Maid Drone assists in the distribution of supplies. For hygiene reasons, the external digestive system interface is deactivated when this equipment is installed.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
        { "Item": "UnEquip", "AssetGroup": "ItemMouth3", },
    ],
    [
        {
            "Item": "DusterGag",
            "AssetGroup": "ItemMouth",
            "Color": ["Default", "Default",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "ItemProperty": {},
            "Type": null,
            "Property": "Normal",
            "TypeRecord": { "typed": 0 },
            "Name": "Drone backup cleaning equipment",
            "Description": "The modular equipment of the Maid Drone enables it to continue cleaning operations normally even when its arms is unavailable.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
        { "Item": "UnEquip", "AssetGroup": "ItemMisc", },
        { "Item": "UnEquip", "AssetGroup": "ItemMouth3", },
    ]
];
var MaidDronebody = [
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 0, },}],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 2, },}],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 1, },}],
];
var MaidDronehands = [
    [
        { "Item": "FuturisticCuffs", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 0 },},
        { "Item": "FuturisticMittens", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 1 },},
        {
            "Item": "FeatherDuster",
            "AssetGroup": "ItemHandheld",
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "ItemProperty": {},
            "Type": null,
            "Property": "Normal",
            "Name": "Auxiliary Drone cleaning equipment",
            "Description": "Modular equipment for the Maid Drone, assisting them in cleaning operations.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        }
    ],
    [
        { "Item": "FuturisticCuffs", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 1 },},
        { "Item": "FuturisticMittens", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 0 },},
        { "Item": "UnEquip", "AssetGroup": "ItemHandheld",}
    ],
    [
        {
            "Item": "FuturisticArmbinder",
            "AssetGroup": "ItemArms",
            "Color": ['#202020', '#555555', '#777777', 'Default', 'Default'],
            "TypeRecord": { "typed": 0 },
        },
        { "Item": "FuturisticMittens", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 0 },},
        { "Item": "UnEquip", "AssetGroup": "ItemHandheld",}
    ]
];
var MaidDronelegs = [
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 0 },},
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 0 },}
    ],
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 2 },},
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 2 },},
        {
            "Item": "MonoHeel",
            "AssetGroup": "ItemBoots",
            "Color": ["#2c2c2c", "#666666", "#999999",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "ItemProperty": {},
            "Type": null,
            "Property": "Normal",
            "TypeRecord": { "typed": 0 },
            "Name": "Auxiliary Drone posture equipment",
            "Description": "Modular equipment for the Maid Drone enables them to perform tasks while maintaining a stationary, upright posture for extended periods.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
    ],
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 1 },},
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 1 },},
        {
            "Item": "MonoHeel",
            "AssetGroup": "ItemBoots",
            "Color": ["#2c2c2c", "#666666", "#999999",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "ItemProperty": {},
            "Type": null,
            "Property": "Normal",
            "TypeRecord": { "typed": 0 },
            "Name": "Auxiliary Drone posture equipment",
            "Description": "Modular equipment for the Maid Drone enables them to perform tasks while maintaining a stationary, upright posture for extended periods.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },

    ],
];
var MaidDroneSet = {
    Binds: MaidDroneBinds,
    eyes: MaidDroneeyes,
    ears: MaidDroneears,
    mouth: MaidDronemouth,
    body: MaidDronebody,
    hands: MaidDronehands,
    legs: MaidDronelegs,
};
//#endregion

//#region PonyDrone
var PonyDroneBinds = [
    { "AssetGroup": "TailStraps", "Item": "HorseTailStrap1", "Color": ["HairFront"],},
    //0
    {
        "Item": "LatexCatsuit",
        "AssetGroup": "Suit",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },
    {
        "Item": "LatexCatsuit",
        "AssetGroup": "SuitLower",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },

    //2
    {
        "Item": "FuturisticHarness",
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {   // TODO: is this supposed to be the same or a HighSecurityHarness?
        "Item": "FuturisticHarness",
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //4
    {
        "Item": "FuturisticVibrator",
        "AssetGroup": "ItemVulva",
        "Color": ["#454545", "#555555", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone main power supply and power interface",
        "Description": "The Drone main power supply which supports basic activity. The external power interface can receive external charging or orgasm-based charging.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //5
    {
        "Item": "VibeHeartClitPiercing",
        "AssetGroup": "ItemVulvaPiercings",
        "Color": ["#595959", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the clitoris. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LockingVibePlug",
        "AssetGroup": "ItemButt",
        "Color": ["Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the anus. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "VibeHeartPiercings",
        "AssetGroup": "ItemNipplesPiercings",
        "Color": ["#6C6C6C", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the nipples. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ShockClamps",
        "AssetGroup": "ItemNipples",
        "Color": ["#Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone punishment device",
        "Description": "Implanted in the nipples. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //9
    {
        "Item": "SciFiPleasurePanties",
        "AssetGroup": "ItemPelvis",
        "Color": ["#454545", "#202020", "#878787", "#202020", "#878787", "#878787", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "c": 3, "i": 0, "o": 0, "s": 0 },
        "Name": "Drone internal-cycle control hub",
        "Description": "Implanted in the lower abdomen. Controls all internal-cycle devices and includes orgasm-function restriction.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticBra",
        "AssetGroup": "ItemBreast",
        "Color": ["#4A4A4A", "#FFFFFF", "#FFFFFF", "#4B4B4B", "#363636"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone physiological monitor",
        "Description": "Implanted in the chest. Monitors temperature, heart rate, and arousal for physiological regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //11
    {
        "Item": "FuturisticAnkleCuffs",
        "AssetGroup": "ItemFeet",
        "Color": ["Default", "#494949", "#303030", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the ankles. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticLegCuffs",
        "AssetGroup": "ItemLegs",
        "Color": ["#Default", "#4A4A4A", "#383838", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the legs. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "PonyMittensBinder",
        "AssetGroup": "ItemHands",
        "Color": ["#212121", "Default", "#111111", "Default", "#9A862D", "#212121", "Default", "Default",],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Auxiliary Drone handling equipment",
        "Description": "Modular equipment for the Pony Drone enables efficient material handling operations.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "StrictPonyBoots",
        "AssetGroup": "ItemBoots",
        "Color": ["#0B0B0B", "#0B0B0B", "Default", "#bbbbbb", "#0B0B0B", "Default", "Default", "#000000",],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone movement assistance equipment",
        "Description": "Modular equipment for the Pony Drone enables efficient material handling and triggers a penalty if the drone remains stationary for a certain period.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticCuffs",
        "AssetGroup": "ItemArms",
        "Color": ["#4F4F4F", "#353535", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the arms. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //16
    {
        "Item": "DroneMask",
        "AssetGroup": "ItemHood",
        "Color": ["#222222", "#CCCCCC", "#7F7F7F", "#00F4FD", "#E700CA"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "m": 0, "e": 0, "p": 1, "g": 2, "s": 1, "h": 0, "j": 5, "b": 0 },
        "OverridePriority": {
            "EyeSmile": 0,
            "EyeSmileShine": 0,
            "Base": 12,
            "Shine": 12,
            "Barcode": 12,
            "Text": 12,
            "EyeSpiral": 0,
            "EyeSculpted": 0,
            "EyeRegular": 0,
            "EyeHoles": 0,
            "EyeRegularGlow": 0,
            "EyeSculptedGlow": 0,
            "EyeSmileGlow": 0,
            "EyeSpiralGlow": 0,
            "EyeConcaveShine": 0,
            "EyeRegularShine": 0,
            "EyeHolesShine": 0,
            "EyeSculptedShine": 0,
            "EyeSpiralShine": 0
        },
        "Name": "Drone individual-identification device",
        "Description": "Implanted on the face. Disables the body's original facial identification and uses a barcode instead.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //17
    {
        "Item": "ModularGag",
        "AssetGroup": "ItemMouth",
        "Color": ["Default", "Default", "#B0B0B0", "#212121", "#A00000", "Default", "Default", "Default", "#9A862D",],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "g": 0, "h": 0, "c": 1, "b": 0, "e": 1 },
        "Name": "Drone balance-enhancement device",
        "Description": "The modular equipment for the Pony Drone enhances the balance by utilizing a mounted artificial vestibular system.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "PonyGag",
        "AssetGroup": "ItemMouth3",
        "Color": ["Default", "Default", "#383838", "Default", "Default", "#B24031", "Default", "Default", "#B24031", "#EAEAEA", "Default", "#FF95DB", "#383838", "Default", "#383838", "#956B1C", "#8A7055", "#3F3F3F",],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "g": 2, "p": 1, "r": 0, "t": 0, "e": 1, "h": 0, "b": 1 },
        "Name": "Drone navigation-steering device",
        "Description": "Equipped with a navigation system, this device can steer the Pony Drone with high-precision optimization on its transport routes.", 
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "InteractiveVisor",
        "AssetGroup": "ItemHead",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone visual-system external interface",
        "Description": "Connected to the face and visual system. Receives system instructions directly and can block excess visual information.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LatexRespirator",
        "AssetGroup": "ItemMouth2",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "f": 2, "g": 1, "s": 0, "m": 2, "l": 1 },
        "Name": "Drone respiratory-system external interface",
        "Description": "Connected to the nasal cavity and respiratory system. Blocks mouth breathing, limits nasal breathing and induces medicated Drone gas.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticEarphones",
        "AssetGroup": "ItemEars",
        "Color": ["#898989", "#2A2A2A", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone auditory-system external interface",
        "Description": "Connected to the ears and auditory system. Continuously plays training loops and can block excess audio.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //21
    {
        "Item": "ShockCollar",
        "AssetGroup": "ItemNeck",
        "Color": ["Default", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone punishment device",
        "Description": "Implanted at the neck. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ElectronicTag",
        "AssetGroup": "ItemNeckAccessories",
        "Color": ["#595959", "Default", "#000000"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone display",
        "Description": "Implanted at the neck. Displays Drone output and shows remaining battery when idle.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //23
    {
        "Item": "Antenna",
        "AssetGroup": "HairAccessory1",
        "TypeRecord": { "typed": 5 },
        "Color": [
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8",
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8"
        ],
    },
];
var PonyDroneeyes = [
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 0 },},],
    [{ 
        "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 1 },
        "OverridePriority": { "Base": 12, "EyeRegularShine": 0, "Shine": 12, "Text": 12, "EyeRegular": 0 },
    },],
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 3 },},],
];
var PonyDroneears = [
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 0 },}],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 1 },}],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 3 },}],
];
var PonyDronemouth = [
    [{ "Item": "PonyGag", "AssetGroup": "ItemMouth3", "TypeRecord": { "g": 2, "p": 1, "r": 0, "t": 0, "e": 1, "h": 0, "b": 0 },},],
    [{ "Item": "PonyGag", "AssetGroup": "ItemMouth3", "TypeRecord": { "g": 2, "p": 1, "r": 0, "t": 0, "e": 1, "h": 0, "b": 1 },},],
    [{ "Item": "PonyGag", "AssetGroup": "ItemMouth3", "TypeRecord": { "g": 5, "p": 1, "r": 0, "t": 0, "e": 1, "h": 0, "b": 1 },},]
];
var PonyDronebody = [
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 0,},}],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 2,},}],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 1,},}],
];
var PonyDronehands = [
    [
        { "Item": "FuturisticCuffs", "AssetGroup": "ItemArms", "TypeRecord": { "typed": 0 },},
        { "Item": "PonyMittensBinder", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 0 },},
    ],
    [
        { "Item": "UnEquip", "AssetGroup": "ItemArms",},
        { "Item": "PonyMittensBinder", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 1 },}
    ],
    [
        { "Item": "FuturisticArmbinder", "AssetGroup": "ItemArms", "Color": ['#202020', '#555555', '#777777', 'Default', 'Default'], "TypeRecord": { "typed": 0 },},
        { "Item": "PonyMittensBinder", "AssetGroup": "ItemHands", "TypeRecord": { "typed": 0 },}
    ]
];
var PonyDronelegs = [
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 0 },},
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 0 },}
    ],
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 2 },},
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 2 },},
    ],
    [
        { "Item": "FuturisticAnkleCuffs", "AssetGroup": "ItemFeet", "TypeRecord": { "typed": 1 },},
        { "Item": "FuturisticLegCuffs", "AssetGroup": "ItemLegs", "TypeRecord": { "typed": 1 },},
    ],
];
var PonyDroneSet = {
    Binds: PonyDroneBinds,
    eyes: PonyDroneeyes,
    ears: PonyDroneears,
    mouth: PonyDronemouth,
    body: PonyDronebody,
    hands: PonyDronehands,
    legs: PonyDronelegs,

};
//#endregion

//#region PuppyDrone
var PuppyDroneBinds = [
    { "Item": "PuppyEars2", "AssetGroup": "HairAccessory2", "Color": ["HairFront"],},
    { "Item": "WolfTailStrap2", "AssetGroup": "TailStraps", "Color": ["HairFront"],},
    //0
    {
        "Item": "LatexCatsuit",
        "AssetGroup": "Suit",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },
    {
        "Item": "LatexCatsuit",
        "AssetGroup": "SuitLower",
        "TypeRecord": { "typed": 0 },
        "Color": ["#202020", "Default", "Default", "Default"],
        "Text": "", "Text2": "", "Text3": ""
    },

    //2
    {
        "Item": "FuturisticHarness",
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {   // TODO: is this supposed to be the same or a HighSecurityHarness?
        "Item": "FuturisticHarness",
        "AssetGroup": "ItemTorso",
        "Color": ["#666666", "#7A7A7A", "#393939", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone posture-control device",
        "Description": "Implanted into the body's shoulders, back, and abdomen. High-torque servos control Drone posture to prevent movement errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //4
    {
        "Item": "FuturisticVibrator",
        "AssetGroup": "ItemVulva",
        "Color": ["#454545", "#555555", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone main power supply and power interface",
        "Description": "The Drone main power supply which supports basic activity. The external power interface can receive external charging or orgasm-based charging.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //5
    {
        "Item": "VibeHeartClitPiercing",
        "AssetGroup": "ItemVulvaPiercings",
        "Color": ["#595959", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the clitoris. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LockingVibePlug",
        "AssetGroup": "ItemButt",
        "Color": ["Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the anus. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "VibeHeartPiercings",
        "AssetGroup": "ItemNipplesPiercings",
        "Color": ["#6C6C6C", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "vibrating": 0 },
        "Name": "Drone internal-cycle control device",
        "Description": "Implanted in the nipples. Uses physical vibration to induce arousal for hormone regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ShockClamps",
        "AssetGroup": "ItemNipples",
        "Color": ["#Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone punishment device",
        "Description": "Implanted in the nipples. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //9
    {
        "Item": "SciFiPleasurePanties",
        "AssetGroup": "ItemPelvis",
        "Color": ["#454545", "#202020", "#878787", "#202020", "#878787", "#878787", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "c": 3, "i": 0, "o": 0, "s": 0 },
        "Name": "Drone internal-cycle control hub",
        "Description": "Implanted in the lower abdomen. Controls all internal-cycle devices and includes orgasm-function restriction.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticBra",
        "AssetGroup": "ItemBreast",
        "Color": ["#4A4A4A", "#FFFFFF", "#FFFFFF", "#4B4B4B", "#363636"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone physiological monitor",
        "Description": "Implanted in the chest. Monitors temperature, heart rate, and arousal for physiological regulation.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //11
    {
        "Item": "FuturisticAnkleCuffs",
        "AssetGroup": "ItemFeet",
        "Color": ["Default", "#494949", "#303030", "#FFFFFF"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 2 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the ankles. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "PawPaddedPetsuitLegs",
        "AssetGroup": "ItemLegs",
        "Color": ["#181818", "Default", "#131313", "#F40000", "#252525", "#323232", "#760000", "Default", "Default",],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 0 },
        "Name": "Auxiliary Drone patrol equipment",
        "Description": "Modular equipment for the Puppy Drone, assisting them in conducting patrols within the facility.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticMittens",
        "AssetGroup": "ItemHands",
        "Color": ["#777777", "#6E6E6E", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 1 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the hands. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticHeels2",
        "AssetGroup": "ItemBoots",
        "Color": ["#212121", "#4A4A4A", "#383838", "#3D3D3D", "#404040", "#3D3D3D", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone motion-control device",
        "Description": "Connected to the feet. Prevents unauthorized movement and can assist movement when needed.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "PawPaddedPetsuitArms",
        "AssetGroup": "ItemArms",
        "Color": ["#161616", "#EDEDED", "#242424", "#960000", "#370000", "#890000", "#2F2F2F", "Default", "Default",],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Auxiliary Drone patrol equipment",
        "Description": "Modular equipment for the Puppy Drone, assisting them in conducting patrols within the facility.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //16
    {
        "Item": "DroneMask",
        "AssetGroup": "ItemHood",
        "Color": ["#222222", "#CCCCCC", "#7F7F7F", "#00F4FD", "#E700CA"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "m": 0, "e": 0, "p": 1, "g": 2, "s": 1, "h": 0, "j": 5, "b": 0 },
        "OverridePriority": {
            "EyeSmile": 0,
            "EyeSmileShine": 0,
            "Base": 12,
            "Shine": 12,
            "Barcode": 12,
            "Text": 12,
            "EyeSpiral": 0,
            "EyeSculpted": 0,
            "EyeRegular": 0,
            "EyeHoles": 0,
            "EyeRegularGlow": 0,
            "EyeSculptedGlow": 0,
            "EyeSmileGlow": 0,
            "EyeSpiralGlow": 0,
            "EyeConcaveShine": 0,
            "EyeRegularShine": 0,
            "EyeHolesShine": 0,
            "EyeSculptedShine": 0,
            "EyeSpiralShine": 0
        },
        "Name": "Drone individual-identification device",
        "Description": "Implanted on the face. Disables the body's original facial identification and uses a barcode instead.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //17
    {
        "Item": "OTNPlugGag",
        "AssetGroup": "ItemMouth",
        "Color": ["#665D5D", "#514D57", "Default", "#979595"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": { "OverridePriority": { "Base": 0, "Straps": 0, "StrapsLong": 0 } },
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { typed: 1 },
        "Name": "Drone digestive-system external interface",
        "Description": "Connected to the mouth and digestive system. Allows Drone nutrition blocks and can be used sexually.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "InteractiveVisor",
        "AssetGroup": "ItemHead",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone visual-system external interface",
        "Description": "Connected to the face and visual system. Receives system instructions directly and can block excess visual information.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "LatexRespirator",
        "AssetGroup": "ItemMouth2",
        "Color": ["#333333", "#222222", "#CCCCCC", "#222222", "#CCCCCC", "#FF5AC8"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "f": 2, "g": 1, "s": 0, "m": 2, "l": 1 },
        "Name": "Drone respiratory-system external interface",
        "Description": "Connected to the nasal cavity and respiratory system. Blocks mouth breathing, limits nasal breathing and induces medicated Drone gas.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "FuturisticEarphones",
        "AssetGroup": "ItemEars",
        "Color": ["#898989", "#2A2A2A", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "TypeRecord": { "typed": 0 },
        "Name": "Drone auditory-system external interface",
        "Description": "Connected to the ears and auditory system. Continuously plays training loops and can block excess audio.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //21
    {
        "Item": "ShockCollar",
        "AssetGroup": "ItemNeck",
        "Color": ["Default", "Default"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone punishment device",
        "Description": "Implanted at the neck. Uses electric current to punish Drone errors.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },
    {
        "Item": "ElectronicTag",
        "AssetGroup": "ItemNeckAccessories",
        "Color": ["#595959", "Default", "#000000"],
        "Lock": "HighSecurityPadlock",
        "Private": false,
        "ItemProperty": {},
        "Type": null,
        "Property": "Normal",
        "Name": "Drone display",
        "Description": "Implanted at the neck. Displays Drone output and shows remaining battery when idle.",
        "MemberName": "Drone master-control core",
        "MemberNumber": 50051
    },

    //23
    {
        "Item": "Antenna",
        "AssetGroup": "HairAccessory1",
        "TypeRecord": { "typed": 5 },
        "Color": [
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8",
            "#8F8F8F", "#000000", "#131313", "#FF5AC8", "#FF5AC8"
        ],
    },
];
var PuppyDroneeyes = [
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 0 },},],
    [{
        "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 1 },
        "OverridePriority": { "Base": 12, "EyeRegularShine": 0, "Shine": 12, "Text": 12, "EyeRegular": 0 },
    },],
    [{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 3 },},],
];
var PuppyDroneears = [
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 0 },}],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 1 },}],
    [{ "Item": "FuturisticEarphones", "AssetGroup": "ItemEars", "TypeRecord": { "typed": 3 },}],
];
var PuppyDronemouth = [
    [
        { "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 0 },},
        { "Item": "UnEquip", "AssetGroup": "ItemMouth3",},
    ],
    [
        { "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 1 },},
        { "Item": "UnEquip", "AssetGroup": "ItemMouth3",},
    ],
    [
        { "Item": "OTNPlugGag", "AssetGroup": "ItemMouth", "TypeRecord": { typed: 1 },},
        {
            "Item": "CageMuzzle",
            "AssetGroup": "ItemMouth3",
            "Color": ["Default", "Default",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "Type": null,
            "Property": "Normal",
            "Name": "Drone muzzle-suppressor device",
            "Description": "The modular equipment of the Puppy Drone helps prevent incidents such as accidental attacks or ingestion.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
    ]
]
var PuppyDronebody = [
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 0,},}],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 2,},}],
    [{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 1,},}],
];
var PuppyDronehands = [ // TODO: check if this is really correct
    [{ "Item": "UnEquip", "AssetGroup": "ItemAddon",},],
    [
        {   
            "Item": "CeilingNeckCuff",
            "AssetGroup": "ItemAddon",
            "Color": ["#757575", "#877C66",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "Type": null,
            "Property": "Normal",
            "Name": "Drone movement-limiting equipment",
            "Description": "Modular equipment for the Puppy Drone. Limits its movement and prevents loosing sight of it.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
    ],
    [
        {
            "Item": "CeilingNeckCuff",
            "AssetGroup": "ItemAddon",
            "Color": ["#757575", "#877C66",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "Type": null,
            "Property": "Normal",
            "Name": "Drone movement-limiting equipment",
            "Description": "Modular equipment for the Puppy Drone. Limits its movement and prevents loosing sight of it.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
    ]
];
var PuppyDronelegs = [  // TODO: check if this is really correct
    [{ "Item": "UnEquip", "AssetGroup": "ItemNeckRestraints",},],
    [
        {
            "Item": "Post",
            "AssetGroup": "ItemNeckRestraints",
            "Color": ["Default", "Default", "Default", "Default",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "Type": null,
            "Property": "Normal",
            "Name": "Drone movement-limiting equipment",
            "Description": "Modular equipment for the Puppy Drone. Limits its movement and prevents loosing sight of it.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
    ],
    [
        {
            "Item": "Post",
            "AssetGroup": "ItemNeckRestraints",
            "Color": ["Default", "Default", "Default", "Default",],
            "Lock": "HighSecurityPadlock",
            "Private": false,
            "Type": null,
            "Property": "Normal",
            "Name": "Drone movement-limiting equipment",
            "Description": "Modular equipment for the Puppy Drone. Limits its movement and prevents loosing sight of it.",
            "MemberName": "Drone master-control core",
            "MemberNumber": 50051
        },
    ]
];
var PuppyDroneSet = {
    Binds: PuppyDroneBinds,
    eyes: PuppyDroneeyes,
    ears: PuppyDroneears,
    mouth: PuppyDronemouth,
    body: PuppyDronebody,
    hands: PuppyDronehands,
    legs: PuppyDronelegs,
};
//#endregion
/*
//#region KittyDrone
var KittyDroneBinds = [];
var KittyDroneeyes = [];
var KittyDroneears = [];
var KittyDronemouth = [];
var KittyDronebody = [];
var KittyDronehands = [];
var KittyDronelegs = [];
var KittyDroneSet = {
    Binds: KittyDroneBinds,
    eyes: KittyDroneeyes,
    ears: KittyDroneears,
    mouth: KittyDronemouth,
    body: KittyDronebody,
    hands: KittyDronehands,
    legs: KittyDronelegs,
};
//#endregion
*/
/*
//#region AngelDrone
var AngelDroneBinds = [];
var AngelDroneeyes = [];
var AngelDroneears = [];
var AngelDronemouth = [];
var AngelDronebody = [];
var AngelDronehands = [];
var AngelDronelegs = [];
var AngelDroneSet = {
    Binds: AngelDroneBinds,
    eyes: AngelDroneeyes,
    ears: AngelDroneears,
    mouth: AngelDronemouth,
    body: AngelDronebody,
    hands: AngelDronehands,
    legs: AngelDronelegs,
};
//#endregion
*/

export var AllEquipSets = {
    BasicDrone: BasicDroneSet,
    MaidDrone: MaidDroneSet,
    PonyDrone: PonyDroneSet,
    PuppyDrone: PuppyDroneSet,
    //KittyDrone: KittyDroneSet,
    //AngelDrone: AngelDroneSet,
};
