// #region constants.js
// ==UserScript==
// @name DroneTrainingSystem English (LSCG + Legacy Compatible)
// @namespace local
// @version 1.6.20260722-lscg
// @description English DroneTrainingSystem with LSCG ModSDK hooks and legacy DTS migration. No remote loader.
// @author Original from zajucd; Further developed by DeusLynx (full English version)
// @license MIT
// @include /^https:\/\/(www\.)?bondageprojects\.elementfx\.com\/R\d+\/(BondageClub|\d+)\/(\d+\.html)?$/
// @include /^https:\/\/(www\.)?bondage-europe\.com\/R\d+\/(BondageClub|\d+)\/(\d+\.html)?$/
// @include /^https:\/\/(www\.)?bondageprojects\.com\/R\d+\/$/
// @grant none
// @run-at document-end
// ==/UserScript==

(() => {
	var __defProp = Object.defineProperty;
	var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
	var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

	// src/constants.js
	var script_version = "1.6.20260722";
	var DTS_SETTINGS_KEY = "DTSbyDeusLynx";
	var DTS_LEGACY_SETTINGS_KEYS = ["DTSbyZajucd"];
	var DTS_LOADER_FLAG = "DTSbyDeusLynx";
	var DTS_LEGACY_LOADER_FLAG = "DTSbyZajucd";
	var changeLog = `Update Log
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
	var bindLevelStrings = ["Off", "On", "Maximum"];
	var bodyLevelStrings = ["Available", "Restricted", "Offline"];
	var typeStrings = ["bindStatus", "bodyStatus"];
	var typeDisplayStrings = ["Restraint", "Function"];
	var bodyPartStrings = ["eyes", "ears", "mouth", "body", "hands", "legs"];
	var bodyPartDisplayStrings = ["Eyes", "Ears", "Mouth", "Body", "Hands", "Legs"];
	var bodyPartAssetGroups = [
		["ItemHead", "ItemHood"],
		["ItemEars", "ItemHood"],
		["ItemMouth", "ItemMouth2", "ItemMouth3"],
		["ItemVulva", "ItemVulvaPiercings", "ItemButt", "ItemPelvis", "ItemNipples", "ItemNipplesPiercings", "ItemBreast"],
		["ItemArms", "ItemHands"],
		["ItemBoots", "ItemFeet", "ItemLegs"]
	];
	var ArousalDisplayStrings = ["Orgasm limit", "Pleasure device"];
// #endregion
// #region state.js

	// src/state.js
	var timeEventInterval = -1;
	function setTimeEventInterval(v) {
		timeEventInterval = v;
	}
	var charaterInstalledScript_isDrone = /* @__PURE__ */ new Map();
	function resetCharaterInstalledScript() {
		charaterInstalledScript_isDrone = /* @__PURE__ */ new Map();
	}
	var showedEnterHelp = false;
	function setShowedEnterHelp(v) {
		showedEnterHelp = v;
	}
	var showChangeLog = false;
	function setShowChangeLog(v) {
		showChangeLog = v;
	}
	var initComplete = false;
	function setInitComplete(v) {
		initComplete = v;
	}
	var isRefreshBinding = false;
	function setIsRefreshBinding(v) {
		isRefreshBinding = v;
	}
	var lastRefreshBindsTime = /* @__PURE__ */ new Date();
	function setLastRefreshBindsTime(v) {
		lastRefreshBindsTime = v;
	}
	var trainingProcess = 0;
	function setTrainingProcess(v) {
		trainingProcess = v;
	}
	function addTrainingProcess(v = 1) {
		trainingProcess += v;
	}
	var isTraining = false;
	function setIsTraining(v) {
		isTraining = v;
	}
	var isEducationing = false;
	function setIsEducationing(v) {
		isEducationing = v;
	}
	var pverPos = null;
	function setPverPos(v) {
		pverPos = v;
	}
// #endregion
// #region rooms.js

	// src/rooms.js
	var MissionInfo = class _MissionInfo {
		constructor(name, text, reward) {
			this.name = name;
			this.text = text;
			this.desc = "";
			this.reward = reward;
			this.id = Date.now() + Math.floor(Math.random() * 1e4);
			this.complete = null;
		}
		static ProgressAdd(name) {
			var pdi = PlayerDroneInfo();
			for (var mission of pdi.missions) {
				if (mission.name == name) {
					mission.progress += 1;
					if (mission.progress >= mission.target) {
						_MissionInfo.MissionComplete(mission);
					}
				}
			}
		}
		static MissionComplete(mission, ...parmas) {
			var pdi = PlayerDroneInfo();
			SendMessageToSelf(`Mission: ${mission.text} complete, reward ${mission.reward} quota points`);
			pdi.coin += mission.reward;
			if (mission.complete != null) {
				_MissionInfo[mission.complete](mission, ...parmas);
			}
			pdi.missions = pdi.missions.filter((mi) => mission.id != mi.id);
		}
		static StockRoomMission() {
			var from = Math.floor(Math.random() * 60);
			var to = Math.floor(Math.random() * 60);
			var mission = new _MissionInfo("StockRoom", "Transport cargo", 10);
			mission.from = from;
			mission.to = to;
			mission.complete = "StockRoomMissionComplete";
			mission.desc = `Transport the goods from ${String.fromCharCode(65 + Math.floor(from / 5))}${from % 5 + 1} to ${String.fromCharCode(65 + Math.floor(to / 5))}${to % 5 + 1}`;
			return mission;
		}
		static StockRoomMissionComplete(mission) {
			var pdi = PlayerDroneInfo();
			pdi.items = pdi.items.filter((item) => !(item.name == "StockRoom" && item.index == mission.from));
		}
		static OrgasmMission() {
			var mission = new _MissionInfo("OrgasmResist", "Orgasm resistance mission", 10);
			mission.target = 3;
			mission.progress = 0;
			mission.desc = `Resist orgasm three times`;
			return mission;
		}
		static SpankMission() {
			var mission = new _MissionInfo("Spank", "Receive-spanking mission", 10);
			mission.target = 3;
			mission.progress = 0;
			mission.desc = `Be spanked by an Operator or Visitor three times`;
			return mission;
		}
		static OwnerSpankMission() {
			var mission = new _MissionInfo("OwnerSpank", "Spanking mission", 10);
			mission.target = 3;
			mission.progress = 0;
			mission.desc = `Spank a Drone three times`;
			return mission;
		}
		static PetHeadMission() {
			var mission = new _MissionInfo("PetHead", "Receive-head-pat mission", 10);
			mission.target = 3;
			mission.progress = 0;
			mission.desc = `Be patted on the head by an Operator or Visitor three times`;
			return mission;
		}
		static OwnerPetHeadMission() {
			var mission = new _MissionInfo("OwnerPetHead", "Head-pat mission", 10);
			mission.target = 3;
			mission.progress = 0;
			mission.desc = `Pat a Drone's head three times`;
			return mission;
		}
		static ChargeMission() {
			var mission = new _MissionInfo("Charge", "Charging-station mission", 10);
			mission.target = 1;
			mission.progress = 0;
			mission.desc = `Use a charging station once`;
			return mission;
		}
		static TrainMission() {
		}
		static Education() {
		}
	};
	var _RequireActivityinfo = class _RequireActivityinfo {
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
		static CheckAllActivityComplete(SourceCharacter, TargetCharacter, param, FocusGroupName, ActivityName) {
			for (var info of _RequireActivityinfo.RequireActivity) {
				if (info.complete == true) continue;
				if (param != info.param) continue;
				if (info.FocusGroupNames.length > 0 && info.FocusGroupNames.findIndex((i) => {
					return i == FocusGroupName;
				}) == -1) continue;
				if (info.ActivityNames.length > 0 && info.ActivityNames.findIndex((i) => {
					return i == ActivityName;
				}) == -1) continue;
				info.progress++;
				if (info.progress >= info.target) {
					info.completed = true;
					if (info.calltrainingProcess) {
						addTrainingProcess(1);
						info.calltrainingProcess = false;
					}
				}
			}
			_RequireActivityinfo.ClearAllPoseCompleted();
		}
		static CheckAllActivityIncomplete() {
			for (var info of _RequireActivityinfo.RequireActivity) {
				if (Date.now() > info.timeLimitUntil && info.progress < info.target) {
					SendMessageToSelf("Action not completed within the time limit - executing punishment");
					DoPunishment(2, 3);
					info.completed = true;
				}
			}
			_RequireActivityinfo.ClearAllPoseCompleted();
		}
		static ClearAllPoseCompleted() {
			_RequireActivityinfo.RequireActivity = _RequireActivityinfo.RequireActivity.filter((i) => {
				return i.completed == false;
			});
		}
		static RequireDroneActivity(FocusGroupNameArray, ActivityNameArray, param, timeLimit, count, calltrainingProcess = false) {
			_RequireActivityinfo.RequireActivity.push(new _RequireActivityinfo(FocusGroupNameArray, ActivityNameArray, param, timeLimit, count, calltrainingProcess));
		}
	};
	__publicField(_RequireActivityinfo, "RequireActivity", []);
	var RequireActivityinfo = _RequireActivityinfo;
	var _RequirePoseinfo = class _RequirePoseinfo {
		constructor(poseNameArray, timeLimit, calltrainingProcess) {
			this.poseNameArray = poseNameArray;
			this.timeLimitUntil = Date.now() + timeLimit;
			this.completed = false;
			this.calltrainingProcess = calltrainingProcess;
		}
		static RequireDronePose(poseNameArray, timeLimit, calltrainingProcess = false) {
			_RequirePoseinfo.RequirePose.push(new _RequirePoseinfo(poseNameArray, timeLimit, calltrainingProcess));
		}
		static CheckPose() {
			for (var reqPose of _RequirePoseinfo.RequirePose) {
				if (reqPose.complete == true) continue;
				var isPose = false;
				for (var pose of reqPose.poseNameArray) {
					if (Player.Pose.findIndex((i) => {
						return i == pose;
					}) != -1) {
						isPose = true;
						break;
					}
				}
				if (isPose) {
					reqPose.completed = true;
					if (reqPose.calltrainingProcess) {
						addTrainingProcess(1);
					}
				} else if (Date.now() > reqPose.timeLimitUntil) {
					SendMessageToSelf("Action not completed within the time limit - executing punishment");
					DoPunishment(2, 3);
					reqPose.completed = true;
				}
			}
			_RequirePoseinfo.ClearAllPoseCompleted();
		}
		static ClearAllPoseCompleted() {
			_RequirePoseinfo.RequirePose = _RequirePoseinfo.RequirePose.filter((i) => {
				return i.completed == false;
			});
		}
	};
	__publicField(_RequirePoseinfo, "RequirePose", []);
	var RequirePoseinfo = _RequirePoseinfo;
	var StockRoom = {
		Areas: [
			{ leftUp: { X: 0, Y: 2 }, rightDown: { X: 4, Y: 6 } },
			{ leftUp: { X: 35, Y: 2 }, rightDown: { X: 39, Y: 6 } },
			{ leftUp: { X: 0, Y: 27 }, rightDown: { X: 4, Y: 31 } },
			{ leftUp: { X: 35, Y: 27 }, rightDown: { X: 39, Y: 31 } }
		],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function StockRoomEnter() {
		SendMessageToSelf(`You have entered the stockroom area. At the cabinet, you can ${styleButton("Pick up", StockRoomAction, true)} or ${styleButton("Put down", StockRoomAction, false)} goods.`, "StockRoom");
	}
	function StockRoomLeave() {
		ClearTagMessage("StockRoom");
	}
	function StockRoomAction(isTake, isSkipCanInteract = false) {
		var pdi = PlayerDroneInfo();
		if (!IsInZone(Player.MapData.Pos, StockRoom)) {
			SendMessageToSelf(`Not in the StockRoom area`, "StockRoom");
			return;
		}
		if (Player.CanInteract() == false && !isSkipCanInteract) {
			if (Player.IsMounted()) {
				SendMessageToSelf(`Arms and legs are simultaneously unavailable... attempting to call the dispatch system to perform the operation instead ${styleProgressBar("Calling", "Completed", 3e4, StockRoomAction, isTake, true)}`, "StockRoom");
			} else {
				SendMessageToSelf(`Arms unavailable... attempting to adjust posture to operate using legs and feet ${styleProgressBar("Adjusting", "Complete", 1e4, StockRoomAction, isTake, true)}`, "StockRoom");
			}
			return;
		}
		if (isTake) {
			if (pdi.items.length < pdi.itemsMax) {
				var index = GetStockIndex();
				pdi.items.push(ItemInfo.StockRoomItem(index));
				SendMessageToSelf(`Item retrieved successfully - item ID: ${String.fromCharCode(65 + Math.floor(index / 5))}${index % 5 + 1}`, "StockRoom");
			} else {
				SendMessageToSelf("Storage unit full... retrieval failed", "StockRoom");
			}
		} else {
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
	function GetStockIndex() {
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
	var Elevator = {
		Areas: [
			{ leftUp: { X: 18, Y: 35 }, rightDown: { X: 20, Y: 37 } },
			{ leftUp: { X: 30, Y: 35 }, rightDown: { X: 32, Y: 37 } },
			{ leftUp: { X: 22, Y: 35 }, rightDown: { X: 24, Y: 37 } },
			{ leftUp: { X: 30, Y: 30 }, rightDown: { X: 32, Y: 32 } }
		],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	async function ElevatorEnter(nowInZone) {
		var pdi = PlayerDroneInfo();
		switch (nowInZone) {
			case "0":
				{
					if (pdi.isDrone) {
						SendMessageToSelf("Drone entered facility elevator. Transferring to standby area...", "Elevator");
						await sleep(3e3);
						var xAdd4 = Object.assign({}, Player.MapData.Pos);
						xAdd4.X += 4;
						if (IsInArea(xAdd4, Elevator.Areas[2]) == false) {
							xAdd4 = Object.assign({}, Elevator.Areas[2].leftUp);
						}
						MovePlayer(xAdd4);
						await sleep(3e3);
						WearEquips(Player, [Crate]);
						SendMessageToSelf("Containment pod deployed!", "Elevator");
						await sleep(3e3);
						MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]));
						SendMessageToSelf("Moved to standby area! Waiting for system call...", "Elevator");
						SendMessageToSelf(styleProgressBar("Waiting", "Called", 3e4, async () => {
							SendMessageToSelf("System call received! Moving to main facility area...", "Elevator");
							await sleep(1e3);
							MovePlayer(RandomPosOfArea(Elevator.Areas[3]));
							RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
						}));
					} else if (pdi.isOwner) {
						SendMessageToSelf("Operator entered facility elevator. Transferring to main facility area...", "Elevator");
						var xAdd12 = Object.assign({}, Player.MapData.Pos);
						xAdd12.X += 12;
						if (IsInArea(xAdd12, Elevator.Areas[1]) == false) {
							xAdd12 = Object.assign({}, Elevator.Areas[1].leftUp);
						}
						MovePlayer(xAdd12);
						RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
					} else {
						SendMessageToSelf("Visitors do not have facility access! Register as a Drone or Operator and try again.", "Elevator");
					}
				}
				break;
			case "1":
				{
					if (pdi.isOwner) {
						SendMessageToSelf("Operator entered facility elevator! Transferring to facility entrance...", "Elevator");
						var xAdd12b = Object.assign({}, Player.MapData.Pos);
						xAdd12b.X -= 12;
						if (IsInArea(xAdd12b, Elevator.Areas[0]) == false) {
							xAdd12b = Object.assign({}, Elevator.Areas[0].leftUp);
						}
						MovePlayer(xAdd12b);
					} else if (pdi.isDrone) {
						SendMessageToSelf("Drones may not use the Operator elevator. Executing punishment!", "Elevator");
						DoPunishment(2, 3);
					} else {
						SendMessageToSelf("Visitors do not have facility access. Register as a Drone or Operator and try again.", "Elevator");
					}
				}
				break;
			case "3":
				{
					if (pdi.isDrone) {
						SendMessageToSelf("Drone entered facility elevator. Transferring to standby area...", "Elevator");
						await sleep(3e3);
						var xAdd3 = Object.assign({}, Player.MapData.Pos);
						xAdd3.X += 3;
						if (IsInArea(xAdd3, Elevator.Areas[2]) == false) {
							xAdd3 = Object.assign({}, Elevator.Areas[2].leftUp);
						}
						MovePlayer(xAdd3);
						await sleep(3e3);
						WearEquips(Player, [Crate]);
						SendMessageToSelf("Containment pod deployed!", "Elevator");
						await sleep(3e3);
						MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]));
						SendMessageToSelf("Moved to standby area. Waiting for system call...", "Elevator");
						SendMessageToSelf(styleProgressBar("Waiting", "Called", 3e4, async () => {
							SendMessageToSelf("System call received! Moving to facility entrance...", "Elevator");
							await sleep(1e3);
							MovePlayer(RandomPosOfArea(Elevator.Areas[0]));
							RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
						}));
					} else if (pdi.isOwner) {
						SendMessageToSelf("Operators should use the southern Operator elevator.", "Elevator");
					} else {
						SendMessageToSelf("Visitors do not have facility access! Register as a Drone or Operator and try again.", "Elevator");
					}
				}
				break;
		}
	}
	function ElevatorLeave() {
		ClearTagMessage("Elevator");
	}
	var SleepEnterZone = {
		Areas: [{ leftUp: { X: 24, Y: 18 }, rightDown: { X: 27, Y: 25 } }],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	var SleepEnterTiles = {
		Areas: [
			{ X: 27, Y: 18 },
			{ X: 27, Y: 20 },
			{ X: 27, Y: 22 },
			{ X: 27, Y: 24 }
		],
		Exclude: []
	};
	function SleepEnterZoneEnter() {
		SendMessageToSelf(`Entered Drone sleep area. On the inner pads you can ${styleButton("Sleep", SleepEnterZoneDoSleep, true)} to gain quota points.`, "SleepEnterZone");
	}
	function SleepEnterZoneLeave() {
		ClearTagMessage("SleepEnterZone");
	}
	function SleepEnterZoneDoSleep() {
		var i = IsInZone(Player.MapData.Pos, SleepEnterTiles);
		if (i === false) {
			SendMessageToSelf("Not on a pad", "SleepEnterZone");
			return;
		}
		var index = Number.parseInt(i);
		SendMessageToSelf(`About to sleep for ${(index + 1) * 6} hours. Time still counts while offline. ${styleButton("Start sleep", async (index2) => {
			ClearTagMessage("SleepEnterZone");
			SendMessageToSelf(`Sleep started. Gained ${(index2 + 1) * 10} quota points`);
			var pdi = PlayerDroneInfo();
			pdi.coin += (index2 + 1) * 10;
			await sleep(1e3);
			WearEquips(Player, [Crate]);
			SendMessageToSelf(`Sleep pod deployed! Moving to standby area to begin sleep.`);
			await sleep(2e3);
			MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]), true);
			pdi.sleepUntil = Date.now() + (index2 + 1) * 6 * 3600 * 1e3;
			DTSSyncSettings();
		}, index)}`, "SleepEnterZone");
	}
	var SleepRoom = {
		Areas: [{ leftUp: { X: 34, Y: 34 }, rightDown: { X: 39, Y: 39 } }],
		Exclude: []
	};
	var ModifyRoom = {
		Areas: [{ leftUp: { X: 15, Y: 2 }, rightDown: { X: 18, Y: 7 } }],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	var ModifyInnerRoom = {
		Areas: [{ leftUp: { X: 8, Y: 2 }, rightDown: { X: 14, Y: 7 } }],
		Exclude: []
	};
	function ModifyRoomEnter() {
		SendMessageToSelf(`Entered upgrade workshop, ${styleButton("Show available upgrades", ShowAvailableModify)}`, "ModifyRoom");
	}
	function ModifyRoomLeave() {
		if (IsInZone(Player.MapData.Pos, ModifyInnerRoom) == false) {
			ClearTagMessage("ModifyRoom");
		}
	}
	var allModify = {
		eyes1: {
			id: "eyes1",
			name: "Implant contact-lens display",
			desc: "Eye function can be set to a restricted mode.",
			price: 10,
			effect: (pdi) => {
				pdi.bodyStatusMax.eyes = 1;
			},
			front: []
		},
		ears1: {
			id: "ears1",
			name: "Implant ear-canal filler",
			desc: "Ear function can be set to a restricted mode.",
			price: 10,
			effect: (pdi) => {
				pdi.bodyStatusMax.ears = 1;
			},
			front: []
		},
		mouth1: {
			id: "mouth1",
			name: "Implant jaw-control motor",
			desc: "Mouth function can be set to a restricted mode.",
			price: 10,
			effect: (pdi) => {
				pdi.bodyStatusMax.mouth = 1;
			},
			front: []
		},
		hands1: {
			id: "hands1",
			name: "Implant shoulder/elbow control motor",
			desc: "Arm function can be set to a restricted mode.",
			price: 10,
			effect: (pdi) => {
				pdi.bodyStatusMax.hands = 1;
			},
			front: []
		},
		legs1: {
			id: "legs1",
			name: "Implant knee/ankle control motor",
			desc: "Leg function can be set to a restricted mode.",
			price: 10,
			effect: (pdi) => {
				pdi.bodyStatusMax.legs = 1;
			},
			front: []
		},
		level1: {
			id: "level1",
			name: "System upgrade to version 1.0",
			desc: "Flash next system firmware version and unlock more functions",
			price: 15,
			effect: (pdi) => {
				pdi.level = 1;
			},
			front: ["eyes1", "ears1", "mouth1", "hands1", "legs1", "education1", "training1"]
		},
		eyes2: {
			id: "eyes2",
			name: "Replace with artificial electronic eyeballs",
			desc: "Eye function can be set to offline mode.",
			price: 20,
			effect: (pdi) => {
				pdi.bodyStatusMax.eyes = 2;
			},
			front: ["level1"]
		},
		ears2: {
			id: "ears2",
			name: "Implant cochlear damper",
			desc: "Ear function can be set to offline mode.",
			price: 20,
			effect: (pdi) => {
				pdi.bodyStatusMax.ears = 2;
			},
			front: ["level1"]
		},
		mouth2: {
			id: "mouth2",
			name: "Implant vocal-cord control device",
			desc: "Mouth function can be set to offline mode.",
			price: 20,
			effect: (pdi) => {
				pdi.bodyStatusMax.mouth = 2;
			},
			front: ["level1"]
		},
		hands2: {
			id: "hands2",
			name: "Implant hand-control motor",
			desc: "Arm function can be set to offline mode.",
			price: 20,
			effect: (pdi) => {
				pdi.bodyStatusMax.hands = 2;
			},
			front: ["level1"]
		},
		legs2: {
			id: "legs2",
			name: "Implant hip-control motor",
			desc: "Leg function can be set to offline mode.",
			price: 20,
			effect: (pdi) => {
				pdi.bodyStatusMax.legs = 2;
			},
			front: ["level1"]
		},
		level2: {
			id: "level2",
			name: "System upgrade to version 2.0",
			desc: "Flash next system firmware version and unlock more functions",
			price: 25,
			effect: (pdi) => {
				pdi.level = 2;
			},
			front: ["eyes2", "ears2", "mouth2", "hands2", "legs2", "education2", "training2"]
		},
		battery1: {
			id: "battery1",
			name: "Install extra bladder power supply",
			desc: "Increase endurance by 50%",
			price: 20,
			effect: (pdi) => {
				pdi.batteryMax = 1500;
			},
			front: []
		},
		battery2: {
			id: "battery2",
			name: "Install extra intestinal power supply",
			desc: "Increase endurance by 66%",
			price: 30,
			effect: (pdi) => {
				pdi.batteryMax = 2500;
			},
			front: ["level1", "battery1"]
		},
		itemsMax1: {
			id: "itemsMax1",
			name: "Storage-unit expansion",
			desc: "Increase item slot limit by one",
			price: 20,
			effect: (pdi) => {
				pdi.itemsMax = 4;
			},
			front: []
		},
		itemsMax2: {
			id: "itemsMax2",
			name: "Advanced storage-unit expansion",
			desc: "Increase item slot limit by one",
			price: 30,
			effect: (pdi) => {
				pdi.itemsMax = 5;
			},
			front: ["level1", "itemsMax1"]
		},
		missionsMax1: {
			id: "missionsMax1",
			name: "Memory-unit expansion",
			desc: "Increase mission slot limit and daily mission limit by one",
			price: 20,
			effect: (pdi) => {
				pdi.missionsMax = 4;
			},
			front: []
		},
		missionsMax2: {
			id: "missionsMax2",
			name: "Advanced memory-unit expansion",
			desc: "Increase mission slot limit and daily mission limit by one",
			price: 30,
			effect: (pdi) => {
				pdi.missionsMax = 5;
			},
			front: ["level1", "missionsMax1"]
		},
		orgasmBatteryGet1: {
			id: "orgasmBatteryGet1",
			name: "Upgrade orgasm-charging component",
			desc: "Increase battery gained from orgasm by 100%",
			price: 20,
			effect: (pdi) => {
				pdi.orgasmBatteryGet = 200;
			},
			front: []
		},
		orgasmBatteryGet2: {
			id: "orgasmBatteryGet2",
			name: "Further upgrade orgasm-charging component",
			desc: "Increase battery gained from orgasm by 50%",
			price: 30,
			effect: (pdi) => {
				pdi.orgasmBatteryGet = 300;
			},
			front: ["level1", "orgasmBatteryGet1"]
		},
		displayTalkCost1: {
			id: "displayTalkCost1",
			name: "Install high-performance display",
			desc: "Reduce display screen cost",
			price: 20,
			effect: (pdi) => {
				pdi.chatBatteryCost = 30;
			},
			front: []
		},
		displayTalkCost2: {
			id: "displayTalkCost2",
			name: "Install top-tier display",
			desc: "Further reduce display screen cost",
			price: 30,
			effect: (pdi) => {
				pdi.chatBatteryCost = 15;
			},
			front: ["level1", "displayTalkCost1"]
		},
		dontShow: {
			id: "dontShow",
			name: "Not displayed; for annotation purposes only.",
			desc: "The following can be obtained in the training room: training1, training2, training3, education1, education2, education3.",
			price: 30,
			effect: (pdi) => {
			},
			front: ["dontShow"]
		}
	};
	var selectModify = "";
	function ShowAvailableModify(target2 = null) {
		var pdi = PlayerDroneInfo();
		if (pdi.isDrone == false && target2 == null) {
			var input = document.getElementById("InputChat");
			input.value = "/DTS findtargetmodify []";
			SendMessageToSelf("Enter the target ID inside the brackets and send the command to get the target Drone's available upgrades.", "ModifyRoom");
			return;
		}
		var list = [];
		for (var mod in allModify) {
			if (CanModify(allModify[mod], target2) == false) continue;
			list.push(Object.assign({}, allModify[mod]));
		}
		var string = "";
		for (var mod of list) {
			string += "\n";
			string += mod.name;
			if (target2 == null) {
				string += styleButton("Select", (id, desc, price) => {
					selectModify = id;
					SendMessageToSelf(`Upgrade effect: ${desc}
 Required quota points: ${price}
Enter the upgrade pod in the left room to start upgrading.`, "ModifyRoom");
				}, mod.id, mod.desc, mod.price);
			} else {
				string += styleButton("Select", (id, desc, price) => {
					SendMessageToSelf(`Upgrade effect: ${desc}
 Required quota points: ${price}
For this Drone: ${styleButton("Apply upgrade", () => {
						if (target2.ownerId != -1 && target2.ownerId != Player.MemberNumber) {
							SendMessageToSelf(`You do not have permission to operate this Drone!`, "ModifyRoom");
							return;
						}
						if (price > pdi.coin) {
							SendMessageToSelf(`Not enough quota points to upgrade!`, "ModifyRoom");
							return;
						} else {
							pdi.coin -= price;
						}
						SendDTSMsg(target2, new MsgInfo("DoModifyByOwner", id));
						SendMessageToSelf(`Upgrade command sent!`, "ModifyRoom");
					})}`, "ModifyRoom");
				}, mod.id, mod.desc, mod.price);
			}
		}
		SendMessageToSelf(`Available upgrades:${string}`, "ModifyRoom");
	}
	function CanModify(mod, target2 = null) {
		var pdi = null;
		if (target2 == null) {
			pdi = PlayerDroneInfo();
		} else {
			pdi = target2;
		}
		if (pdi.modifys[mod.id] != void 0) return false;
		for (var front of mod.front) {
			if (!pdi.modifys[front]) return false;
		}
		return true;
	}
	var ModifyTile = {
		Areas: [{ X: 10, Y: 5 }],
		Exclude: [],
		Enter: void 0
	};
	function ModifyTileEnter(nowInZone, paid = false) {
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
			} else {
				pdi.coin -= allModify[selectModify].price;
			}
		}
		WearEquips(Player, [Crate]);
		var select = selectModify;
		selectModify = "";
		SendMessageToSelf(`Drone entered upgrade pod. Closing pod door and starting upgrade...${styleProgressBar("Upgrading", "Upgrade complete", 3e4, (select2) => {
			var pdi2 = PlayerDroneInfo();
			var mod = Object.assign({}, allModify[select2]);
			mod.effect(pdi2);
			pdi2.modifys[select2] = true;
			SendMessageToSelf(`Upgrade complete. Opening pod door`, "ModifyRoom");
			RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
		}, select)}`);
	}
	function DoModifyByOwner(Modifyid) {
		selectModify = Modifyid;
		ModifyTileEnter(0, true);
	}
	var ShopRoom = {
		Areas: [{ leftUp: { X: 20, Y: 2 }, rightDown: { X: 32, Y: 7 } }],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function ShopRoomEnter() {
		SendMessageToSelf(`Entered shop. Move into the inner room to shop`, "ShopRoom");
	}
	function ShopRoomLeave() {
		ClearTagMessage("ShopRoom");
	}
	var ShopInnerRoom = {
		Areas: [
			{ leftUp: { X: 25, Y: 2 }, rightDown: { X: 27, Y: 3 } },
			{ leftUp: { X: 30, Y: 2 }, rightDown: { X: 32, Y: 3 } }
		],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function ShopInnerRoomEnter() {
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
	function ShopInnerRoomLeave() {
		ClearTagMessage("ShopInnerRoom");
	}
	var WorkRoom = {
		Areas: [{ leftUp: { X: 0, Y: 12 }, rightDown: { X: 6, Y: 22 } }],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function WorkRoomEnter() {
		SendMessageToSelf(`Entered office. Move to an inner workstation to work`, "WorkRoom");
	}
	function WorkRoomLeave() {
		ClearTagMessage("WorkRoom");
		ClearTagMessage("WorkRoomWork");
	}
	var WorkInnerRoom = {
		Areas: [
			{ leftUp: { X: 0, Y: 12 }, rightDown: { X: 1, Y: 13 } },
			{ leftUp: { X: 5, Y: 12 }, rightDown: { X: 6, Y: 13 } },
			{ leftUp: { X: 0, Y: 16 }, rightDown: { X: 1, Y: 17 } },
			{ leftUp: { X: 0, Y: 20 }, rightDown: { X: 1, Y: 21 } },
			{ leftUp: { X: 5, Y: 20 }, rightDown: { X: 6, Y: 21 } }
		],
		Exclude: [],
		Enter: void 0
	};
	function WorkInnerRoomEnter() {
		SendMessageToSelf(`${styleButton("Take mission", TakeMission)}${styleButton("Do office work", DoWork)}`, "WorkRoom");
	}
	function DoWork() {
		var p1 = Math.floor(Math.random() * 100);
		var p2 = Math.floor(Math.random() * 100);
		var p3 = Math.floor(Math.random() * 4);
		switch (p3) {
			case 0:
				{
					p3 = "+";
				}
				break;
			case 1:
				{
					p3 = "-";
				}
				break;
			case 2:
				{
					p3 = "*";
				}
				break;
			case 3:
				{
					p3 = "/";
				}
				break;
			default:
				{
					p3 = "+";
				}
				break;
		}
		var string = `${p1} ${p3} ${p2}`;
		var result = new Function("return " + string)();
		var resultIndex = Math.floor(Math.random() * 4);
		var worngResult = [
			(result + Math.floor(Math.random() * 100 - 50)).toFixed(2),
			(result + Math.floor(Math.random() * 100 - 50)).toFixed(2),
			(result + Math.floor(Math.random() * 100 - 50)).toFixed(2)
		];
		result = result.toFixed(2);
		string += ` = ?
`;
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
	var OperRoom = {
		Areas: [{ leftUp: { X: 12, Y: 18 }, rightDown: { X: 22, Y: 25 } }],
		Exclude: [{ leftUp: { X: 14, Y: 18 }, rightDown: { X: 18, Y: 19 } }],
		Enter: void 0,
		Leave: void 0
	};
	function OperRoomEnter() {
		SendMessageToSelf(`Entered Operator lounge`, "OperRoom");
	}
	function OperRoomLeave() {
		ClearTagMessage("OperRoom");
	}
	var Cat = {
		Areas: [{ X: 19, Y: 24 }],
		Exclude: [],
		Enter: void 0
	};
	function CatEnter() {
		SendMessageToSelf(`This is a cat`, "OperRoom");
	}
	var DancerRoom = {
		Areas: [{ leftUp: { X: 14, Y: 18 }, rightDown: { X: 18, Y: 19 } }],
		Exclude: []
	};
	var PrivateRoomCrate = {
		Areas: [
			{ X: 12, Y: 12 },
			{ X: 20, Y: 12 },
			{ X: 22, Y: 12 }
		],
		Exclude: []
	};
	var PrivateRoom = {
		Areas: [
			{ leftUp: { X: 12, Y: 12 }, rightDown: { X: 15, Y: 16 } },
			{ leftUp: { X: 17, Y: 12 }, rightDown: { X: 20, Y: 16 } },
			{ leftUp: { X: 22, Y: 12 }, rightDown: { X: 27, Y: 16 } }
		],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function PrivateRoomEnter() {
		var pdi = PlayerDroneInfo();
		if (pdi.isDrone) {
			SendMessageToSelf(`Entered private room.`, "PrivateRoom");
		} else {
			SendMessageToSelf(`Entered private room. ${styleButton("Call Drone to private room", CallDroneToPrivateRoom)}`, "PrivateRoom");
		}
	}
	function CallDroneToPrivateRoom() {
		var input = document.getElementById("InputChat");
		input.value = "/DTS findtargetoprivate []";
		SendMessageToSelf("Enter the target ID inside the brackets and send the command.");
	}
	var TrainingRoomBlackTile = {
		Areas: [
			{ X: 34, Y: 13 },
			{ X: 38, Y: 13 }
		],
		Exclude: []
	};
	var TrainingRoom = {
		Areas: [
			{ leftUp: { X: 33, Y: 12 }, rightDown: { X: 35, Y: 14 } },
			{ leftUp: { X: 37, Y: 12 }, rightDown: { X: 39, Y: 14 } }
		],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function TrainingRoomEnter(nowInZone) {
		SendMessageToSelf(`Entered training room. Stand on a black tile and ${styleButton("Start training", StartTraining, nowInZone)}`, "TrainingRoom");
	}
	function TrainingRoomLeave(pverInZone) {
		if (isTraining) {
			SendMessageToSelf("You may not leave the training room before training completes.", "TrainingRoom");
			MovePlayer(TrainingRoomBlackTile.Areas[pverInZone]);
		} else {
			ClearTagMessage("TrainingRoom");
		}
	}
	var trainingMenu = [
		async () => {
			var pdi = PlayerDroneInfo();
			var waitTime = 3e3;
			var waitTimeShort = 1e3;
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
					SendMessageToSelf(`${styleProgressBar("Head being patted...", "End", 2e4)}`, "TrainingProc");
					RequirePoseinfo.RequireDronePose(["Kneel"], 2e4, true);
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
					SendMessageToSelf(`${styleProgressBar("Cheek being pinched...", "End", 2e4)}`, "TrainingProc");
					RequirePoseinfo.RequireDronePose(["BaseLower", "LegsClosed"], 2e4, true);
					RequirePoseinfo.RequireDronePose(["BaseUpper"], 2e4, true);
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
					SendMessageToSelf(`${styleProgressBar("Lower abdomen being caressed...", "End", 2e4)}`, "TrainingProc");
					RequireActivityinfo.RequireDroneActivity([], ["Caress"], 0, 2e4, 3, true);
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
			var waitTime = 3e3;
			var waitTimeShort = 1e3;
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
					SendMessageToSelf(`${styleProgressBar("Lower abdomen being pinched...", "End", 2e4)}`, "TrainingProc");
					RequirePoseinfo.RequireDronePose(["LegsClosed"], 2e4, true);
					RequirePoseinfo.RequireDronePose(["BackBoxTie", "BackElbowTouch"], 2e4, true);
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
					SendMessageToSelf(`${styleProgressBar("Wiggle foot", "End", 2e4)}`, "TrainingProc");
					RequireActivityinfo.RequireDroneActivity(["ItemBoots"], ["Wiggle"], 0, 2e4, 1, true);
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
					SendMessageToSelf(`${styleProgressBar("Wiggle fingers", "End", 2e4)}`, "TrainingProc");
					RequireActivityinfo.RequireDroneActivity(["ItemHands"], ["Wiggle"], 0, 2e4, 1, true);
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
		}
	];
	async function WaitTrainingProcess(DoAtStart, DoAtFail, maxTrainingProcess) {
		var toNext = false;
		var retryCount = 0;
		var pdi = PlayerDroneInfo();
		while (toNext == false) {
			setTrainingProcess(0);
			DoAtStart();
			for (var i = 0; i < 20; i++) {
				await sleep(1e3);
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
	async function StartTraining(nowInZone) {
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
	var EducationRoom = {
		Areas: [[{ X: 34, Y: 22 }, { X: 36, Y: 22 }, { X: 38, Y: 22 }]],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function EducationRoomEnter(nowInZone) {
		SendMessageToSelf(`Entered education room, ${styleButton("Start education", StartEducation)}`, "EducationRoom");
	}
	function EducationRoomLeave(pverInZone) {
		ClearTagMessage("EducationRoom");
	}
	var educationMenu = [
		async () => {
			var pdi = PlayerDroneInfo();
			var waitTime = 2e3;
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
			SendMessageToSelf("My Identity..., human..., fading...", "EducationRoomClear");
			await sleep(waitTime);
			ClearTagMessage("EducationRoomClear");
			await WaitEducationProcess("My identity is ", "Drone", "Human");
			await WaitEducationProcess("My purpose is ", "Obey", "Seek selfhood");
			await WaitEducationProcess("When my owner pats my head, I should ", "Feel aroused", "Feel nothing");
			SendMessageToSelf(`${styleProgressBar("Head being patted", "End", waitTime * 2)}`, "EducationRoomClear");
			await sleep(waitTime);
			DoOrgasm();
			await sleep(15e3);
			SendMessageToSelf(`${styleProgressBar("Head being patted", "End", waitTime * 2)}`, "EducationRoomClear");
			await sleep(waitTime);
			DoOrgasm();
			await sleep(15e3);
			SendMessageToSelf(`${styleProgressBar("Head being patted", "End", waitTime * 2)}`, "EducationRoomClear");
			await sleep(waitTime);
			DoOrgasm();
			await sleep(15e3);
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
			var waitTime = 2e3;
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
			await sleep(15e3);
			DoOrgasm();
			await sleep(15e3);
			DoOrgasm();
			await sleep(15e3);
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
		}
	];
	async function WaitEducationProcess(text1, text2, text3) {
		var toNext = false;
		var choiced = false;
		var waitTime = 2e3;
		while (toNext == false) {
			var choiced = false;
			ClearTagMessage("EducationRoomClear");
			SendMessageToSelf(`${text1}${styleButton(text2, () => {
				toNext = true;
				choiced = true;
			})}, ${styleButton(text3, () => {
				DoPunishment(2, 3);
				choiced = true;
			})}`, "EducationRoomClear");
			await waitFor(() => {
				return choiced == true;
			});
			ClearTagMessage("EducationRoomClear");
			await sleep(waitTime);
		}
	}
	async function StartEducation(nowInZone) {
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
	var ChargeRoom = {
		Areas: [[
			{ X: 1, Y: 10 },
			{ X: 38, Y: 10 },
			{ X: 1, Y: 25 },
			{ X: 38, Y: 25 },
			{ X: 8, Y: 30 },
			{ X: 18, Y: 30 }
		]],
		Exclude: [],
		Enter: void 0,
		Leave: void 0
	};
	function ChargeRoomEnter() {
		var pdi = PlayerDroneInfo();
		SendMessageToSelf(`On a charging station. ${styleButton(`Start Charging`, ChargeRoomCharge)}`, "ChargeRoom");
	}
	function ChargeRoomLeave() {
		ClearTagMessage("ChargeRoom");
		var inv = InventoryGet(Player, "ItemDevices");
		if (inv?.Asset?.Name == "OneBarPrison") {
			RemoveRestrainByOneAssetGroup(Player, "ItemDevices");
		}
	}
	function ChargeRoomCharge() {
		WearEquips(Player, [OneBar]);
		SendMessageToSelf(styleProgressBar("Charging", "Charge Complete", 6e4, ChargeComplete), "ChargeRoom");
	}
	function ChargeComplete() {
		var pdi = PlayerDroneInfo();
		pdi.battery = pdi.batteryMax;
		RemoveRestrainByOneAssetGroup(Player, "ItemDevices");
		MissionInfo.ProgressAdd("Charge");
	}
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
	var AllZoneList = [
		StockRoom,
		Elevator,
		SleepRoom,
		ModifyRoom,
		ModifyTile,
		ShopRoom,
		ShopInnerRoom,
		WorkRoom,
		WorkInnerRoom,
		OperRoom,
		Cat,
		DancerRoom,
		PrivateRoom,
		TrainingRoom,
		EducationRoom,
		ChargeRoom,
		SleepEnterZone,
		SleepEnterTiles
	];
	var map = {
		"Type": "Always",
		"Tiles": "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҲҲҲҴҴҲҲҲҴҴҴҴҴҴҴ¬yyyyyҴҴҴҳҳҳҴҴҴyyyyтyyyҴҴªªªҴҴªªªтyyyyyyyyyyyyҴҴҳ«««ҳҴтyyyyтyyyҴҴªªªҴҴªªªтyyyyyyyyyyyyҴҴ«ҳ«ҳ«ҴКyyyyтyyyҴҴҴҴҴҴҴҴҴҴтyyyyyyyyyyyyҴҴ«««««ҴҴyyyyтyyyyyyyyyyyyyтyyyyyyyyyyyyҴҴ«ҳ«ҳ«ÇÇyyyyтyyyyyyyyyyyyyтyyyyyyyyyyyyҴҴҳ«««ҴҴтyyyyтyyyyyyyyyyyyyтyyyyyyҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҳ«ҳyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyҳ«ҳ«¬«yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy«¬«ҲҲҴҴҴҲҲҴyyyҴААААҴААААҴААААААҴyyyҴҳҳҳҴҳҳҳªªҴҴҴªªҴyyyҴҴҴҴyyyҴ«««Ҵ«««ªªҴҴҴªªҴyyyҴҴҴҴyyyҴ«¬«Ҵ«¬«¬¬¬¬¬¬¬ҴyyyҴҴҴҴyyyҴ«««Ҵ«««ҲҲҴ¬ҴҴҴҴyyyҴҴҴҴyyyҴҴҴҴҴҴҴҴªªҴ¬¬¬¬ҴyyyҴҴҴҴyyyҴyyyyyyyªªҴ¬¬¬¬ҴyyyҴҴҴЮЮЮЮЮҴҴҴҴҴҳҳҳҳҴyyyҴyyyyyyy¬¬¬¬¬¬¬ÇyyyҴxЮ¬¬¬Юxxxҳ«««ҴyyyÇyyyyyyyҲҲҴ¬ҴҲҲҴyyyҴxЮЮxxxҳ««ҳҳҴyyyҴҳ¬ҳ¬ҳ¬ҳªªҴ¬ҴªªҴyyyҴxxxxxxxxxxxҳ«««ҴyyyҴҴҳҴҳҴҳҴªªҴ¬ҴªªҴyyyҴxxxxxxxxxxxҳ««ҳҳҴyyyҴҴ«Ҵ«Ҵ«Ҵ¬¬¬¬¬¬¬ҴyyyҴxxxxxxxxxxxҳ«««ҴyyyҴҴ«Ҵ«Ҵ«ҴҴҴҴҴҴҴҴҴyyyҴxxxxxxxxxxxҳ««ҳҳҴyyyҴҴҴҴҴҴҴҴҳ«ҳyyyyyyyyҴxxxxxxxxxxxҳ«««Ҵyyyyyyyyҳ«ҳ«¬«yyyyyyyyҴxxxxxxxxxxxҳ««ҳҳҴyyyyyyyy«¬«ҴҴҴҴҴҴҴyyyyҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴҴyyyyҴҴҴҴҴҴҴyyyyyyҴyyyyyyyyyyyyyyyyyyyyyyyyyyҴyyyyyyyyyyyyҴyyyyyyyyyyyyyyyyyyyyyyyyyyҴyyyyyyyyyyyyҴҳ«ҳyyyyyyyҳ«ҳyyyyyyyyyҳҳҳҳҴyyyyyyyyyyyyҴ«¬«yyyyyyy«¬«yyyyyyyyyҳ«««ҴyyyyyyyyyyyyҴҳ«ҳyyyyyyyҳ«ҳyyyyyyyyyҳ«««ҴyyyyyyyyyyyyҴyyyyyyyyyyyyyyyyyyyyyyÇ«««ҴyyyyyyҴҴҴҴҴҴҴҴҴҴҴҴЮЮЮЮЮҴҴҴҴҴҴҴҴҴҴyҴҴҴҴҴҴҳҳҳҳҳҳææëëëðëëëææҴxxxxxҴҲҲҲҲҳҳҳҳҴҴҴҴҲҲҲҴ««««««ææëëëðëëëææҴxxxxxҴªªªҲ«««ҳ¬¬¬ҴªªªҴ««««««ææëëëëëëëææҴxxxxxҴªªªҲ«««ҳ¬¬¬ҲªªªҴ««««««ææëëëðëëëææÇxxxxxÇªªªҲ«««ҳ¬¬¬ÇªªªҴ««««««ææëëëðëëëææҴxxxxxҴҲҲҲҳҳҳҳҳҳҳҳҴҲҲҲҴ««««««ææëëëëëëëææҴЮЮЮЮЮҴyyұ«ҳ«ҳ«ҳ«ҳyyyyҴ««««««",
		"Objects": "ҴӄӃҶұҳҹddddddddddddddddddddddddddddddddddddddddddddddddddd೥ddddddd೦೧ddd೦೧dddddddƂƂƂƂƂұdddddddddшшшddŀddddшddddшdddҴƂƂƂƂƂdddddddddddddddddddddиddddddddddddddddddƂƂƂƂƂҲdddddddddžſddddƀƁddd೥ྴddd೥ྴdҵƂƂƂƂƂddddddddddшddྴྴdddddddddddddddddddddddddƂƂƂƂƂҳddddddddddddddddddddddddddddҶƂƂƂƂƂdddddddddddddddŀdddddddddddddddddddddddddddddྴdddddddddddྴdddྴddddddddddddྴddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd೦೧ddd೦೧dddddd௪ddddd௪ddddd௪dddddddd೥ddd೥džſdddžſdddddшżdddddżшdшd࠲żdddddddиdшdиdшddddddddddddddːːdːːdddddddːːdddddddddddddddddddddddddddϼdϼdddddddddϼdddddddddddd೦೧ddd೥ddddddࠖࠖdddddࠖࠖdࠖࠖdd˚˚ddddddྴdddྴdžſdddddddddddddŀdŀdddddddddŀdddddddddddddddddddྴddddྶdddddddྶdྶdddddddddྴdddddddddddddddddddїdтdтdтdјdљdіќdddddddddddddd೦೧ddd೦೧dddddddࠖࠖࠖࠖࠖdddddddddddddddddddddžſdddžſddddddшdddddŀddddїјddddddddྴdྴdྴddddddddddddddddˤˤˤdżdddddddddddddddddddddddddddddddddddˆˆˆddddddїўddddddddшdшdшdddddddddddddddddddddddddddddddddddddddddddddddddddddddƂƂddddd̪ddddјњddddddddddddddddddddddddddžſdddddddddddddddddddddddddddddddྴdddddddddddddddྶྐྵdྸdddddddddྴdddddƂƂƂƂƂҷddddddddddddddddddddddddddddҺƂƂƂƂƂddddddddddddddddddddddddddddddddddddddddƂƂƂƂƂҸddddddddddddddddddddddddddddһƂƂƂƂƂddddddddddddddddddddddddddddddddddddddddƂƂƂƂƂҹdddddddddddddddddddddddྸddddҼƂƂƂƂƂddddddddddddddddddddddddddddddddddddddddೋdddddddddೋdddddddddddddddddddddddddddddnsdddddddddddиdddddddddddddྴddddddшшшшшшddddddddddddƀƁddddddddddddddddddddшшшшшшdddddddddddྴdddddྷdddddddddddྐྵddddшшшшшшddddddddddddddddddddddddddddddddddшшшшшшdddddddddddd࠲d࠲d࠲dddddddddddddddddшшшшшшddddddddddddddddddddddddddddddddddшшшшшш"
	};
	async function ExpendInit() {
		await waitFor(() => initComplete == true);
	}
	async function InitMapFaci() {
		ChatRoomData.Name = "DroneFacility 2.0";
		ChatRoomData.desc = `In development... testing and gathering ideas for the mod.
All info on github: tinyurl.com/DroneTrainingSystem
If something isn't clear just ask RoomTester or someone who has the mod already~`;
		ChatRoomData.Limit = 20;
		ChatRoomData.Access = ["All"];
		ChatRoomData.Visibility = ["All"];
		ChatRoomData.Private = false;
		ChatRoomData.MapData = Object.assign({}, map);
		ServerSend("ChatRoomAdmin", { MemberNumber: Player.ID, Room: ChatRoomGetSettings(ChatRoomData), Action: "Update" });
		for (var char of ChatRoomCharacter) {
			ChatRoomMapViewTeleport(char.MemberNumber, { X: 1, Y: 37 });
			await sleep(200);
		}
		MovePlayer({ X: 1, Y: 37 });
	}
	async function PlayerMovedFaci() {
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
			if ((AllZoneList[zoneKey].Enter ?? false) == false && (AllZoneList[zoneKey].Leave ?? false) == false && (AllZoneList[zoneKey].Moved ?? false) == false)
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
	async function CheckSleepUntil() {
		if (ChatRoomData.MapData.Objects.startsWith("ҴӄӃҶұҳҹ") == false) return;
		var pdi = PlayerDroneInfo();
		if (pdi.sleepUntil == null) return;
		if (pdi.sleepUntil < Date.now()) {
			pdi.sleepUntil = null;
			SendMessageToSelf(`Sleep complete; moving to main facility area`);
			await sleep(2e3);
			MovePlayer(RandomPosOfArea(Elevator.Areas[3]));
			RemoveRestrainByOneAssetGroup(Player, Crate.AssetGroup);
			return;
		}
		if (IsInZone(Player.MapData.Pos, SleepRoom) === false) {
			WearEquips(Player, [Crate]);
			MovePlayer(RandomPosOfArea(SleepRoom.Areas[0]), true);
		}
	}
// #endregion
// #region items.js

	// src/items.js
	var ItemInfo = class _ItemInfo {
		constructor(name) {
			this.name = name;
			this.id = Date.now() + Math.floor(Math.random() * 1e4);
			this.text = "";
			this.canUse = () => {
				return true;
			};
			this.use = null;
			this.param = [];
		}
		static RemoveThis(item) {
			var pdi = PlayerDroneInfo();
			pdi.items = pdi.items.filter((i) => {
				return i.id != item.id;
			});
		}
		static StockRoomItem(index) {
			var item = new _ItemInfo("StockRoom");
			item.index = index;
			item.text = `Cargo${String.fromCharCode(65 + Math.floor(index / 5))}${index % 5 + 1}`;
			return item;
		}
		static BatteryItem() {
			var item = new _ItemInfo("BatteryItem");
			item.text = "Disposable power bank: restores 50% Drone battery. Use before battery is depleted!";
			item.use = "BatteryItemUse";
			return item;
		}
		static BatteryItemUse(item) {
			var pdi = PlayerDroneInfo();
			if (pdi.isDrone) {
				SendActionText(`Drone${pdi.MemberNumber} connects the power bank's cable to the power port on its underside. Start charging...`);
				SendMessageToSelf(`${styleProgressBar("Charging", "Charging complete", 15e3, () => {
					var pdi2 = PlayerDroneInfo();
					ResponseBatteryCharge(pdi2.batteryMax / 2);
					SendMessageToSelf("Charging complete");
				})}`);
			} else {
				ResponseBatteryCharge(pdi.batteryMax / 2);
				SendMessageToSelf("The personal terminal does not need charging, but the power bank has been stored as backup energy.");
			}
			_ItemInfo.RemoveThis(item);
		}
		static BindStatusDownItem() {
			var item = new _ItemInfo("BindStatusDownItem");
			item.text = "Restraint easing chip: lowers one part's restraint level by 1";
			item.param = [
				{ id: 0, name: bodyPartDisplayStrings[0] },
				{ id: 1, name: bodyPartDisplayStrings[1] },
				{ id: 2, name: bodyPartDisplayStrings[2] },
				{ id: 4, name: bodyPartDisplayStrings[4] },
				{ id: 5, name: bodyPartDisplayStrings[5] }
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
			} else {
				SendActionText(`${Player.Name} used the Restraint-Loosening Chip on the restraints binding their body and the restraints on the ${bodyPartDisplayStrings[part]} loosened.`);
				RemoveRestrainsWithAssetGroup(Player, bodyPartAssetGroups[part]);
			}
			_ItemInfo.RemoveThis(item);
		}
		static BindStatusUpItem() {
			var item = new _ItemInfo("BindStatusUpItem");
			item.text = "Restraint tightening chip: raises one part's restraint level by 1";
			item.param = [
				{ id: 0, name: bodyPartDisplayStrings[0] },
				{ id: 1, name: bodyPartDisplayStrings[1] },
				{ id: 2, name: bodyPartDisplayStrings[2] },
				{ id: 4, name: bodyPartDisplayStrings[4] },
				{ id: 5, name: bodyPartDisplayStrings[5] }
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
			} else {
				pdi.coin += 5;
				SendActionText(`${Player.Name} used a Constriction Chip, but since it cannot be used on non-Drone targets, it was reclaimed for 5 Quota Points.`);
			}
			_ItemInfo.RemoveThis(item);
		}
		static BodyStatusDownItem() {
			var item = new _ItemInfo("BodyStatusDownItem");
			item.text = "Function restoration chip: lowers one part's function restriction by 1";
			item.param = [
				{ id: 0, name: bodyPartDisplayStrings[0] },
				{ id: 1, name: bodyPartDisplayStrings[1] },
				{ id: 2, name: bodyPartDisplayStrings[2] },
				{ id: 4, name: bodyPartDisplayStrings[4] },
				{ id: 5, name: bodyPartDisplayStrings[5] }
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
			} else {
				SendActionText(`${Player.Name} swiped the Function restoration chip over the restraints on their body, and the restraints on the ${bodyPartDisplayStrings[part]} loosened.`);
				RemoveRestrainsWithAssetGroup(Player, bodyPartAssetGroups[part]);
			}
			_ItemInfo.RemoveThis(item);
		}
		static BodyStatusUpItem() {
			var item = new _ItemInfo("BodyStatusUpItem");
			item.text = "Function restriction chip: raises one part's function restriction by 1";
			item.param = [
				{ id: 0, name: bodyPartDisplayStrings[0] },
				{ id: 1, name: bodyPartDisplayStrings[1] },
				{ id: 2, name: bodyPartDisplayStrings[2] },
				{ id: 4, name: bodyPartDisplayStrings[4] },
				{ id: 5, name: bodyPartDisplayStrings[5] }
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
				} else {
					SendActionText(`Drone${pdi.MemberNumber} used the Function restriction chip to scan the collar, restricting the function of the ${bodyPartDisplayStrings[part]}.`);
					DoSetBodyOrBindStatus(
						1,
						part,
						pdi.bindStatus[bodyPartStrings[part]] == 2 ? 2 : pdi.bindStatus[bodyPartStrings[part]] + 1,
						{ Name: "Function restriction chip" }
					);
				}
			} else {
				pdi.coin += 5;
				SendActionText(`${Player.Name} used a Function Restriction Chip, but since it cannot be used on non-Drone units, it was reclaimed for 5 Quota Points.`);
			}
			_ItemInfo.RemoveThis(item);
		}
		static VibeItem() {
			var item = new _ItemInfo("VibeItem");
			item.text = "Vibration controller: adjusts vibrator intensity";
			item.param = [
				{ id: 0, name: "Off" },
				{ id: 1, name: "Low" },
				{ id: 2, name: "High" }
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
			} else {
				DoVibe(level * 2, true);
				SendActionText(`${Player.Name} used the vibration controller.`);
			}
			_ItemInfo.RemoveThis(item);
		}
		static OrgasmLimitItem() {
			var item = new _ItemInfo("OrgasmLimitItem");
			item.text = "Orgasm limiter: adjusts orgasm restriction level";
			item.param = [
				{ id: 0, name: "Off" },
				{ id: 1, name: "Edging" },
				{ id: 2, name: "Blocked" }
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
			} else {
				pdi.coin += 5;
				SendActionText(`${Player.Name} used an Orgasm Limiter. But since it cannot be used on non-drones, it was reclaimed for 5 Quota Points.`);
			}
			_ItemInfo.RemoveThis(item);
		}
		static DisplayTalkItem() {
			var item = new _ItemInfo("DisplayTalkItem");
			item.text = "Display switch: toggles speaking through the display";
			item.param = [
				{ id: 0, name: "Off" },
				{ id: 1, name: "On" }
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
			} else {
				pdi.coin += 5;
				SendActionText(`${Player.Name} used the Display Switch. But since it cannot be used on non-Drone targets, it was reclaimed for 5 Quota Points.`);
			}
			_ItemInfo.RemoveThis(item);
		}
		static PrivateRoomItem() {
			var item = new _ItemInfo("PrivateRoomItem");
			item.text = "Private-room keycard: teleports to a private room and can call a Drone there. Remember the Drone ID first";
			item.param = [
				{ id: 0, name: "Room 1" },
				{ id: 1, name: "Room 2" },
				{ id: 2, name: "Room 3" }
			];
			item.use = "PrivateRoomItemUse";
			return item;
		}
		static PrivateRoomItemUse(item, level) {
			var pdi = PlayerDroneInfo();
			if (pdi.isDrone) {
				SendMessageToSelf("Drones are not allowed to use this item! Executing punishment and confiscating item!");
				DoPunishment(2, 3);
				_ItemInfo.RemoveThis(item);
				return;
			}
			for (var charater of ChatRoomCharacter) {
				if (IsInArea(charater.MapData.Pos, PrivateRoom.Areas[level])) {
					SendMessageToSelf("Room occupied... can not use!");
					return;
				}
			}
			MovePlayer(RandomPosOfArea(PrivateRoom.Areas[level]), true);
			_ItemInfo.RemoveThis(item);
		}
	};
	var allItem = [
		{ item: "BatteryItem", price: 10 },
		{ item: "BindStatusDownItem", price: 15 },
		{ item: "BindStatusUpItem", price: 5 },
		{ item: "BodyStatusDownItem", price: 15 },
		{ item: "BodyStatusUpItem", price: 5 },
		{ item: "VibeItem", price: 10 },
		{ item: "OrgasmLimitItem", price: 10 },
		{ item: "DisplayTalkItem", price: 5 },
		{ item: "PrivateRoomItem", price: 5 }
	];
// #endregion
// #region commands.js

	// src/commands.js
	function DTSHeartBeatPayload(requestResponse, isDrone) {
		return {
			receive: requestResponse,
			recive: requestResponse,
			isDrone
		};
	}
	var MsgCmds = {
		HeartBeatPack: {
			Command: (sender2, param) => {
				if (sender2.MemberNumber == Player.MemberNumber) return;
				if (param.isDrone != void 0) {
					charaterInstalledScript_isDrone[sender2.MemberNumber] = param.isDrone;
				}
				if (param.receive || param.recive) {
					SendDTSMsg(sender2, new MsgInfo("HeartBeatPack", DTSHeartBeatPayload(false, PlayerDroneInfo().isDrone)));
				}
			}
		},
		SetStatus: {
			Command: (sender2, param) => {
				if (param.length < 3) return;
				var type = param[0];
				var part = param[1];
				var level = param[2];
				DoSetBodyOrBindStatus(type, part, level, sender2);
			}
		},
		BatteryHelp: {
			Command: (sender2, param) => {
				if (ChatRoomMapViewIsActive() == false) {
					SendMessageToSelf(`Received a charging assistance signal from Drone ${sender2.MemberNumber}`);
				} else {
					var xDiff = sender2.MapData.Pos.X - Player.MapData.Pos.X;
					var yDiff = sender2.MapData.Pos.Y - Player.MapData.Pos.Y;
					SendMessageToSelf(`Charging help signal received from Drone ${sender2.MemberNumber} (${Math.abs(xDiff)} tiles ${xDiff > 0 ? "right" : "left"} and ${Math.abs(yDiff)} tiles ${yDiff > 0 ? "below" : "above"})`);
				}
			}
		},
		DoPunishment: {
			Command: (sender2, param) => {
				if (param == null || param.length < 2) {
					var pdi = PlayerDroneInfo();
					DoPunishment(pdi.shockLevel, pdi.shockCount);
				} else {
					var power = param[0];
					var count = param[1];
					SendMessageToSelf(`Punishment command received from ${sender2.Name}`);
					DoPunishment(power, count);
				}
			}
		},
		DoVibe: {
			Command: (sender2, param) => {
				if (param.length < 1) return;
				var power = param[0];
				SendMessageToSelf(`Vibration-device command received from ${sender2.Name}`);
				DoVibe(power);
			}
		},
		DoOrgasm: {
			Command: (sender2, param) => {
				SendMessageToSelf(`Received Forced-orgasm command from ${sender2.Name}`);
				DoOrgasm();
			}
		},
		RequestStatus: {
			Command: (sender2, param) => {
				ResponseRequestStatus(sender2, param);
			}
		},
		ReceivedStatus: {
			Command: (sender2, param) => {
				ShowStatus(param);
			}
		},
		ReceivedStatusModify: {
			Command: (sender2, param) => {
				if (ShowAvailableModify != void 0) {
					ShowAvailableModify(param);
				}
			}
		},
		DoModifyByOwner: {
			Command: (sender2, param) => {
				if (DoModifyByOwner != void 0) {
					DoModifyByOwner(param);
				}
			}
		},
		BatteryCharge: {
			Command: (sender2, param) => {
				ResponseBatteryCharge2(param);
			}
		},
		AddArousal: {
			Command: (sender2, param) => {
				ActivityTimerProgress(Player, param);
			}
		},
		ReqOwnerRight: {
			Command: (sender2, param) => {
				if (param) {
					PlayerDroneInfo().ownerId = -1;
					SendMessageToSelf(`Operator${sender2.MemberNumber} has revoked control over this unit`);
					SendDTSMsg(sender2, new MsgInfo("RespOwnerRight", param));
				} else {
					SendMessageToSelf(`Operator${sender2.MemberNumber} requests control permission for this unit. Click: ${styleButton("Accept", SetToDroneAccept, sender2)}`);
				}
			}
		},
		RespOwnerRight: {
			Command: (sender2, param) => {
				SendMessageToSelf(`${param ? "Revoked" : "Acquired"} control permission for Drone ${sender2.MemberNumber}`);
			}
		},
		SetDisplayTalk: {
			Command: (sender2, param) => {
				ResponseSetDisplayTalk(sender2, param);
			}
		},
		SendMissionHelp: {
			Command: (sender2, param) => {
				ShowMissionsString(param, `"Mission help request received from Drone ${sender2.MemberNumber}:`);
			}
		},
		PutMission: {
			Command: (sender2, param) => {
				SendMessageToSelf(`Mission received from Operator ${sender2.MemberNumber}`);
				TakeMission();
			}
		},
		CallToPos: {
			Command: (sender2, param) => {
				var pdi = PlayerDroneInfo();
				if (pdi.isDrone) {
					SendMessageToSelf(`Call request received from Operator ${sender2.MemberNumber}. Moving to specified location...`);
					ClearTagMessage("CallToPos");
					MovePlayer(param, true);
				} else {
					SendMessageToSelf(`Call request received from Operator ${sender2.MemberNumber}. ${styleButton("Move to specified location", () => {
						ClearTagMessage("CallToPos");
						MovePlayer(param, true);
					})}`, "CallToPos");
					setTimeout(() => {
						ClearTagMessage("CallToPos");
					}, 3e4);
				}
			}
		}
	};
	var CommandsAction = {
		findtarget: {
			Command: (param) => {
				var mn = parseInt(param[0]);
				if (isNaN(mn) == false) {
					var char = ChatRoomCharacter.find((c) => c.MemberNumber === mn);
					if (char) {
						DoFindTatget(char);
					} else {
						SendMessageToSelf("Target not found!");
					}
				} else {
					SendMessageToSelf("Target not found!");
				}
			}
		},
		findtargetmodify: {
			Command: (param) => {
				var mn = parseInt(param[0]);
				if (isNaN(mn) == false) {
					var char = ChatRoomCharacter.find((c) => c.MemberNumber === mn);
					if (char) {
						DoFindTatget(char, "ReceivedStatusModify");
					} else {
						SendMessageToSelf("Target not found!");
					}
				} else {
					SendMessageToSelf("Target not found!");
				}
			}
		},
		findtargetoprivate: {
			Command: (param) => {
				var mn = parseInt(param[0]);
				if (isNaN(mn) == false) {
					var char = ChatRoomCharacter.find((c) => c.MemberNumber === mn);
					if (char) {
						var index = -1;
						if (PrivateRoom != void 0 && PrivateRoomCrate != void 0) {
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
					} else {
						SendMessageToSelf("Target not found!");
					}
				} else {
					SendMessageToSelf("Target not found!");
				}
			}
		}
	};
	var BeepCmds = {
		cometoroom: {
			Command: async (senderMn, param, options) => {
				if (options.chatRoomName == void 0 || options.chatRoomName == null) return;
				var pdi = PlayerDroneInfo();
				var moveToRoom = async () => {
					ClearTagMessage("CallToPos");
					if (ChatRoomData.Name.toLowerCase() !== options.chatRoomName.toLowerCase()) {
						try {
							await JoinRoom(options.chatRoomName);
						} catch {
							return;
						}
					}
					if (ChatRoomIsViewActive("Map") == false) return;
					try {
						var pos = ChatRoomGetCharacter(senderMn).MapData.Pos;
						MovePlayer(pos);
					} catch {
						return;
					}
				};
				if (pdi.isDrone && pdi.ownerId == senderMn) {
					SendMessageToSelf(`Remote call request received from Operator ${senderMn}. Moving to their room...`);
					moveToRoom();
				} else {
					SendMessageToSelf(`Received a remote call request from Operator ${senderMn}, ${styleButton("Move to their room", () => {
						moveToRoom();
					})}`, "CallToPos");
					setTimeout(() => {
						ClearTagMessage("CallToPos");
					}, 3e4);
				}
			}
		}
	};
	function SendDTSMsg(targetPlayer, Dict) {
		if (targetPlayer) {
			ServerSend("ChatRoomChat", { Content: "DTS", Type: "Hidden", Dictionary: Dict, Target: targetPlayer.MemberNumber });
		} else {
			ServerSend("ChatRoomChat", { Content: "DTS", Type: "Hidden", Dictionary: Dict });
		}
	}
	var MsgInfo = class {
		constructor(type, param) {
			this.type = type;
			this.param = param;
		}
		static DoCmd(sender2, msgInfo) {
			MsgCmds[msgInfo.type].Command(sender2, msgInfo.param);
		}
		static DoBeepCmd(MemberNumber, msgInfo, options) {
			BeepCmds[msgInfo.type].Command(MemberNumber, msgInfo.param, options);
		}
	};
	var CommandInfo = class {
		constructor(command, commandText) {
			this.command = command;
			this.commandText = commandText;
		}
		static DoCmd(commandInfo) {
			CommandsAction[commandInfo.command].Command(commandInfo.commandText);
		}
	};
	function ResponseRequestStatus(sender2, param = null) {
		var handle = "ReceivedStatus";
		if (param != null) {
			handle = param;
		}
		if (charaterInstalledScript_isDrone[sender2.MemberNumber] != void 0) {
			SendDTSMsg(sender2, new MsgInfo(handle, PlayerDroneInfo()));
		} else if (CheckPlayerDroneInfoExistAndIsDrone()) {
			SendActionText(GetStatusAndVoiceCmdString(), sender2);
		}
	}
	function ResponseBatteryCharge2(param) {
		var pdi = PlayerDroneInfo();
		pdi.battery += param;
		if (pdi.battery > pdi.batteryMax) {
			pdi.battery = pdi.batteryMax;
		}
		RefreshBatteryTag();
		RefreshPlayerEffect();
	}
	function ResponseSetDisplayTalk(sender2, param) {
		PlayerDroneInfo().disPlayTalk = param;
		SendMessageToSelf(`Display talk was set by ${sender2.Name} to ${param ? "enabled" : "disabled"}`);
	}
	function ShowStatus(info = null) {
		if (!info) {
			info = PlayerDroneInfo();
		}
		var playerIsOwner = info.ownerId == -1 && info.MemberNumber != Player.MemberNumber || info.ownerId == Player.MemberNumber;
		var char = ChatRoomCharacter.find((c) => c.MemberNumber === info.MemberNumber);
		var { bpm, breathing, temp } = InventoryItemBreastFuturisticBraUpdate(char);
		var progress = 0;
		var temp = 37;
		if (char.ArousalSettings && char.ArousalSettings.Progress > 0) {
			temp += char.ArousalSettings.Progress / 100 * 3;
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
			ShowString = `——————Basic Info——————
Drone ID: ${info.MemberNumber}
Drone model: ${info.type}V${info.level}
quota points: ${info.coin}
Remaining battery: ${info.battery}/${info.batteryMax}
Operator ID: ${info.ownerId == -1 ? "No Operator" : info.ownerId}
System version: ${info.scriptVersion}${sleepString}
——————Physiology——————
Heart rate: ${bpm}BPM
Temperature: ${temp}℃
Arousal state: ${breathing === "Action" || breathing === "High" ? "Aroused" : "Not aroused"}
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
		} else if (info.isOwner) {
			ShowString = `——————Basic Info——————
Operator ID: ${info.MemberNumber}
Operator permission level: ${info.level}
quota points: ${info.coin}
System version: ${info.scriptVersion}
——————Physiology——————
Heart rate: ${bpm}BPM
Temperature: ${temp}℃
————————————————
${styleButton("Available actions", ShowActionButtons, info)}`;
		} else {
			ShowString = `——————Basic Info——————
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
	function GetExString(info) {
		var exString = ``;
		if (info.modifys["training1"]) {
			exString += `
Obedience command: When an Operator pats the head, switch to obedience pose`;
			exString += `
Reset command: When an Operator pinches the cheek, reset posture`;
			exString += `
Self-check command: When an Operator caresses the lower abdomen/belly, perform self-check`;
		}
		if (info.modifys["training2"]) {
			exString += `
Standby command: When an Operator pinches the lower abdomen/belly, switch to standby pose`;
			exString += `
Service command: When an Operator wiggles the body part to be served, kiss that part with the mouth plug`;
		}
		if (info.modifys["education1"]) {
			exString += `
Reward program: Being patted on the head has a chance to trigger orgasm`;
		}
		if (info.modifys["education2"]) {
			exString += `
Guilt program: Failing to resist orgasm raises a random restraint by 1`;
		}
		return exString;
	}
	function GetStatusAndVoiceCmdString() {
		var info = PlayerDroneInfo();
		var playerIsOwner = info.ownerId == -1 && info.MemberNumber != Player.MemberNumber || info.ownerId == Player.MemberNumber;
		var char = ChatRoomCharacter.find((c) => c.MemberNumber === info.MemberNumber);
		var { bpm, breathing, temp } = InventoryItemBreastFuturisticBraUpdate(char);
		var progress = 0;
		var temp = 37;
		var exString = GetExString(info);
		if (char.ArousalSettings && char.ArousalSettings.Progress > 0) {
			temp += char.ArousalSettings.Progress / 100 * 3;
			progress = char.ArousalSettings.Progress;
		}
		return `——————Basic Info——————
Drone ID: ${info.MemberNumber}
Drone model: ${info.type}V${info.level}
quota points: ${info.coin}
Remaining battery: ${info.battery}/${info.batteryMax}
Operator ID: ${info.ownerId == -1 ? "No Operator" : info.ownerId}
System version: ${info.scriptVersion}
——————Physiology——————
Heart rate: ${bpm}BPM
Temperature: ${temp}℃
Arousal state: ${breathing === "Action" || breathing === "High" ? "Aroused" : "Not aroused"}
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
	function ShowActionButtons(info = null) {
		var string = "";
		if (!info) {
			info = PlayerDroneInfo();
		}
		if (info.MemberNumber == Player.MemberNumber) {
			if (info.isDrone) string = ShowStringsToSelf(0, info);
			else if (info.isOwner) string = ShowStringsToSelf(1, info);
			else string = ShowStringsToSelf(2, info);
		} else {
			var pdi = PlayerDroneInfo();
			if (pdi.isDrone) {
				if (info.isDrone) string = ShowStringsToOther(0, info);
				else if (info.MemberNumber == pdi.ownerId) string = ShowStringsToOther(1, info);
				else string = ShowStringsToOther(2, info);
			} else if (pdi.isOwner) {
				if (info.isDrone) string = ShowStringsToOther(3, info);
				else string = ShowStringsToOther(5, info);
			} else {
				if (info.isDrone) string = ShowStringsToOther(4, info);
				else string = ShowStringsToOther(5, info);
			}
		}
		SendMessageToSelf(string, "actions");
	}
	function ShowStringsToSelf(index, info) {
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
	function ShowStringsToOther(index, info) {
		switch (index) {
			case 0:
				return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Send mission help request:${styleButton("Run", SendMissionHelp, info)}
Share battery:${styleButton("Run", DoBatteryHelp, info, 0)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
			case 1:
				return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Send mission help request:${styleButton("Run", SendMissionHelp, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
			case 2:
				return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Send mission help request:${styleButton("Run", SendMissionHelp, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
			case 3:
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
Discard this Drone:${styleButton("Run", () => {
					SendMessageToSelf("In development");
				})}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
			case 4:
				return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Show voice commands:${styleButton("Run", ShowVoiceCommand, info)}
Shock punishment:${styleButton("Run", ReqDoPunishment, info)}
Orgasm reward:${styleButton("Run", ReqDoOrgasm, info)}
Set mission:${styleButton("Run", SetMissionToDrone, info)}
Hand-crank charging:${styleButton("Run", DoBatteryHelp, info, 2)}
Set display screen:${styleButton("Run", SetDisplayTalk, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
			case 5:
				return `Available actions for this unit:
Show unit status:${styleButton("Run", DoFindTatget, info)}
Show this panel again:${styleButton("Run", ShowActionButtons, info)}`;
			default:
				return "";
		}
	}
	function ShowItemsList() {
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
				} else {
					string += "\n";
					for (var p of item.param) {
						string += styleButton(p.name, (id) => {
							ItemInfo[item.use](item, id);
							ShowItemsList();
						}, p.id);
					}
				}
			}
			string += styleButton("Drop", (item2) => {
				ItemInfo.RemoveThis(item2);
				ShowItemsList();
			}, item);
		}
		SendMessageToSelf(string, "items", false);
	}
	function ShowMissionProcess() {
		var pdi = PlayerDroneInfo();
		ShowMissionsString(pdi.missions, "Mission list:");
	}
	function ShowMissionsString(missions, head) {
		var string = head;
		for (var mission of missions) {
			string += "\n";
			string += mission.text + ": " + mission.desc;
			if (mission.target != void 0 && mission.progress != void 0) {
				string += ` (${mission.progress}/${mission.target})`;
			}
		}
		SendMessageToSelf(string, "missions", false);
	}
	function FindPlayerHint() {
		var input = document.getElementById("InputChat");
		input.value = "/DTS findtarget []";
		SendMessageToSelf("Enter the target ID inside the brackets and send the command or touch the target collar (including yourself)");
	}
	function DoFindTatget(target2, param = null) {
		SendDTSMsg(target2, new MsgInfo("RequestStatus", param));
	}
	function SendMissionHelp(info) {
		SendDTSMsg(info, new MsgInfo("SendMissionHelp", Object.assign([], PlayerDroneInfo().missions)));
		SendMessageToSelf("Mission help request sent!");
	}
	function SetMissionToDrone(info) {
		SendDTSMsg(info, new MsgInfo("PutMission", null));
		SendMessageToSelf("Mission assignment command sent!");
	}
	async function GoToFacility() {
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
			SearchDescs: Player.ChatSearchSettings.SearchDescriptions
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
		} else if (ChatRoomData.Admin.indexOf(Player.MemberNumber) != -1) {
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
	async function ExitFromStack() {
		var pdi = PlayerDroneInfo();
		if (pdi.isDrone) {
			SendMessageToSelf(`Drone rescue costs 20 credit quota. If you have less than 20, it will go negative. ${styleButton("Run", DoExitFromStack, 20)}`);
		} else {
			SendMessageToSelf(`Rescue costs 5 credit quota. If you have less than 5, it will go negative. ${styleButton("Run", DoExitFromStack, 20)}`);
		}
	}
	async function DoExitFromStack(price) {
		var pdi = PlayerDroneInfo();
		SendMessageToSelf(styleProgressBar("Calling", "Complete", 120 * 1e3, async () => {
			RemoveRestrains(Player);
			await sleep(1e3);
			await RefreshBinds(true);
			await sleep(1e3);
			if (ChatRoomData?.MapData?.Objects?.startsWith("ҴӄӃҶұҳҹ")) {
				MovePlayer({ X: 1, Y: 37 });
			}
			pdi.coin -= price;
		}));
	}
	async function JoinRoom(RoomName) {
		await ChatRoomAttemptLeave();
		await sleep(1e3);
		await ServerRoomJoin(RoomName);
		await sleep(1e3);
		await waitFor(() => {
			return ChatRoomData != null;
		});
	}
	function GetMission(pdi, missionStr = null) {
		var missionLists = [
			["StockRoomMission", "OrgasmMission", "SpankMission", "PetHeadMission", "ChargeMission"],
			["StockRoomMission", "OwnerSpankMission", "OwnerPetHeadMission"]
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
	function TakeMission(missionStr = null) {
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
	function SetDisplayTalk(info) {
		SendDTSMsg(info, new MsgInfo("SetDisplayTalk", !info.disPlayTalk));
		SendMessageToSelf("Command sent: target Drone display screen set to " + (info.disPlayTalk ? "Off" : "On"));
	}
	function ShowVoiceCommand(info = null) {
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
	function DoBatteryHelp(target2, type) {
		var char = ChatRoomCharacter.find((c) => c.MemberNumber === target2.MemberNumber);
		if (!char) {
			SendMessageToSelf("Target lost");
			return;
		}
		if (ChatRoomIsViewActive("Map") && !ChatRoomMapViewCharacterOnInteractionRange(char)) {
			SendMessageToSelf("Target is too far away!");
			return;
		}
		var diff2 = 0;
		var pdi = PlayerDroneInfo();
		switch (type) {
			case 0:
				{
					SendActionText(`Drone ${Player.MemberNumber} presses her lower abdomen against Drone ${target2.MemberNumber}'s. The power unit within the womb begins to transfer charge. The faint current causes their bodies to tremble slightly.`);
					SendMessageToSelf("Battery sharing complete");
					diff2 = Math.floor((target2.battery + pdi.battery) / 2) - target2.battery;
					pdi.battery -= diff2;
					SendDTSMsg(target2, new MsgInfo("BatteryCharge", diff2));
					SendDTSMsg(target2, new MsgInfo("AddArousal", 10));
					ActivityTimerProgress(Player, 10);
					RefreshBatteryTag();
					RefreshPlayerEffect();
				}
				break;
			case 1:
				{
					SendActionText(`${Player.Name} connects the power cable to the power port located between the legs of Drone ${target2.MemberNumber}. The current flows through the vaginal canal to the power source within her womb, causing her body to shudder.`);
					SendMessageToSelf("Charging complete");
					diff2 = target2.batteryMax - target2.battery;
					SendDTSMsg(target2, new MsgInfo("BatteryCharge", diff2));
					SendDTSMsg(target2, new MsgInfo("AddArousal", 30));
				}
				break;
			case 2:
				{
					if (pdi.battery >= pdi.batteryMax * 0.3) {
						SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target2.MemberNumber}. Since Drone ${target2.MemberNumber} already held a certain amount of charge, the crank spins on its own, rapidly draining a large amount of power.`);
					} else {
						SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target2.MemberNumber} and turns it vigorously. The kinetic energy converts into electrical energy, flowing through the vaginal canal to the power source inside the womb, while the kinetic and electrical energy cause her body to tremble violently.`);
					}
					SendMessageToSelf("Charging complete");
					diff2 = Math.floor(target2.batteryMax * 0.3) - target2.battery;
					SendDTSMsg(target2, new MsgInfo("BatteryCharge", diff2));
					SendDTSMsg(target2, new MsgInfo("AddArousal", 50));
				}
				break;
		}
	}
	function ReqDoPunishment(target2) {
		SendDTSMsg(target2, new MsgInfo("DoPunishment", null));
	}
	function ReqDoOrgasm(target2) {
		SendDTSMsg(target2, new MsgInfo("DoOrgasm", null));
	}
	function ShowPlayerEnterHelp() {
		if (showedEnterHelp) return;
		if (showChangeLog) {
			SendMessageToSelf(changeLog);
		}
		SendMessageToSelf(`Link to Drone Training System established. ${styleButton("Show status", ShowStatus)} ${styleButton("Available Functions", ShowActionButtons)}`, "", true);
		SendDTSMsg(null, new MsgInfo("HeartBeatPack", DTSHeartBeatPayload(true, PlayerDroneInfo().isDrone)));
		setShowedEnterHelp(true);
		var pdi = PlayerDroneInfo();
		var now = /* @__PURE__ */ new Date();
		var date = now.getFullYear() * 1e4 + (now.getMonth() + 1) * 100 + now.getDate();
		if (date > pdi.lastLoginDate) {
			if (pdi.isDrone) {
				SendMessageToSelf("Daily login reward: 5 quota points");
				pdi.coin += 5;
			} else {
				SendMessageToSelf("Daily login reward: 30 quota points");
				pdi.coin += 30;
			}
			pdi.todaysMission = 0;
			pdi.todaysWork = 0;
			pdi.lastLoginDate = date;
		}
	}
// #endregion
// #region drone.js

	// src/drone.js
	var Crate = {
		"Item": "FuturisticCrate",
		"AssetGroup": "ItemDevices",
		"Color": [
			"#222222",
			"Default",
			"#444444",
			"Default",
			"Default",
			"#FF1199",
			"Default",
			"#444444",
			"#555555",
			"#3B7F2C",
			"Default",
			"Default",
			"#BBBBFF",
			"Default"
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
	var CrateBind = {
		"Item": "FuturisticCrate",
		"AssetGroup": "ItemDevices",
		"Color": [
			"#222222",
			"Default",
			"#444444",
			"Default",
			"Default",
			"#FF1199",
			"Default",
			"#444444",
			"#555555",
			"#3B7F2C",
			"Default",
			"Default",
			"#BBBBFF",
			"Default"
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
	var OneBar = {
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
	var BasicDroneBinds = [
		// 0
		{
			"Item": "LatexCatsuit",
			"AssetGroup": "Suit",
			"TypeRecord": { "typed": 0 },
			"Color": ["#202020", "Default", "Default", "Default"],
			"Text": "",
			"Text2": "",
			"Text3": ""
		},
		{
			"Item": "LatexCatsuit",
			"AssetGroup": "SuitLower",
			"TypeRecord": { "typed": 0 },
			"Color": ["#202020", "Default", "Default", "Default"],
			"Text": "",
			"Text2": "",
			"Text3": ""
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
			"Description": "Implanted into the body's shoulders, back, and abdomen; high-torque servos control Drone posture to prevent movement errors",
			"MemberName": "Drone master-control core",
			"MemberNumber": 50051
		},
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
			"Description": "Implanted into the body's shoulders, back, and abdomen; high-torque servos control Drone posture to prevent movement errors",
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
			"Description": "The Drone main power supply supports basic activity; the external power interface can receive external charging or orgasm-based charging",
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
			"Description": "Implanted in the nipples; uses physical vibration to induce arousal for hormone regulation",
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
			"Description": "Implanted in the anus; uses physical vibration to induce arousal for hormone regulation",
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
			"Description": "Implanted in the clitoris; uses physical vibration to induce arousal for hormone regulation",
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
			"Description": "Implanted in the nipples; uses electric current to punish Drone errors",
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
			"Description": "Implanted in the lower abdomen; controls all internal-cycle devices and includes orgasm-function restriction",
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
			"Description": "Implanted in the chest; monitors temperature, heart rate, and arousal for physiological regulation",
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
			"Description": "Connected to the ankles; prevents unauthorized movement and can assist movement when needed",
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
			"Description": "Connected to the legs; prevents unauthorized movement and can assist movement when needed",
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
			"Description": "Connected to the hands; prevents unauthorized movement and can assist movement when needed",
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
			"Description": "Connected to the feet; prevents unauthorized movement and can assist movement when needed",
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
			"Description": "Connected to the arms; prevents unauthorized movement and can assist movement when needed",
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
			"Description": "Implanted on the face; disables the body's original facial identification and uses a barcode instead",
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
			"Description": "Connected to the mouth and digestive system; allows Drone nutrition blocks and can be used sexually",
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
			"Description": "Connected to the face and visual system; receives system instructions directly and can block excess visual information",
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
			"Description": "Connected to the nasal cavity and respiratory system; limits breathing to medicated Drone gas and blocks mouth breathing",
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
			"Description": "Connected to the ears and auditory system; continuously plays training courses and can block excess audio",
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
			"Description": "Implanted at the neck; uses electric current to punish Drone errors",
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
			"Description": "Implanted at the neck; displays Drone output and shows remaining battery when idle",
			"MemberName": "Drone master-control core",
			"MemberNumber": 50051
		},
		// 23
		{
			"Item": "Antenna",
			"AssetGroup": "HairAccessory1",
			"TypeRecord": { "typed": 5 },
			"Color": [
				"#8F8F8F",
				"#000000",
				"#131313",
				"#FF5AC8",
				"#FF5AC8",
				"#8F8F8F",
				"#000000",
				"#131313",
				"#FF5AC8",
				"#FF5AC8"
			]
		}
	];
	var BasicDroneeyes = [
		[{ "Item": "InteractiveVisor", "AssetGroup": "ItemHead", "TypeRecord": { "typed": 0 } }],
		[{
			"Item": "InteractiveVisor",
			"AssetGroup": "ItemHead",
			"TypeRecord": { "typed": 1 },
			"OverridePriority": { "Base": 12, "EyeRegularShine": 0, "Shine": 12, "Text": 12, "EyeRegular": 0 }
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
		[{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis", "TypeRecord": { "o": 1 } }]
	];
	var BasicDronehands = [
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
		]
	];
	var BasicDroneSet = {
		Binds: BasicDroneBinds,
		eyes: BasicDroneeyes,
		ears: BasicDroneears,
		mouth: BasicDronemouth,
		body: BasicDronebody,
		hands: BasicDronehands,
		legs: BasicDronelegs
	};
	var AllEquipSets = {
		BasicDrone: BasicDroneSet
	};
	var shockItems = [
		{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis" },
		{ "Item": "ShockClamps", "AssetGroup": "ItemNipples" },
		{ "Item": "ShockCollar", "AssetGroup": "ItemNeck" }
	];
	var vibeItem = [
		{ "Item": "SciFiPleasurePanties", "AssetGroup": "ItemPelvis" },
		{ "Item": "FuturisticVibrator", "AssetGroup": "ItemVulva" },
		{ "Item": "VibeHeartClitPiercing", "AssetGroup": "ItemVulvaPiercings" },
		{ "Item": "LockingVibePlug", "AssetGroup": "ItemButt" },
		{ "Item": "VibeHeartPiercings", "AssetGroup": "ItemNipplesPiercings" }
	];
	function RemoveClothes(sender2, refresh = true, removeUnderwear = true, removeCosplay = false) {
		CharacterNaked(sender2);
		if (refresh == true) {
			CharacterLoadEffect(sender2);
			ChatRoomCharacterUpdate(sender2);
		}
	}
	function RemoveRestrains(sender2, refresh = true) {
		RemoveRestrainsWithAssetGroup(sender2, AssetGroup, refresh);
	}
	function RemoveRestrainByOneAssetGroup(sender2, assetGroup, refresh = true) {
		RemoveRestrainsWithAssetGroup(sender2, [assetGroup], refresh);
	}
	function RemoveRestrainsWithAssetGroup(sender2, group, refresh = true) {
		if (sender2 == null) return;
		for (var ag of group) {
			if ((ag.Name ?? false) == false) {
				if (ag.startsWith("Item")) {
					InventoryRemove(sender2, ag);
				}
			} else {
				if (ag.Name.startsWith("Item")) {
					InventoryRemove(sender2, ag.Name);
				}
			}
		}
		if (refresh == true) {
			CharacterLoadEffect(sender2);
			ChatRoomCharacterUpdate(sender2);
		}
	}
	async function WearEquips(target2, EquipList, refresh = true, craft = true, difficulty = 1e3) {
		var sender2 = ChatRoomGetCharacter(target2.MemberNumber);
		if (sender2 == void 0) return;
		var pushList = [];
		for (let i = 0; i < EquipList.length; i++) {
			let res = Object.assign({}, EquipList[i]);
			const ID = CharacterAppearanceGetCurrentValue(sender2, res.AssetGroup, "ID");
			if (ID != "None") {
				sender2.Appearance.splice(ID, 1);
			}
			let colors = [];
			if (res.Color != void 0) {
				if (Array.isArray(res.Color)) {
					colors = Object.assign([], res.Color);
				} else {
					colors = res.Color.replace(/\s*/g, "").split(",");
				}
			} else {
				colors = CharacterAppearanceGetCurrentValue(sender2, res.AssetGroup, "Color");
			}
			const A = AssetGet(sender2.AssetFamily, res.AssetGroup, res.Item);
			if (A != null) {
				let item = {
					Asset: A,
					Color: colors,
					Difficulty: difficulty
				};
				ExtendedItemInit(sender2, item, false, false);
				pushList.push(item);
			}
		}
		sender2.Appearance.push(...pushList);
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
				InventoryCraft(sender2, sender2, localAssetGroup, res, false, true, false);
				await sleep(100);
			}
		}
		if (refresh) {
			CharacterLoadEffect(sender2);
			ChatRoomCharacterUpdate(sender2);
		}
	}
	function RefreshPlayerEffect(sender2 = Player) {
		CharacterLoadEffect(sender2);
		ChatRoomCharacterUpdate(sender2);
	}
	async function DoPunishment(power, count) {
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
				var index = Math.floor(Math.random() * itemsCanShock.length);
				PropertyShockPublishAction(Player, itemsCanShock[index]);
				sleep(300);
			}
			pdi.battery -= pdi.punishBatteryCost;
		} else {
			SendMessageToSelf(`No usable shock device found. Punishment failed!`);
		}
	}
	async function DoVibe(power, skipCheck = false) {
		if (CheckPlayerDroneInfoExistAndIsDrone() == false && !skipCheck) return;
		var itemsCanVibe = [];
		for (var bind of vibeItem) {
			var geted = InventoryGet(Player, bind.AssetGroup);
			var tr = Object.assign({}, geted.Property.TypeRecord);
			if (geted == null || geted.Asset.Name == bind.Item) {
				if (tr.vibrating != void 0) {
					tr.vibrating = power;
				} else if (tr.i != void 0) {
					tr.i = power;
				}
				itemsCanVibe.push(geted);
				ExtendedItemSetOptionByRecord(Player, geted, tr);
			}
		}
		if (itemsCanVibe.length > 0) {
			SendMessageToSelf(`Vibration device intensity set to ${power}`);
			RefreshPlayerEffect();
		} else {
			SendMessageToSelf(`No usable vibration device found. Vibe setting failed`);
		}
	}
	async function DoOrgasm(showText = true) {
		if (showText) {
			SendMessageToSelf(`Executing forced orgasm`);
		}
		ActivityTimerProgress(Player, 10);
		ActivityOrgasmPrepare(Player);
	}
	function DoSetBodyOrBindStatus(type, part, level, sender2) {
		if (type == -1 || part == -1 || level == -1) return;
		var Drone = PlayerDroneInfo();
		if (Drone[typeStrings[type]] != void 0 && Drone[typeStrings[type]][bodyPartStrings[part]] != void 0) {
			Drone[typeStrings[type]][bodyPartStrings[part]] = level;
			if (part == 3) {
				SendMessageToSelf(`${ArousalDisplayStrings[type]} was set by ${sender2.Name} to ${[bindLevelStrings, bodyLevelStrings][0][level]}`);
				if (type == 1) {
					DoVibe(level * 2, true);
				}
			} else {
				SendMessageToSelf(`${bodyPartDisplayStrings[part] + typeDisplayStrings[type]} was set by ${sender2.Name} to ${[bindLevelStrings, bodyLevelStrings][type][level]}`);
			}
			RefreshBinds(true);
		}
	}
	function RefreshBatteryTag() {
		if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
		var pdi = PlayerDroneInfo();
		var tag = InventoryGet(Player, "ItemNeckAccessories");
		if (tag?.Property?.Text != void 0) {
			var percent = Math.floor(pdi.battery * 100 / pdi.batteryMax);
			tag.Property.Text = percent.toString();
			if (percent > 50) {
				tag.Color[0] = "#40812c";
			} else if (percent > 20) {
				tag.Color[0] = "#cccc33";
			} else {
				tag.Color[0] = "#cc3333";
			}
		}
	}
	function HintBatteryHelp() {
		SendMessageToSelf("Battery low. You can ask nearby players for " + styleButton("help", SendBatteryHelp) + "Charging");
	}
	function SendBatteryHelp() {
		SendDTSMsg(null, new MsgInfo("BatteryHelp", null));
	}
	function ResponseBatteryCharge(param) {
		var pdi = PlayerDroneInfo();
		pdi.battery += param;
		if (pdi.battery > pdi.batteryMax) {
			pdi.battery = pdi.batteryMax;
		}
		RefreshBatteryTag();
		RefreshPlayerEffect();
	}
	async function RefreshBinds(canRefresh = false) {
		var nowDate = /* @__PURE__ */ new Date();
		if (nowDate - lastRefreshBindsTime <= 1e3) return;
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
				if (geted == null || geted.Asset.Name != bind.Item || geted.Craft == void 0) {
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
		} catch {
		}
		setIsRefreshBinding(false);
	}
	function DTSMigrateLegacySettings() {
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
	function DTSSyncSettings() {
		ServerPlayerExtensionSettingsSync(DTS_SETTINGS_KEY);
	}
	var DroneInfo = class _DroneInfo {
		constructor() {
			this.scriptVersion = Number(script_version.split(".").slice(0, 2).join("."));
			this.MemberNumber = Player.MemberNumber;
			this.isDrone = false;
			this.isOwner = false;
			this.level = 0;
			this.type = "BasicDrone";
			this.battery = 1e3;
			this.batteryMax = 1e3;
			this.moveBatteryCost = 1;
			this.chatBatteryCost = 50;
			this.miniteBatteryCost = 10;
			this.punishBatteryCost = 100;
			this.orgasmBatteryGet = 100;
			this.shockLevel = 1;
			this.shockCount = 3;
			this.coin = 0;
			this.ownerId = -1;
			this.bodyStatus = { eyes: 0, ears: 0, mouth: 0, body: 0, hands: 0, legs: 0 };
			this.bodyStatusMax = { eyes: 0, ears: 0, mouth: 0, body: 0, hands: 0, legs: 0 };
			this.bindStatus = { eyes: 0, ears: 0, mouth: 0, body: 0, hands: 0, legs: 0 };
			this.disPlayTalk = false;
			this.facilityMapEntered = false;
			this.items = [];
			this.itemsMax = 3;
			this.missions = [];
			this.missionsMax = 3;
			this.modifys = /* @__PURE__ */ new Map();
			this.lastLoginDate = 0;
			this.todaysMission = 0;
			this.todaysWork = 0;
			this.workMax = 30;
			this.sleepUntil = null;
		}
		FromPlayerSetting() {
			DTSMigrateLegacySettings();
			if (Player.ExtensionSettings[DTS_SETTINGS_KEY] != void 0) {
				return Player.ExtensionSettings[DTS_SETTINGS_KEY];
			}
			return new _DroneInfo();
		}
		SaveToPlayerSetting() {
			Player.ExtensionSettings[DTS_SETTINGS_KEY] = this;
			DTSSyncSettings();
		}
	};
	function addMissingProperties(target2, source) {
		for (let key in source) {
			if (source.hasOwnProperty(key) && !target2.hasOwnProperty(key)) {
				target2[key] = source[key];
			}
		}
		return target2;
	}
	function PlayerDroneInfo() {
		DTSMigrateLegacySettings();
		if (!Player.ExtensionSettings[DTS_SETTINGS_KEY]) {
			Player.ExtensionSettings[DTS_SETTINGS_KEY] = new DroneInfo();
			DTSSyncSettings();
		} else if (!Number.isFinite(Number(Player.ExtensionSettings[DTS_SETTINGS_KEY].scriptVersion)) || Number(Player.ExtensionSettings[DTS_SETTINGS_KEY].scriptVersion) < new DroneInfo().scriptVersion) {
			addMissingProperties(Player.ExtensionSettings[DTS_SETTINGS_KEY], new DroneInfo());
			setShowChangeLog(true);
			Player.ExtensionSettings[DTS_SETTINGS_KEY].scriptVersion = new DroneInfo().scriptVersion;
			DTSSyncSettings();
		}
		return Player.ExtensionSettings[DTS_SETTINGS_KEY];
	}
	function CheckPlayerDroneInfoExistAndIsDrone() {
		var pdi = PlayerDroneInfo();
		if (pdi === void 0) return false;
		return pdi.isDrone;
	}
	async function StartDrone() {
		var waitTime = 2e3;
		var waitTimeShort = 1e3;
		SendMessageToSelf(`Received body-to-Drone registration request. Starting Drone conversion sequence...`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting upgrade-unit deployment...
${styleProgressBar("Deploying", "Deployment complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, [Crate]);
		SendMessageToSelf(`Upgrade unit deployed! Body containment complete!`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting solvent spray...
${styleProgressBar("Spraying", "Spray complete", waitTime)}`);
		await sleep(waitTime);
		RemoveClothes(Player, false);
		var group = Object.assign([], AssetGroup);
		group = group.filter((item) => item.Name !== "ItemDevices");
		RemoveRestrainsWithAssetGroup(Player, group);
		RefreshPlayerEffect();
		SendMessageToSelf(`Body clothing and restraints dissolved!`);
		await sleep(waitTime);
		SendMessageToSelf(`Applying new body restraint...
${styleProgressBar("Restraining", "Restraint complete", waitTime)}`);
		await sleep(waitTime);
		ExtendedItemSetOptionByRecord(Player, InventoryGet(Player, Crate.AssetGroup), {
			"w": 1,
			"l": 3,
			"a": 3,
			"d": 0,
			"t": 0,
			"h": 0
		});
		await sleep(waitTime);
		SendMessageToSelf(`Body restraint complete!`);
		await sleep(waitTimeShort);
		SendMessageToSelf(`Starting latex coating...
${styleProgressBar("Coating", "Coating complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(0, 2));
		SendMessageToSelf(`Latex coating complete!`);
		await sleep(waitTimeShort);
		SendMessageToSelf(`Starting main power supply installation...
${styleProgressBar("Installing", "Installation failed", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`Main power supply installation failed! Estimated cause: Anxiety-induced body skeletal-muscle tremors and vaginal obstruction.`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting posture-control device installation...
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(2, 4));
		SendMessageToSelf(`Posture-control device implanted in the body's shoulders, back, and abdomen. Installation complete!`);
		await sleep(waitTime);
		SendMessageToSelf(`Posture-control device started on external power, actively suppressing body skeletal-muscle tremors.
${styleProgressBar("Starting", "Startup complete", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting main power supply installation: Inserting installation tube into the vagina...`);
		ExtendedItemSetOptionByRecord(Player, InventoryGet(Player, Crate.AssetGroup), {
			"w": 1,
			"l": 3,
			"a": 3,
			"d": 1,
			"t": 0,
			"h": 0,
			"d1": 0
		});
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		SendMessageToSelf(`Vaginal dilation smooth! Inserting the main power installation tube further...`);
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		SendMessageToSelf(`Main power installation tube reached the cervix! Starting insertion of main power supply into the uterus...
${styleProgressBar("Inserting", "Insertion complete", waitTime)}`);
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		SendMessageToSelf(`Main power supply inserted successfully! Starting battery-fluid injection...
${styleProgressBar("Injecting", "Injection complete", waitTime)}`);
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		SendMessageToSelf(`Injection smooth! Main power supply expansion rate increasing normally...
${styleProgressBar("Injecting", "Injection abnormal", waitTime)}`);
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		SendMessageToSelf(`Main power supply expansion obstruction detected. Estimated cause: It has expanded to fill the uterus...`);
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		SendMessageToSelf(`Increasing battery-fluid injection pressure! Main power supply expansion rate is slow...
${styleProgressBar("Injecting", "Injection complete", waitTime)}`);
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		SendMessageToSelf(`Battery-fluid injection complete! Main power supply fully expanded! Sealing injection port and connecting power interface!`);
		await sleep(waitTime);
		ActivityTimerProgress(Player, 10);
		WearEquips(Player, BasicDroneBinds.slice(4, 5));
		ExtendedItemSetOptionByRecord(Player, InventoryGet(Player, Crate.AssetGroup), {
			"w": 1,
			"l": 3,
			"a": 3,
			"d": 0,
			"t": 0,
			"h": 0
		});
		SendMessageToSelf(`Main power installation tube withdrawn. Power interface expanded to fill the vagina. Main power installation complete. Starting orgasm-charging test...`);
		await sleep(waitTime);
		DoOrgasm();
		await sleep(waitTime * 3);
		SendMessageToSelf(`Main power supply charged successfully! Orgasm-charging test complete!`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting internal-cycle control device installation...
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(5, 9));
		SendMessageToSelf(`Internal-cycle control device implanted in the body's nipples, clitoris, and anus. Installation complete!`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting internal-cycle master control system and physiological monitor installation...
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(9, 11));
		SendMessageToSelf(`Master control system implanted in the lower abdomen! Physiological monitor implanted in the chest! Starting function test...`);
		await sleep(waitTime);
		DoVibe(2, true);
		SendMessageToSelf(`Internal-cycle control device started... Vibration function normal! Physiological monitor detected increased temperature and heart rate. Monitoring function normal!`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting motion-control device installation...
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(11, 16));
		SendMessageToSelf(`Motion-control device implanted in the body's hands, arms, legs, ankles, and feet. Installation complete!`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting individual-identification device installation...
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(16, 17));
		SendMessageToSelf(`Individual-identification device implanted in the face. Printing Drone ID on the device...`);
		await sleep(waitTime);
		SendMessageToSelf(`Abnormal body movement detected! Estimated cause: Panic from body hypoxia`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting motion-control device to suppress abnormal body movement...
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting installation of visual, auditory, digestive, and respiratory external interfaces on the identification device.
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(17, 21));
		SendMessageToSelf(`External interface installation complete! Abnormal body movement eased.`);
		await sleep(waitTime);
		SendMessageToSelf(`Starting display and signal receiver installation...
${styleProgressBar("Installing", "Installation complete", waitTime)}`);
		await sleep(waitTime);
		WearEquips(Player, BasicDroneBinds.slice(21, 24));
		SendMessageToSelf(`Display installation complete! Signal receiver installation complete!`);
		await sleep(waitTime);
		SendMessageToSelf(`All devices installed! Drone registration complete! Starting Drone education program...`);
		await sleep(waitTime);
		SendMessageToSelf(`@$@##$%$%$
${styleProgressBar("@$@##", "$%$%$", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`#@#%$##$%%
${styleProgressBar("#@#%", "##$%%", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`#@$%#@$%#@
${styleProgressBar("#@$%#", "@$%#@", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`@#$$$%%%$$
${styleProgressBar("@#$$$", "%%%$$", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`#$%%%$%$$@
${styleProgressBar("#$%%%", "$%$$@", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`@@@#%$#@@%
${styleProgressBar("@@@#%", "$#@@%", waitTime)}`);
		await sleep(waitTime);
		SendMessageToSelf(`Drone education program complete! Drone conversion sequence fully complete! Releasing Drone...`);
		InventoryRemove(Player, Crate.AssetGroup);
		RefreshPlayerEffect();
		PlayerDroneInfo().isDrone = true;
		SendDTSMsg(sender, new MsgInfo("HeartBeatPack", DTSHeartBeatPayload(false, PlayerDroneInfo().isDrone)));
	}
	function SetToDrone(target2, isUndo) {
		if (target2.MemberNumber == Player.MemberNumber) {
			if (!isUndo) {
				StartDrone();
			}
		} else {
			SendDTSMsg(target2, new MsgInfo("ReqOwnerRight", isUndo));
			SendMessageToSelf(`Command sent`);
		}
	}
	function SetToDroneAccept(targetChar) {
		PlayerDroneInfo().ownerId = targetChar.MemberNumber;
		SendDTSMsg(targetChar, new MsgInfo("RespOwnerRight", false));
	}
	function SetToOwner(target2, isUndo) {
		if (target2.MemberNumber == Player.MemberNumber) {
			PlayerDroneInfo().isOwner = !isUndo;
			SendMessageToSelf(`Operator status ${isUndo ? "revoked" : "registered"}!`);
		}
	}
	function SetIdentityHint(target2, isSetDrone, isUndo) {
		var pdi = PlayerDroneInfo();
		if (target2.MemberNumber == Player.MemberNumber && isSetDrone && isUndo && pdi.isDrone) {
			SendMessageToSelf("Drones may not unregister their own identity. Executing punishment!");
			DoPunishment(2, 3);
			return;
		}
		if (pdi.ownerId != -1 && pdi.ownerId != target2.MemberNumber) {
			SendMessageToSelf("Drones may not unregister their own identity. Executing punishment!");
			DoPunishment(2, 3);
			return;
		}
		if (target2.MemberNumber == Player.MemberNumber) {
			if (isSetDrone && !isUndo && !target2.isDrone) {
				SendMessageToSelf(`About to accept Drone conversion. Click: ${styleButton("Confirm", SetToDrone, target2, isUndo)}`);
				return;
			}
			if (!isSetDrone && !isUndo && !target2.isOwner) {
				SendMessageToSelf(`About to register as an Operator. Click: ${styleButton("Confirm", SetToOwner, target2, isUndo)}`);
				return;
			}
			if (!isSetDrone && isUndo && target2.isOwner) {
				SendMessageToSelf(`About to unregister Operator identity. Click: ${styleButton("Confirm", SetToOwner, target2, isUndo)}`);
				return;
			}
		} else {
			if (target2.ownerId == -1 || target2.ownerId == Player.MemberNumber) {
				if (isSetDrone && !isUndo && target2.isDrone) {
					SendMessageToSelf(`About to request control permission from them. Click: ${styleButton("Confirm", SetToDrone, target2, isUndo)}`);
					return;
				}
				if (isSetDrone && isUndo && target2.isDrone) {
					SendMessageToSelf(`About to clear control permission over them. Click: ${styleButton("Confirm", SetToDrone, target2, isUndo)}`);
					return;
				}
			} else {
				SendMessageToSelf(`You do not have permission to operate this Drone. Please contact the Operator ${target2.ownerId} to transfer operational permissions.`);
			}
		}
	}
	function SetStatusHint(info, type, part) {
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
	function SetStatusSend(info, type, part, level) {
		if (type == 1 && info.bodyStatusMax[bodyPartStrings[part]] < level && part != 3) {
			SendMessageToSelf("This Drone has not received the upgrade for that part and cannot be set to the specified state!");
			return;
		}
		SendDTSMsg(info, new MsgInfo("SetStatus", [type, part, level]));
		SendMessageToSelf("Set command sent");
	}
// #endregion
// #region hooks.js

	// src/hooks.js
	var hookMap = /* @__PURE__ */ new Map();
	var dtsModApi = null;
	var dtsModApiAttempted = false;
	function DTSGetModApi() {
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
		} catch (error) {
			console.warn("DTS: ModSDK registration failed; using legacy hooks.", error);
			dtsModApi = null;
		}
		return dtsModApi;
	}
	function DTSHookTarget(funcName, context) {
		if (context === Player) return `Player.${funcName}`;
		if (context == null || context === globalThis || context === window) return funcName;
		return null;
	}
	function DTSInstallLegacyHook(funcName, context, beforeFn, afterFn, tag = "") {
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
		const hookedFn = function(...args2) {
			let result;
			let skipOriginal = false;
			for (const before of Object.values(entry.beforeFnList)) {
				const beforeResult = before.apply(this, args2);
				if (beforeResult !== void 0) {
					result = beforeResult;
					skipOriginal = true;
				}
			}
			if (!skipOriginal) result = entry.originalFn.apply(this, args2);
			for (const after of Object.values(entry.afterFnList)) {
				result = after.call(this, result, ...args2);
			}
			return result;
		};
		ctx[funcName] = hookedFn;
		return hookedFn;
	}
	function InstallHook(funcName, context, beforeFn, afterFn, tag = "") {
		const modApi = DTSGetModApi();
		const target2 = DTSHookTarget(funcName, context);
		if (modApi && target2 && typeof modApi.hookFunction === "function") {
			return modApi.hookFunction(target2, 0, function(args2, next) {
				const thisArg = context != null ? context : this ?? globalThis;
				let result;
				let skipOriginal = false;
				if (typeof beforeFn === "function") {
					const beforeResult = beforeFn.apply(thisArg, args2);
					if (beforeResult !== void 0) {
						result = beforeResult;
						skipOriginal = true;
					}
				}
				if (!skipOriginal) result = next(args2);
				if (typeof afterFn === "function") {
					result = afterFn.call(thisArg, result, ...args2);
				}
				return result;
			});
		}
		return DTSInstallLegacyHook(funcName, context, beforeFn, afterFn, tag);
	}
	function ChatRoomMessageReceived(result, data) {
		if (data != null && typeof data === "object" && data.Content != null && typeof data.Content === "string" && data.Content != "" && data.Sender != null && typeof data.Sender === "number") {
			var SenderCharacter = null;
			for (var C = 0; C < ChatRoomCharacter.length; C++)
				if (ChatRoomCharacter[C].MemberNumber == data.Sender) {
					SenderCharacter = ChatRoomCharacter[C];
					break;
				}
			if (SenderCharacter != null) {
				var pdi = PlayerDroneInfo();
				var msg = data.Content;
				while (msg.indexOf("<") > -1) msg = msg.replace("<", "&lt;");
				while (msg.indexOf(">") > -1) msg = msg.replace(">", "&gt;");
				if (data.Content == "DTS" && data.Type == "Hidden") {
					DoHiddenMessage(SenderCharacter, msg, data.Dictionary);
					return result;
				} else if (data.Type == "Activity") {
					if (data.Dictionary.length >= 4) {
						if (typeof data.Dictionary[0].SourceCharacter == "number" && typeof data.Dictionary[1].TargetCharacter == "number" && data.Dictionary[2].FocusGroupName && data.Dictionary[3].ActivityName) {
							GroupActivityReceived(data.Dictionary[0].SourceCharacter, data.Dictionary[1].TargetCharacter, data.Dictionary[2].FocusGroupName, data.Dictionary[3].ActivityName);
						}
					}
					if (data.Content.startsWith("Orgasm") && data.Dictionary.length >= 1 && typeof data.Dictionary[0].SourceCharacter == "number") {
						if (CheckPlayerDroneInfoExistAndIsDrone()) {
							if (data.Dictionary[0].SourceCharacter == Player.MemberNumber) {
								SendMessageToSelf("This unit's orgasm restored some power");
								MsgCmds["BatteryCharge"].Command(null, pdi.orgasmBatteryGet);
							} else {
								SendMessageToSelf("A nearby individual's orgasm restored a little power");
								MsgCmds["BatteryCharge"].Command(null, pdi.orgasmBatteryGet * 0.1);
							}
						}
						if (data.Dictionary[0].SourceCharacter == Player.MemberNumber) {
							SelfOrgasmed(data.Content.startsWith("OrgasmResist") || data.Content.startsWith("OrgasmFail"));
						}
					}
				} else if (data.Type == "Action" && msg == "ServerEnter" && SenderCharacter.MemberNumber == Player.MemberNumber) {
					PlayerEnterRoom();
				} else if (msg.startsWith("ServerLeave") || msg.startsWith("ServerDisconnect") || msg.startsWith("ServerBan") || msg.startsWith("ServerKick")) {
					if (charaterInstalledScript_isDrone[SenderCharacter.MemberNumber] != void 0) {
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
	var ActivityFunc = {
		ItemButtSpank: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
			if (param == 1) {
				if (charaterInstalledScript_isDrone[SourceCharacter] == void 0 || charaterInstalledScript_isDrone[SourceCharacter] == false) {
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
				if (charaterInstalledScript_isDrone[SourceCharacter] == void 0 || charaterInstalledScript_isDrone[SourceCharacter] == false) {
					MissionInfo.ProgressAdd("PetHead");
					var pdi = new PlayerDroneInfo();
					if (pdi.isDrone && pdi.modifys["training1"] == true) {
						RequirePoseinfo.RequireDronePose(["Kneel"], 2e4);
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
				if (charaterInstalledScript_isDrone[SourceCharacter] == void 0 || charaterInstalledScript_isDrone[SourceCharacter] == false) {
					var pdi = new PlayerDroneInfo();
					if (pdi.isDrone && pdi.modifys["training1"] == true) {
						RequireActivityinfo.RequireDroneActivity([], ["Caress"], 0, 2e4, 3);
					}
				}
			}
		},
		ItemMouthPinch: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
			if (param == 1) {
				if (charaterInstalledScript_isDrone[SourceCharacter] == void 0 || charaterInstalledScript_isDrone[SourceCharacter] == false) {
					var pdi = new PlayerDroneInfo();
					if (pdi.isDrone && pdi.modifys["training1"] == true) {
						RequirePoseinfo.RequireDronePose(["BaseLower", "LegsClosed"], 2e4);
						RequirePoseinfo.RequireDronePose(["BaseUpper"], 2e4);
					}
				}
			}
		},
		ItemPelvisPinch: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
			if (param == 1) {
				if (charaterInstalledScript_isDrone[SourceCharacter] == void 0 || charaterInstalledScript_isDrone[SourceCharacter] == false) {
					var pdi = new PlayerDroneInfo();
					if (pdi.isDrone && pdi.modifys["training2"] == true) {
						RequirePoseinfo.RequireDronePose(["LegsClosed"], 2e4);
						RequirePoseinfo.RequireDronePose(["BackBoxTie", "BackElbowTouch"], 2e4);
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
						if (character != void 0) {
							if (ChatRoomIsViewActive("Map") && !ChatRoomMapViewCharacterOnInteractionRange(character)) {
								return;
							}
							RequireActivityinfo.RequireDroneActivity([FocusGroupName], ["GaggedKiss"], 2, 2e4, 1);
						}
					}
				}
			}
		},
		ItemNeck: (param, SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) => {
			if (param == 0) {
				ShowStatus(PlayerDroneInfo());
			} else if (param == 1) {
				ResponseRequestStatus({ MemberNumber: SourceCharacter });
			}
		}
	};
	function GroupActivityReceived(SourceCharacter, TargetCharacter, FocusGroupName, ActivityName) {
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
	function SelfOrgasmed(Resist) {
		if (Resist) {
			MissionInfo.ProgressAdd("OrgasmResist");
		} else {
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
	function PlayerEnterRoom() {
		setShowedEnterHelp(false);
		resetCharaterInstalledScript();
		ShowPlayerEnterHelp();
	}
	function DoHiddenMessage(ChatRoomCharacter2, msg, dict) {
		if (charaterInstalledScript_isDrone[ChatRoomCharacter2.MemberNumber] == void 0) {
			charaterInstalledScript_isDrone[ChatRoomCharacter2.MemberNumber] = false;
		}
		MsgInfo.DoCmd(ChatRoomCharacter2, dict);
	}
	function DoVoiceCommand(ChatRoomCharacter2, msg) {
		var pdi = PlayerDroneInfo();
		var cmd = findIndices(msg, ["Show status", "Deploy charging crank", "Orgasm reward", "Shock punishment", "Set to ", "Display screen message"]);
		if (cmd >= 4 && pdi.ownerId != -1 && pdi.ownerId != ChatRoomCharacter2.MemberNumber) {
			SendActionText(`You do not have permission to operate this Drone. Please contact the Operator ${pdi.ownerId} to transfer operational permissions`, ChatRoomCharacter2);
			return;
		}
		switch (cmd[0]) {
			// Show status
			case 0:
				{
					ResponseRequestStatus(ChatRoomCharacter2);
				}
				break;
			// deploy charging crank
			case 1:
				{
					if (pdi.battery >= pdi.batteryMax * 0.3) {
						SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target.MemberNumber}. Since Drone ${target.MemberNumber} already held a certain amount of charge, the crank spins on its own, rapidly draining a large amount of power.`);
					} else {
						SendActionText(`${Player.Name} pops out the hand crank concealed within the power port at the crotch of Drone ${target.MemberNumber} and turns it vigorously. The kinetic energy converts into electrical energy, flowing through the vaginal canal to the power source inside the womb, while the kinetic and electrical energy cause her body to tremble violently.`);
					}
					diff = Math.floor(pdi.batteryMax * 0.3) - pdi.battery;
					MsgCmds["BatteryCharge"].Command(null, diff);
				}
				break;
			// Orgasm reward
			case 2:
				{
					DoOrgasm();
				}
				break;
			// Shock punishment
			case 3:
				{
					DoPunishment(pdi.shockLevel, pdi.shockCount);
				}
				break;
			// Set to
			case 4:
				{
					var typeDisplayStringsLocal = ["Restraint", "Function"];
					var bodyPartDisplayStringsLocal = ["Eyes", "Ears", "Mouth", "Body", "Hands", "Legs"];
					var bindLevelStringsLocal = ["Off", "On", "Maximum"];
					var bodyLevelStringsLocal = ["Available", "Restricted", "Offline"];
					var ArousalDisplayStringsLocal = ["Orgasm limit", "Pleasure device"];
					var params = findIndices(msg, typeDisplayStringsLocal, bodyPartDisplayStringsLocal, bindLevelStringsLocal, bodyLevelStringsLocal, ArousalDisplayStringsLocal);
					switch (params[0]) {
						case 0:
							{
								DoSetBodyOrBindStatus(0, params[1], params[2], ChatRoomCharacter2);
								return;
							}
							break;
						case 1:
							{
								DoSetBodyOrBindStatus(1, params[1], params[3], ChatRoomCharacter2);
								return;
							}
							break;
					}
					switch (params[4]) {
						case 0:
							{
								DoSetBodyOrBindStatus(0, 3, params[2], ChatRoomCharacter2);
								return;
							}
							break;
						case 1:
							{
								DoSetBodyOrBindStatus(1, 3, params[2], ChatRoomCharacter2);
								return;
							}
							break;
					}
				}
				break;
			// Display screen message
			case 5:
				{
					var params = findIndices(msg, ["Open", "Off"]);
					if (params[0] != -1) {
						ResponseSetDisplayTalk(ChatRoomCharacter2, params[0] == 0);
					}
				}
				break;
		}
	}
	function ChatRoomMapViewUpdatePlayerFlagAfter(result, UpdateTimeOffset) {
		DTSPlayerMoved();
		PlayerMovedFaci();
	}
	function DTSPlayerMoved() {
		if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
		var pdi = PlayerDroneInfo();
		pdi.battery -= pdi.moveBatteryCost;
	}
	function CanWalkAfter(result) {
		if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
		var pdi = PlayerDroneInfo();
		var droneResult = !(pdi.battery <= pdi.batteryMax * 0.2 || pdi.bodyStatus.legs >= 1);
		return result && droneResult;
	}
	function IsMountedAfter(result) {
		if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
		var pdi = PlayerDroneInfo();
		var droneResult = pdi.battery <= 0 || pdi.bodyStatus.legs >= 2;
		return result || droneResult;
	}
	function GetBlindLevelAfter(result) {
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
	function GetDeafLevelAfter(result) {
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
	function CanInteractAfter(result) {
		if (isRefreshBinding) {
			return true;
		}
		if (CheckPlayerDroneInfoExistAndIsDrone() == false) return result;
		var pdi = PlayerDroneInfo();
		var droneResult = !(pdi.battery <= pdi.batteryMax * 0.2 || pdi.bodyStatus.hands >= 1);
		return result && droneResult;
	}
	function DialogCanUnlockBefore() {
		if (isRefreshBinding) {
			return true;
		}
	}
	function SpeechTransformDeafenIntensityBefore(C) {
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
	function ChatRoomSendChatMessageBefore(msg) {
		if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
		var pdi = PlayerDroneInfo();
		if (pdi.battery <= 0) {
			HintBatteryHelp();
			return true;
		}
		if (pdi.disPlayTalk) {
			if (pdi.battery <= 0 || pdi.bodyStatus.mouth == 2) {
				SendActionText("The indicator light on 'Drone'" + Player.MemberNumber + "flashes. It attempted to speak but failed.");
			} else {
				if (pdi.modifys["education1"]) {
					msg.replace(/I|Me|We|Our/g, "This unit");
					msg.replace(Player.Name, `Drone ${Player.MemberNumber}`);
				}
				SendActionText(`Drone ${Player.MemberNumber}'s display shows:
` + msg);
				pdi.battery -= pdi.chatBatteryCost;
				return true;
			}
		}
	}
	function ChatRoomPlayerIsAdminBefore() {
		if (CheckPlayerDroneInfoExistAndIsDrone() == false) return;
		if (ChatRoomData?.MapData?.Objects?.startsWith("ҴӄӃҶұҳҹ") && ChatRoomData?.Name?.startsWith("DroneFacility")) return false;
	}
	function ServerShowBeepBefore(message, duration, options, title) {
		if (PlayerDroneInfo() === void 0) return;
		if (message.startsWith("DTSBeep")) {
			var memberNumber = -1;
			memberNumber = options.memberNumber;
			var params = message.split(" ");
			if (params.length > 2) {
				MsgInfo.DoBeepCmd(memberNumber, new MsgInfo(params[1], params.slice(2)), options);
			} else {
				MsgInfo.DoBeepCmd(memberNumber, new MsgInfo(params[1], null), options);
			}
			return 0;
		}
	}
	function ChatRoomFirstTimeHelpBefore() {
		if (!ChatRoomHelpSeen) {
			ShowPlayerEnterHelp();
		}
	}
// #endregion
// #region utils.js

	// src/utils.js
	function sleep(time) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}
	async function waitFor(func2, cancelFunc = () => false) {
		while (!func2()) {
			if (cancelFunc()) {
				return false;
			}
			await sleep(10);
		}
		return true;
	}
	function findIndices(str, ...strArrays) {
		var map2 = strArrays.map(
			(arr) => arr.map((s) => str.indexOf(s))
		);
		var result = [];
		for (var i = 0; i < map2.length; i++) {
			var found = false;
			for (var j = 0; j < map2[i].length; j++) {
				if (map2[i][j] != -1) {
					found = true;
					result.push(j);
					break;
				}
			}
			if (found == false) {
				result.push(-1);
			}
		}
		return result;
	}
	function IsInZone(Pos, Zone) {
		var isIn = false;
		for (let areaKey in Zone.Areas) {
			if (IsInArea(Pos, Zone.Areas[areaKey])) {
				isIn = areaKey;
				break;
			}
		}
		if (isIn) {
			for (let areaKey in Zone.Exclude) {
				if (IsInArea(Pos, Zone.Exclude[areaKey])) {
					isIn = false;
					break;
				}
			}
		}
		return isIn;
	}
	function IsInArea(Pos, Area) {
		var isIn = false;
		if (Area.X != void 0) {
			isIn = IsAtTile(Pos, Area);
		} else if (Area.leftUp != void 0) {
			isIn = IsInLURD(Pos, Area);
		} else if (Area instanceof Array) {
			isIn = IsAtTileArray(Pos, Area);
		}
		return isIn;
	}
	function IsAtTile(Pos, Tile) {
		return Pos.X == Tile.X && Pos.Y == Tile.Y;
	}
	function IsInLURD(Pos, LURD) {
		return Pos.X >= LURD.leftUp.X && Pos.Y >= LURD.leftUp.Y && Pos.X <= LURD.rightDown.X && Pos.Y <= LURD.rightDown.Y;
	}
	function IsAtTileArray(Pos, Tiles) {
		for (var tile of Tiles) {
			if (IsAtTile(Pos, tile)) {
				return true;
			}
		}
		return false;
	}
	function RandomPosOfArea(Area) {
		if (Area.X != void 0) {
			return Object.assign({}, Area);
		} else if (Area.leftUp != void 0) {
			return {
				X: Math.floor(Math.random() * (Area.rightDown.X - Area.leftUp.X + 1)) + Area.leftUp.X,
				Y: Math.floor(Math.random() * (Area.rightDown.Y - Area.leftUp.Y + 1)) + Area.leftUp.Y
			};
		} else if (Area instanceof Array) {
			return Object.assign({}, Area[Math.floor(Math.random() * Area.length)]);
		}
	}
	function MovePlayer(Pos, triggerPlayerMoved = false) {
		if (Pos.X == void 0 || Pos.Y == void 0) return;
		Player.MapData.Pos = Object.assign({}, Pos);
		ServerSend("ChatRoomCharacterMapDataUpdate", { Pos: Object.assign({}, Pos) });
		if (triggerPlayerMoved) {
			DTSPlayerMoved();
			PlayerMovedFaci();
		} else {
			setPverPos(Object.assign({}, Player.MapData.Pos));
		}
	}
	function DTSCloneSettings(settings) {
		try {
			if (typeof structuredClone === "function") return structuredClone(settings);
			return JSON.parse(JSON.stringify(settings));
		} catch (error) {
			console.warn("DTS: legacy settings could only be shallow-copied.", error);
			return Object.assign({}, settings);
		}
	}
	var clearLastTag = ["status", "items", "actions", "missions"];
	function ClearMessageByFunc(func2) {
		var elements = document.getElementById("TextAreaChatLog").children;
		for (let i = elements.length - 1; i >= 0; i--) {
			var remove = false;
			var child = elements[i];
			if (child?.children[1]?.dataset?.timestamp != false && child?.children[1]?.dataset?.timestamp != false) {
				if (func2(child) == true) {
					remove = true;
				} else {
					remove = false;
				}
			} else {
				remove = false;
			}
			if (remove) {
				elements[i].remove();
			}
		}
	}
	function ClearOldMessage() {
		ClearMessageByFunc((child) => {
			if (child?.children[1]?.dataset?.timestamp) {
				var diff2 = (/* @__PURE__ */ new Date()).getTime() - parseInt(child.children[1].dataset.timestamp);
				return diff2 > 120 * 1e3;
			} else {
				return false;
			}
		});
	}
	function ClearLastMessage() {
		ClearMessageByFunc((child) => {
			return child?.children[1]?.dataset?.clearatnext == "true";
		});
	}
	function ClearTagMessage(tag) {
		ClearMessageByFunc((child) => {
			return child?.children[1]?.dataset?.cleartag == tag;
		});
	}
	function ClearAllMessage() {
		ClearMessageByFunc((child) => {
			return true;
		});
	}
	function styleMessage(message, tag = "", cantClear = false, clearAtNext = false) {
		var timestamp = (/* @__PURE__ */ new Date()).getTime();
		if (cantClear) timestamp = false;
		const hiddenString = "styleMessage";
		ClearLastMessage();
		if (clearLastTag.findIndex((t) => {
			return t == tag;
		}) > -1) {
			ClearTagMessage(tag);
		}
		return `<div
		data-timestamp="${timestamp}"
		data-style-message="${hiddenString}"
		data-clearatnext="${clearAtNext}"
		data-cleartag="${tag}"
		style='
	background: #000000;
	padding: 8px;
	border: 1px solid #3C3C3C;
	box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
	font-family: Consolas, "Courier New", monospace;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	border-radius: 2px;
	color: #00FF00;
	display: flex;
	align-items: baseline;
	gap: 0.4em;
	line-height: 1.5;
'><span style="font-size: 1.2vw;">■</span><span style="
	font-size: 1.6vw;
	white-space: pre-wrap;
	flex: 1;
	line-height: inherit;
	margin: 0;
">${message}_</span></div>`;
	}
	function SendMessageToSelf(message, tag = "", cantClear = false, clearAtNext = false) {
		ChatRoomSendLocal(styleMessage(message, tag, cantClear, clearAtNext));
	}
	function SendActionText(message, target2 = null) {
		if (target2) {
			ServerSend("ChatRoomChat", {
				Content: "DTS_ACTION_TAG",
				Type: "Action",
				Dictionary: [
					{
						Tag: 'MISSING TEXT IN "Interface.csv": DTS_ACTION_TAG',
						Text: message
					}
				],
				Target: target2.MemberNumber
			});
		} else {
			ServerSend("ChatRoomChat", {
				Content: "DTS_ACTION_TAG",
				Type: "Action",
				Dictionary: [
					{
						Tag: 'MISSING TEXT IN "Interface.csv": DTS_ACTION_TAG',
						Text: message
					}
				]
			});
		}
	}
	var _buttonCallbacks = /* @__PURE__ */ new Map();
	var _globalListenerAttached = false;
	function styleButton(buttonText, clickHandler, ...extraArgs) {
		const escapeHtml = (text) => {
			const div = document.createElement("div");
			div.textContent = text;
			return div.innerHTML;
		};
		const safeText = escapeHtml(buttonText);
		const clickId = "btn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 8);
		if (typeof clickHandler === "function") {
			_buttonCallbacks.set(clickId, { handler: clickHandler, args: extraArgs });
		} else if (clickHandler !== void 0) {
			console.warn("styleButton: clickHandler must be a function, click binding ignored");
		}
		if (!_globalListenerAttached) {
			document.addEventListener("click", (event) => {
				const targetButton = event.target.closest("[data-click-id]");
				if (targetButton) {
					const id = targetButton.getAttribute("data-click-id");
					const callbackInfo = _buttonCallbacks.get(id);
					if (callbackInfo) {
						const { handler, args: args2 } = callbackInfo;
						handler.call(targetButton, ...args2);
					}
				}
			});
			_globalListenerAttached = true;
		}
		return `<button
				data-click-id="${clickId}"
				style="
						display: inline-flex;
						align-items: baseline;
						cursor: pointer;
						background: transparent;
						border: solid;
						border-color: #33CC33;
						border-width: 1px;
						color: #00FF00;
						transition: all 0.1s ease;
						white-space: nowrap;
						font-family: inherit;
				"
				onmouseover="this.style.background='rgba(0, 255, 0, 0.1)'; this.style.borderColor='#00FF00';"
				onmouseout="this.style.background='transparent'; this.style.borderColor='#33CC33';"
				onmousedown="this.style.background='rgba(0, 255, 0, 0.2)';"
				onmouseup="this.style.background='rgba(0, 255, 0, 0.1)'; this.style.borderColor='#00FF00';"
		>
				<span>▸</span>${safeText}
		</button>`;
	}
	var _textProgressManager = {
		items: /* @__PURE__ */ new Map(),
		intervalMs: 30,
		register(id, duration, onComplete, onCompleteParams, textSpan, messageSpan, container, completionMessage) {
			const startTime = performance.now();
			const intervalId = setInterval(() => {
				if (!container.isConnected) {
					this.unregister(id);
					return;
				}
				const elapsed = performance.now() - startTime;
				let progress = Math.min(1, elapsed / duration);
				this.updateText(textSpan, progress);
				if (progress >= 1) {
					if (completionMessage && messageSpan) {
						const escapeHtml = (text) => {
							const div = document.createElement("div");
							div.textContent = text;
							return div.innerHTML;
						};
						messageSpan.innerHTML = escapeHtml(completionMessage);
					}
					if (typeof onComplete === "function") {
						onComplete(...onCompleteParams);
					}
					this.unregister(id);
				}
			}, this.intervalMs);
			this.items.set(id, { intervalId, onComplete, textSpan, container });
		},
		updateText(spanElement, progress) {
			const barWidth = 20;
			const filled = Math.floor(progress * barWidth);
			const empty = barWidth - filled;
			const bar = "#".repeat(filled) + "_".repeat(empty);
			const percent = Math.floor(progress * 100);
			spanElement.textContent = `[${bar}] ${percent}%`;
		},
		unregister(id) {
			const item = this.items.get(id);
			if (item) {
				clearInterval(item.intervalId);
				this.items.delete(id);
			}
		},
		clearAll() {
			for (const [id, item] of this.items) {
				clearInterval(item.intervalId);
			}
			this.items.clear();
		}
	};
	window.addEventListener("beforeunload", () => _textProgressManager.clearAll());
	function styleProgressBar(message, completionMessage, duration = 3e3, onComplete = null, ...onCompleteParams) {
		const progressId = "txtpb_" + Date.now() + "_" + Math.random().toString(36).substr(2, 8);
		const escapeHtml = (text) => {
			const div = document.createElement("div");
			div.textContent = text;
			return div.innerHTML;
		};
		const safeMessage = escapeHtml(message);
		const safeCompletionMessage = completionMessage ? escapeHtml(completionMessage) : null;
		const html = `<div data-text-progress-id="${progressId}" style="
						background: #000000;
						padding: 8px;
						border: 1px solid #3C3C3C;
						box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
						font-family: Consolas, 'Courier New', monospace;
						-webkit-font-smoothing: antialiased;
						-moz-osx-font-smoothing: grayscale;
						border-radius: 2px;
						color: #00FF00;
						display: inline-flex;
						align-items: baseline;
						gap: 0.8em;
						line-height: 1.5;
				">
						<span class="text-progress-message-${progressId}" style="font-size: 1.6vw; white-space: pre-wrap; flex-shrink: 0;">${safeMessage}</span>
						<span class="text-progress-${progressId}" style="
								font-family: inherit;
								font-size: 1.6vw;
								letter-spacing: 1px;
								white-space: pre;
						">[${"#".repeat(20)}] 0%</span>
				</div>`;
		setTimeout(() => {
			const container = document.querySelector(`[data-text-progress-id="${progressId}"]`);
			if (!container) return;
			const textSpan = container.querySelector(`.text-progress-${progressId}`);
			const messageSpan = container.querySelector(`.text-progress-message-${progressId}`);
			if (textSpan && messageSpan) {
				_textProgressManager.register(
					progressId,
					duration,
					onComplete,
					onCompleteParams,
					textSpan,
					messageSpan,
					container,
					safeCompletionMessage
				);
			}
		}, 0);
		return html;
	}
// #endregion
// #region main.js

	// src/main.js
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
				Action: function(text) {
					const command = text.split(" ")[0];
					const commandText = text.replace("[", "").replace("]", "").split(" ").slice(1);
					CommandInfo.DoCmd(new CommandInfo(command, commandText));
				}
			}
		]);
		setTimeEventInterval(setInterval(() => {
			try {
				if (ChatRoomData) {
					TimeEvent();
				}
			} catch {
			}
		}, 1e3));
		PlayerDroneInfo();
		setInitComplete(true);
	}
	var secAfterStart = 0;
	function TimeEvent() {
		secAfterStart += 1;
		{
			DoPerSec();
		}
		if (secAfterStart % 10 == 0) {
			DoPer10Sec();
		}
		if (secAfterStart % 60 == 0) {
			DoPerMin();
		}
		if (secAfterStart % 600 == 0) {
			DoPer10Min();
		}
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
	}
	function DoPerHour() {
	}
	async function DTSWaitForLSCGModSdk() {
		if (globalThis.bcModSdk?.registerMod) return;
		await sleep(250);
		const lscgIsLoading = Boolean(
			globalThis.LSCG_VERSION || Player?.LSCG || Array.from(document.scripts).some((script) => /littlesera\.github\.io\/LSCG\//i.test(script.src))
		);
		if (!lscgIsLoading) return;
		const deadline = Date.now() + 1e4;
		while (!globalThis.bcModSdk?.registerMod && Date.now() < deadline) {
			await sleep(50);
		}
	}
	async function WaitEnable() {
		if (!window[DTS_LOADER_FLAG] && !window[DTS_LEGACY_LOADER_FLAG]) {
			console.log(`Loading complete`);
			window[DTS_LOADER_FLAG] = true;
			window[DTS_LEGACY_LOADER_FLAG] = true;
			await waitFor(() => typeof window.Player?.MemberNumber === "number");
			await DTSWaitForLSCGModSdk();
			Init();
		}
	}
	(function DTSExposeFacilityCallbacks() {
		const callbacks = {
			StockRoomEnter,
			StockRoomLeave,
			ElevatorEnter,
			ElevatorLeave,
			SleepEnterZoneEnter,
			SleepEnterZoneLeave,
			ModifyRoomEnter,
			ModifyRoomLeave,
			ModifyTileEnter,
			ShopRoomEnter,
			ShopRoomLeave,
			ShopInnerRoomEnter,
			ShopInnerRoomLeave,
			WorkRoomEnter,
			WorkRoomLeave,
			WorkInnerRoomEnter,
			OperRoomEnter,
			OperRoomLeave,
			CatEnter,
			PrivateRoomEnter,
			TrainingRoomEnter,
			TrainingRoomLeave,
			EducationRoomEnter,
			EducationRoomLeave,
			ChargeRoomEnter,
			ChargeRoomLeave
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
// #endregion
})();
// #region undefined

// #endregion