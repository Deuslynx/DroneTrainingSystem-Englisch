// ----- items.js -----
// The carried-item catalog (ItemInfo) and the purchasable-item price list.

import { bodyPartDisplayStrings, bodyPartStrings, bodyPartAssetGroups } from "./constants.js";
import { SendActionText, SendMessageToSelf, styleProgressBar, IsInArea, MovePlayer, RandomPosOfArea } from "./utils.js";
import { 
    PlayerDroneInfo, DoSetBodyOrBindStatus, DoVibe, DoPunishment, 
    RemoveRestrainsWithAssetGroup, ResponseBatteryCharge 
} from "./drone.js";
// PrivateRoom is only read at call-time (inside PrivateRoomItemUse), never
// at module top-level, so this static circular import with rooms.js is safe.
import { PrivateRoom } from "./rooms.js";

export class ItemInfo {
    constructor(name) {
        this.name = name;
        this.id = Date.now() + Math.floor(Math.random() * 10000);
        this.text = "";
        this.canUse = () => { return true; };
        this.use = null;
        this.param = [];
    }
    static RemoveThis(item) {
        var pdi = PlayerDroneInfo();
        pdi.items = pdi.items.filter((i) => { return i.id != item.id; });
    }
    static StockRoomItem(index) {
        var item = new ItemInfo("StockRoom");
        item.index = index;
        item.text = `Cargo${String.fromCharCode(65 + Math.floor(index / 5))}${index % 5 + 1}`;

        return item;
    }
    static BatteryItem() {
        var item = new ItemInfo("BatteryItem");
        item.text = "Disposable power bank: restores 50% Drone battery. Use before battery is depleted!";
        item.use = "BatteryItemUse";
        return item;
    }
    static BatteryItemUse(item) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            SendActionText(`Drone${pdi.MemberNumber} connects the power bank's cable to the power port on its underside. Start charging...`);
            SendMessageToSelf(`${styleProgressBar("Charging", "Charging complete", 15000, () => {
                var pdi = PlayerDroneInfo();
                ResponseBatteryCharge(pdi.batteryMax / 2);
                SendMessageToSelf("Charging complete");
            })}`);
        }
        else {
            ResponseBatteryCharge(pdi.batteryMax / 2);
            SendMessageToSelf("The personal terminal does not need charging, but the power bank has been stored as backup energy.");
        }
        ItemInfo.RemoveThis(item);
    }
    static BindStatusDownItem() {
        var item = new ItemInfo("BindStatusDownItem");
        item.text = "Restraint easing chip: lowers one part's restraint level by 1";
        item.param = [
            { id: 0, name: bodyPartDisplayStrings[0] },
            { id: 1, name: bodyPartDisplayStrings[1] },
            { id: 2, name: bodyPartDisplayStrings[2] },
            { id: 4, name: bodyPartDisplayStrings[4] },
            { id: 5, name: bodyPartDisplayStrings[5] },
        ];
        item.use = "BindStatusDownItemUse";
        return item;
    }

    static BindStatusDownItemUse(item, part) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            SendActionText(`Drone${pdi.MemberNumber} used the restraint-loosening chip to scan the collar and the restraints on the ${bodyPartDisplayStrings[part]} loosened.`);
            DoSetBodyOrBindStatus(
                0,
                part,
                pdi.bindStatus[bodyPartStrings[part]] == 0 ? 0 : pdi.bindStatus[bodyPartStrings[part]] - 1,
                { Name: "Restraint easing chip" }
            );
        }
        else {
            SendActionText(`${Player.Name} used the Restraint-Loosening Chip on the restraints binding their body and the restraints on the ${bodyPartDisplayStrings[part]} loosened.`);
            RemoveRestrainsWithAssetGroup(Player, bodyPartAssetGroups[part]);
        }
        ItemInfo.RemoveThis(item);
    }
    static BindStatusUpItem() {
        var item = new ItemInfo("BindStatusUpItem");
        item.text = "Restraint tightening chip: raises one part's restraint level by 1";
        item.param = [
            { id: 0, name: bodyPartDisplayStrings[0] },
            { id: 1, name: bodyPartDisplayStrings[1] },
            { id: 2, name: bodyPartDisplayStrings[2] },
            { id: 4, name: bodyPartDisplayStrings[4] },
            { id: 5, name: bodyPartDisplayStrings[5] },
        ];
        item.use = "BindStatusUpItemUse";
        return item;
    }
    static BindStatusUpItemUse(item, part) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            SendActionText(`Drone${pdi.MemberNumber} used the restraint-tightening chip to scan the collar, and the restraints on the ${bodyPartDisplayStrings[part]} tightened.`);
            DoSetBodyOrBindStatus(
                0,
                part,
                pdi.bindStatus[bodyPartStrings[part]] == 2 ? 2 : pdi.bindStatus[bodyPartStrings[part]] + 1,
                { Name: "Restraint tightening chip" }
            );
        }
        else {
            pdi.coin += 5;
            SendActionText(`${Player.Name} used a Constriction Chip, but since it cannot be used on non-Drone targets, it was reclaimed for 5 Quota Points.`);
        }
        ItemInfo.RemoveThis(item);
    }
    static BodyStatusDownItem() {
        var item = new ItemInfo("BodyStatusDownItem");
        item.text = "Function restoration chip: lowers one part's function restriction by 1";
        item.param = [
            { id: 0, name: bodyPartDisplayStrings[0] },
            { id: 1, name: bodyPartDisplayStrings[1] },
            { id: 2, name: bodyPartDisplayStrings[2] },
            { id: 4, name: bodyPartDisplayStrings[4] },
            { id: 5, name: bodyPartDisplayStrings[5] },
        ];
        item.use = "BodyStatusDownItemUse";
        return item;
    }
    static BodyStatusDownItemUse(item, part) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            var pdi = PlayerDroneInfo();
            SendActionText(`Drone ${pdi.MemberNumber} scanned the collar with a function restoration chip, and the functionality of the ${bodyPartDisplayStrings[part]} was restored.`);
            DoSetBodyOrBindStatus(
                1,
                part,
                pdi.bodyStatus[bodyPartStrings[part]] == 0 ? 0 : pdi.bodyStatus[bodyPartStrings[part]] - 1,
                { Name: "Function restoration chip" }
            );
        }
        else {
            SendActionText(`${Player.Name} swiped the Function restoration chip over the restraints on their body, and the restraints on the ${bodyPartDisplayStrings[part]} loosened.`);
            RemoveRestrainsWithAssetGroup(Player, bodyPartAssetGroups[part]);
        }
        ItemInfo.RemoveThis(item);
    }
    static BodyStatusUpItem() {
        var item = new ItemInfo("BodyStatusUpItem");
        item.text = "Function restriction chip: raises one part's function restriction by 1";
        item.param = [
            { id: 0, name: bodyPartDisplayStrings[0] },
            { id: 1, name: bodyPartDisplayStrings[1] },
            { id: 2, name: bodyPartDisplayStrings[2] },
            { id: 4, name: bodyPartDisplayStrings[4] },
            { id: 5, name: bodyPartDisplayStrings[5] },
        ];
        item.use = "BodyStatusUpItemUse";
        return item;
    }
    static BodyStatusUpItemUse(item, part) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            var pdi = PlayerDroneInfo();
            if (pdi.bodyStatus[bodyPartStrings[part]] == 2 ? 2 : pdi.bodyStatus[bodyPartStrings[part]] + 1 > pdi.bodyStatusMax[bodyPartStrings[part]]) {
                pdi.coin += 5;
                SendActionText(`Drone${pdi.MemberNumber} used the Function restriction chip to scan the collar, but the ${bodyPartDisplayStrings[part]} did not accept the function restriction, so the chip was reclaimed for 5 Quota Points.`);
            }
            else {
                SendActionText(`Drone${pdi.MemberNumber} used the Function restriction chip to scan the collar, restricting the function of the ${bodyPartDisplayStrings[part]}.`);
                DoSetBodyOrBindStatus(
                    1,
                    part,
                    pdi.bindStatus[bodyPartStrings[part]] == 2 ? 2 : pdi.bindStatus[bodyPartStrings[part]] + 1,
                    { Name: "Function restriction chip" }
                );
            }
        }
        else {
            pdi.coin += 5;
            SendActionText(`${Player.Name} used a Function Restriction Chip, but since it cannot be used on non-Drone units, it was reclaimed for 5 Quota Points.`);
        }
        ItemInfo.RemoveThis(item);
    }
    static VibeItem() {
        var item = new ItemInfo("VibeItem");
        item.text = "Vibration controller: adjusts vibrator intensity";
        item.param = [
            { id: 0, name: "Off" },
            { id: 1, name: "Low" },
            { id: 2, name: "High" },
        ];
        item.use = "VibeItemUse";
        return item;
    }
    static VibeItemUse(item, level) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            var pdi = PlayerDroneInfo();
            SendActionText(`Drone${pdi.MemberNumber} used the vibration controller.`);
            DoSetBodyOrBindStatus(
                1,
                3,
                level,
                { Name: "Vibration controller" }
            );
        }
        else {
            DoVibe(level * 2, true);
            SendActionText(`${Player.Name} used the vibration controller.`);
        }
        ItemInfo.RemoveThis(item);
    }
    static OrgasmLimitItem() {
        var item = new ItemInfo("OrgasmLimitItem");
        item.text = "Orgasm limiter: adjusts orgasm restriction level";
        item.param = [
            { id: 0, name: "Off" },
            { id: 1, name: "Edging" },
            { id: 2, name: "Blocked" },
        ];
        item.use = "OrgasmLimitItemUse";
        return item;
    }
    static OrgasmLimitItemUse(item, level) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            var pdi = PlayerDroneInfo();
            SendActionText(`Drone${pdi.MemberNumber} used an orgasm limiter.`);
            DoSetBodyOrBindStatus(
                1,
                3,
                level,
                { Name: "Orgasm limiter" }
            );
        }
        else {
            pdi.coin += 5;
            SendActionText(`${Player.Name} used an Orgasm Limiter. But since it cannot be used on non-drones, it was reclaimed for 5 Quota Points.`);
        }
        ItemInfo.RemoveThis(item);
    }
    static DisplayTalkItem() {
        var item = new ItemInfo("DisplayTalkItem");
        item.text = "Display switch: toggles speaking through the display";
        item.param = [
            { id: 0, name: "Off" },
            { id: 1, name: "On" },
        ];
        item.use = "DisplayTalkItemUse";
        return item;
    }
    static DisplayTalkItemUse(item, level) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            var pdi = PlayerDroneInfo();
            SendActionText(`Drone${pdi.MemberNumber} used the Display switch`);
            pdi.disPlayTalk = level == 1;
        }
        else {
            pdi.coin += 5;
            SendActionText(`${Player.Name} used the Display Switch. But since it cannot be used on non-Drone targets, it was reclaimed for 5 Quota Points.`);
        }
        ItemInfo.RemoveThis(item);
    }
    static PrivateRoomItem() {
        var item = new ItemInfo("PrivateRoomItem");
        item.text = "Private-room keycard: teleports to a private room and can call a Drone there. Remember the Drone ID first";
        item.param = [
            { id: 0, name: "Room 1" },
            { id: 1, name: "Room 2" },
            { id: 2, name: "Room 3" },
        ];
        item.use = "PrivateRoomItemUse";
        return item;
    }
    static PrivateRoomItemUse(item, level) {
        var pdi = PlayerDroneInfo();
        if (pdi.isDrone) {
            SendMessageToSelf("Drones are not allowed to use this item! Executing punishment and confiscating item!");
            DoPunishment(2, 3);
            ItemInfo.RemoveThis(item);
            return;
        }
        for (var charater of ChatRoomCharacter) {
            if (IsInArea(charater.MapData.Pos, PrivateRoom.Areas[level])) {
                SendMessageToSelf("Room occupied... can not use!");
                return;
            }
        }
        MovePlayer(RandomPosOfArea(PrivateRoom.Areas[level]), true);
        ItemInfo.RemoveThis(item);
    }
}

export var allItem = [
    { item: "BatteryItem", price: 10 },
    { item: "BindStatusDownItem", price: 15 },
    { item: "BindStatusUpItem", price: 5 },
    { item: "BodyStatusDownItem", price: 15 },
    { item: "BodyStatusUpItem", price: 5 },
    { item: "VibeItem", price: 10 },
    { item: "OrgasmLimitItem", price: 10 },
    { item: "DisplayTalkItem", price: 5 },
    { item: "PrivateRoomItem", price: 5 },
];