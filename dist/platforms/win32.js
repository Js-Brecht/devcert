"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const fs_1 = require("fs");
const shared_1 = require("./shared");
const utils_1 = require("../utils");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const debug = debug_1.default('devcert:platforms:windows');
let encryptionKey;
class WindowsPlatform {
    constructor() {
        this.HOST_FILE_PATH = 'C:\\Windows\\System32\\Drivers\\etc\\hosts';
    }
    /**
     * Windows is at least simple. Like macOS, most applications will delegate to
     * the system trust store, which is updated with the confusingly named
     * `certutil` exe (not the same as the NSS/Mozilla certutil). Firefox does it's
     * own thing as usual, and getting a copy of NSS certutil onto the Windows
     * machine to try updating the Firefox store is basically a nightmare, so we
     * don't even try it - we just bail out to the GUI.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // IE, Chrome, system utils
            debug('adding devcert root to Windows OS trust store');
            try {
                utils_1.run(`certutil -addstore -user root "${certificatePath}"`);
            }
            catch (e) {
                e.output.map((buffer) => {
                    if (buffer) {
                        console.log(buffer.toString());
                    }
                });
            }
            debug('adding devcert root to Firefox trust store');
            // Firefox (don't even try NSS certutil, no easy install for Windows)
            try {
                yield shared_1.openCertificateInFirefox('start firefox', certificatePath);
            }
            catch (_a) {
                debug('Error opening Firefox, most likely Firefox is not installed');
            }
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let hostsFileContents = fs_1.readFileSync(this.HOST_FILE_PATH, 'utf8');
            if (!hostsFileContents.includes(domain)) {
                yield utils_1.sudo(`echo 127.0.0.1  ${domain} >> ${this.HOST_FILE_PATH}`);
            }
        });
    }
    readProtectedFile(filepath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!encryptionKey) {
                encryptionKey = yield user_interface_1.default.getWindowsEncryptionPassword();
            }
            // Try to decrypt the file
            try {
                return this.decrypt(fs_1.readFileSync(filepath, 'utf8'), encryptionKey);
            }
            catch (e) {
                // If it's a bad password, clear the cached copy and retry
                if (e.message.indexOf('bad decrypt') >= -1) {
                    encryptionKey = null;
                    return yield this.readProtectedFile(filepath);
                }
                throw e;
            }
        });
    }
    writeProtectedFile(filepath, contents) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!encryptionKey) {
                encryptionKey = yield user_interface_1.default.getWindowsEncryptionPassword();
            }
            let encryptedContents = this.encrypt(contents, encryptionKey);
            fs_1.writeFileSync(filepath, encryptedContents);
        });
    }
    encrypt(text, key) {
        let cipher = crypto_1.default.createCipher('aes256', new Buffer(key));
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    }
    decrypt(encrypted, key) {
        let decipher = crypto_1.default.createDecipher('aes256', new Buffer(key));
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    }
}
exports.default = WindowsPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luMzIuanMiLCJzb3VyY2VSb290IjoiRDovZGV2L2dwbS9naXRodWIuY29tL0pzLUJyZWNodC9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL3dpbjMyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBEQUFnQztBQUNoQyw0REFBNEI7QUFDNUIsMkJBQWtFO0FBRWxFLHFDQUFvRDtBQUVwRCxvQ0FBcUM7QUFDckMsK0VBQW1DO0FBRW5DLE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBRXZELElBQUksYUFBcUIsQ0FBQztBQUUxQjtJQUFBO1FBRVUsbUJBQWMsR0FBRyw0Q0FBNEMsQ0FBQztJQXlFeEUsQ0FBQztJQXZFQzs7Ozs7OztPQU9HO0lBQ0csZ0JBQWdCLENBQUMsZUFBdUIsRUFBRSxVQUFtQixFQUFFOztZQUNuRSwyQkFBMkI7WUFDM0IsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUE7WUFDdEQsSUFBSTtnQkFDRixXQUFHLENBQUMsa0NBQW1DLGVBQWdCLEdBQUcsQ0FBQyxDQUFDO2FBQzdEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRTtvQkFDOUIsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztxQkFDaEM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUNELEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO1lBQ25ELHFFQUFxRTtZQUNyRSxJQUFJO2dCQUNGLE1BQU0saUNBQXdCLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ2xFO1lBQUMsV0FBTTtnQkFDTixLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQzthQUN0RTtRQUNILENBQUM7S0FBQTtJQUVLLDRCQUE0QixDQUFDLE1BQWM7O1lBQy9DLElBQUksaUJBQWlCLEdBQUcsaUJBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sWUFBSSxDQUFDLG1CQUFvQixNQUFPLE9BQVEsSUFBSSxDQUFDLGNBQWUsRUFBRSxDQUFDLENBQUM7YUFDdkU7UUFDSCxDQUFDO0tBQUE7SUFFSyxpQkFBaUIsQ0FBQyxRQUFnQjs7WUFDdEMsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDbEIsYUFBYSxHQUFHLE1BQU0sd0JBQUUsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO2FBQ3pEO1lBQ0QsMEJBQTBCO1lBQzFCLElBQUk7Z0JBQ0YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzVEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsMERBQTBEO2dCQUMxRCxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO29CQUMxQyxhQUFhLEdBQUcsSUFBSSxDQUFDO29CQUNyQixPQUFPLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMvQztnQkFDRCxNQUFNLENBQUMsQ0FBQzthQUNUO1FBQ0gsQ0FBQztLQUFBO0lBRUssa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjs7WUFDekQsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDbEIsYUFBYSxHQUFHLE1BQU0sd0JBQUUsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO2FBQ3pEO1lBQ0QsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM5RCxrQkFBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FBQTtJQUVPLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBVztRQUN2QyxJQUFJLE1BQU0sR0FBRyxnQkFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1RCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTyxPQUFPLENBQUMsU0FBaUIsRUFBRSxHQUFXO1FBQzVDLElBQUksUUFBUSxHQUFHLGdCQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUUsQ0FBQztDQUVGO0FBM0VELGtDQTJFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcclxuaW1wb3J0IHsgd3JpdGVGaWxlU3luYyBhcyB3cml0ZSwgcmVhZEZpbGVTeW5jIGFzIHJlYWQgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCB7IG9wZW5DZXJ0aWZpY2F0ZUluRmlyZWZveCB9IGZyb20gJy4vc2hhcmVkJztcclxuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuJztcclxuaW1wb3J0IHsgcnVuLCBzdWRvIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgVUkgZnJvbSAnLi4vdXNlci1pbnRlcmZhY2UnO1xyXG5cclxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpwbGF0Zm9ybXM6d2luZG93cycpO1xyXG5cclxubGV0IGVuY3J5cHRpb25LZXk6IHN0cmluZztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdpbmRvd3NQbGF0Zm9ybSBpbXBsZW1lbnRzIFBsYXRmb3JtIHtcclxuXHJcbiAgcHJpdmF0ZSBIT1NUX0ZJTEVfUEFUSCA9ICdDOlxcXFxXaW5kb3dzXFxcXFN5c3RlbTMyXFxcXERyaXZlcnNcXFxcZXRjXFxcXGhvc3RzJztcclxuXHJcbiAgLyoqXHJcbiAgICogV2luZG93cyBpcyBhdCBsZWFzdCBzaW1wbGUuIExpa2UgbWFjT1MsIG1vc3QgYXBwbGljYXRpb25zIHdpbGwgZGVsZWdhdGUgdG9cclxuICAgKiB0aGUgc3lzdGVtIHRydXN0IHN0b3JlLCB3aGljaCBpcyB1cGRhdGVkIHdpdGggdGhlIGNvbmZ1c2luZ2x5IG5hbWVkXHJcbiAgICogYGNlcnR1dGlsYCBleGUgKG5vdCB0aGUgc2FtZSBhcyB0aGUgTlNTL01vemlsbGEgY2VydHV0aWwpLiBGaXJlZm94IGRvZXMgaXQnc1xyXG4gICAqIG93biB0aGluZyBhcyB1c3VhbCwgYW5kIGdldHRpbmcgYSBjb3B5IG9mIE5TUyBjZXJ0dXRpbCBvbnRvIHRoZSBXaW5kb3dzXHJcbiAgICogbWFjaGluZSB0byB0cnkgdXBkYXRpbmcgdGhlIEZpcmVmb3ggc3RvcmUgaXMgYmFzaWNhbGx5IGEgbmlnaHRtYXJlLCBzbyB3ZVxyXG4gICAqIGRvbid0IGV2ZW4gdHJ5IGl0IC0gd2UganVzdCBiYWlsIG91dCB0byB0aGUgR1VJLlxyXG4gICAqL1xyXG4gIGFzeW5jIGFkZFRvVHJ1c3RTdG9yZXMoY2VydGlmaWNhdGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgLy8gSUUsIENocm9tZSwgc3lzdGVtIHV0aWxzXHJcbiAgICBkZWJ1ZygnYWRkaW5nIGRldmNlcnQgcm9vdCB0byBXaW5kb3dzIE9TIHRydXN0IHN0b3JlJylcclxuICAgIHRyeSB7XHJcbiAgICAgIHJ1bihgY2VydHV0aWwgLWFkZHN0b3JlIC11c2VyIHJvb3QgXCIkeyBjZXJ0aWZpY2F0ZVBhdGggfVwiYCk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGUub3V0cHV0Lm1hcCgoYnVmZmVyOiBCdWZmZXIpID0+IHtcclxuICAgICAgICBpZiAoYnVmZmVyKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhidWZmZXIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGRlYnVnKCdhZGRpbmcgZGV2Y2VydCByb290IHRvIEZpcmVmb3ggdHJ1c3Qgc3RvcmUnKVxyXG4gICAgLy8gRmlyZWZveCAoZG9uJ3QgZXZlbiB0cnkgTlNTIGNlcnR1dGlsLCBubyBlYXN5IGluc3RhbGwgZm9yIFdpbmRvd3MpXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBvcGVuQ2VydGlmaWNhdGVJbkZpcmVmb3goJ3N0YXJ0IGZpcmVmb3gnLCBjZXJ0aWZpY2F0ZVBhdGgpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIGRlYnVnKCdFcnJvciBvcGVuaW5nIEZpcmVmb3gsIG1vc3QgbGlrZWx5IEZpcmVmb3ggaXMgbm90IGluc3RhbGxlZCcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgYWRkRG9tYWluVG9Ib3N0RmlsZUlmTWlzc2luZyhkb21haW46IHN0cmluZykge1xyXG4gICAgbGV0IGhvc3RzRmlsZUNvbnRlbnRzID0gcmVhZCh0aGlzLkhPU1RfRklMRV9QQVRILCAndXRmOCcpO1xyXG4gICAgaWYgKCFob3N0c0ZpbGVDb250ZW50cy5pbmNsdWRlcyhkb21haW4pKSB7XHJcbiAgICAgIGF3YWl0IHN1ZG8oYGVjaG8gMTI3LjAuMC4xICAkeyBkb21haW4gfSA+PiAkeyB0aGlzLkhPU1RfRklMRV9QQVRIIH1gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlYWRQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgaWYgKCFlbmNyeXB0aW9uS2V5KSB7XHJcbiAgICAgIGVuY3J5cHRpb25LZXkgPSBhd2FpdCBVSS5nZXRXaW5kb3dzRW5jcnlwdGlvblBhc3N3b3JkKCk7XHJcbiAgICB9XHJcbiAgICAvLyBUcnkgdG8gZGVjcnlwdCB0aGUgZmlsZVxyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGVjcnlwdChyZWFkKGZpbGVwYXRoLCAndXRmOCcpLCBlbmNyeXB0aW9uS2V5KTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgLy8gSWYgaXQncyBhIGJhZCBwYXNzd29yZCwgY2xlYXIgdGhlIGNhY2hlZCBjb3B5IGFuZCByZXRyeVxyXG4gICAgICBpZiAoZS5tZXNzYWdlLmluZGV4T2YoJ2JhZCBkZWNyeXB0JykgPj0gLTEpIHtcclxuICAgICAgICBlbmNyeXB0aW9uS2V5ID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZWFkUHJvdGVjdGVkRmlsZShmaWxlcGF0aCk7XHJcbiAgICAgIH1cclxuICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHdyaXRlUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSB7XHJcbiAgICBpZiAoIWVuY3J5cHRpb25LZXkpIHtcclxuICAgICAgZW5jcnlwdGlvbktleSA9IGF3YWl0IFVJLmdldFdpbmRvd3NFbmNyeXB0aW9uUGFzc3dvcmQoKTtcclxuICAgIH1cclxuICAgIGxldCBlbmNyeXB0ZWRDb250ZW50cyA9IHRoaXMuZW5jcnlwdChjb250ZW50cywgZW5jcnlwdGlvbktleSk7XHJcbiAgICB3cml0ZShmaWxlcGF0aCwgZW5jcnlwdGVkQ29udGVudHMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBlbmNyeXB0KHRleHQ6IHN0cmluZywga2V5OiBzdHJpbmcpIHtcclxuICAgIGxldCBjaXBoZXIgPSBjcnlwdG8uY3JlYXRlQ2lwaGVyKCdhZXMyNTYnLCBuZXcgQnVmZmVyKGtleSkpO1xyXG4gICAgcmV0dXJuIGNpcGhlci51cGRhdGUodGV4dCwgJ3V0ZjgnLCAnaGV4JykgKyBjaXBoZXIuZmluYWwoJ2hleCcpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkZWNyeXB0KGVuY3J5cHRlZDogc3RyaW5nLCBrZXk6IHN0cmluZykge1xyXG4gICAgbGV0IGRlY2lwaGVyID0gY3J5cHRvLmNyZWF0ZURlY2lwaGVyKCdhZXMyNTYnLCBuZXcgQnVmZmVyKGtleSkpO1xyXG4gICAgcmV0dXJuIGRlY2lwaGVyLnVwZGF0ZShlbmNyeXB0ZWQsICdoZXgnLCAndXRmOCcpICsgZGVjaXBoZXIuZmluYWwoJ3V0ZjgnKTtcclxuICB9XHJcblxyXG59Il19