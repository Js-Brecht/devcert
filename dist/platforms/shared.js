"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const url_1 = tslib_1.__importDefault(require("url"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const get_port_1 = tslib_1.__importDefault(require("get-port"));
const http_1 = tslib_1.__importDefault(require("http"));
const glob_1 = require("glob");
const fs_1 = require("fs");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const child_process_1 = require("child_process");
const debug = debug_1.default('devcert:platforms:shared');
/**
 *  Given a directory or glob pattern of directories, attempt to install the
 *  CA certificate to each directory containing an NSS database.
 */
function addCertificateToNSSCertDB(nssDirGlob, certPath, certutilPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`trying to install certificate into NSS databases in ${nssDirGlob}`);
        glob_1.sync(nssDirGlob).forEach((potentialNSSDBDir) => {
            debug(`checking to see if ${potentialNSSDBDir} is a valid NSS database directory`);
            if (fs_1.existsSync(path_1.default.join(potentialNSSDBDir, 'cert8.db'))) {
                debug(`Found legacy NSS database in ${potentialNSSDBDir}, adding certificate ...`);
                utils_1.run(`${certutilPath} -A -d "${potentialNSSDBDir}" -t 'C,,' -i "${certPath}" -n devcert`);
            }
            if (fs_1.existsSync(path_1.default.join(potentialNSSDBDir, 'cert9.db'))) {
                debug(`Found modern NSS database in ${potentialNSSDBDir}, adding certificate ...`);
                utils_1.run(`${certutilPath} -A -d "sql:${potentialNSSDBDir}" -t 'C,,' -i "${certPath}" -n devcert`);
            }
        });
        debug(`finished scanning & installing certificate in NSS databases in ${nssDirGlob}`);
    });
}
exports.addCertificateToNSSCertDB = addCertificateToNSSCertDB;
/**
 *  Check to see if Firefox is still running, and if so, ask the user to close
 *  it. Poll until it's closed, then return.
 *
 * This is needed because Firefox appears to load the NSS database in-memory on
 * startup, and overwrite on exit. So we have to ask the user to quite Firefox
 * first so our changes don't get overwritten.
 */
function closeFirefox() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (isFirefoxOpen()) {
            yield user_interface_1.default.closeFirefoxBeforeContinuing();
            while (isFirefoxOpen()) {
                yield sleep(50);
            }
        }
    });
}
exports.closeFirefox = closeFirefox;
/**
 * Check if Firefox is currently open
 */
function isFirefoxOpen() {
    // NOTE: We use some Windows-unfriendly methods here (ps) because Windows
    // never needs to check this, because it doesn't update the NSS DB
    // automaticaly.
    assert_1.default(constants_1.isMac || constants_1.isLinux, 'checkForOpenFirefox was invoked on a platform other than Mac or Linux');
    return child_process_1.execSync('ps aux').indexOf('firefox') > -1;
}
function sleep(ms) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
/**
 * Firefox manages it's own trust store for SSL certificates, which can be
 * managed via the certutil command (supplied by NSS tooling packages). In the
 * event that certutil is not already installed, and either can't be installed
 * (Windows) or the user doesn't want to install it (skipCertutilInstall:
 * true), it means that we can't programmatically tell Firefox to trust our
 * root CA certificate.
 *
 * There is a recourse though. When a Firefox tab is directed to a URL that
 * responds with a certificate, it will automatically prompt the user if they
 * want to add it to their trusted certificates. So if we can't automatically
 * install the certificate via certutil, we instead start a quick web server
 * and host our certificate file. Then we open the hosted cert URL in Firefox
 * to kick off the GUI flow.
 *
 * This method does all this, along with providing user prompts in the terminal
 * to walk them through this process.
 */
