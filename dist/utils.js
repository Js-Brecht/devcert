"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const tmp_1 = tslib_1.__importDefault(require("tmp"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const path_1 = tslib_1.__importDefault(require("path"));
const sudo_prompt_1 = tslib_1.__importDefault(require("sudo-prompt"));
const constants_1 = require("./constants");
const debug = debug_1.default('devcert:util');
function openssl(cmd) {
    return run(`openssl ${cmd}`, {
        stdio: 'pipe',
        env: Object.assign({
            RANDFILE: path_1.default.join(constants_1.configPath('.rnd'))
        }, process.env)
    });
}
exports.openssl = openssl;
function run(cmd, options = {}) {
    debug(`exec: \`${cmd}\``);
    return child_process_1.execSync(cmd, options);
}
exports.run = run;
function waitForUser() {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.on('data', resolve);
    });
}
exports.waitForUser = waitForUser;
function reportableError(message) {
    return new Error(`${message} | This is a bug in devcert, please report the issue at https://github.com/davewasmer/devcert/issues`);
}
exports.reportableError = reportableError;
function mktmp() {
    // discardDescriptor because windows complains the file is in use if we create a tmp file
    // and then shell out to a process that tries to use it
    return tmp_1.default.fileSync({ discardDescriptor: true }).name;
}
exports.mktmp = mktmp;
function sudo(cmd) {
    return new Promise((resolve, reject) => {
        sudo_prompt_1.default.exec(cmd, { name: 'devcert' }, (err, stdout, stderr) => {
            let error = err || (typeof stderr === 'string' && stderr.trim().length > 0 && new Error(stderr));
            error ? reject(error) : resolve(stdout);
        });
    });
}
exports.sudo = sudo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiRDovZGV2L2dwbS9naXRodWIuY29tL0pzLUJyZWNodC9kZXZjZXJ0LyIsInNvdXJjZXMiOlsidXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBQTBEO0FBQzFELHNEQUFzQjtBQUN0QiwwREFBZ0M7QUFDaEMsd0RBQXdCO0FBQ3hCLHNFQUFxQztBQUVyQywyQ0FFcUI7QUFFckIsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRTFDLGlCQUF3QixHQUFXO0lBQ2pDLE9BQU8sR0FBRyxDQUFDLFdBQVksR0FBSSxFQUFFLEVBQUU7UUFDN0IsS0FBSyxFQUFFLE1BQU07UUFDYixHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNqQixRQUFRLEVBQUUsY0FBSSxDQUFDLElBQUksQ0FBQyxzQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQztLQUNoQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBUEQsMEJBT0M7QUFFRCxhQUFvQixHQUFXLEVBQUUsVUFBMkIsRUFBRTtJQUM1RCxLQUFLLENBQUMsV0FBWSxHQUFJLElBQUksQ0FBQyxDQUFDO0lBQzVCLE9BQU8sd0JBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUhELGtCQUdDO0FBRUQ7SUFDRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDN0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN2QixPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBTEQsa0NBS0M7QUFFRCx5QkFBZ0MsT0FBZTtJQUM3QyxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsT0FBTyxzR0FBc0csQ0FBQyxDQUFDO0FBQ3JJLENBQUM7QUFGRCwwQ0FFQztBQUVEO0lBQ0UseUZBQXlGO0lBQ3pGLHVEQUF1RDtJQUN2RCxPQUFPLGFBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN4RCxDQUFDO0FBSkQsc0JBSUM7QUFFRCxjQUFxQixHQUFXO0lBQzlCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMscUJBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsR0FBaUIsRUFBRSxNQUFxQixFQUFFLE1BQXFCLEVBQUUsRUFBRTtZQUM1RyxJQUFJLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBRTtZQUNsRyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBUEQsb0JBT0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjU3luYywgRXhlY1N5bmNPcHRpb25zIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XHJcbmltcG9ydCB0bXAgZnJvbSAndG1wJztcclxuaW1wb3J0IGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBzdWRvUHJvbXB0IGZyb20gJ3N1ZG8tcHJvbXB0JztcclxuXHJcbmltcG9ydCB7XHJcbiAgY29uZmlnUGF0aCxcclxufSBmcm9tICcuL2NvbnN0YW50cyc7XHJcblxyXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OnV0aWwnKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvcGVuc3NsKGNtZDogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIHJ1bihgb3BlbnNzbCAkeyBjbWQgfWAsIHtcclxuICAgIHN0ZGlvOiAncGlwZScsXHJcbiAgICBlbnY6IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICBSQU5ERklMRTogcGF0aC5qb2luKGNvbmZpZ1BhdGgoJy5ybmQnKSlcclxuICAgIH0sIHByb2Nlc3MuZW52KVxyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcnVuKGNtZDogc3RyaW5nLCBvcHRpb25zOiBFeGVjU3luY09wdGlvbnMgPSB7fSkge1xyXG4gIGRlYnVnKGBleGVjOiBcXGAkeyBjbWQgfVxcYGApO1xyXG4gIHJldHVybiBleGVjU3luYyhjbWQsIG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gd2FpdEZvclVzZXIoKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICBwcm9jZXNzLnN0ZGluLnJlc3VtZSgpO1xyXG4gICAgcHJvY2Vzcy5zdGRpbi5vbignZGF0YScsIHJlc29sdmUpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0YWJsZUVycm9yKG1lc3NhZ2U6IHN0cmluZykge1xyXG4gIHJldHVybiBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gfCBUaGlzIGlzIGEgYnVnIGluIGRldmNlcnQsIHBsZWFzZSByZXBvcnQgdGhlIGlzc3VlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZld2FzbWVyL2RldmNlcnQvaXNzdWVzYCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBta3RtcCgpIHtcclxuICAvLyBkaXNjYXJkRGVzY3JpcHRvciBiZWNhdXNlIHdpbmRvd3MgY29tcGxhaW5zIHRoZSBmaWxlIGlzIGluIHVzZSBpZiB3ZSBjcmVhdGUgYSB0bXAgZmlsZVxyXG4gIC8vIGFuZCB0aGVuIHNoZWxsIG91dCB0byBhIHByb2Nlc3MgdGhhdCB0cmllcyB0byB1c2UgaXRcclxuICByZXR1cm4gdG1wLmZpbGVTeW5jKHsgZGlzY2FyZERlc2NyaXB0b3I6IHRydWUgfSkubmFtZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN1ZG8oY21kOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgc3Vkb1Byb21wdC5leGVjKGNtZCwgeyBuYW1lOiAnZGV2Y2VydCcgfSwgKGVycjogRXJyb3IgfCBudWxsLCBzdGRvdXQ6IHN0cmluZyB8IG51bGwsIHN0ZGVycjogc3RyaW5nIHwgbnVsbCkgPT4ge1xyXG4gICAgICBsZXQgZXJyb3IgPSBlcnIgfHwgKHR5cGVvZiBzdGRlcnIgPT09ICdzdHJpbmcnICYmIHN0ZGVyci50cmltKCkubGVuZ3RoID4gMCAmJiBuZXcgRXJyb3Ioc3RkZXJyKSkgO1xyXG4gICAgICBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKHN0ZG91dCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG4iXX0=