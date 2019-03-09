const assert = require('assert');
const bot = require('../app');

describe('Bot', () => {
  describe('Class initialization', () => {
    it('should get an new bot instance', () => {
      const myBot = new bot.TimeSheetReporterBot.Bot();
      assert.notStrictEqual(myBot, null);
    });
    it('should have authorization token', function() {
      const app = new bot.TimeSheetReporterBot.Bot();
      assert.strictEqual(
        app.opts.headers.Authorization.length > 0,
        true);
    });
    it('should ', function() {
      const app = new bot.TimeSheetReporterBot.Bot();
      app.getProps().then((res) => {
        console.warn(res);
      });
    });
  });
});
