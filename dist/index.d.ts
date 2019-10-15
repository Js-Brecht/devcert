/// <reference types="node" />
import { UserInterface } from './user-interface';
export interface Options {
    returnCa?: true | 'read';
    skipCertutilInstall?: true;
    skipHostsFile?: true;
    ui?: UserInterface;
}
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
export declare function certificateFor(domain: string, options?: Options): Promise<{
    ca: string | Buffer;
    key: Buffer;
    cert: Buffer;
} | {
    key: Buffer;
    cert: Buffer;
    ca?: undefined;
}>;
export declare function hasCertificateFor(domain: string): boolean;
export declare function configuredDomains(): string[];
export declare function removeDomain(domain: string): void;
