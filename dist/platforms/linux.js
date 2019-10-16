"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const shared_1 = require("./shared");
const utils_1 = require("../utils");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const debug = debug_1.default('devcert:platforms:linux');
class LinuxPlatform {
    constructor() {
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, '.mozilla/firefox/*');
        this.CHROME_NSS_DIR = path_1.default.join(process.env.HOME, '.pki/nssdb');
        this.FIREFOX_BIN_PATH = '/usr/bin/firefox';
        this.CHROME_BIN_PATH = '/usr/bin/google-chrome';
        this.HOST_FILE_PATH = '/etc/hosts';
    }
    /**
     * Linux is surprisingly difficult. There seems to be multiple system-wide
     * repositories for certs, so we copy ours to each. However, Firefox does it's
     * usual separate trust store. Plus Chrome relies on the NSS tooling (like
     * Firefox), but uses the user's NSS database, unlike Firefox (which uses a
     * separate Mozilla one). And since Chrome doesn't prompt the user with a GUI
     * flow when opening certs, if we can't use certutil to install our certificate
     * into the user's NSS database, we're out of luck.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug('Adding devcert root CA to Linux system-wide trust stores');
            // run(`sudo cp ${ certificatePath } /etc/ssl/certs/devcert.crt`);
            utils_1.run(`sudo cp "${certificatePath}" /usr/local/share/ca-certificates/devcert.crt`);
            // run(`sudo bash -c "cat ${ certificatePath } >> /etc/ssl/certs/ca-certificates.crt"`);
            utils_1.run(`sudo update-ca-certificates`);
            if (this.isFirefoxInstalled()) {
                // Firefox
                debug('Firefox install detected: adding devcert root CA to Firefox-specific trust stores ...');
                if (!command_exists_1.sync('certutil')) {
                    if (options.skipCertutilInstall) {
                        debug('NSS tooling is not already installed, and `skipCertutil` is true, so falling back to manual certificate install for Firefox');
                        shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                    }
                    else {
                        debug('NSS tooling is not already installed. Trying to install NSS tooling now with `apt install`');
                        utils_1.run('sudo apt install libnss3-tools');
                        debug('Installing certificate into Firefox trust stores using NSS tooling');
                        yield shared_1.closeFirefox();
                        yield shared_1.addCertificateToNSSCertDB(this.FIREFOX_NSS_DIR, certificatePath, 'certutil');
                    }
                }
            }
            else {
                debug('Firefox does not appear to be installed, skipping Firefox-specific steps...');
            }
            if (this.isChromeInstalled()) {
                debug('Chrome install detected: adding devcert root CA to Chrome trust store ...');
                if (!command_exists_1.sync('certutil')) {
                    user_interface_1.default.warnChromeOnLinuxWithoutCertutil();
                }
                else {
                    yield shared_1.closeFirefox();
                    yield shared_1.addCertificateToNSSCertDB(this.CHROME_NSS_DIR, certificatePath, 'certutil');
                }
            }
            else {
                debug('Chrome does not appear to be installed, skipping Chrome-specific steps...');
            }
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let hostsFileContents = fs_1.readFileSync(this.HOST_FILE_PATH, 'utf8');
            if (!hostsFileContents.includes(domain)) {
                utils_1.run(`echo '127.0.0.1  ${domain}' | sudo tee -a "${this.HOST_FILE_PATH}" > /dev/null`);
            }
        });
    }
    readProtectedFile(filepath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield utils_1.run(`sudo cat "${filepath}"`)).toString().trim();
        });
    }
    writeProtectedFile(filepath, contents) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (fs_1.existsSync(filepath)) {
                yield utils_1.run(`sudo rm "${filepath}"`);
            }
            fs_1.writeFileSync(filepath, contents);
            yield utils_1.run(`sudo chown 0 "${filepath}"`);
            yield utils_1.run(`sudo chmod 600 "${filepath}"`);
        });
    }
    isFirefoxInstalled() {
        return fs_1.existsSync(this.FIREFOX_BIN_PATH);
    }
    isChromeInstalled() {
        return fs_1.existsSync(this.CHROME_BIN_PATH);
    }
}
exports.default = LinuxPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGludXguanMiLCJzb3VyY2VSb290IjoiRDovZGV2L2dwbS9naXRodWIuY29tL0pzLUJyZWNodC9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL2xpbnV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3QjtBQUN4QiwyQkFBNEY7QUFDNUYsMERBQWdDO0FBQ2hDLG1EQUF1RDtBQUN2RCxxQ0FBNkY7QUFDN0Ysb0NBQStCO0FBRS9CLCtFQUFtQztBQUduQyxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUVyRDtJQUFBO1FBRVUsb0JBQWUsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDcEUsbUJBQWMsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzNELHFCQUFnQixHQUFHLGtCQUFrQixDQUFDO1FBQ3RDLG9CQUFlLEdBQUcsd0JBQXdCLENBQUM7UUFFM0MsbUJBQWMsR0FBRyxZQUFZLENBQUM7SUFnRnhDLENBQUM7SUE5RUM7Ozs7Ozs7O09BUUc7SUFDRyxnQkFBZ0IsQ0FBQyxlQUF1QixFQUFFLFVBQW1CLEVBQUU7O1lBRW5FLEtBQUssQ0FBQywwREFBMEQsQ0FBQyxDQUFDO1lBQ2xFLGtFQUFrRTtZQUNsRSxXQUFHLENBQUMsWUFBYSxlQUFnQixnREFBZ0QsQ0FBQyxDQUFDO1lBQ25GLHdGQUF3RjtZQUN4RixXQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUVuQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO2dCQUM3QixVQUFVO2dCQUNWLEtBQUssQ0FBQyx1RkFBdUYsQ0FBQyxDQUFDO2dCQUMvRixJQUFJLENBQUMscUJBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDOUIsSUFBSSxPQUFPLENBQUMsbUJBQW1CLEVBQUU7d0JBQy9CLEtBQUssQ0FBQyw2SEFBNkgsQ0FBQyxDQUFDO3dCQUNySSxpQ0FBd0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7cUJBQ2xFO3lCQUFNO3dCQUNMLEtBQUssQ0FBQyw0RkFBNEYsQ0FBQyxDQUFDO3dCQUNwRyxXQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzt3QkFDdEMsS0FBSyxDQUFDLG9FQUFvRSxDQUFDLENBQUM7d0JBQzVFLE1BQU0scUJBQVksRUFBRSxDQUFDO3dCQUNyQixNQUFNLGtDQUF5QixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDO3FCQUNwRjtpQkFDRjthQUNGO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO2FBQ3RGO1lBRUQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtnQkFDNUIsS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxxQkFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUM5Qix3QkFBRSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7aUJBQ3ZDO3FCQUFNO29CQUNMLE1BQU0scUJBQVksRUFBRSxDQUFDO29CQUNyQixNQUFNLGtDQUF5QixDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNuRjthQUNGO2lCQUFNO2dCQUNMLEtBQUssQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO2FBQ3BGO1FBQ0gsQ0FBQztLQUFBO0lBRUssNEJBQTRCLENBQUMsTUFBYzs7WUFDL0MsSUFBSSxpQkFBaUIsR0FBRyxpQkFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkMsV0FBRyxDQUFDLG9CQUFxQixNQUFPLG9CQUFxQixJQUFJLENBQUMsY0FBZSxlQUFlLENBQUMsQ0FBQzthQUMzRjtRQUNILENBQUM7S0FBQTtJQUVLLGlCQUFpQixDQUFDLFFBQWdCOztZQUN0QyxPQUFPLENBQUMsTUFBTSxXQUFHLENBQUMsYUFBYSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakUsQ0FBQztLQUFBO0lBRUssa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjs7WUFDekQsSUFBSSxlQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BCLE1BQU0sV0FBRyxDQUFDLFlBQVksUUFBUSxHQUFHLENBQUMsQ0FBQzthQUNwQztZQUNELGtCQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sV0FBRyxDQUFDLGlCQUFpQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sV0FBRyxDQUFDLG1CQUFtQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FBQTtJQUdPLGtCQUFrQjtRQUN4QixPQUFPLGVBQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU8saUJBQWlCO1FBQ3ZCLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBRUY7QUF2RkQsZ0NBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGV4aXN0c1N5bmMgYXMgZXhpc3RzLCByZWFkRmlsZVN5bmMgYXMgcmVhZCwgd3JpdGVGaWxlU3luYyBhcyB3cml0ZUZpbGUgfSBmcm9tICdmcyc7XHJcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCB7IHN5bmMgYXMgY29tbWFuZEV4aXN0cyB9IGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcclxuaW1wb3J0IHsgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQiwgb3BlbkNlcnRpZmljYXRlSW5GaXJlZm94LCBjbG9zZUZpcmVmb3ggfSBmcm9tICcuL3NoYXJlZCc7XHJcbmltcG9ydCB7IHJ1biB9IGZyb20gJy4uL3V0aWxzJztcclxuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4uL2luZGV4JztcclxuaW1wb3J0IFVJIGZyb20gJy4uL3VzZXItaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuJztcclxuXHJcbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6cGxhdGZvcm1zOmxpbnV4Jyk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW51eFBsYXRmb3JtIGltcGxlbWVudHMgUGxhdGZvcm0ge1xyXG5cclxuICBwcml2YXRlIEZJUkVGT1hfTlNTX0RJUiA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FLCAnLm1vemlsbGEvZmlyZWZveC8qJyk7XHJcbiAgcHJpdmF0ZSBDSFJPTUVfTlNTX0RJUiA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FLCAnLnBraS9uc3NkYicpO1xyXG4gIHByaXZhdGUgRklSRUZPWF9CSU5fUEFUSCA9ICcvdXNyL2Jpbi9maXJlZm94JztcclxuICBwcml2YXRlIENIUk9NRV9CSU5fUEFUSCA9ICcvdXNyL2Jpbi9nb29nbGUtY2hyb21lJztcclxuXHJcbiAgcHJpdmF0ZSBIT1NUX0ZJTEVfUEFUSCA9ICcvZXRjL2hvc3RzJztcclxuXHJcbiAgLyoqXHJcbiAgICogTGludXggaXMgc3VycHJpc2luZ2x5IGRpZmZpY3VsdC4gVGhlcmUgc2VlbXMgdG8gYmUgbXVsdGlwbGUgc3lzdGVtLXdpZGVcclxuICAgKiByZXBvc2l0b3JpZXMgZm9yIGNlcnRzLCBzbyB3ZSBjb3B5IG91cnMgdG8gZWFjaC4gSG93ZXZlciwgRmlyZWZveCBkb2VzIGl0J3NcclxuICAgKiB1c3VhbCBzZXBhcmF0ZSB0cnVzdCBzdG9yZS4gUGx1cyBDaHJvbWUgcmVsaWVzIG9uIHRoZSBOU1MgdG9vbGluZyAobGlrZVxyXG4gICAqIEZpcmVmb3gpLCBidXQgdXNlcyB0aGUgdXNlcidzIE5TUyBkYXRhYmFzZSwgdW5saWtlIEZpcmVmb3ggKHdoaWNoIHVzZXMgYVxyXG4gICAqIHNlcGFyYXRlIE1vemlsbGEgb25lKS4gQW5kIHNpbmNlIENocm9tZSBkb2Vzbid0IHByb21wdCB0aGUgdXNlciB3aXRoIGEgR1VJXHJcbiAgICogZmxvdyB3aGVuIG9wZW5pbmcgY2VydHMsIGlmIHdlIGNhbid0IHVzZSBjZXJ0dXRpbCB0byBpbnN0YWxsIG91ciBjZXJ0aWZpY2F0ZVxyXG4gICAqIGludG8gdGhlIHVzZXIncyBOU1MgZGF0YWJhc2UsIHdlJ3JlIG91dCBvZiBsdWNrLlxyXG4gICAqL1xyXG4gIGFzeW5jIGFkZFRvVHJ1c3RTdG9yZXMoY2VydGlmaWNhdGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xyXG5cclxuICAgIGRlYnVnKCdBZGRpbmcgZGV2Y2VydCByb290IENBIHRvIExpbnV4IHN5c3RlbS13aWRlIHRydXN0IHN0b3JlcycpO1xyXG4gICAgLy8gcnVuKGBzdWRvIGNwICR7IGNlcnRpZmljYXRlUGF0aCB9IC9ldGMvc3NsL2NlcnRzL2RldmNlcnQuY3J0YCk7XHJcbiAgICBydW4oYHN1ZG8gY3AgXCIkeyBjZXJ0aWZpY2F0ZVBhdGggfVwiIC91c3IvbG9jYWwvc2hhcmUvY2EtY2VydGlmaWNhdGVzL2RldmNlcnQuY3J0YCk7XHJcbiAgICAvLyBydW4oYHN1ZG8gYmFzaCAtYyBcImNhdCAkeyBjZXJ0aWZpY2F0ZVBhdGggfSA+PiAvZXRjL3NzbC9jZXJ0cy9jYS1jZXJ0aWZpY2F0ZXMuY3J0XCJgKTtcclxuICAgIHJ1bihgc3VkbyB1cGRhdGUtY2EtY2VydGlmaWNhdGVzYCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNGaXJlZm94SW5zdGFsbGVkKCkpIHtcclxuICAgICAgLy8gRmlyZWZveFxyXG4gICAgICBkZWJ1ZygnRmlyZWZveCBpbnN0YWxsIGRldGVjdGVkOiBhZGRpbmcgZGV2Y2VydCByb290IENBIHRvIEZpcmVmb3gtc3BlY2lmaWMgdHJ1c3Qgc3RvcmVzIC4uLicpO1xyXG4gICAgICBpZiAoIWNvbW1hbmRFeGlzdHMoJ2NlcnR1dGlsJykpIHtcclxuICAgICAgICBpZiAob3B0aW9ucy5za2lwQ2VydHV0aWxJbnN0YWxsKSB7XHJcbiAgICAgICAgICBkZWJ1ZygnTlNTIHRvb2xpbmcgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBhbmQgYHNraXBDZXJ0dXRpbGAgaXMgdHJ1ZSwgc28gZmFsbGluZyBiYWNrIHRvIG1hbnVhbCBjZXJ0aWZpY2F0ZSBpbnN0YWxsIGZvciBGaXJlZm94Jyk7XHJcbiAgICAgICAgICBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3godGhpcy5GSVJFRk9YX0JJTl9QQVRILCBjZXJ0aWZpY2F0ZVBhdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkZWJ1ZygnTlNTIHRvb2xpbmcgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLiBUcnlpbmcgdG8gaW5zdGFsbCBOU1MgdG9vbGluZyBub3cgd2l0aCBgYXB0IGluc3RhbGxgJyk7XHJcbiAgICAgICAgICBydW4oJ3N1ZG8gYXB0IGluc3RhbGwgbGlibnNzMy10b29scycpO1xyXG4gICAgICAgICAgZGVidWcoJ0luc3RhbGxpbmcgY2VydGlmaWNhdGUgaW50byBGaXJlZm94IHRydXN0IHN0b3JlcyB1c2luZyBOU1MgdG9vbGluZycpO1xyXG4gICAgICAgICAgYXdhaXQgY2xvc2VGaXJlZm94KCk7XHJcbiAgICAgICAgICBhd2FpdCBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKHRoaXMuRklSRUZPWF9OU1NfRElSLCBjZXJ0aWZpY2F0ZVBhdGgsICdjZXJ0dXRpbCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVidWcoJ0ZpcmVmb3ggZG9lcyBub3QgYXBwZWFyIHRvIGJlIGluc3RhbGxlZCwgc2tpcHBpbmcgRmlyZWZveC1zcGVjaWZpYyBzdGVwcy4uLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlzQ2hyb21lSW5zdGFsbGVkKCkpIHtcclxuICAgICAgZGVidWcoJ0Nocm9tZSBpbnN0YWxsIGRldGVjdGVkOiBhZGRpbmcgZGV2Y2VydCByb290IENBIHRvIENocm9tZSB0cnVzdCBzdG9yZSAuLi4nKTtcclxuICAgICAgaWYgKCFjb21tYW5kRXhpc3RzKCdjZXJ0dXRpbCcpKSB7XHJcbiAgICAgICAgVUkud2FybkNocm9tZU9uTGludXhXaXRob3V0Q2VydHV0aWwoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBhd2FpdCBjbG9zZUZpcmVmb3goKTtcclxuICAgICAgICBhd2FpdCBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCKHRoaXMuQ0hST01FX05TU19ESVIsIGNlcnRpZmljYXRlUGF0aCwgJ2NlcnR1dGlsJyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlYnVnKCdDaHJvbWUgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGluc3RhbGxlZCwgc2tpcHBpbmcgQ2hyb21lLXNwZWNpZmljIHN0ZXBzLi4uJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBhZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbjogc3RyaW5nKSB7XHJcbiAgICBsZXQgaG9zdHNGaWxlQ29udGVudHMgPSByZWFkKHRoaXMuSE9TVF9GSUxFX1BBVEgsICd1dGY4Jyk7XHJcbiAgICBpZiAoIWhvc3RzRmlsZUNvbnRlbnRzLmluY2x1ZGVzKGRvbWFpbikpIHtcclxuICAgICAgcnVuKGBlY2hvICcxMjcuMC4wLjEgICR7IGRvbWFpbiB9JyB8IHN1ZG8gdGVlIC1hIFwiJHsgdGhpcy5IT1NUX0ZJTEVfUEFUSCB9XCIgPiAvZGV2L251bGxgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlYWRQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiAoYXdhaXQgcnVuKGBzdWRvIGNhdCBcIiR7ZmlsZXBhdGh9XCJgKSkudG9TdHJpbmcoKS50cmltKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyB3cml0ZVByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZykge1xyXG4gICAgaWYgKGV4aXN0cyhmaWxlcGF0aCkpIHtcclxuICAgICAgYXdhaXQgcnVuKGBzdWRvIHJtIFwiJHtmaWxlcGF0aH1cImApO1xyXG4gICAgfVxyXG4gICAgd3JpdGVGaWxlKGZpbGVwYXRoLCBjb250ZW50cyk7XHJcbiAgICBhd2FpdCBydW4oYHN1ZG8gY2hvd24gMCBcIiR7ZmlsZXBhdGh9XCJgKTtcclxuICAgIGF3YWl0IHJ1bihgc3VkbyBjaG1vZCA2MDAgXCIke2ZpbGVwYXRofVwiYCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBpc0ZpcmVmb3hJbnN0YWxsZWQoKSB7XHJcbiAgICByZXR1cm4gZXhpc3RzKHRoaXMuRklSRUZPWF9CSU5fUEFUSCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzQ2hyb21lSW5zdGFsbGVkKCkge1xyXG4gICAgcmV0dXJuIGV4aXN0cyh0aGlzLkNIUk9NRV9CSU5fUEFUSCk7XHJcbiAgfVxyXG5cclxufSJdfQ==