function openCertificateInFirefox(firefoxPath, certPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug('Adding devert to Firefox trust stores manually. Launching a webserver to host our certificate temporarily ...');
        let port = yield get_port_1.default();
        let server = http_1.default.createServer((req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let { pathname } = url_1.default.parse(req.url);
            if (pathname === '/certificate') {
                res.writeHead(200, { 'Content-type': 'application/x-x509-ca-cert' });
                res.write(fs_1.readFileSync(certPath));
                res.end();
            }
            else {
                res.writeHead(200);
                res.write(yield user_interface_1.default.firefoxWizardPromptPage(`http://localhost:${port}/certificate`));
                res.end();
            }
        })).listen(port);
        debug('Certificate server is up. Printing instructions for user and launching Firefox with hosted certificate URL');
        yield user_interface_1.default.startFirefoxWizard(`http://localhost:${port}`);
        utils_1.run(`${firefoxPath} http://localhost:${port}`);
        yield user_interface_1.default.waitForFirefoxWizard();
        server.close();
    });
}
exports.openCertificateInFirefox = openCertificateInFirefox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IkQ6L2Rldi9ncG0vZ2l0aHViLmNvbS9Kcy1CcmVjaHQvZGV2Y2VydC8iLCJzb3VyY2VzIjpbInBsYXRmb3Jtcy9zaGFyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLHNEQUFzQjtBQUN0QiwwREFBZ0M7QUFDaEMsNERBQTRCO0FBQzVCLGdFQUErQjtBQUMvQix3REFBd0I7QUFDeEIsK0JBQW9DO0FBQ3BDLDJCQUFvRTtBQUNwRSxvQ0FBK0I7QUFDL0IsNENBQThDO0FBQzlDLCtFQUFtQztBQUNuQyxpREFBaUQ7QUFFakQsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFdEQ7OztHQUdHO0FBQ0gsbUNBQWdELFVBQWtCLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQjs7UUFDeEcsS0FBSyxDQUFDLHVEQUF3RCxVQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLFdBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQzdDLEtBQUssQ0FBQyxzQkFBdUIsaUJBQWtCLG9DQUFvQyxDQUFDLENBQUM7WUFDckYsSUFBSSxlQUFNLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUNwRCxLQUFLLENBQUMsZ0NBQWlDLGlCQUFrQiwwQkFBMEIsQ0FBQyxDQUFBO2dCQUNwRixXQUFHLENBQUMsR0FBSSxZQUFhLFdBQVksaUJBQWtCLGtCQUFtQixRQUFTLGNBQWMsQ0FBQyxDQUFDO2FBQ2hHO1lBQ0QsSUFBSSxlQUFNLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUNwRCxLQUFLLENBQUMsZ0NBQWlDLGlCQUFrQiwwQkFBMEIsQ0FBQyxDQUFBO2dCQUNwRixXQUFHLENBQUMsR0FBSSxZQUFhLGVBQWdCLGlCQUFrQixrQkFBbUIsUUFBUyxjQUFjLENBQUMsQ0FBQzthQUNwRztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLGtFQUFtRSxVQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzFGLENBQUM7Q0FBQTtBQWRELDhEQWNDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNIOztRQUNFLElBQUksYUFBYSxFQUFFLEVBQUU7WUFDbkIsTUFBTSx3QkFBRSxDQUFDLDRCQUE0QixFQUFFLENBQUM7WUFDeEMsT0FBTSxhQUFhLEVBQUUsRUFBRTtnQkFDckIsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDakI7U0FDRjtJQUNILENBQUM7Q0FBQTtBQVBELG9DQU9DO0FBRUQ7O0dBRUc7QUFDSDtJQUNFLHlFQUF5RTtJQUN6RSxrRUFBa0U7SUFDbEUsZ0JBQWdCO0lBQ2hCLGdCQUFNLENBQUMsaUJBQUssSUFBSSxtQkFBTyxFQUFFLHVFQUF1RSxDQUFDLENBQUM7SUFDbEcsT0FBTyx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRUQsZUFBcUIsRUFBVTs7UUFDN0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILGtDQUErQyxXQUFtQixFQUFFLFFBQWdCOztRQUNsRixLQUFLLENBQUMsK0dBQStHLENBQUMsQ0FBQztRQUN2SCxJQUFJLElBQUksR0FBRyxNQUFNLGtCQUFPLEVBQUUsQ0FBQztRQUMzQixJQUFJLE1BQU0sR0FBRyxjQUFJLENBQUMsWUFBWSxDQUFDLENBQU8sR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2hELElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLFFBQVEsS0FBSyxjQUFjLEVBQUU7Z0JBQy9CLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLDRCQUE0QixFQUFFLENBQUMsQ0FBQztnQkFDckUsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNYO2lCQUFNO2dCQUNMLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSx3QkFBRSxDQUFDLHVCQUF1QixDQUFDLG9CQUFxQixJQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RGLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNYO1FBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsS0FBSyxDQUFDLDRHQUE0RyxDQUFDLENBQUM7UUFDcEgsTUFBTSx3QkFBRSxDQUFDLGtCQUFrQixDQUFDLG9CQUFxQixJQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFELFdBQUcsQ0FBQyxHQUFJLFdBQVkscUJBQXNCLElBQUssRUFBRSxDQUFDLENBQUM7UUFDbkQsTUFBTSx3QkFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQXBCRCw0REFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xyXG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xyXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XHJcbmltcG9ydCBnZXRQb3J0IGZyb20gJ2dldC1wb3J0JztcclxuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XHJcbmltcG9ydCB7IHN5bmMgYXMgZ2xvYiB9IGZyb20gJ2dsb2InO1xyXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgYXMgcmVhZEZpbGUsIGV4aXN0c1N5bmMgYXMgZXhpc3RzIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBydW4gfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IGlzTWFjLCBpc0xpbnV4IH0gZnJvbSAnLi4vY29uc3RhbnRzJztcclxuaW1wb3J0IFVJIGZyb20gJy4uL3VzZXItaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgZXhlY1N5bmMgYXMgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5cclxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpwbGF0Zm9ybXM6c2hhcmVkJyk7XHJcblxyXG4vKipcclxuICogIEdpdmVuIGEgZGlyZWN0b3J5IG9yIGdsb2IgcGF0dGVybiBvZiBkaXJlY3RvcmllcywgYXR0ZW1wdCB0byBpbnN0YWxsIHRoZVxyXG4gKiAgQ0EgY2VydGlmaWNhdGUgdG8gZWFjaCBkaXJlY3RvcnkgY29udGFpbmluZyBhbiBOU1MgZGF0YWJhc2UuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQihuc3NEaXJHbG9iOiBzdHJpbmcsIGNlcnRQYXRoOiBzdHJpbmcsIGNlcnR1dGlsUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZGVidWcoYHRyeWluZyB0byBpbnN0YWxsIGNlcnRpZmljYXRlIGludG8gTlNTIGRhdGFiYXNlcyBpbiAkeyBuc3NEaXJHbG9iIH1gKTtcclxuICBnbG9iKG5zc0Rpckdsb2IpLmZvckVhY2goKHBvdGVudGlhbE5TU0RCRGlyKSA9PiB7XHJcbiAgICBkZWJ1ZyhgY2hlY2tpbmcgdG8gc2VlIGlmICR7IHBvdGVudGlhbE5TU0RCRGlyIH0gaXMgYSB2YWxpZCBOU1MgZGF0YWJhc2UgZGlyZWN0b3J5YCk7XHJcbiAgICBpZiAoZXhpc3RzKHBhdGguam9pbihwb3RlbnRpYWxOU1NEQkRpciwgJ2NlcnQ4LmRiJykpKSB7XHJcbiAgICAgIGRlYnVnKGBGb3VuZCBsZWdhY3kgTlNTIGRhdGFiYXNlIGluICR7IHBvdGVudGlhbE5TU0RCRGlyIH0sIGFkZGluZyBjZXJ0aWZpY2F0ZSAuLi5gKVxyXG4gICAgICBydW4oYCR7IGNlcnR1dGlsUGF0aCB9IC1BIC1kIFwiJHsgcG90ZW50aWFsTlNTREJEaXIgfVwiIC10ICdDLCwnIC1pIFwiJHsgY2VydFBhdGggfVwiIC1uIGRldmNlcnRgKTtcclxuICAgIH1cclxuICAgIGlmIChleGlzdHMocGF0aC5qb2luKHBvdGVudGlhbE5TU0RCRGlyLCAnY2VydDkuZGInKSkpIHtcclxuICAgICAgZGVidWcoYEZvdW5kIG1vZGVybiBOU1MgZGF0YWJhc2UgaW4gJHsgcG90ZW50aWFsTlNTREJEaXIgfSwgYWRkaW5nIGNlcnRpZmljYXRlIC4uLmApXHJcbiAgICAgIHJ1bihgJHsgY2VydHV0aWxQYXRoIH0gLUEgLWQgXCJzcWw6JHsgcG90ZW50aWFsTlNTREJEaXIgfVwiIC10ICdDLCwnIC1pIFwiJHsgY2VydFBhdGggfVwiIC1uIGRldmNlcnRgKTtcclxuICAgIH1cclxuICB9KTtcclxuICBkZWJ1ZyhgZmluaXNoZWQgc2Nhbm5pbmcgJiBpbnN0YWxsaW5nIGNlcnRpZmljYXRlIGluIE5TUyBkYXRhYmFzZXMgaW4gJHsgbnNzRGlyR2xvYiB9YCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAgQ2hlY2sgdG8gc2VlIGlmIEZpcmVmb3ggaXMgc3RpbGwgcnVubmluZywgYW5kIGlmIHNvLCBhc2sgdGhlIHVzZXIgdG8gY2xvc2VcclxuICogIGl0LiBQb2xsIHVudGlsIGl0J3MgY2xvc2VkLCB0aGVuIHJldHVybi5cclxuICpcclxuICogVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBGaXJlZm94IGFwcGVhcnMgdG8gbG9hZCB0aGUgTlNTIGRhdGFiYXNlIGluLW1lbW9yeSBvblxyXG4gKiBzdGFydHVwLCBhbmQgb3ZlcndyaXRlIG9uIGV4aXQuIFNvIHdlIGhhdmUgdG8gYXNrIHRoZSB1c2VyIHRvIHF1aXRlIEZpcmVmb3hcclxuICogZmlyc3Qgc28gb3VyIGNoYW5nZXMgZG9uJ3QgZ2V0IG92ZXJ3cml0dGVuLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlRmlyZWZveCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBpZiAoaXNGaXJlZm94T3BlbigpKSB7XHJcbiAgICBhd2FpdCBVSS5jbG9zZUZpcmVmb3hCZWZvcmVDb250aW51aW5nKCk7XHJcbiAgICB3aGlsZShpc0ZpcmVmb3hPcGVuKCkpIHtcclxuICAgICAgYXdhaXQgc2xlZXAoNTApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIEZpcmVmb3ggaXMgY3VycmVudGx5IG9wZW5cclxuICovXHJcbmZ1bmN0aW9uIGlzRmlyZWZveE9wZW4oKSB7XHJcbiAgLy8gTk9URTogV2UgdXNlIHNvbWUgV2luZG93cy11bmZyaWVuZGx5IG1ldGhvZHMgaGVyZSAocHMpIGJlY2F1c2UgV2luZG93c1xyXG4gIC8vIG5ldmVyIG5lZWRzIHRvIGNoZWNrIHRoaXMsIGJlY2F1c2UgaXQgZG9lc24ndCB1cGRhdGUgdGhlIE5TUyBEQlxyXG4gIC8vIGF1dG9tYXRpY2FseS5cclxuICBhc3NlcnQoaXNNYWMgfHwgaXNMaW51eCwgJ2NoZWNrRm9yT3BlbkZpcmVmb3ggd2FzIGludm9rZWQgb24gYSBwbGF0Zm9ybSBvdGhlciB0aGFuIE1hYyBvciBMaW51eCcpO1xyXG4gIHJldHVybiBleGVjKCdwcyBhdXgnKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2xlZXAobXM6IG51bWJlcikge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcblxyXG4vKipcclxuICogRmlyZWZveCBtYW5hZ2VzIGl0J3Mgb3duIHRydXN0IHN0b3JlIGZvciBTU0wgY2VydGlmaWNhdGVzLCB3aGljaCBjYW4gYmVcclxuICogbWFuYWdlZCB2aWEgdGhlIGNlcnR1dGlsIGNvbW1hbmQgKHN1cHBsaWVkIGJ5IE5TUyB0b29saW5nIHBhY2thZ2VzKS4gSW4gdGhlXHJcbiAqIGV2ZW50IHRoYXQgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBhbmQgZWl0aGVyIGNhbid0IGJlIGluc3RhbGxlZFxyXG4gKiAoV2luZG93cykgb3IgdGhlIHVzZXIgZG9lc24ndCB3YW50IHRvIGluc3RhbGwgaXQgKHNraXBDZXJ0dXRpbEluc3RhbGw6XHJcbiAqIHRydWUpLCBpdCBtZWFucyB0aGF0IHdlIGNhbid0IHByb2dyYW1tYXRpY2FsbHkgdGVsbCBGaXJlZm94IHRvIHRydXN0IG91clxyXG4gKiByb290IENBIGNlcnRpZmljYXRlLlxyXG4gKlxyXG4gKiBUaGVyZSBpcyBhIHJlY291cnNlIHRob3VnaC4gV2hlbiBhIEZpcmVmb3ggdGFiIGlzIGRpcmVjdGVkIHRvIGEgVVJMIHRoYXRcclxuICogcmVzcG9uZHMgd2l0aCBhIGNlcnRpZmljYXRlLCBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgcHJvbXB0IHRoZSB1c2VyIGlmIHRoZXlcclxuICogd2FudCB0byBhZGQgaXQgdG8gdGhlaXIgdHJ1c3RlZCBjZXJ0aWZpY2F0ZXMuIFNvIGlmIHdlIGNhbid0IGF1dG9tYXRpY2FsbHlcclxuICogaW5zdGFsbCB0aGUgY2VydGlmaWNhdGUgdmlhIGNlcnR1dGlsLCB3ZSBpbnN0ZWFkIHN0YXJ0IGEgcXVpY2sgd2ViIHNlcnZlclxyXG4gKiBhbmQgaG9zdCBvdXIgY2VydGlmaWNhdGUgZmlsZS4gVGhlbiB3ZSBvcGVuIHRoZSBob3N0ZWQgY2VydCBVUkwgaW4gRmlyZWZveFxyXG4gKiB0byBraWNrIG9mZiB0aGUgR1VJIGZsb3cuXHJcbiAqXHJcbiAqIFRoaXMgbWV0aG9kIGRvZXMgYWxsIHRoaXMsIGFsb25nIHdpdGggcHJvdmlkaW5nIHVzZXIgcHJvbXB0cyBpbiB0aGUgdGVybWluYWxcclxuICogdG8gd2FsayB0aGVtIHRocm91Z2ggdGhpcyBwcm9jZXNzLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveChmaXJlZm94UGF0aDogc3RyaW5nLCBjZXJ0UGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZGVidWcoJ0FkZGluZyBkZXZlcnQgdG8gRmlyZWZveCB0cnVzdCBzdG9yZXMgbWFudWFsbHkuIExhdW5jaGluZyBhIHdlYnNlcnZlciB0byBob3N0IG91ciBjZXJ0aWZpY2F0ZSB0ZW1wb3JhcmlseSAuLi4nKTtcclxuICBsZXQgcG9ydCA9IGF3YWl0IGdldFBvcnQoKTtcclxuICBsZXQgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICBsZXQgeyBwYXRobmFtZSB9ID0gdXJsLnBhcnNlKHJlcS51cmwpO1xyXG4gICAgaWYgKHBhdGhuYW1lID09PSAnL2NlcnRpZmljYXRlJykge1xyXG4gICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gteDUwOS1jYS1jZXJ0JyB9KTtcclxuICAgICAgcmVzLndyaXRlKHJlYWRGaWxlKGNlcnRQYXRoKSk7XHJcbiAgICAgIHJlcy5lbmQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlcy53cml0ZUhlYWQoMjAwKTtcclxuICAgICAgcmVzLndyaXRlKGF3YWl0IFVJLmZpcmVmb3hXaXphcmRQcm9tcHRQYWdlKGBodHRwOi8vbG9jYWxob3N0OiR7IHBvcnQgfS9jZXJ0aWZpY2F0ZWApKTtcclxuICAgICAgcmVzLmVuZCgpO1xyXG4gICAgfVxyXG4gIH0pLmxpc3Rlbihwb3J0KTtcclxuICBkZWJ1ZygnQ2VydGlmaWNhdGUgc2VydmVyIGlzIHVwLiBQcmludGluZyBpbnN0cnVjdGlvbnMgZm9yIHVzZXIgYW5kIGxhdW5jaGluZyBGaXJlZm94IHdpdGggaG9zdGVkIGNlcnRpZmljYXRlIFVSTCcpO1xyXG4gIGF3YWl0IFVJLnN0YXJ0RmlyZWZveFdpemFyZChgaHR0cDovL2xvY2FsaG9zdDokeyBwb3J0IH1gKTtcclxuICBydW4oYCR7IGZpcmVmb3hQYXRoIH0gaHR0cDovL2xvY2FsaG9zdDokeyBwb3J0IH1gKTtcclxuICBhd2FpdCBVSS53YWl0Rm9yRmlyZWZveFdpemFyZCgpO1xyXG4gIHNlcnZlci5jbG9zZSgpO1xyXG59XHJcbiJdfQ==