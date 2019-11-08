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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiRDovZGV2L3NvdXJjZS9ub2RlL2RldmNlcnQvIiwic291cmNlcyI6WyJ1c2VyLWludGVyZmFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4RUFBNkM7QUFDN0MsbUNBQXNDO0FBV3RDLE1BQU0sU0FBUyxHQUFrQjtJQUN6Qiw0QkFBNEI7O1lBQ2hDLE9BQU8sTUFBTSx5QkFBYyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7UUFDMUYsQ0FBQztLQUFBO0lBQ0ssZ0NBQWdDOztZQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDOzs7Ozs7S0FNWixDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFDSyw0QkFBNEI7O1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUN4RCxDQUFDO0tBQUE7SUFDSyxrQkFBa0IsQ0FBQyxlQUFlOztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDOzs7Ozs7Ozs7O1FBVVAsZUFBZ0I7Ozs7OztLQU1wQixDQUFDLENBQUM7WUFDSCxNQUFNLG1CQUFXLEVBQUUsQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFDSyx1QkFBdUIsQ0FBQyxjQUFzQjs7WUFDbEQsT0FBTzs7O3VEQUc0QyxjQUFjOzs7S0FHaEUsQ0FBQztRQUNKLENBQUM7S0FBQTtJQUNLLG9CQUFvQjs7WUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7Ozs7OztLQU9YLENBQUMsQ0FBQTtZQUNGLE1BQU0sbUJBQVcsRUFBRSxDQUFDO1FBQ3RCLENBQUM7S0FBQTtDQUNGLENBQUE7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFzc3dvcmRQcm9tcHQgZnJvbSAncGFzc3dvcmQtcHJvbXB0JztcclxuaW1wb3J0IHsgd2FpdEZvclVzZXIgfSBmcm9tICcuL3V0aWxzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVXNlckludGVyZmFjZSB7XHJcbiAgZ2V0V2luZG93c0VuY3J5cHRpb25QYXNzd29yZCgpOiBQcm9taXNlPHN0cmluZz47XHJcbiAgd2FybkNocm9tZU9uTGludXhXaXRob3V0Q2VydHV0aWwoKTogUHJvbWlzZTx2b2lkPjtcclxuICBjbG9zZUZpcmVmb3hCZWZvcmVDb250aW51aW5nKCk6IFByb21pc2U8dm9pZD47XHJcbiAgc3RhcnRGaXJlZm94V2l6YXJkKGNlcnRpZmljYXRlSG9zdDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcclxuICBmaXJlZm94V2l6YXJkUHJvbXB0UGFnZShjZXJ0aWZpY2F0ZVVSTDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xyXG4gIHdhaXRGb3JGaXJlZm94V2l6YXJkKCk6IFByb21pc2U8dm9pZD47XHJcbn1cclxuXHJcbmNvbnN0IERlZmF1bHRVSTogVXNlckludGVyZmFjZSA9IHtcclxuICBhc3luYyBnZXRXaW5kb3dzRW5jcnlwdGlvblBhc3N3b3JkKCkge1xyXG4gICAgcmV0dXJuIGF3YWl0IHBhc3N3b3JkUHJvbXB0KCdkZXZjZXJ0IHBhc3N3b3JkIChodHRwOi8vYml0Lmx5L2RldmNlcnQtd2hhdC1wYXNzd29yZD8pOicpO1xyXG4gIH0sXHJcbiAgYXN5bmMgd2FybkNocm9tZU9uTGludXhXaXRob3V0Q2VydHV0aWwoKSB7XHJcbiAgICBjb25zb2xlLndhcm4oYFxyXG4gICAgICBXQVJOSU5HOiBJdCBsb29rcyBsaWtlIHlvdSBoYXZlIENocm9tZSBpbnN0YWxsZWQsIGJ1dCB5b3Ugc3BlY2lmaWVkXHJcbiAgICAgICdza2lwQ2VydHV0aWxJbnN0YWxsOiB0cnVlJy4gVW5mb3J0dW5hdGVseSwgd2l0aG91dCBpbnN0YWxsaW5nXHJcbiAgICAgIGNlcnR1dGlsLCBpdCdzIGltcG9zc2libGUgZ2V0IENocm9tZSB0byB0cnVzdCBkZXZjZXJ0J3MgY2VydGlmaWNhdGVzXHJcbiAgICAgIFRoZSBjZXJ0aWZpY2F0ZXMgd2lsbCB3b3JrLCBidXQgQ2hyb21lIHdpbGwgY29udGludWUgdG8gd2FybiB5b3UgdGhhdFxyXG4gICAgICB0aGV5IGFyZSB1bnRydXN0ZWQuXHJcbiAgICBgKTtcclxuICB9LFxyXG4gIGFzeW5jIGNsb3NlRmlyZWZveEJlZm9yZUNvbnRpbnVpbmcoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnUGxlYXNlIGNsb3NlIEZpcmVmb3ggYmVmb3JlIGNvbnRpbnVpbmcnKTtcclxuICB9LFxyXG4gIGFzeW5jIHN0YXJ0RmlyZWZveFdpemFyZChjZXJ0aWZpY2F0ZUhvc3QpIHtcclxuICAgIGNvbnNvbGUubG9nKGBcclxuICAgICAgZGV2Y2VydCB3YXMgdW5hYmxlIHRvIGF1dG9tYXRpY2FsbHkgY29uZmlndXJlIEZpcmVmb3guIFlvdSdsbCBuZWVkIHRvXHJcbiAgICAgIGNvbXBsZXRlIHRoaXMgcHJvY2VzcyBtYW51YWxseS4gRG9uJ3Qgd29ycnkgdGhvdWdoIC0gRmlyZWZveCB3aWxsIHdhbGtcclxuICAgICAgeW91IHRocm91Z2ggaXQuXHJcblxyXG4gICAgICBXaGVuIHlvdSdyZSByZWFkeSwgaGl0IGFueSBrZXkgdG8gY29udGludWUuIEZpcmVmb3ggd2lsbCBsYXVuY2ggYW5kXHJcbiAgICAgIGRpc3BsYXkgYSB3aXphcmQgdG8gd2FsayB5b3UgdGhyb3VnaCBob3cgdG8gdHJ1c3QgdGhlIGRldmNlcnRcclxuICAgICAgY2VydGlmaWNhdGUuIFdoZW4geW91IGFyZSBmaW5pc2hlZCwgY29tZSBiYWNrIGhlcmUgYW5kIHdlJ2xsIGZpbmlzaCB1cC5cclxuXHJcbiAgICAgIChJZiBGaXJlZm94IGRvZXNuJ3Qgc3RhcnQsIGdvIGFoZWFkIGFuZCBzdGFydCBpdCBhbmQgbmF2aWdhdGUgdG9cclxuICAgICAgJHsgY2VydGlmaWNhdGVIb3N0IH0gaW4gYSBuZXcgdGFiLilcclxuXHJcbiAgICAgIElmIHlvdSBhcmUgY3VyaW91cyBhYm91dCB3aHkgYWxsIHRoaXMgaXMgbmVjZXNzYXJ5LCBjaGVjayBvdXRcclxuICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2RhdmV3YXNtZXIvZGV2Y2VydCNob3ctaXQtd29ya3NcclxuXHJcbiAgICAgIDxQcmVzcyBhbnkga2V5IHRvIGxhdW5jaCBGaXJlZm94IHdpemFyZD5cclxuICAgIGApO1xyXG4gICAgYXdhaXQgd2FpdEZvclVzZXIoKTtcclxuICB9LFxyXG4gIGFzeW5jIGZpcmVmb3hXaXphcmRQcm9tcHRQYWdlKGNlcnRpZmljYXRlVVJMOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBgXHJcbiAgICAgIDxodG1sPlxyXG4gICAgICAgIDxoZWFkPlxyXG4gICAgICAgICAgPG1ldGEgaHR0cC1lcXVpdj1cInJlZnJlc2hcIiBjb250ZW50PVwiMDsgdXJsPSR7Y2VydGlmaWNhdGVVUkx9XCIgLz5cclxuICAgICAgICA8L2hlYWQ+XHJcbiAgICAgIDwvaHRtbD5cclxuICAgIGA7XHJcbiAgfSxcclxuICBhc3luYyB3YWl0Rm9yRmlyZWZveFdpemFyZCgpIHtcclxuICAgIGNvbnNvbGUubG9nKGBcclxuICAgICAgTGF1bmNoaW5nIEZpcmVmb3ggLi4uXHJcblxyXG4gICAgICBHcmVhdCEgT25jZSB5b3UndmUgZmluaXNoZWQgdGhlIEZpcmVmb3ggd2l6YXJkIGZvciBhZGRpbmcgdGhlIGRldmNlcnRcclxuICAgICAgY2VydGlmaWNhdGUsIGp1c3QgaGl0IGFueSBrZXkgaGVyZSBhZ2FpbiBhbmQgd2UnbGwgd3JhcCB1cC5cclxuXHJcbiAgICAgIDxQcmVzcyBhbnkga2V5IHRvIGNvbnRpbnVlPlxyXG4gICAgYClcclxuICAgIGF3YWl0IHdhaXRGb3JVc2VyKCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0VUk7Il19