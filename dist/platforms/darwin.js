"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const utils_1 = require("../utils");
const shared_1 = require("./shared");
const debug = debug_1.default('devcert:platforms:macos');
class MacOSPlatform {
    constructor() {
        this.FIREFOX_BUNDLE_PATH = '/Applications/Firefox.app';
        this.FIREFOX_BIN_PATH = path_1.default.join(this.FIREFOX_BUNDLE_PATH, 'Contents/MacOS/firefox');
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, 'Library/Application Support/Firefox/Profiles/*');
        this.HOST_FILE_PATH = '/etc/hosts';
    }
    /**
     * macOS is pretty simple - just add the certificate to the system keychain,
     * and most applications will delegate to that for determining trusted
     * certificates. Firefox, of course, does it's own thing. We can try to
     * automatically install the cert with Firefox if we can use certutil via the
     * `nss` Homebrew package, otherwise we go manual with user-facing prompts.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Chrome, Safari, system utils
            debug('Adding devcert root CA to macOS system keychain');
            utils_1.run(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain -p ssl -p basic "${certificatePath}"`);
            if (this.isFirefoxInstalled()) {
                // Try to use certutil to install the cert automatically
                debug('Firefox install detected. Adding devcert root CA to Firefox trust store');
                if (!this.isNSSInstalled()) {
                    if (!options.skipCertutilInstall) {
                        if (command_exists_1.sync('brew')) {
                            debug(`certutil is not already installed, but Homebrew is detected. Trying to install certutil via Homebrew...`);
                            utils_1.run('brew install nss');
                        }
                        else {
                            debug(`Homebrew isn't installed, so we can't try to install certutil. Falling back to manual certificate install`);
                            return yield shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                        }
                    }
                    else {
                        debug(`certutil is not already installed, and skipCertutilInstall is true, so we have to fall back to a manual install`);
                        return yield shared_1.openCertificateInFirefox(this.FIREFOX_BIN_PATH, certificatePath);
                    }
                }
                let certutilPath = path_1.default.join(utils_1.run('brew --prefix nss').toString().trim(), 'bin', 'certutil');
                yield shared_1.closeFirefox();
                yield shared_1.addCertificateToNSSCertDB(this.FIREFOX_NSS_DIR, certificatePath, certutilPath);
            }
            else {
                debug('Firefox does not appear to be installed, skipping Firefox-specific steps...');
            }
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let hostsFileContents = fs_1.readFileSync(this.HOST_FILE_PATH, 'utf8');
            if (!hostsFileContents.includes(domain)) {
                utils_1.run(`echo '\n127.0.0.1 ${domain}' | sudo tee -a "${this.HOST_FILE_PATH}" > /dev/null`);
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
        return fs_1.existsSync(this.FIREFOX_BUNDLE_PATH);
    }
    isNSSInstalled() {
        try {
            return utils_1.run('brew list -1').toString().includes('\nnss\n');
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = MacOSPlatform;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFyd2luLmpzIiwic291cmNlUm9vdCI6IkQ6L2Rldi9zb3VyY2Uvbm9kZS9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL2Rhcndpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBd0I7QUFDeEIsMkJBQTRGO0FBQzVGLDBEQUFnQztBQUNoQyxtREFBdUQ7QUFDdkQsb0NBQStCO0FBRS9CLHFDQUE2RjtBQUc3RixNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUdyRDtJQUFBO1FBRVUsd0JBQW1CLEdBQUcsMkJBQTJCLENBQUM7UUFDbEQscUJBQWdCLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNqRixvQkFBZSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztRQUVoRyxtQkFBYyxHQUFHLFlBQVksQ0FBQztJQXdFeEMsQ0FBQztJQXRFQzs7Ozs7O09BTUc7SUFDRyxnQkFBZ0IsQ0FBQyxlQUF1QixFQUFFLFVBQW1CLEVBQUU7O1lBRW5FLCtCQUErQjtZQUMvQixLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztZQUN6RCxXQUFHLENBQUMseUdBQTBHLGVBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBRW5JLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQzdCLHdEQUF3RDtnQkFDeEQsS0FBSyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7b0JBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUU7d0JBQ2hDLElBQUkscUJBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTs0QkFDekIsS0FBSyxDQUFDLHlHQUF5RyxDQUFDLENBQUM7NEJBQ2pILFdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3lCQUN6Qjs2QkFBTTs0QkFDTCxLQUFLLENBQUMsMkdBQTJHLENBQUMsQ0FBQzs0QkFDbkgsT0FBTyxNQUFNLGlDQUF3QixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQzt5QkFDL0U7cUJBQ0Y7eUJBQU07d0JBQ0wsS0FBSyxDQUFDLGlIQUFpSCxDQUFDLENBQUE7d0JBQ3hILE9BQU8sTUFBTSxpQ0FBd0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7cUJBQy9FO2lCQUNGO2dCQUNELElBQUksWUFBWSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsV0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUM1RixNQUFNLHFCQUFZLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxrQ0FBeUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUN0RjtpQkFBTTtnQkFDTCxLQUFLLENBQUMsNkVBQTZFLENBQUMsQ0FBQzthQUN0RjtRQUNILENBQUM7S0FBQTtJQUVLLDRCQUE0QixDQUFDLE1BQWM7O1lBQy9DLElBQUksaUJBQWlCLEdBQUcsaUJBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZDLFdBQUcsQ0FBQyxxQkFBc0IsTUFBTyxvQkFBcUIsSUFBSSxDQUFDLGNBQWUsZUFBZSxDQUFDLENBQUM7YUFDNUY7UUFDSCxDQUFDO0tBQUE7SUFFSyxpQkFBaUIsQ0FBQyxRQUFnQjs7WUFDdEMsT0FBTyxDQUFDLE1BQU0sV0FBRyxDQUFDLGFBQWEsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pFLENBQUM7S0FBQTtJQUVLLGtCQUFrQixDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7O1lBQ3pELElBQUksZUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNwQixNQUFNLFdBQUcsQ0FBQyxZQUFZLFFBQVEsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFDRCxrQkFBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM5QixNQUFNLFdBQUcsQ0FBQyxpQkFBaUIsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUN4QyxNQUFNLFdBQUcsQ0FBQyxtQkFBbUIsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQUE7SUFFTyxrQkFBa0I7UUFDeEIsT0FBTyxlQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVPLGNBQWM7UUFDcEIsSUFBSTtZQUNGLE9BQU8sV0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxLQUFLLENBQUM7U0FDZDtJQUNILENBQUM7Q0FFRjtBQTlFRCxnQ0E4RUM7QUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMgYXMgd3JpdGVGaWxlLCBleGlzdHNTeW5jIGFzIGV4aXN0cywgcmVhZEZpbGVTeW5jIGFzIHJlYWQgfSBmcm9tICdmcyc7XHJcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCB7IHN5bmMgYXMgY29tbWFuZEV4aXN0cyB9IGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcclxuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgeyBhZGRDZXJ0aWZpY2F0ZVRvTlNTQ2VydERCLCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3gsIGNsb3NlRmlyZWZveCB9IGZyb20gJy4vc2hhcmVkJztcclxuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuJztcclxuXHJcbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6cGxhdGZvcm1zOm1hY29zJyk7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFjT1NQbGF0Zm9ybSBpbXBsZW1lbnRzIFBsYXRmb3JtIHtcclxuXHJcbiAgcHJpdmF0ZSBGSVJFRk9YX0JVTkRMRV9QQVRIID0gJy9BcHBsaWNhdGlvbnMvRmlyZWZveC5hcHAnO1xyXG4gIHByaXZhdGUgRklSRUZPWF9CSU5fUEFUSCA9IHBhdGguam9pbih0aGlzLkZJUkVGT1hfQlVORExFX1BBVEgsICdDb250ZW50cy9NYWNPUy9maXJlZm94Jyk7XHJcbiAgcHJpdmF0ZSBGSVJFRk9YX05TU19ESVIgPSBwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuSE9NRSwgJ0xpYnJhcnkvQXBwbGljYXRpb24gU3VwcG9ydC9GaXJlZm94L1Byb2ZpbGVzLyonKTtcclxuXHJcbiAgcHJpdmF0ZSBIT1NUX0ZJTEVfUEFUSCA9ICcvZXRjL2hvc3RzJztcclxuXHJcbiAgLyoqXHJcbiAgICogbWFjT1MgaXMgcHJldHR5IHNpbXBsZSAtIGp1c3QgYWRkIHRoZSBjZXJ0aWZpY2F0ZSB0byB0aGUgc3lzdGVtIGtleWNoYWluLFxyXG4gICAqIGFuZCBtb3N0IGFwcGxpY2F0aW9ucyB3aWxsIGRlbGVnYXRlIHRvIHRoYXQgZm9yIGRldGVybWluaW5nIHRydXN0ZWRcclxuICAgKiBjZXJ0aWZpY2F0ZXMuIEZpcmVmb3gsIG9mIGNvdXJzZSwgZG9lcyBpdCdzIG93biB0aGluZy4gV2UgY2FuIHRyeSB0b1xyXG4gICAqIGF1dG9tYXRpY2FsbHkgaW5zdGFsbCB0aGUgY2VydCB3aXRoIEZpcmVmb3ggaWYgd2UgY2FuIHVzZSBjZXJ0dXRpbCB2aWEgdGhlXHJcbiAgICogYG5zc2AgSG9tZWJyZXcgcGFja2FnZSwgb3RoZXJ3aXNlIHdlIGdvIG1hbnVhbCB3aXRoIHVzZXItZmFjaW5nIHByb21wdHMuXHJcbiAgICovXHJcbiAgYXN5bmMgYWRkVG9UcnVzdFN0b3JlcyhjZXJ0aWZpY2F0ZVBhdGg6IHN0cmluZywgb3B0aW9uczogT3B0aW9ucyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgLy8gQ2hyb21lLCBTYWZhcmksIHN5c3RlbSB1dGlsc1xyXG4gICAgZGVidWcoJ0FkZGluZyBkZXZjZXJ0IHJvb3QgQ0EgdG8gbWFjT1Mgc3lzdGVtIGtleWNoYWluJyk7XHJcbiAgICBydW4oYHN1ZG8gc2VjdXJpdHkgYWRkLXRydXN0ZWQtY2VydCAtZCAtciB0cnVzdFJvb3QgLWsgL0xpYnJhcnkvS2V5Y2hhaW5zL1N5c3RlbS5rZXljaGFpbiAtcCBzc2wgLXAgYmFzaWMgXCIkeyBjZXJ0aWZpY2F0ZVBhdGggfVwiYCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNGaXJlZm94SW5zdGFsbGVkKCkpIHtcclxuICAgICAgLy8gVHJ5IHRvIHVzZSBjZXJ0dXRpbCB0byBpbnN0YWxsIHRoZSBjZXJ0IGF1dG9tYXRpY2FsbHlcclxuICAgICAgZGVidWcoJ0ZpcmVmb3ggaW5zdGFsbCBkZXRlY3RlZC4gQWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBGaXJlZm94IHRydXN0IHN0b3JlJyk7XHJcbiAgICAgIGlmICghdGhpcy5pc05TU0luc3RhbGxlZCgpKSB7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnNraXBDZXJ0dXRpbEluc3RhbGwpIHtcclxuICAgICAgICAgIGlmIChjb21tYW5kRXhpc3RzKCdicmV3JykpIHtcclxuICAgICAgICAgICAgZGVidWcoYGNlcnR1dGlsIGlzIG5vdCBhbHJlYWR5IGluc3RhbGxlZCwgYnV0IEhvbWVicmV3IGlzIGRldGVjdGVkLiBUcnlpbmcgdG8gaW5zdGFsbCBjZXJ0dXRpbCB2aWEgSG9tZWJyZXcuLi5gKTtcclxuICAgICAgICAgICAgcnVuKCdicmV3IGluc3RhbGwgbnNzJyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZWJ1ZyhgSG9tZWJyZXcgaXNuJ3QgaW5zdGFsbGVkLCBzbyB3ZSBjYW4ndCB0cnkgdG8gaW5zdGFsbCBjZXJ0dXRpbC4gRmFsbGluZyBiYWNrIHRvIG1hbnVhbCBjZXJ0aWZpY2F0ZSBpbnN0YWxsYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3godGhpcy5GSVJFRk9YX0JJTl9QQVRILCBjZXJ0aWZpY2F0ZVBhdGgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkZWJ1ZyhgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBhbmQgc2tpcENlcnR1dGlsSW5zdGFsbCBpcyB0cnVlLCBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBhIG1hbnVhbCBpbnN0YWxsYClcclxuICAgICAgICAgIHJldHVybiBhd2FpdCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3godGhpcy5GSVJFRk9YX0JJTl9QQVRILCBjZXJ0aWZpY2F0ZVBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBsZXQgY2VydHV0aWxQYXRoID0gcGF0aC5qb2luKHJ1bignYnJldyAtLXByZWZpeCBuc3MnKS50b1N0cmluZygpLnRyaW0oKSwgJ2JpbicsICdjZXJ0dXRpbCcpO1xyXG4gICAgICBhd2FpdCBjbG9zZUZpcmVmb3goKTtcclxuICAgICAgYXdhaXQgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQih0aGlzLkZJUkVGT1hfTlNTX0RJUiwgY2VydGlmaWNhdGVQYXRoLCBjZXJ0dXRpbFBhdGgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVidWcoJ0ZpcmVmb3ggZG9lcyBub3QgYXBwZWFyIHRvIGJlIGluc3RhbGxlZCwgc2tpcHBpbmcgRmlyZWZveC1zcGVjaWZpYyBzdGVwcy4uLicpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgYWRkRG9tYWluVG9Ib3N0RmlsZUlmTWlzc2luZyhkb21haW46IHN0cmluZykge1xyXG4gICAgbGV0IGhvc3RzRmlsZUNvbnRlbnRzID0gcmVhZCh0aGlzLkhPU1RfRklMRV9QQVRILCAndXRmOCcpO1xyXG4gICAgaWYgKCFob3N0c0ZpbGVDb250ZW50cy5pbmNsdWRlcyhkb21haW4pKSB7XHJcbiAgICAgIHJ1bihgZWNobyAnXFxuMTI3LjAuMC4xICR7IGRvbWFpbiB9JyB8IHN1ZG8gdGVlIC1hIFwiJHsgdGhpcy5IT1NUX0ZJTEVfUEFUSCB9XCIgPiAvZGV2L251bGxgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlYWRQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiAoYXdhaXQgcnVuKGBzdWRvIGNhdCBcIiR7ZmlsZXBhdGh9XCJgKSkudG9TdHJpbmcoKS50cmltKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyB3cml0ZVByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZykge1xyXG4gICAgaWYgKGV4aXN0cyhmaWxlcGF0aCkpIHtcclxuICAgICAgYXdhaXQgcnVuKGBzdWRvIHJtIFwiJHtmaWxlcGF0aH1cImApO1xyXG4gICAgfVxyXG4gICAgd3JpdGVGaWxlKGZpbGVwYXRoLCBjb250ZW50cyk7XHJcbiAgICBhd2FpdCBydW4oYHN1ZG8gY2hvd24gMCBcIiR7ZmlsZXBhdGh9XCJgKTtcclxuICAgIGF3YWl0IHJ1bihgc3VkbyBjaG1vZCA2MDAgXCIke2ZpbGVwYXRofVwiYCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzRmlyZWZveEluc3RhbGxlZCgpIHtcclxuICAgIHJldHVybiBleGlzdHModGhpcy5GSVJFRk9YX0JVTkRMRV9QQVRIKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNOU1NJbnN0YWxsZWQoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gcnVuKCdicmV3IGxpc3QgLTEnKS50b1N0cmluZygpLmluY2x1ZGVzKCdcXG5uc3NcXG4nKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn07XHJcbiJdfQ==