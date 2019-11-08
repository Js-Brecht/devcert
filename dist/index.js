"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const rimraf_1 = tslib_1.__importDefault(require("rimraf"));
const constants_1 = require("./constants");
const platforms_1 = tslib_1.__importDefault(require("./platforms"));
const certificate_authority_1 = tslib_1.__importDefault(require("./certificate-authority"));
const certificates_1 = tslib_1.__importDefault(require("./certificates"));
const user_interface_1 = tslib_1.__importDefault(require("./user-interface"));
const debug = debug_1.default('devcert');
/**
 * Request an SSL certificate for the given app name signed by the devcert root
 * certificate authority. If devcert has previously generated a certificate for
 * that app name on this machine, it will reuse that certificate.
 *
 * If this is the first time devcert is being run on this machine, it will
 * generate and attempt to install a root certificate authority.
 *
 * Returns a promise that resolves with { key, cert }, where `key` and `cert`
 * are Buffers with the contents of the certificate private key and certificate
 * file, respectively
 *
 * If `returnCa` is `true`, include path to CA cert as `ca` in return value.
 * If `returnCa` is `read`, include Buffer with contents of CA cert in return value.
 */
function certificateFor(domain, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Certificate requested for ${domain}. Skipping certutil install: ${Boolean(options.skipCertutilInstall)}. Skipping hosts file: ${Boolean(options.skipHostsFile)}`);
        if (options.ui) {
            Object.assign(user_interface_1.default, options.ui);
        }
        if (!constants_1.isMac && !constants_1.isLinux && !constants_1.isWindows) {
            throw new Error(`Platform not supported: "${process.platform}"`);
        }
        if (!command_exists_1.sync('openssl')) {
            throw new Error('OpenSSL not found: OpenSSL is required to generate SSL certificates - make sure it is installed and available in your PATH');
        }
        let domainKeyPath = constants_1.pathForDomain(domain, `private-key.key`);
        let domainCertPath = constants_1.pathForDomain(domain, `certificate.crt`);
        if (!fs_1.existsSync(constants_1.rootCAKeyPath)) {
            debug('Root CA is not installed yet, so it must be our first run. Installing root CA ...');
            yield certificate_authority_1.default(options);
        }
        if (!fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`))) {
            debug(`Can't find certificate file for ${domain}, so it must be the first request for ${domain}. Generating and caching ...`);
            yield certificates_1.default(domain);
        }
        if (!options.skipHostsFile) {
            yield platforms_1.default.addDomainToHostFileIfMissing(domain);
        }
        debug(`Returning domain certificate`);
        if (options.returnCa) {
            return {
                ca: options.returnCa === 'read' ? fs_1.readFileSync(constants_1.rootCACertPath) : constants_1.rootCACertPath,
                key: fs_1.readFileSync(domainKeyPath),
                cert: fs_1.readFileSync(domainCertPath)
            };
        }
        return {
            key: fs_1.readFileSync(domainKeyPath),
            cert: fs_1.readFileSync(domainCertPath)
        };
    });
}
exports.certificateFor = certificateFor;
function hasCertificateFor(domain) {
    return fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`));
}
exports.hasCertificateFor = hasCertificateFor;
function configuredDomains() {
    return fs_1.readdirSync(constants_1.domainsDir);
}
exports.configuredDomains = configuredDomains;
function removeDomain(domain) {
    return rimraf_1.default.sync(constants_1.pathForDomain(domain));
}
exports.removeDomain = removeDomain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiRDovZGV2L3NvdXJjZS9ub2RlL2RldmNlcnQvIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBNEY7QUFDNUYsMERBQWdDO0FBQ2hDLG1EQUF1RDtBQUN2RCw0REFBNEI7QUFDNUIsMkNBUXFCO0FBQ3JCLG9FQUEwQztBQUMxQyw0RkFBa0U7QUFDbEUsMEVBQXVEO0FBQ3ZELDhFQUFxRDtBQUVyRCxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFTckM7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCx3QkFBcUMsTUFBYyxFQUFFLFVBQW1CLEVBQUU7O1FBQ3hFLEtBQUssQ0FBQyw2QkFBNkIsTUFBTSxnQ0FBZ0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQywwQkFBMEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFekssSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFO1lBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FBQyx3QkFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksQ0FBQyxpQkFBSyxJQUFJLENBQUMsbUJBQU8sSUFBSSxDQUFDLHFCQUFTLEVBQUU7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDbEU7UUFFRCxJQUFJLENBQUMscUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDRIQUE0SCxDQUFDLENBQUM7U0FDL0k7UUFFRCxJQUFJLGFBQWEsR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdELElBQUksY0FBYyxHQUFHLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLGVBQU0sQ0FBQyx5QkFBYSxDQUFDLEVBQUU7WUFDMUIsS0FBSyxDQUFDLG1GQUFtRixDQUFDLENBQUM7WUFDM0YsTUFBTSwrQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxlQUFNLENBQUMseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxFQUFFO1lBQ3JELEtBQUssQ0FBQyxtQ0FBbUMsTUFBTSx5Q0FBeUMsTUFBTSw4QkFBOEIsQ0FBQyxDQUFDO1lBQzlILE1BQU0sc0JBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMxQixNQUFNLG1CQUFlLENBQUMsNEJBQTRCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUN0QyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDcEIsT0FBTztnQkFDTCxFQUFFLEVBQUUsT0FBTyxDQUFDLFFBQVEsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLGlCQUFRLENBQUMsMEJBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQkFBYztnQkFDM0UsR0FBRyxFQUFFLGlCQUFRLENBQUMsYUFBYSxDQUFDO2dCQUM1QixJQUFJLEVBQUUsaUJBQVEsQ0FBQyxjQUFjLENBQUM7YUFDL0IsQ0FBQTtTQUNGO1FBQ0QsT0FBTztZQUNMLEdBQUcsRUFBRSxpQkFBUSxDQUFDLGFBQWEsQ0FBQztZQUM1QixJQUFJLEVBQUUsaUJBQVEsQ0FBQyxjQUFjLENBQUM7U0FDL0IsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQTVDRCx3Q0E0Q0M7QUFFRCwyQkFBa0MsTUFBYztJQUM5QyxPQUFPLGVBQU0sQ0FBQyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUZELDhDQUVDO0FBRUQ7SUFDRSxPQUFPLGdCQUFPLENBQUMsc0JBQVUsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFGRCw4Q0FFQztBQUVELHNCQUE2QixNQUFjO0lBQ3pDLE9BQU8sZ0JBQU0sQ0FBQyxJQUFJLENBQUMseUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFGRCxvQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRGaWxlU3luYyBhcyByZWFkRmlsZSwgcmVhZGRpclN5bmMgYXMgcmVhZGRpciwgZXhpc3RzU3luYyBhcyBleGlzdHMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCB7IHN5bmMgYXMgY29tbWFuZEV4aXN0cyB9IGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcclxuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnO1xyXG5pbXBvcnQge1xyXG4gIGlzTWFjLFxyXG4gIGlzTGludXgsXHJcbiAgaXNXaW5kb3dzLFxyXG4gIHBhdGhGb3JEb21haW4sXHJcbiAgZG9tYWluc0RpcixcclxuICByb290Q0FLZXlQYXRoLFxyXG4gIHJvb3RDQUNlcnRQYXRoXHJcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5pbXBvcnQgY3VycmVudFBsYXRmb3JtIGZyb20gJy4vcGxhdGZvcm1zJztcclxuaW1wb3J0IGluc3RhbGxDZXJ0aWZpY2F0ZUF1dGhvcml0eSBmcm9tICcuL2NlcnRpZmljYXRlLWF1dGhvcml0eSc7XHJcbmltcG9ydCBnZW5lcmF0ZURvbWFpbkNlcnRpZmljYXRlIGZyb20gJy4vY2VydGlmaWNhdGVzJztcclxuaW1wb3J0IFVJLCB7IFVzZXJJbnRlcmZhY2UgfSBmcm9tICcuL3VzZXItaW50ZXJmYWNlJztcclxuXHJcbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQnKTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XHJcbiAgcmV0dXJuQ2E/OiB0cnVlIHwgJ3JlYWQnLFxyXG4gIHNraXBDZXJ0dXRpbEluc3RhbGw/OiB0cnVlLFxyXG4gIHNraXBIb3N0c0ZpbGU/OiB0cnVlLFxyXG4gIHVpPzogVXNlckludGVyZmFjZVxyXG59XHJcblxyXG4vKipcclxuICogUmVxdWVzdCBhbiBTU0wgY2VydGlmaWNhdGUgZm9yIHRoZSBnaXZlbiBhcHAgbmFtZSBzaWduZWQgYnkgdGhlIGRldmNlcnQgcm9vdFxyXG4gKiBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuIElmIGRldmNlcnQgaGFzIHByZXZpb3VzbHkgZ2VuZXJhdGVkIGEgY2VydGlmaWNhdGUgZm9yXHJcbiAqIHRoYXQgYXBwIG5hbWUgb24gdGhpcyBtYWNoaW5lLCBpdCB3aWxsIHJldXNlIHRoYXQgY2VydGlmaWNhdGUuXHJcbiAqXHJcbiAqIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgZGV2Y2VydCBpcyBiZWluZyBydW4gb24gdGhpcyBtYWNoaW5lLCBpdCB3aWxsXHJcbiAqIGdlbmVyYXRlIGFuZCBhdHRlbXB0IHRvIGluc3RhbGwgYSByb290IGNlcnRpZmljYXRlIGF1dGhvcml0eS5cclxuICpcclxuICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHsga2V5LCBjZXJ0IH0sIHdoZXJlIGBrZXlgIGFuZCBgY2VydGBcclxuICogYXJlIEJ1ZmZlcnMgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGNlcnRpZmljYXRlIHByaXZhdGUga2V5IGFuZCBjZXJ0aWZpY2F0ZVxyXG4gKiBmaWxlLCByZXNwZWN0aXZlbHlcclxuICogXHJcbiAqIElmIGByZXR1cm5DYWAgaXMgYHRydWVgLCBpbmNsdWRlIHBhdGggdG8gQ0EgY2VydCBhcyBgY2FgIGluIHJldHVybiB2YWx1ZS5cclxuICogSWYgYHJldHVybkNhYCBpcyBgcmVhZGAsIGluY2x1ZGUgQnVmZmVyIHdpdGggY29udGVudHMgb2YgQ0EgY2VydCBpbiByZXR1cm4gdmFsdWUuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2VydGlmaWNhdGVGb3IoZG9tYWluOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSkge1xyXG4gIGRlYnVnKGBDZXJ0aWZpY2F0ZSByZXF1ZXN0ZWQgZm9yICR7ZG9tYWlufS4gU2tpcHBpbmcgY2VydHV0aWwgaW5zdGFsbDogJHtCb29sZWFuKG9wdGlvbnMuc2tpcENlcnR1dGlsSW5zdGFsbCl9LiBTa2lwcGluZyBob3N0cyBmaWxlOiAke0Jvb2xlYW4ob3B0aW9ucy5za2lwSG9zdHNGaWxlKX1gKTtcclxuXHJcbiAgaWYgKG9wdGlvbnMudWkpIHtcclxuICAgIE9iamVjdC5hc3NpZ24oVUksIG9wdGlvbnMudWkpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFpc01hYyAmJiAhaXNMaW51eCAmJiAhaXNXaW5kb3dzKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBsYXRmb3JtIG5vdCBzdXBwb3J0ZWQ6IFwiJHtwcm9jZXNzLnBsYXRmb3JtfVwiYCk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWNvbW1hbmRFeGlzdHMoJ29wZW5zc2wnKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdPcGVuU1NMIG5vdCBmb3VuZDogT3BlblNTTCBpcyByZXF1aXJlZCB0byBnZW5lcmF0ZSBTU0wgY2VydGlmaWNhdGVzIC0gbWFrZSBzdXJlIGl0IGlzIGluc3RhbGxlZCBhbmQgYXZhaWxhYmxlIGluIHlvdXIgUEFUSCcpO1xyXG4gIH1cclxuXHJcbiAgbGV0IGRvbWFpbktleVBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYHByaXZhdGUta2V5LmtleWApO1xyXG4gIGxldCBkb21haW5DZXJ0UGF0aCA9IHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCk7XHJcblxyXG4gIGlmICghZXhpc3RzKHJvb3RDQUtleVBhdGgpKSB7XHJcbiAgICBkZWJ1ZygnUm9vdCBDQSBpcyBub3QgaW5zdGFsbGVkIHlldCwgc28gaXQgbXVzdCBiZSBvdXIgZmlyc3QgcnVuLiBJbnN0YWxsaW5nIHJvb3QgQ0EgLi4uJyk7XHJcbiAgICBhd2FpdCBpbnN0YWxsQ2VydGlmaWNhdGVBdXRob3JpdHkob3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWV4aXN0cyhwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApKSkge1xyXG4gICAgZGVidWcoYENhbid0IGZpbmQgY2VydGlmaWNhdGUgZmlsZSBmb3IgJHtkb21haW59LCBzbyBpdCBtdXN0IGJlIHRoZSBmaXJzdCByZXF1ZXN0IGZvciAke2RvbWFpbn0uIEdlbmVyYXRpbmcgYW5kIGNhY2hpbmcgLi4uYCk7XHJcbiAgICBhd2FpdCBnZW5lcmF0ZURvbWFpbkNlcnRpZmljYXRlKGRvbWFpbik7XHJcbiAgfVxyXG5cclxuICBpZiAoIW9wdGlvbnMuc2tpcEhvc3RzRmlsZSkge1xyXG4gICAgYXdhaXQgY3VycmVudFBsYXRmb3JtLmFkZERvbWFpblRvSG9zdEZpbGVJZk1pc3NpbmcoZG9tYWluKTtcclxuICB9XHJcblxyXG4gIGRlYnVnKGBSZXR1cm5pbmcgZG9tYWluIGNlcnRpZmljYXRlYCk7XHJcbiAgaWYgKG9wdGlvbnMucmV0dXJuQ2EpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNhOiBvcHRpb25zLnJldHVybkNhID09PSAncmVhZCcgPyByZWFkRmlsZShyb290Q0FDZXJ0UGF0aCkgOiByb290Q0FDZXJ0UGF0aCxcclxuICAgICAga2V5OiByZWFkRmlsZShkb21haW5LZXlQYXRoKSxcclxuICAgICAgY2VydDogcmVhZEZpbGUoZG9tYWluQ2VydFBhdGgpXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBrZXk6IHJlYWRGaWxlKGRvbWFpbktleVBhdGgpLFxyXG4gICAgY2VydDogcmVhZEZpbGUoZG9tYWluQ2VydFBhdGgpXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NlcnRpZmljYXRlRm9yKGRvbWFpbjogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIGV4aXN0cyhwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZWREb21haW5zKCkge1xyXG4gIHJldHVybiByZWFkZGlyKGRvbWFpbnNEaXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRG9tYWluKGRvbWFpbjogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHJpbXJhZi5zeW5jKHBhdGhGb3JEb21haW4oZG9tYWluKSk7XHJcbn0iXX0=