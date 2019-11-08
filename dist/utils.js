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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiRDovZGV2L3NvdXJjZS9ub2RlL2RldmNlcnQvIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBMEQ7QUFDMUQsc0RBQXNCO0FBQ3RCLDBEQUFnQztBQUNoQyx3REFBd0I7QUFDeEIsc0VBQXFDO0FBRXJDLDJDQUVxQjtBQUVyQixNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUMsaUJBQXdCLEdBQVc7SUFDakMsT0FBTyxHQUFHLENBQUMsV0FBWSxHQUFJLEVBQUUsRUFBRTtRQUM3QixLQUFLLEVBQUUsTUFBTTtRQUNiLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ2pCLFFBQVEsRUFBRSxjQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDO0tBQ2hCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFQRCwwQkFPQztBQUVELGFBQW9CLEdBQVcsRUFBRSxVQUEyQixFQUFFO0lBQzVELEtBQUssQ0FBQyxXQUFZLEdBQUksSUFBSSxDQUFDLENBQUM7SUFDNUIsT0FBTyx3QkFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBSEQsa0JBR0M7QUFFRDtJQUNFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM3QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFMRCxrQ0FLQztBQUVELHlCQUFnQyxPQUFlO0lBQzdDLE9BQU8sSUFBSSxLQUFLLENBQUMsR0FBRyxPQUFPLHNHQUFzRyxDQUFDLENBQUM7QUFDckksQ0FBQztBQUZELDBDQUVDO0FBRUQ7SUFDRSx5RkFBeUY7SUFDekYsdURBQXVEO0lBQ3ZELE9BQU8sYUFBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hELENBQUM7QUFKRCxzQkFJQztBQUVELGNBQXFCLEdBQVc7SUFDOUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxxQkFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFpQixFQUFFLE1BQXFCLEVBQUUsTUFBcUIsRUFBRSxFQUFFO1lBQzVHLElBQUksS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFFO1lBQ2xHLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFQRCxvQkFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4ZWNTeW5jLCBFeGVjU3luY09wdGlvbnMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0IHRtcCBmcm9tICd0bXAnO1xyXG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHN1ZG9Qcm9tcHQgZnJvbSAnc3Vkby1wcm9tcHQnO1xyXG5cclxuaW1wb3J0IHtcclxuICBjb25maWdQYXRoLFxyXG59IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6dXRpbCcpO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5zc2woY21kOiBzdHJpbmcpIHtcclxuICByZXR1cm4gcnVuKGBvcGVuc3NsICR7IGNtZCB9YCwge1xyXG4gICAgc3RkaW86ICdwaXBlJyxcclxuICAgIGVudjogT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgIFJBTkRGSUxFOiBwYXRoLmpvaW4oY29uZmlnUGF0aCgnLnJuZCcpKVxyXG4gICAgfSwgcHJvY2Vzcy5lbnYpXHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBydW4oY21kOiBzdHJpbmcsIG9wdGlvbnM6IEV4ZWNTeW5jT3B0aW9ucyA9IHt9KSB7XHJcbiAgZGVidWcoYGV4ZWM6IFxcYCR7IGNtZCB9XFxgYCk7XHJcbiAgcmV0dXJuIGV4ZWNTeW5jKGNtZCwgb3B0aW9ucyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yVXNlcigpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgIHByb2Nlc3Muc3RkaW4ucmVzdW1lKCk7XHJcbiAgICBwcm9jZXNzLnN0ZGluLm9uKCdkYXRhJywgcmVzb2x2ZSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXBvcnRhYmxlRXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIG5ldyBFcnJvcihgJHttZXNzYWdlfSB8IFRoaXMgaXMgYSBidWcgaW4gZGV2Y2VydCwgcGxlYXNlIHJlcG9ydCB0aGUgaXNzdWUgYXQgaHR0cHM6Ly9naXRodWIuY29tL2RhdmV3YXNtZXIvZGV2Y2VydC9pc3N1ZXNgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1rdG1wKCkge1xyXG4gIC8vIGRpc2NhcmREZXNjcmlwdG9yIGJlY2F1c2Ugd2luZG93cyBjb21wbGFpbnMgdGhlIGZpbGUgaXMgaW4gdXNlIGlmIHdlIGNyZWF0ZSBhIHRtcCBmaWxlXHJcbiAgLy8gYW5kIHRoZW4gc2hlbGwgb3V0IHRvIGEgcHJvY2VzcyB0aGF0IHRyaWVzIHRvIHVzZSBpdFxyXG4gIHJldHVybiB0bXAuZmlsZVN5bmMoeyBkaXNjYXJkRGVzY3JpcHRvcjogdHJ1ZSB9KS5uYW1lO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3VkbyhjbWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBzdWRvUHJvbXB0LmV4ZWMoY21kLCB7IG5hbWU6ICdkZXZjZXJ0JyB9LCAoZXJyOiBFcnJvciB8IG51bGwsIHN0ZG91dDogc3RyaW5nIHwgbnVsbCwgc3RkZXJyOiBzdHJpbmcgfCBudWxsKSA9PiB7XHJcbiAgICAgIGxldCBlcnJvciA9IGVyciB8fCAodHlwZW9mIHN0ZGVyciA9PT0gJ3N0cmluZycgJiYgc3RkZXJyLnRyaW0oKS5sZW5ndGggPiAwICYmIG5ldyBFcnJvcihzdGRlcnIpKSA7XHJcbiAgICAgIGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoc3Rkb3V0KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbiJdfQ==