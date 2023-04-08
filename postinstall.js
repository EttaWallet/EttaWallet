var exec = require('child_process').exec;
var os = require('os');

const baseCommand = 'rn-nodeify --install buffer,stream,assert,events,crypto,vm,process --hack';

function postInstallMac() {
  //   exec(`${baseCommand} && cd ios && pod install && cd ..`);
  // M1 workaround
  exec(`${baseCommand} && cd ios && arch -x86_64 pod install && cd ..`);
}
function postInstallLinWin() {
  exec(baseCommand);
}

if (os.type() === 'Darwin') {
  postInstallMac();
} else {
  postInstallLinWin();
}
