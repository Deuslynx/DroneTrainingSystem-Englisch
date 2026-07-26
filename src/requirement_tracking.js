// ----- requirement_tracking.js -----
// Activity/pose requirement tracking used by the training minigames.

import { SendMessageToSelf } from "./utils.js";
import { DoPunishment } from "./drone.js";
import { addTrainingProcess } from "./state.js";

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
