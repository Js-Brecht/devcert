"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// import path from 'path';
const debug_1 = tslib_1.__importDefault(require("debug"));
const mkdirp_1 = require("mkdirp");
const fs_1 = require("fs");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const certificate_authority_1 = require("./certificate-authority");
const debug = debug_1.default('devcert:certificates');
/**
 * Generate a domain certificate signed by the devcert root CA. Domain
 * certificates are cached in their own directories under
 * CONFIG_ROOT/domains/<domain>, and reused on subsequent requests. Because the
 * individual domain certificates are signed by the devcert root CA (which was
 * added to the OS/browser trust stores), they are trusted.
 */
function generateDomainCertificate(domain) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        mkdirp_1.sync(constants_1.pathForDomain(domain));
        debug(`Generating private key for ${domain}`);
        let domainKeyPath = constants_1.pathForDomain(domain, 'private-key.key');
        generateKey(domainKeyPath);
        debug(`Generating certificate signing request for ${domain}`);
        let csrFile = constants_1.pathForDomain(domain, `certificate-signing-request.csr`);
        constants_1.withDomainSigningRequestConfig(domain, (configpath) => {
            utils_1.openssl(`req -new -config "${configpath}" -key "${domainKeyPath}" -out "${csrFile}"`);
        });
        debug(`Generating certificate for ${domain} from signing request and signing with root CA`);
        let domainCertPath = constants_1.pathForDomain(domain, `certificate.crt`);
        yield certificate_authority_1.withCertificateAuthorityCredentials(({ caKeyPath, caCertPath }) => {
            constants_1.withDomainCertificateConfig(domain, (domainCertConfigPath) => {
                utils_1.openssl(`ca -config "${domainCertConfigPath}" -in "${csrFile}" -out "${domainCertPath}" -keyfile "${caKeyPath}" -cert "${caCertPath}" -days 7000 -batch`);
            });
        });
    });
}
exports.default = generateDomainCertificate;
// Generate a cryptographic key, used to sign certificates or certificate signing requests.
function generateKey(filename) {
    debug(`generateKey: ${filename}`);
    utils_1.openssl(`genrsa -out "${filename}" 2048`);
    fs_1.chmodSync(filename, 400);
}
exports.generateKey = generateKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydGlmaWNhdGVzLmpzIiwic291cmNlUm9vdCI6IkQ6L2Rldi9ncG0vZ2l0aHViLmNvbS9Kcy1CcmVjaHQvZGV2Y2VydC8iLCJzb3VyY2VzIjpbImNlcnRpZmljYXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBMkI7QUFDM0IsMERBQWdDO0FBQ2hDLG1DQUF3QztBQUN4QywyQkFBd0M7QUFDeEMsMkNBQXlHO0FBQ3pHLG1DQUFrQztBQUNsQyxtRUFBOEU7QUFFOUUsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFFbEQ7Ozs7OztHQU1HO0FBQ0gsbUNBQXdELE1BQWM7O1FBQ3BFLGFBQU0sQ0FBQyx5QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFOUIsS0FBSyxDQUFDLDhCQUErQixNQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksYUFBYSxHQUFHLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDN0QsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTNCLEtBQUssQ0FBQyw4Q0FBK0MsTUFBTyxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFJLE9BQU8sR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3ZFLDBDQUE4QixDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3BELGVBQU8sQ0FBQyxxQkFBc0IsVUFBVyxXQUFZLGFBQWMsV0FBWSxPQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQzlGLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLDhCQUErQixNQUFPLGdEQUFnRCxDQUFDLENBQUM7UUFDOUYsSUFBSSxjQUFjLEdBQUcseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUU5RCxNQUFNLDJEQUFtQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTtZQUN0RSx1Q0FBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO2dCQUMzRCxlQUFPLENBQUMsZUFBZ0Isb0JBQXFCLFVBQVcsT0FBUSxXQUFZLGNBQWUsZUFBZ0IsU0FBVSxZQUFhLFVBQVcscUJBQXFCLENBQUMsQ0FBQTtZQUNySyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBckJELDRDQXFCQztBQUVELDJGQUEyRjtBQUMzRixxQkFBNEIsUUFBZ0I7SUFDMUMsS0FBSyxDQUFDLGdCQUFpQixRQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLGVBQU8sQ0FBQyxnQkFBaUIsUUFBUyxRQUFRLENBQUMsQ0FBQztJQUM1QyxjQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFKRCxrQ0FJQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xyXG5pbXBvcnQgeyBzeW5jIGFzIG1rZGlycCB9IGZyb20gJ21rZGlycCc7XHJcbmltcG9ydCB7IGNobW9kU3luYyBhcyBjaG1vZCB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgcGF0aEZvckRvbWFpbiwgd2l0aERvbWFpblNpZ25pbmdSZXF1ZXN0Q29uZmlnLCB3aXRoRG9tYWluQ2VydGlmaWNhdGVDb25maWcgfSBmcm9tICcuL2NvbnN0YW50cyc7XHJcbmltcG9ydCB7IG9wZW5zc2wgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgd2l0aENlcnRpZmljYXRlQXV0aG9yaXR5Q3JlZGVudGlhbHMgfSBmcm9tICcuL2NlcnRpZmljYXRlLWF1dGhvcml0eSc7XHJcblxyXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OmNlcnRpZmljYXRlcycpO1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGEgZG9tYWluIGNlcnRpZmljYXRlIHNpZ25lZCBieSB0aGUgZGV2Y2VydCByb290IENBLiBEb21haW5cclxuICogY2VydGlmaWNhdGVzIGFyZSBjYWNoZWQgaW4gdGhlaXIgb3duIGRpcmVjdG9yaWVzIHVuZGVyXHJcbiAqIENPTkZJR19ST09UL2RvbWFpbnMvPGRvbWFpbj4sIGFuZCByZXVzZWQgb24gc3Vic2VxdWVudCByZXF1ZXN0cy4gQmVjYXVzZSB0aGVcclxuICogaW5kaXZpZHVhbCBkb21haW4gY2VydGlmaWNhdGVzIGFyZSBzaWduZWQgYnkgdGhlIGRldmNlcnQgcm9vdCBDQSAod2hpY2ggd2FzXHJcbiAqIGFkZGVkIHRvIHRoZSBPUy9icm93c2VyIHRydXN0IHN0b3JlcyksIHRoZXkgYXJlIHRydXN0ZWQuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURvbWFpbkNlcnRpZmljYXRlKGRvbWFpbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgbWtkaXJwKHBhdGhGb3JEb21haW4oZG9tYWluKSk7XHJcblxyXG4gIGRlYnVnKGBHZW5lcmF0aW5nIHByaXZhdGUga2V5IGZvciAkeyBkb21haW4gfWApO1xyXG4gIGxldCBkb21haW5LZXlQYXRoID0gcGF0aEZvckRvbWFpbihkb21haW4sICdwcml2YXRlLWtleS5rZXknKTtcclxuICBnZW5lcmF0ZUtleShkb21haW5LZXlQYXRoKTtcclxuXHJcbiAgZGVidWcoYEdlbmVyYXRpbmcgY2VydGlmaWNhdGUgc2lnbmluZyByZXF1ZXN0IGZvciAkeyBkb21haW4gfWApO1xyXG4gIGxldCBjc3JGaWxlID0gcGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS1zaWduaW5nLXJlcXVlc3QuY3NyYCk7XHJcbiAgd2l0aERvbWFpblNpZ25pbmdSZXF1ZXN0Q29uZmlnKGRvbWFpbiwgKGNvbmZpZ3BhdGgpID0+IHtcclxuICAgIG9wZW5zc2woYHJlcSAtbmV3IC1jb25maWcgXCIkeyBjb25maWdwYXRoIH1cIiAta2V5IFwiJHsgZG9tYWluS2V5UGF0aCB9XCIgLW91dCBcIiR7IGNzckZpbGUgfVwiYCk7XHJcbiAgfSk7XHJcblxyXG4gIGRlYnVnKGBHZW5lcmF0aW5nIGNlcnRpZmljYXRlIGZvciAkeyBkb21haW4gfSBmcm9tIHNpZ25pbmcgcmVxdWVzdCBhbmQgc2lnbmluZyB3aXRoIHJvb3QgQ0FgKTtcclxuICBsZXQgZG9tYWluQ2VydFBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApO1xyXG5cclxuICBhd2FpdCB3aXRoQ2VydGlmaWNhdGVBdXRob3JpdHlDcmVkZW50aWFscygoeyBjYUtleVBhdGgsIGNhQ2VydFBhdGggfSkgPT4ge1xyXG4gICAgd2l0aERvbWFpbkNlcnRpZmljYXRlQ29uZmlnKGRvbWFpbiwgKGRvbWFpbkNlcnRDb25maWdQYXRoKSA9PiB7XHJcbiAgICAgIG9wZW5zc2woYGNhIC1jb25maWcgXCIkeyBkb21haW5DZXJ0Q29uZmlnUGF0aCB9XCIgLWluIFwiJHsgY3NyRmlsZSB9XCIgLW91dCBcIiR7IGRvbWFpbkNlcnRQYXRoIH1cIiAta2V5ZmlsZSBcIiR7IGNhS2V5UGF0aCB9XCIgLWNlcnQgXCIkeyBjYUNlcnRQYXRoIH1cIiAtZGF5cyA3MDAwIC1iYXRjaGApXHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gR2VuZXJhdGUgYSBjcnlwdG9ncmFwaGljIGtleSwgdXNlZCB0byBzaWduIGNlcnRpZmljYXRlcyBvciBjZXJ0aWZpY2F0ZSBzaWduaW5nIHJlcXVlc3RzLlxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVLZXkoZmlsZW5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gIGRlYnVnKGBnZW5lcmF0ZUtleTogJHsgZmlsZW5hbWUgfWApO1xyXG4gIG9wZW5zc2woYGdlbnJzYSAtb3V0IFwiJHsgZmlsZW5hbWUgfVwiIDIwNDhgKTtcclxuICBjaG1vZChmaWxlbmFtZSwgNDAwKTtcclxufSJdfQ==