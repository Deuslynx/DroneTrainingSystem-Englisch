// ----- constants.js -----
// Storage keys, loader flags, static display strings and the changelog text.

export const script_version = "1.6.20260722";

export const DTS_SETTINGS_KEY = "DTSbyDeusLynx";
export const DTS_LEGACY_SETTINGS_KEYS = ["DTSbyZajucd"];
export const DTS_LOADER_FLAG = "DTSbyDeusLynx";
export const DTS_LEGACY_LOADER_FLAG = "DTSbyZajucd";

export const changeLog =
    `Update Log
——————V1.6—————— DeusLynx extension starting here
1. Translated everything into English for better development - does only work in englisch DTS rooms now.
2. Fixed LSCG compatibility.
——————V1.5—————— All from zajucd until this point
1. Fixed an issue where the Operator could not interact with objects in the warehouse area.
2. Added a Drone standby area on the southeast side of the facility.
3. Fixed an issue where the buyback price of certain items exceeded their selling price.
——————V1.4——————
1. Fixed an issue where a failed orgasm attempt was incorrectly registered as a successful orgasm.
2. Added a "Call for Rescue" function to escape situations where the player might get stuck (e.g., due to disconnection).
——————V1.3——————
1. Fixed an issue where certain items were not consumed after use.
——————V1.2——————
1. Fixed an issue preventing the completion of basic training.
2. Added missing text for the "spanking" and "head-patting" tasks.
3. Added bonus effects granted upon completing basic and advanced education.
4. Silently adjusted the battery charge gained when nearby players reach orgasm (does not affect charge gained during one's own orgasm).
5. Added a modification option to reduce the frequency of messages displayed on the screen.
——————V1.1——————
1. Fixed text errors occurring when punishments were triggered.
2. Fixed an issue where the daily reward cap for processing debris was missing.
3. Refined some text related to training and education.
4. Added a display for available programs in the Drone status info, showing effects gained from education and training.
5. Fixed logic errors regarding gaining control, manually charging the Drone, and initiating training.
——————V1.0——————
1. Added quest and item systems.
2. Added a training facility map.
——————V0.2——————
1. Added voice command functionality to facilitate player interaction without plugins.
2. Added the registration process for becoming a Drone.
3. Fixed several bugs.
4. The item layering for the smooth latex mask would reset whenever item settings were modified.
——————V0.1——————
1. Completed core functionality
`;

// ----- Drone Settings -----
export const bindLevelStrings = ["Off", "On", "Maximum"];
export const bodyLevelStrings = ["Available", "Restricted", "Offline"];
export const levelStrings = [bindLevelStrings, bodyLevelStrings];
export const typeStrings = ["bindStatus", "bodyStatus"];
export const typeDisplayStrings = ["Restraint", "Function"];
export const bodyPartStrings = ["eyes", "ears", "mouth", "body", "hands", "legs"];
export const bodyPartDisplayStrings = ["Eyes", "Ears", "Mouth", "Body", "Hands", "Legs"];
export const bodyPartAssetGroups = [
    ["ItemHead", "ItemHood"],
    ["ItemEars", "ItemHood"],
    ["ItemMouth", "ItemMouth2", "ItemMouth3"],
    ["ItemVulva", "ItemVulvaPiercings", "ItemButt", "ItemPelvis", "ItemNipples", "ItemNipplesPiercings", "ItemBreast"],
    ["ItemArms", "ItemHands"],
    ["ItemBoots", "ItemFeet", "ItemLegs"],
];
export const ArousalDisplayStrings = ["Orgasm limit", "Pleasure device"];
export const vibeModeStrings = {
    "-1": "Off",
    "0": "Low",
    "1": "Medium",
    "2": "High",
    "3": "Maximum",
};

export const missionLists = [
    ["StockRoomMission", "OrgasmMission", "SpankMission", "PetHeadMission", "ChargeMission"],
    ["StockRoomMission", "OwnerSpankMission", "OwnerPetHeadMission"],
];