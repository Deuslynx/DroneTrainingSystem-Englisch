# DroneTrainingSystem-Englisch

## Setup

1. Download a userscript addon for your browser - eg. tampermonkey (or have another way of running js code for BondageClub).

2. Choose **one** of the following methods:

> **Option 1 – Automatic Updates**<br>
> Install the [DTS_Loader](https://deuslynx.github.io/DroneTrainingSystem-Englisch/DTSLoader.user.js)
> (Note: This will automatically use the newest version of the DTS by loading the script from the dist folder in this repository.)

> **Option 2 – Manual Updates**<br>
> Install [DTS-UserScript](https://deuslynx.github.io/DroneTrainingSystem-Englisch/dist/DroneTrainingSystem.user.js)
> (Note: With this you will have to manually update if there is a new version.)

> **Option 3 – One Off Version**<br>
> Install [Static-DTS-UserScript](https://deuslynx.github.io/DroneTrainingSystem-Englisch/DroneTrainingSystem-EngVer.user.js)
> (Note: This version is the translation of the original that won't get any updates.)

> **Info**<br>
> If you use another method than tampermonkey and only need the code: [raw_DTScode](https://deuslynx.github.io/DroneTrainingSystem-Englisch/dist/DroneTrainingSystem.iife.js).

3. Make sure the userscript addon and the newly created script are both activated in the Bondage Club tab.
4. Reload the page.

If everything is working properly you should be able to see black areas with green text in a room chat.
If you just want to have a look around the facility for now, then register as an Operator (you can deregister later). Becoming a Drone is meant to be a permanent decision (even though there are ways around that).

> **Info**<br>
> If something isn't working the next time, please visit here again... something may have changed since the project is still in development.

## Current Features
- Elevator (map entrance or south side of the facility):  Accessible after registering as either a drone or an operator.
- Warehouse Area (four corners of the facility):  Used to pick up or drop off cargo for tasks.
- Work Area (west side of the facility):  Players can accept tasks or process miscellaneous items to earn quota points.
- Modification Area (northwest side of the facility):  Drones can spend quota points here to undergo modifications and unlock additional functions.
- Shop Area (northeast side of the facility):  Quota points can be spent here to purchase usable items.
- Training/Education Area (east side of the facility):  Drones can receive training or education here to unlock more functions.
- Operator Lounge (south side of the facility):  Accessible only to operators. Contains "Hakimi" (a cat?). Operators can call drones to perform here (feature in development).
- Private Rooms (inside the Operator Lounge):  Accessible only to operators. Operators can summon drones for overnight companionship here.
- Drone Dormancy Area (southeast side of the facility):  Drones can enter sleep mode here to gain quota points. The available sleep durations from top to bottom are 6, 12, 18, and 24 hours.
- Charging Stations (around the facility):  Drones can recharge here. If battery power is completely depleted, they cannot perform any activities and must wait for assistance.

## Improvements
If you have ideas for improvements or just general vague ideas for Drone training/operating, send a mail to subdeuslynx@gmail.com, open a new issue or write a direct message to the RoomTester acc if it's at the front desk of the facility.

Any idea is appreciated, so don't hesitate to mention yours!

## Future Plans
Somewhat loose... maybe extending the map along with some features... but I'll have to see where everything goes~

---
---

### DTS bundler
Bundles `src/main.js` and everything it imports (`constants.js`, `state.js`,
`utils.js`, `drone.js`, `items.js`, `commands.js`, `rooms.js`, `hooks.js`)
into one plain-JS userscript at `dist/DroneTrainingSystem.user.js`, with the
Tampermonkey metadata block prepended as a banner.

### Usage
```bash
npm install
npm run build          
npm run watch               # rebuild on every save while editing
```

