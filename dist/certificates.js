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
                utils_1.openssl(`ca -config "${domainCertConfigPath}" -in "${csrFile}" -out "${domainCertPath}" -keyfile "${caKeyPath}" -cert "${caCertPath}" -days 825 -batch`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydGlmaWNhdGVzLmpzIiwic291cmNlUm9vdCI6IkQ6L2Rldi9zb3VyY2Uvbm9kZS9kZXZjZXJ0LyIsInNvdXJjZXMiOlsiY2VydGlmaWNhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyQjtBQUMzQiwwREFBZ0M7QUFDaEMsbUNBQXdDO0FBQ3hDLDJCQUF3QztBQUN4QywyQ0FBeUc7QUFDekcsbUNBQWtDO0FBQ2xDLG1FQUE4RTtBQUU5RSxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUVsRDs7Ozs7O0dBTUc7QUFDSCxtQ0FBd0QsTUFBYzs7UUFDcEUsYUFBTSxDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU5QixLQUFLLENBQUMsOEJBQStCLE1BQU8sRUFBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxhQUFhLEdBQUcseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFM0IsS0FBSyxDQUFDLDhDQUErQyxNQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLElBQUksT0FBTyxHQUFHLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7UUFDdkUsMENBQThCLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDcEQsZUFBTyxDQUFDLHFCQUFzQixVQUFXLFdBQVksYUFBYyxXQUFZLE9BQVEsR0FBRyxDQUFDLENBQUM7UUFDOUYsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsOEJBQStCLE1BQU8sZ0RBQWdELENBQUMsQ0FBQztRQUM5RixJQUFJLGNBQWMsR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRTlELE1BQU0sMkRBQW1DLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFO1lBQ3RFLHVDQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLG9CQUFvQixFQUFFLEVBQUU7Z0JBQzNELGVBQU8sQ0FBQyxlQUFnQixvQkFBcUIsVUFBVyxPQUFRLFdBQVksY0FBZSxlQUFnQixTQUFVLFlBQWEsVUFBVyxvQkFBb0IsQ0FBQyxDQUFBO1lBQ3BLLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQUE7QUFyQkQsNENBcUJDO0FBRUQsMkZBQTJGO0FBQzNGLHFCQUE0QixRQUFnQjtJQUMxQyxLQUFLLENBQUMsZ0JBQWlCLFFBQVMsRUFBRSxDQUFDLENBQUM7SUFDcEMsZUFBTyxDQUFDLGdCQUFpQixRQUFTLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLGNBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUpELGtDQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCB7IHN5bmMgYXMgbWtkaXJwIH0gZnJvbSAnbWtkaXJwJztcclxuaW1wb3J0IHsgY2htb2RTeW5jIGFzIGNobW9kIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBwYXRoRm9yRG9tYWluLCB3aXRoRG9tYWluU2lnbmluZ1JlcXVlc3RDb25maWcsIHdpdGhEb21haW5DZXJ0aWZpY2F0ZUNvbmZpZyB9IGZyb20gJy4vY29uc3RhbnRzJztcclxuaW1wb3J0IHsgb3BlbnNzbCB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyB3aXRoQ2VydGlmaWNhdGVBdXRob3JpdHlDcmVkZW50aWFscyB9IGZyb20gJy4vY2VydGlmaWNhdGUtYXV0aG9yaXR5JztcclxuXHJcbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6Y2VydGlmaWNhdGVzJyk7XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgYSBkb21haW4gY2VydGlmaWNhdGUgc2lnbmVkIGJ5IHRoZSBkZXZjZXJ0IHJvb3QgQ0EuIERvbWFpblxyXG4gKiBjZXJ0aWZpY2F0ZXMgYXJlIGNhY2hlZCBpbiB0aGVpciBvd24gZGlyZWN0b3JpZXMgdW5kZXJcclxuICogQ09ORklHX1JPT1QvZG9tYWlucy88ZG9tYWluPiwgYW5kIHJldXNlZCBvbiBzdWJzZXF1ZW50IHJlcXVlc3RzLiBCZWNhdXNlIHRoZVxyXG4gKiBpbmRpdmlkdWFsIGRvbWFpbiBjZXJ0aWZpY2F0ZXMgYXJlIHNpZ25lZCBieSB0aGUgZGV2Y2VydCByb290IENBICh3aGljaCB3YXNcclxuICogYWRkZWQgdG8gdGhlIE9TL2Jyb3dzZXIgdHJ1c3Qgc3RvcmVzKSwgdGhleSBhcmUgdHJ1c3RlZC5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRG9tYWluQ2VydGlmaWNhdGUoZG9tYWluOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBta2RpcnAocGF0aEZvckRvbWFpbihkb21haW4pKTtcclxuXHJcbiAgZGVidWcoYEdlbmVyYXRpbmcgcHJpdmF0ZSBrZXkgZm9yICR7IGRvbWFpbiB9YCk7XHJcbiAgbGV0IGRvbWFpbktleVBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgJ3ByaXZhdGUta2V5LmtleScpO1xyXG4gIGdlbmVyYXRlS2V5KGRvbWFpbktleVBhdGgpO1xyXG5cclxuICBkZWJ1ZyhgR2VuZXJhdGluZyBjZXJ0aWZpY2F0ZSBzaWduaW5nIHJlcXVlc3QgZm9yICR7IGRvbWFpbiB9YCk7XHJcbiAgbGV0IGNzckZpbGUgPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLXNpZ25pbmctcmVxdWVzdC5jc3JgKTtcclxuICB3aXRoRG9tYWluU2lnbmluZ1JlcXVlc3RDb25maWcoZG9tYWluLCAoY29uZmlncGF0aCkgPT4ge1xyXG4gICAgb3BlbnNzbChgcmVxIC1uZXcgLWNvbmZpZyBcIiR7IGNvbmZpZ3BhdGggfVwiIC1rZXkgXCIkeyBkb21haW5LZXlQYXRoIH1cIiAtb3V0IFwiJHsgY3NyRmlsZSB9XCJgKTtcclxuICB9KTtcclxuXHJcbiAgZGVidWcoYEdlbmVyYXRpbmcgY2VydGlmaWNhdGUgZm9yICR7IGRvbWFpbiB9IGZyb20gc2lnbmluZyByZXF1ZXN0IGFuZCBzaWduaW5nIHdpdGggcm9vdCBDQWApO1xyXG4gIGxldCBkb21haW5DZXJ0UGF0aCA9IHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCk7XHJcblxyXG4gIGF3YWl0IHdpdGhDZXJ0aWZpY2F0ZUF1dGhvcml0eUNyZWRlbnRpYWxzKCh7IGNhS2V5UGF0aCwgY2FDZXJ0UGF0aCB9KSA9PiB7XHJcbiAgICB3aXRoRG9tYWluQ2VydGlmaWNhdGVDb25maWcoZG9tYWluLCAoZG9tYWluQ2VydENvbmZpZ1BhdGgpID0+IHtcclxuICAgICAgb3BlbnNzbChgY2EgLWNvbmZpZyBcIiR7IGRvbWFpbkNlcnRDb25maWdQYXRoIH1cIiAtaW4gXCIkeyBjc3JGaWxlIH1cIiAtb3V0IFwiJHsgZG9tYWluQ2VydFBhdGggfVwiIC1rZXlmaWxlIFwiJHsgY2FLZXlQYXRoIH1cIiAtY2VydCBcIiR7IGNhQ2VydFBhdGggfVwiIC1kYXlzIDgyNSAtYmF0Y2hgKVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIEdlbmVyYXRlIGEgY3J5cHRvZ3JhcGhpYyBrZXksIHVzZWQgdG8gc2lnbiBjZXJ0aWZpY2F0ZXMgb3IgY2VydGlmaWNhdGUgc2lnbmluZyByZXF1ZXN0cy5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlS2V5KGZpbGVuYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICBkZWJ1ZyhgZ2VuZXJhdGVLZXk6ICR7IGZpbGVuYW1lIH1gKTtcclxuICBvcGVuc3NsKGBnZW5yc2EgLW91dCBcIiR7IGZpbGVuYW1lIH1cIiAyMDQ4YCk7XHJcbiAgY2htb2QoZmlsZW5hbWUsIDQwMCk7XHJcbn0iXX0=