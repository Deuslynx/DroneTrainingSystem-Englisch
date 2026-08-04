// ----- constants.js -----
// Storage keys, loader flags, static display strings and the changelog text.

export const script_version = "1.7.20260804";

export const DTS_SETTINGS_KEY = "DTSbyDeusLynx";
export const DTS_LEGACY_SETTINGS_KEYS = ["DTSbyZajucd"];
export const DTS_LOADER_FLAG = "DTSbyDeusLynx";
export const DTS_LEGACY_LOADER_FLAG = "DTSbyZajucd";

export const changeLog =
    `Update Log
——————V1.7—————— latest Zajucd adjustments
1. Fixed an issue where the Operator's battery power was also being consumed.
2. Added text variations for the Display screen messages to make them feel more interactive and robotic.
3. Added several new drone models. Models can be swapped at the Modification Workshop after reaching Level 2.
4. Added cooldown (7d) for model changes; Added standstill punishment for PonyDrone
5. Fixed error when entering non map rooms.
——————V1.6—————— DeusLynx extension starting here
1. Translated everything into English for better development.
2. Fixed LSCG and Version compatibility.
3. Changed some spelling and messages.
4. Added Train and Education Mission.
——————V1.5—————— zajucd's version until this point
... Base Game developed by zajucd
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
