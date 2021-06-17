import keypress from "keypress"; // Listen for Keypress

export default class KeypressActions {
  constructor() {
    this.init()
  }

  init() {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    
    process.stdin.on('keypress', function (ch, key) {
      console.log('\ngot "keypress"', key);
      if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
      }
    });
    // process.stdin.resume();
  }

}
