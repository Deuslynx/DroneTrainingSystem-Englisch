# DroneTrainingSystem-Englisch

## Setup

1. Download a userscript addon for your browser - like tampermonkey or violentmonkey (or have another way of running js code for BondageClub).

2. Create a new script and choose **one** of the following methods:

> **Option 1 – Automatic Updates**
> 
> Paste the code from the DTSLoader.js file into the new script.
> (Note: This will automatically use the newest version by loading code from this repository.)

> **Option 2 – Manual Updates**
>
> Paste the code from the DroneTrainingSystem-EngVersion.js file into the new script.
> (Note: With this you will have to manually update if there is a new version.)

3. Make sure the userscript addon and the newly created script are both activated in the Bondage Club tab.
4. Reload the page.

If everything is working properly you should be able to see black areas with green text in the chat when you caress the neck of someone who has the script (your own works aswell).

If you just want to have a look inside for now, then register as an Operator (can deregister later). Becoming a Drone is meant to be a permanent decision (even though there are ways around that).

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
npm run watch               # rebuild on every save while you're editing
```

## Folder layout
```
dts-build/
  package.json
  build.js       <- build script
  src/           <- all modules
  dist/          <- created DroneTrainingSystem.user.js goes here
```

