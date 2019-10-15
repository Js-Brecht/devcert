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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiRDovZGV2L2dwbS9naXRodWIuY29tL0pzLUJyZWNodC9kZXZjZXJ0LyIsInNvdXJjZXMiOlsiaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQTRGO0FBQzVGLDBEQUFnQztBQUNoQyxtREFBdUQ7QUFDdkQsNERBQTRCO0FBQzVCLDJDQVFxQjtBQUNyQixvRUFBMEM7QUFDMUMsNEZBQWtFO0FBQ2xFLDBFQUF1RDtBQUN2RCw4RUFBcUQ7QUFFckQsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBU3JDOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsd0JBQXFDLE1BQWMsRUFBRSxVQUFtQixFQUFFOztRQUN4RSxLQUFLLENBQUMsNkJBQTZCLE1BQU0sZ0NBQWdDLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsMEJBQTBCLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXpLLElBQUksT0FBTyxDQUFDLEVBQUUsRUFBRTtZQUNkLE1BQU0sQ0FBQyxNQUFNLENBQUMsd0JBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDL0I7UUFFRCxJQUFJLENBQUMsaUJBQUssSUFBSSxDQUFDLG1CQUFPLElBQUksQ0FBQyxxQkFBUyxFQUFFO1lBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsSUFBSSxDQUFDLHFCQUFhLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0SEFBNEgsQ0FBQyxDQUFDO1NBQy9JO1FBRUQsSUFBSSxhQUFhLEdBQUcseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxJQUFJLGNBQWMsR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRTlELElBQUksQ0FBQyxlQUFNLENBQUMseUJBQWEsQ0FBQyxFQUFFO1lBQzFCLEtBQUssQ0FBQyxtRkFBbUYsQ0FBQyxDQUFDO1lBQzNGLE1BQU0sK0JBQTJCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFJLENBQUMsZUFBTSxDQUFDLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsRUFBRTtZQUNyRCxLQUFLLENBQUMsbUNBQW1DLE1BQU0seUNBQXlDLE1BQU0sOEJBQThCLENBQUMsQ0FBQztZQUM5SCxNQUFNLHNCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3pDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFDMUIsTUFBTSxtQkFBZSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVEO1FBRUQsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDdEMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3BCLE9BQU87Z0JBQ0wsRUFBRSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBUSxDQUFDLDBCQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsMEJBQWM7Z0JBQzNFLEdBQUcsRUFBRSxpQkFBUSxDQUFDLGFBQWEsQ0FBQztnQkFDNUIsSUFBSSxFQUFFLGlCQUFRLENBQUMsY0FBYyxDQUFDO2FBQy9CLENBQUE7U0FDRjtRQUNELE9BQU87WUFDTCxHQUFHLEVBQUUsaUJBQVEsQ0FBQyxhQUFhLENBQUM7WUFDNUIsSUFBSSxFQUFFLGlCQUFRLENBQUMsY0FBYyxDQUFDO1NBQy9CLENBQUM7SUFDSixDQUFDO0NBQUE7QUE1Q0Qsd0NBNENDO0FBRUQsMkJBQWtDLE1BQWM7SUFDOUMsT0FBTyxlQUFNLENBQUMseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFGRCw4Q0FFQztBQUVEO0lBQ0UsT0FBTyxnQkFBTyxDQUFDLHNCQUFVLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRkQsOENBRUM7QUFFRCxzQkFBNkIsTUFBYztJQUN6QyxPQUFPLGdCQUFNLENBQUMsSUFBSSxDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBRkQsb0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWFkRmlsZVN5bmMgYXMgcmVhZEZpbGUsIHJlYWRkaXJTeW5jIGFzIHJlYWRkaXIsIGV4aXN0c1N5bmMgYXMgZXhpc3RzIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xyXG5pbXBvcnQgeyBzeW5jIGFzIGNvbW1hbmRFeGlzdHMgfSBmcm9tICdjb21tYW5kLWV4aXN0cyc7XHJcbmltcG9ydCByaW1yYWYgZnJvbSAncmltcmFmJztcclxuaW1wb3J0IHtcclxuICBpc01hYyxcclxuICBpc0xpbnV4LFxyXG4gIGlzV2luZG93cyxcclxuICBwYXRoRm9yRG9tYWluLFxyXG4gIGRvbWFpbnNEaXIsXHJcbiAgcm9vdENBS2V5UGF0aCxcclxuICByb290Q0FDZXJ0UGF0aFxyXG59IGZyb20gJy4vY29uc3RhbnRzJztcclxuaW1wb3J0IGN1cnJlbnRQbGF0Zm9ybSBmcm9tICcuL3BsYXRmb3Jtcyc7XHJcbmltcG9ydCBpbnN0YWxsQ2VydGlmaWNhdGVBdXRob3JpdHkgZnJvbSAnLi9jZXJ0aWZpY2F0ZS1hdXRob3JpdHknO1xyXG5pbXBvcnQgZ2VuZXJhdGVEb21haW5DZXJ0aWZpY2F0ZSBmcm9tICcuL2NlcnRpZmljYXRlcyc7XHJcbmltcG9ydCBVSSwgeyBVc2VySW50ZXJmYWNlIH0gZnJvbSAnLi91c2VyLWludGVyZmFjZSc7XHJcblxyXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0Jyk7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xyXG4gIHJldHVybkNhPzogdHJ1ZSB8ICdyZWFkJyxcclxuICBza2lwQ2VydHV0aWxJbnN0YWxsPzogdHJ1ZSxcclxuICBza2lwSG9zdHNGaWxlPzogdHJ1ZSxcclxuICB1aT86IFVzZXJJbnRlcmZhY2VcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlcXVlc3QgYW4gU1NMIGNlcnRpZmljYXRlIGZvciB0aGUgZ2l2ZW4gYXBwIG5hbWUgc2lnbmVkIGJ5IHRoZSBkZXZjZXJ0IHJvb3RcclxuICogY2VydGlmaWNhdGUgYXV0aG9yaXR5LiBJZiBkZXZjZXJ0IGhhcyBwcmV2aW91c2x5IGdlbmVyYXRlZCBhIGNlcnRpZmljYXRlIGZvclxyXG4gKiB0aGF0IGFwcCBuYW1lIG9uIHRoaXMgbWFjaGluZSwgaXQgd2lsbCByZXVzZSB0aGF0IGNlcnRpZmljYXRlLlxyXG4gKlxyXG4gKiBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIGRldmNlcnQgaXMgYmVpbmcgcnVuIG9uIHRoaXMgbWFjaGluZSwgaXQgd2lsbFxyXG4gKiBnZW5lcmF0ZSBhbmQgYXR0ZW1wdCB0byBpbnN0YWxsIGEgcm9vdCBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkuXHJcbiAqXHJcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB7IGtleSwgY2VydCB9LCB3aGVyZSBga2V5YCBhbmQgYGNlcnRgXHJcbiAqIGFyZSBCdWZmZXJzIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBjZXJ0aWZpY2F0ZSBwcml2YXRlIGtleSBhbmQgY2VydGlmaWNhdGVcclxuICogZmlsZSwgcmVzcGVjdGl2ZWx5XHJcbiAqIFxyXG4gKiBJZiBgcmV0dXJuQ2FgIGlzIGB0cnVlYCwgaW5jbHVkZSBwYXRoIHRvIENBIGNlcnQgYXMgYGNhYCBpbiByZXR1cm4gdmFsdWUuXHJcbiAqIElmIGByZXR1cm5DYWAgaXMgYHJlYWRgLCBpbmNsdWRlIEJ1ZmZlciB3aXRoIGNvbnRlbnRzIG9mIENBIGNlcnQgaW4gcmV0dXJuIHZhbHVlLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNlcnRpZmljYXRlRm9yKGRvbWFpbjogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pIHtcclxuICBkZWJ1ZyhgQ2VydGlmaWNhdGUgcmVxdWVzdGVkIGZvciAke2RvbWFpbn0uIFNraXBwaW5nIGNlcnR1dGlsIGluc3RhbGw6ICR7Qm9vbGVhbihvcHRpb25zLnNraXBDZXJ0dXRpbEluc3RhbGwpfS4gU2tpcHBpbmcgaG9zdHMgZmlsZTogJHtCb29sZWFuKG9wdGlvbnMuc2tpcEhvc3RzRmlsZSl9YCk7XHJcblxyXG4gIGlmIChvcHRpb25zLnVpKSB7XHJcbiAgICBPYmplY3QuYXNzaWduKFVJLCBvcHRpb25zLnVpKTtcclxuICB9XHJcblxyXG4gIGlmICghaXNNYWMgJiYgIWlzTGludXggJiYgIWlzV2luZG93cykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBQbGF0Zm9ybSBub3Qgc3VwcG9ydGVkOiBcIiR7cHJvY2Vzcy5wbGF0Zm9ybX1cImApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFjb21tYW5kRXhpc3RzKCdvcGVuc3NsJykpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignT3BlblNTTCBub3QgZm91bmQ6IE9wZW5TU0wgaXMgcmVxdWlyZWQgdG8gZ2VuZXJhdGUgU1NMIGNlcnRpZmljYXRlcyAtIG1ha2Ugc3VyZSBpdCBpcyBpbnN0YWxsZWQgYW5kIGF2YWlsYWJsZSBpbiB5b3VyIFBBVEgnKTtcclxuICB9XHJcblxyXG4gIGxldCBkb21haW5LZXlQYXRoID0gcGF0aEZvckRvbWFpbihkb21haW4sIGBwcml2YXRlLWtleS5rZXlgKTtcclxuICBsZXQgZG9tYWluQ2VydFBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApO1xyXG5cclxuICBpZiAoIWV4aXN0cyhyb290Q0FLZXlQYXRoKSkge1xyXG4gICAgZGVidWcoJ1Jvb3QgQ0EgaXMgbm90IGluc3RhbGxlZCB5ZXQsIHNvIGl0IG11c3QgYmUgb3VyIGZpcnN0IHJ1bi4gSW5zdGFsbGluZyByb290IENBIC4uLicpO1xyXG4gICAgYXdhaXQgaW5zdGFsbENlcnRpZmljYXRlQXV0aG9yaXR5KG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFleGlzdHMocGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS5jcnRgKSkpIHtcclxuICAgIGRlYnVnKGBDYW4ndCBmaW5kIGNlcnRpZmljYXRlIGZpbGUgZm9yICR7ZG9tYWlufSwgc28gaXQgbXVzdCBiZSB0aGUgZmlyc3QgcmVxdWVzdCBmb3IgJHtkb21haW59LiBHZW5lcmF0aW5nIGFuZCBjYWNoaW5nIC4uLmApO1xyXG4gICAgYXdhaXQgZ2VuZXJhdGVEb21haW5DZXJ0aWZpY2F0ZShkb21haW4pO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFvcHRpb25zLnNraXBIb3N0c0ZpbGUpIHtcclxuICAgIGF3YWl0IGN1cnJlbnRQbGF0Zm9ybS5hZGREb21haW5Ub0hvc3RGaWxlSWZNaXNzaW5nKGRvbWFpbik7XHJcbiAgfVxyXG5cclxuICBkZWJ1ZyhgUmV0dXJuaW5nIGRvbWFpbiBjZXJ0aWZpY2F0ZWApO1xyXG4gIGlmIChvcHRpb25zLnJldHVybkNhKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjYTogb3B0aW9ucy5yZXR1cm5DYSA9PT0gJ3JlYWQnID8gcmVhZEZpbGUocm9vdENBQ2VydFBhdGgpIDogcm9vdENBQ2VydFBhdGgsXHJcbiAgICAgIGtleTogcmVhZEZpbGUoZG9tYWluS2V5UGF0aCksXHJcbiAgICAgIGNlcnQ6IHJlYWRGaWxlKGRvbWFpbkNlcnRQYXRoKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAga2V5OiByZWFkRmlsZShkb21haW5LZXlQYXRoKSxcclxuICAgIGNlcnQ6IHJlYWRGaWxlKGRvbWFpbkNlcnRQYXRoKVxyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNDZXJ0aWZpY2F0ZUZvcihkb21haW46IHN0cmluZykge1xyXG4gIHJldHVybiBleGlzdHMocGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS5jcnRgKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmVkRG9tYWlucygpIHtcclxuICByZXR1cm4gcmVhZGRpcihkb21haW5zRGlyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZURvbWFpbihkb21haW46IHN0cmluZykge1xyXG4gIHJldHVybiByaW1yYWYuc3luYyhwYXRoRm9yRG9tYWluKGRvbWFpbikpO1xyXG59Il19