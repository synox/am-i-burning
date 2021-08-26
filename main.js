// Modules to control application life and create native browser window
const { app, Tray, Menu } = require("electron");
const spawn = require("child_process").spawn;



app.whenReady().then(() => {
  const tray = new Tray("./images/rocket.png");
  const pmset = spawn("pmset", ["-g", "thermlog"]);
  pmset.stdout.on("data", (data) => {

    let heated = false;
    let speed = 101;
    let ready = false;

    let re = /CPU_Scheduler_Limit 	= ([0-9]+)/;
    let match = re.exec(data.toString());
    if ( match ){
      speed = Number(match[1])
      ready = true;
    }

    if (speed === 100) {
      heated = false;
    } else if (speed < 80) {
      heated = true;
    }

    if(ready){
      tray.setImage(heated
                  ? "./images/fire.png"
                  : "./images/rocket.png");
      tray.setTitle(`${speed}%`);
      tray.setToolTip(data.toString());
    } else {
      tray.setImage("./images/clock.png");
      tray.setTitle("Loading");
    }
  });

  pmset.stderr.on("data", (data) => console.log("stderr: ", data.toString()));
  pmset.on("exit", (data) =>
    console.log("child process exited with code: ", data)
  );

  tray.setContextMenu(
    Menu.buildFromTemplate([{ label: "Exit", click: () => app.quit() }])
  );
});
