"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const password_prompt_1 = tslib_1.__importDefault(require("password-prompt"));
const utils_1 = require("./utils");
const DefaultUI = {
    getWindowsEncryptionPassword() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield password_prompt_1.default('devcert password (http://bit.ly/devcert-what-password?):');
        });
    },
    warnChromeOnLinuxWithoutCertutil() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.warn(`
      WARNING: It looks like you have Chrome installed, but you specified
      'skipCertutilInstall: true'. Unfortunately, without installing
      certutil, it's impossible get Chrome to trust devcert's certificates
      The certificates will work, but Chrome will continue to warn you that
      they are untrusted.
    `);
        });
    },
    closeFirefoxBeforeContinuing() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('Please close Firefox before continuing');
        });
    },
    startFirefoxWizard(certificateHost) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`
      devcert was unable to automatically configure Firefox. You'll need to
      complete this process manually. Don't worry though - Firefox will walk
      you through it.

      When you're ready, hit any key to continue. Firefox will launch and
      display a wizard to walk you through how to trust the devcert
      certificate. When you are finished, come back here and we'll finish up.

      (If Firefox doesn't start, go ahead and start it and navigate to
      ${certificateHost} in a new tab.)

      If you are curious about why all this is necessary, check out
      https://github.com/davewasmer/devcert#how-it-works

      <Press any key to launch Firefox wizard>
    `);
            yield utils_1.waitForUser();
        });
    },
    firefoxWizardPromptPage(certificateURL) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return `
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${certificateURL}" />
        </head>
      </html>
    `;
        });
    },
    waitForFirefoxWizard() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log(`
      Launching Firefox ...

      Great! Once you've finished the Firefox wizard for adding the devcert
      certificate, just hit any key here again and we'll wrap up.

      <Press any key to continue>
    `);
            yield utils_1.waitForUser();
        });
    }
};
exports.default = DefaultUI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiRDovZGV2L2dwbS9naXRodWIuY29tL0pzLUJyZWNodC9kZXZjZXJ0LyIsInNvdXJjZXMiOlsidXNlci1pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOEVBQTZDO0FBQzdDLG1DQUFzQztBQVd0QyxNQUFNLFNBQVMsR0FBa0I7SUFDekIsNEJBQTRCOztZQUNoQyxPQUFPLE1BQU0seUJBQWMsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO1FBQzFGLENBQUM7S0FBQTtJQUNLLGdDQUFnQzs7WUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQzs7Ozs7O0tBTVosQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBQ0ssNEJBQTRCOztZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFDeEQsQ0FBQztLQUFBO0lBQ0ssa0JBQWtCLENBQUMsZUFBZTs7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7Ozs7Ozs7OztRQVVQLGVBQWdCOzs7Ozs7S0FNcEIsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxtQkFBVyxFQUFFLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBQ0ssdUJBQXVCLENBQUMsY0FBc0I7O1lBQ2xELE9BQU87Ozt1REFHNEMsY0FBYzs7O0tBR2hFLENBQUM7UUFDSixDQUFDO0tBQUE7SUFDSyxvQkFBb0I7O1lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUM7Ozs7Ozs7S0FPWCxDQUFDLENBQUE7WUFDRixNQUFNLG1CQUFXLEVBQUUsQ0FBQztRQUN0QixDQUFDO0tBQUE7Q0FDRixDQUFBO0FBRUQsa0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhc3N3b3JkUHJvbXB0IGZyb20gJ3Bhc3N3b3JkLXByb21wdCc7XHJcbmltcG9ydCB7IHdhaXRGb3JVc2VyIH0gZnJvbSAnLi91dGlscyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVzZXJJbnRlcmZhY2Uge1xyXG4gIGdldFdpbmRvd3NFbmNyeXB0aW9uUGFzc3dvcmQoKTogUHJvbWlzZTxzdHJpbmc+O1xyXG4gIHdhcm5DaHJvbWVPbkxpbnV4V2l0aG91dENlcnR1dGlsKCk6IFByb21pc2U8dm9pZD47XHJcbiAgY2xvc2VGaXJlZm94QmVmb3JlQ29udGludWluZygpOiBQcm9taXNlPHZvaWQ+O1xyXG4gIHN0YXJ0RmlyZWZveFdpemFyZChjZXJ0aWZpY2F0ZUhvc3Q6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XHJcbiAgZmlyZWZveFdpemFyZFByb21wdFBhZ2UoY2VydGlmaWNhdGVVUkw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcclxuICB3YWl0Rm9yRmlyZWZveFdpemFyZCgpOiBQcm9taXNlPHZvaWQ+O1xyXG59XHJcblxyXG5jb25zdCBEZWZhdWx0VUk6IFVzZXJJbnRlcmZhY2UgPSB7XHJcbiAgYXN5bmMgZ2V0V2luZG93c0VuY3J5cHRpb25QYXNzd29yZCgpIHtcclxuICAgIHJldHVybiBhd2FpdCBwYXNzd29yZFByb21wdCgnZGV2Y2VydCBwYXNzd29yZCAoaHR0cDovL2JpdC5seS9kZXZjZXJ0LXdoYXQtcGFzc3dvcmQ/KTonKTtcclxuICB9LFxyXG4gIGFzeW5jIHdhcm5DaHJvbWVPbkxpbnV4V2l0aG91dENlcnR1dGlsKCkge1xyXG4gICAgY29uc29sZS53YXJuKGBcclxuICAgICAgV0FSTklORzogSXQgbG9va3MgbGlrZSB5b3UgaGF2ZSBDaHJvbWUgaW5zdGFsbGVkLCBidXQgeW91IHNwZWNpZmllZFxyXG4gICAgICAnc2tpcENlcnR1dGlsSW5zdGFsbDogdHJ1ZScuIFVuZm9ydHVuYXRlbHksIHdpdGhvdXQgaW5zdGFsbGluZ1xyXG4gICAgICBjZXJ0dXRpbCwgaXQncyBpbXBvc3NpYmxlIGdldCBDaHJvbWUgdG8gdHJ1c3QgZGV2Y2VydCdzIGNlcnRpZmljYXRlc1xyXG4gICAgICBUaGUgY2VydGlmaWNhdGVzIHdpbGwgd29yaywgYnV0IENocm9tZSB3aWxsIGNvbnRpbnVlIHRvIHdhcm4geW91IHRoYXRcclxuICAgICAgdGhleSBhcmUgdW50cnVzdGVkLlxyXG4gICAgYCk7XHJcbiAgfSxcclxuICBhc3luYyBjbG9zZUZpcmVmb3hCZWZvcmVDb250aW51aW5nKCkge1xyXG4gICAgY29uc29sZS5sb2coJ1BsZWFzZSBjbG9zZSBGaXJlZm94IGJlZm9yZSBjb250aW51aW5nJyk7XHJcbiAgfSxcclxuICBhc3luYyBzdGFydEZpcmVmb3hXaXphcmQoY2VydGlmaWNhdGVIb3N0KSB7XHJcbiAgICBjb25zb2xlLmxvZyhgXHJcbiAgICAgIGRldmNlcnQgd2FzIHVuYWJsZSB0byBhdXRvbWF0aWNhbGx5IGNvbmZpZ3VyZSBGaXJlZm94LiBZb3UnbGwgbmVlZCB0b1xyXG4gICAgICBjb21wbGV0ZSB0aGlzIHByb2Nlc3MgbWFudWFsbHkuIERvbid0IHdvcnJ5IHRob3VnaCAtIEZpcmVmb3ggd2lsbCB3YWxrXHJcbiAgICAgIHlvdSB0aHJvdWdoIGl0LlxyXG5cclxuICAgICAgV2hlbiB5b3UncmUgcmVhZHksIGhpdCBhbnkga2V5IHRvIGNvbnRpbnVlLiBGaXJlZm94IHdpbGwgbGF1bmNoIGFuZFxyXG4gICAgICBkaXNwbGF5IGEgd2l6YXJkIHRvIHdhbGsgeW91IHRocm91Z2ggaG93IHRvIHRydXN0IHRoZSBkZXZjZXJ0XHJcbiAgICAgIGNlcnRpZmljYXRlLiBXaGVuIHlvdSBhcmUgZmluaXNoZWQsIGNvbWUgYmFjayBoZXJlIGFuZCB3ZSdsbCBmaW5pc2ggdXAuXHJcblxyXG4gICAgICAoSWYgRmlyZWZveCBkb2Vzbid0IHN0YXJ0LCBnbyBhaGVhZCBhbmQgc3RhcnQgaXQgYW5kIG5hdmlnYXRlIHRvXHJcbiAgICAgICR7IGNlcnRpZmljYXRlSG9zdCB9IGluIGEgbmV3IHRhYi4pXHJcblxyXG4gICAgICBJZiB5b3UgYXJlIGN1cmlvdXMgYWJvdXQgd2h5IGFsbCB0aGlzIGlzIG5lY2Vzc2FyeSwgY2hlY2sgb3V0XHJcbiAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZld2FzbWVyL2RldmNlcnQjaG93LWl0LXdvcmtzXHJcblxyXG4gICAgICA8UHJlc3MgYW55IGtleSB0byBsYXVuY2ggRmlyZWZveCB3aXphcmQ+XHJcbiAgICBgKTtcclxuICAgIGF3YWl0IHdhaXRGb3JVc2VyKCk7XHJcbiAgfSxcclxuICBhc3luYyBmaXJlZm94V2l6YXJkUHJvbXB0UGFnZShjZXJ0aWZpY2F0ZVVSTDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gYFxyXG4gICAgICA8aHRtbD5cclxuICAgICAgICA8aGVhZD5cclxuICAgICAgICAgIDxtZXRhIGh0dHAtZXF1aXY9XCJyZWZyZXNoXCIgY29udGVudD1cIjA7IHVybD0ke2NlcnRpZmljYXRlVVJMfVwiIC8+XHJcbiAgICAgICAgPC9oZWFkPlxyXG4gICAgICA8L2h0bWw+XHJcbiAgICBgO1xyXG4gIH0sXHJcbiAgYXN5bmMgd2FpdEZvckZpcmVmb3hXaXphcmQoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhgXHJcbiAgICAgIExhdW5jaGluZyBGaXJlZm94IC4uLlxyXG5cclxuICAgICAgR3JlYXQhIE9uY2UgeW91J3ZlIGZpbmlzaGVkIHRoZSBGaXJlZm94IHdpemFyZCBmb3IgYWRkaW5nIHRoZSBkZXZjZXJ0XHJcbiAgICAgIGNlcnRpZmljYXRlLCBqdXN0IGhpdCBhbnkga2V5IGhlcmUgYWdhaW4gYW5kIHdlJ2xsIHdyYXAgdXAuXHJcblxyXG4gICAgICA8UHJlc3MgYW55IGtleSB0byBjb250aW51ZT5cclxuICAgIGApXHJcbiAgICBhd2FpdCB3YWl0Rm9yVXNlcigpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGVmYXVsdFVJOyJdfQ==