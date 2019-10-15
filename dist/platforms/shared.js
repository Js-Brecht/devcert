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
                utils_1.run(`${certutilPath} -A -d "${potentialNSSDBDir}" -t 'C,,' -i ${certPath} -n devcert`);
            }
            if (fs_1.existsSync(path_1.default.join(potentialNSSDBDir, 'cert9.db'))) {
                debug(`Found modern NSS database in ${potentialNSSDBDir}, adding certificate ...`);
                utils_1.run(`${certutilPath} -A -d "sql:${potentialNSSDBDir}" -t 'C,,' -i ${certPath} -n devcert`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IkQ6L2Rldi9ncG0vZ2l0aHViLmNvbS9Kcy1CcmVjaHQvZGV2Y2VydC8iLCJzb3VyY2VzIjpbInBsYXRmb3Jtcy9zaGFyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLHNEQUFzQjtBQUN0QiwwREFBZ0M7QUFDaEMsNERBQTRCO0FBQzVCLGdFQUErQjtBQUMvQix3REFBd0I7QUFDeEIsK0JBQW9DO0FBQ3BDLDJCQUFvRTtBQUNwRSxvQ0FBK0I7QUFDL0IsNENBQThDO0FBQzlDLCtFQUFtQztBQUNuQyxpREFBaUQ7QUFFakQsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFdEQ7OztHQUdHO0FBQ0gsbUNBQWdELFVBQWtCLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQjs7UUFDeEcsS0FBSyxDQUFDLHVEQUF3RCxVQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLFdBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1lBQzdDLEtBQUssQ0FBQyxzQkFBdUIsaUJBQWtCLG9DQUFvQyxDQUFDLENBQUM7WUFDckYsSUFBSSxlQUFNLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUNwRCxLQUFLLENBQUMsZ0NBQWlDLGlCQUFrQiwwQkFBMEIsQ0FBQyxDQUFBO2dCQUNwRixXQUFHLENBQUMsR0FBSSxZQUFhLFdBQVksaUJBQWtCLGlCQUFrQixRQUFTLGFBQWEsQ0FBQyxDQUFDO2FBQzlGO1lBQ0QsSUFBSSxlQUFNLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUNwRCxLQUFLLENBQUMsZ0NBQWlDLGlCQUFrQiwwQkFBMEIsQ0FBQyxDQUFBO2dCQUNwRixXQUFHLENBQUMsR0FBSSxZQUFhLGVBQWdCLGlCQUFrQixpQkFBa0IsUUFBUyxhQUFhLENBQUMsQ0FBQzthQUNsRztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLGtFQUFtRSxVQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzFGLENBQUM7Q0FBQTtBQWRELDhEQWNDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNIOztRQUNFLElBQUksYUFBYSxFQUFFLEVBQUU7WUFDbkIsTUFBTSx3QkFBRSxDQUFDLDRCQUE0QixFQUFFLENBQUM7WUFDeEMsT0FBTSxhQUFhLEVBQUUsRUFBRTtnQkFDckIsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDakI7U0FDRjtJQUNILENBQUM7Q0FBQTtBQVBELG9DQU9DO0FBRUQ7O0dBRUc7QUFDSDtJQUNFLHlFQUF5RTtJQUN6RSxrRUFBa0U7SUFDbEUsZ0JBQWdCO0lBQ2hCLGdCQUFNLENBQUMsaUJBQUssSUFBSSxtQkFBTyxFQUFFLHVFQUF1RSxDQUFDLENBQUM7SUFDbEcsT0FBTyx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRUQsZUFBcUIsRUFBVTs7UUFDN0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILGtDQUErQyxXQUFtQixFQUFFLFFBQWdCOztRQUNsRixLQUFLLENBQUMsK0dBQStHLENBQUMsQ0FBQztRQUN2SCxJQUFJLElBQUksR0FBRyxNQUFNLGtCQUFPLEVBQUUsQ0FBQztRQUMzQixJQUFJLE1BQU0sR0FBRyxjQUFJLENBQUMsWUFBWSxDQUFDLENBQU8sR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2hELElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLFFBQVEsS0FBSyxjQUFjLEVBQUU7Z0JBQy9CLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLDRCQUE0QixFQUFFLENBQUMsQ0FBQztnQkFDckUsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNYO2lCQUFNO2dCQUNMLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSx3QkFBRSxDQUFDLHVCQUF1QixDQUFDLG9CQUFxQixJQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RGLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNYO1FBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsS0FBSyxDQUFDLDRHQUE0RyxDQUFDLENBQUM7UUFDcEgsTUFBTSx3QkFBRSxDQUFDLGtCQUFrQixDQUFDLG9CQUFxQixJQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFELFdBQUcsQ0FBQyxHQUFJLFdBQVkscUJBQXNCLElBQUssRUFBRSxDQUFDLENBQUM7UUFDbkQsTUFBTSx3QkFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQXBCRCw0REFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xyXG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xyXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XHJcbmltcG9ydCBnZXRQb3J0IGZyb20gJ2dldC1wb3J0JztcclxuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XHJcbmltcG9ydCB7IHN5bmMgYXMgZ2xvYiB9IGZyb20gJ2dsb2InO1xyXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgYXMgcmVhZEZpbGUsIGV4aXN0c1N5bmMgYXMgZXhpc3RzIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBydW4gfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IGlzTWFjLCBpc0xpbnV4IH0gZnJvbSAnLi4vY29uc3RhbnRzJztcclxuaW1wb3J0IFVJIGZyb20gJy4uL3VzZXItaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgZXhlY1N5bmMgYXMgZXhlYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5cclxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpwbGF0Zm9ybXM6c2hhcmVkJyk7XHJcblxyXG4vKipcclxuICogIEdpdmVuIGEgZGlyZWN0b3J5IG9yIGdsb2IgcGF0dGVybiBvZiBkaXJlY3RvcmllcywgYXR0ZW1wdCB0byBpbnN0YWxsIHRoZVxyXG4gKiAgQ0EgY2VydGlmaWNhdGUgdG8gZWFjaCBkaXJlY3RvcnkgY29udGFpbmluZyBhbiBOU1MgZGF0YWJhc2UuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQihuc3NEaXJHbG9iOiBzdHJpbmcsIGNlcnRQYXRoOiBzdHJpbmcsIGNlcnR1dGlsUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgZGVidWcoYHRyeWluZyB0byBpbnN0YWxsIGNlcnRpZmljYXRlIGludG8gTlNTIGRhdGFiYXNlcyBpbiAkeyBuc3NEaXJHbG9iIH1gKTtcclxuICBnbG9iKG5zc0Rpckdsb2IpLmZvckVhY2goKHBvdGVudGlhbE5TU0RCRGlyKSA9PiB7XHJcbiAgICBkZWJ1ZyhgY2hlY2tpbmcgdG8gc2VlIGlmICR7IHBvdGVudGlhbE5TU0RCRGlyIH0gaXMgYSB2YWxpZCBOU1MgZGF0YWJhc2UgZGlyZWN0b3J5YCk7XHJcbiAgICBpZiAoZXhpc3RzKHBhdGguam9pbihwb3RlbnRpYWxOU1NEQkRpciwgJ2NlcnQ4LmRiJykpKSB7XHJcbiAgICAgIGRlYnVnKGBGb3VuZCBsZWdhY3kgTlNTIGRhdGFiYXNlIGluICR7IHBvdGVudGlhbE5TU0RCRGlyIH0sIGFkZGluZyBjZXJ0aWZpY2F0ZSAuLi5gKVxyXG4gICAgICBydW4oYCR7IGNlcnR1dGlsUGF0aCB9IC1BIC1kIFwiJHsgcG90ZW50aWFsTlNTREJEaXIgfVwiIC10ICdDLCwnIC1pICR7IGNlcnRQYXRoIH0gLW4gZGV2Y2VydGApO1xyXG4gICAgfVxyXG4gICAgaWYgKGV4aXN0cyhwYXRoLmpvaW4ocG90ZW50aWFsTlNTREJEaXIsICdjZXJ0OS5kYicpKSkge1xyXG4gICAgICBkZWJ1ZyhgRm91bmQgbW9kZXJuIE5TUyBkYXRhYmFzZSBpbiAkeyBwb3RlbnRpYWxOU1NEQkRpciB9LCBhZGRpbmcgY2VydGlmaWNhdGUgLi4uYClcclxuICAgICAgcnVuKGAkeyBjZXJ0dXRpbFBhdGggfSAtQSAtZCBcInNxbDokeyBwb3RlbnRpYWxOU1NEQkRpciB9XCIgLXQgJ0MsLCcgLWkgJHsgY2VydFBhdGggfSAtbiBkZXZjZXJ0YCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgZGVidWcoYGZpbmlzaGVkIHNjYW5uaW5nICYgaW5zdGFsbGluZyBjZXJ0aWZpY2F0ZSBpbiBOU1MgZGF0YWJhc2VzIGluICR7IG5zc0Rpckdsb2IgfWApO1xyXG59XHJcblxyXG4vKipcclxuICogIENoZWNrIHRvIHNlZSBpZiBGaXJlZm94IGlzIHN0aWxsIHJ1bm5pbmcsIGFuZCBpZiBzbywgYXNrIHRoZSB1c2VyIHRvIGNsb3NlXHJcbiAqICBpdC4gUG9sbCB1bnRpbCBpdCdzIGNsb3NlZCwgdGhlbiByZXR1cm4uXHJcbiAqXHJcbiAqIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgRmlyZWZveCBhcHBlYXJzIHRvIGxvYWQgdGhlIE5TUyBkYXRhYmFzZSBpbi1tZW1vcnkgb25cclxuICogc3RhcnR1cCwgYW5kIG92ZXJ3cml0ZSBvbiBleGl0LiBTbyB3ZSBoYXZlIHRvIGFzayB0aGUgdXNlciB0byBxdWl0ZSBGaXJlZm94XHJcbiAqIGZpcnN0IHNvIG91ciBjaGFuZ2VzIGRvbid0IGdldCBvdmVyd3JpdHRlbi5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9zZUZpcmVmb3goKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgaWYgKGlzRmlyZWZveE9wZW4oKSkge1xyXG4gICAgYXdhaXQgVUkuY2xvc2VGaXJlZm94QmVmb3JlQ29udGludWluZygpO1xyXG4gICAgd2hpbGUoaXNGaXJlZm94T3BlbigpKSB7XHJcbiAgICAgIGF3YWl0IHNsZWVwKDUwKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVjayBpZiBGaXJlZm94IGlzIGN1cnJlbnRseSBvcGVuXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0ZpcmVmb3hPcGVuKCkge1xyXG4gIC8vIE5PVEU6IFdlIHVzZSBzb21lIFdpbmRvd3MtdW5mcmllbmRseSBtZXRob2RzIGhlcmUgKHBzKSBiZWNhdXNlIFdpbmRvd3NcclxuICAvLyBuZXZlciBuZWVkcyB0byBjaGVjayB0aGlzLCBiZWNhdXNlIGl0IGRvZXNuJ3QgdXBkYXRlIHRoZSBOU1MgREJcclxuICAvLyBhdXRvbWF0aWNhbHkuXHJcbiAgYXNzZXJ0KGlzTWFjIHx8IGlzTGludXgsICdjaGVja0Zvck9wZW5GaXJlZm94IHdhcyBpbnZva2VkIG9uIGEgcGxhdGZvcm0gb3RoZXIgdGhhbiBNYWMgb3IgTGludXgnKTtcclxuICByZXR1cm4gZXhlYygncHMgYXV4JykuaW5kZXhPZignZmlyZWZveCcpID4gLTE7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpcmVmb3ggbWFuYWdlcyBpdCdzIG93biB0cnVzdCBzdG9yZSBmb3IgU1NMIGNlcnRpZmljYXRlcywgd2hpY2ggY2FuIGJlXHJcbiAqIG1hbmFnZWQgdmlhIHRoZSBjZXJ0dXRpbCBjb21tYW5kIChzdXBwbGllZCBieSBOU1MgdG9vbGluZyBwYWNrYWdlcykuIEluIHRoZVxyXG4gKiBldmVudCB0aGF0IGNlcnR1dGlsIGlzIG5vdCBhbHJlYWR5IGluc3RhbGxlZCwgYW5kIGVpdGhlciBjYW4ndCBiZSBpbnN0YWxsZWRcclxuICogKFdpbmRvd3MpIG9yIHRoZSB1c2VyIGRvZXNuJ3Qgd2FudCB0byBpbnN0YWxsIGl0IChza2lwQ2VydHV0aWxJbnN0YWxsOlxyXG4gKiB0cnVlKSwgaXQgbWVhbnMgdGhhdCB3ZSBjYW4ndCBwcm9ncmFtbWF0aWNhbGx5IHRlbGwgRmlyZWZveCB0byB0cnVzdCBvdXJcclxuICogcm9vdCBDQSBjZXJ0aWZpY2F0ZS5cclxuICpcclxuICogVGhlcmUgaXMgYSByZWNvdXJzZSB0aG91Z2guIFdoZW4gYSBGaXJlZm94IHRhYiBpcyBkaXJlY3RlZCB0byBhIFVSTCB0aGF0XHJcbiAqIHJlc3BvbmRzIHdpdGggYSBjZXJ0aWZpY2F0ZSwgaXQgd2lsbCBhdXRvbWF0aWNhbGx5IHByb21wdCB0aGUgdXNlciBpZiB0aGV5XHJcbiAqIHdhbnQgdG8gYWRkIGl0IHRvIHRoZWlyIHRydXN0ZWQgY2VydGlmaWNhdGVzLiBTbyBpZiB3ZSBjYW4ndCBhdXRvbWF0aWNhbGx5XHJcbiAqIGluc3RhbGwgdGhlIGNlcnRpZmljYXRlIHZpYSBjZXJ0dXRpbCwgd2UgaW5zdGVhZCBzdGFydCBhIHF1aWNrIHdlYiBzZXJ2ZXJcclxuICogYW5kIGhvc3Qgb3VyIGNlcnRpZmljYXRlIGZpbGUuIFRoZW4gd2Ugb3BlbiB0aGUgaG9zdGVkIGNlcnQgVVJMIGluIEZpcmVmb3hcclxuICogdG8ga2ljayBvZmYgdGhlIEdVSSBmbG93LlxyXG4gKlxyXG4gKiBUaGlzIG1ldGhvZCBkb2VzIGFsbCB0aGlzLCBhbG9uZyB3aXRoIHByb3ZpZGluZyB1c2VyIHByb21wdHMgaW4gdGhlIHRlcm1pbmFsXHJcbiAqIHRvIHdhbGsgdGhlbSB0aHJvdWdoIHRoaXMgcHJvY2Vzcy5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3goZmlyZWZveFBhdGg6IHN0cmluZywgY2VydFBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGRlYnVnKCdBZGRpbmcgZGV2ZXJ0IHRvIEZpcmVmb3ggdHJ1c3Qgc3RvcmVzIG1hbnVhbGx5LiBMYXVuY2hpbmcgYSB3ZWJzZXJ2ZXIgdG8gaG9zdCBvdXIgY2VydGlmaWNhdGUgdGVtcG9yYXJpbHkgLi4uJyk7XHJcbiAgbGV0IHBvcnQgPSBhd2FpdCBnZXRQb3J0KCk7XHJcbiAgbGV0IHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgbGV0IHsgcGF0aG5hbWUgfSA9IHVybC5wYXJzZShyZXEudXJsKTtcclxuICAgIGlmIChwYXRobmFtZSA9PT0gJy9jZXJ0aWZpY2F0ZScpIHtcclxuICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHsgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXg1MDktY2EtY2VydCcgfSk7XHJcbiAgICAgIHJlcy53cml0ZShyZWFkRmlsZShjZXJ0UGF0aCkpO1xyXG4gICAgICByZXMuZW5kKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXMud3JpdGVIZWFkKDIwMCk7XHJcbiAgICAgIHJlcy53cml0ZShhd2FpdCBVSS5maXJlZm94V2l6YXJkUHJvbXB0UGFnZShgaHR0cDovL2xvY2FsaG9zdDokeyBwb3J0IH0vY2VydGlmaWNhdGVgKSk7XHJcbiAgICAgIHJlcy5lbmQoKTtcclxuICAgIH1cclxuICB9KS5saXN0ZW4ocG9ydCk7XHJcbiAgZGVidWcoJ0NlcnRpZmljYXRlIHNlcnZlciBpcyB1cC4gUHJpbnRpbmcgaW5zdHJ1Y3Rpb25zIGZvciB1c2VyIGFuZCBsYXVuY2hpbmcgRmlyZWZveCB3aXRoIGhvc3RlZCBjZXJ0aWZpY2F0ZSBVUkwnKTtcclxuICBhd2FpdCBVSS5zdGFydEZpcmVmb3hXaXphcmQoYGh0dHA6Ly9sb2NhbGhvc3Q6JHsgcG9ydCB9YCk7XHJcbiAgcnVuKGAkeyBmaXJlZm94UGF0aCB9IGh0dHA6Ly9sb2NhbGhvc3Q6JHsgcG9ydCB9YCk7XHJcbiAgYXdhaXQgVUkud2FpdEZvckZpcmVmb3hXaXphcmQoKTtcclxuICBzZXJ2ZXIuY2xvc2UoKTtcclxufVxyXG4iXX0=