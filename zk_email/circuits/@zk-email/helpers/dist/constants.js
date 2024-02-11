"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIRCOM_LEVELS = exports.CIRCOM_BIGINT_K = exports.CIRCOM_BIGINT_N = exports.MAX_BODY_PADDED_BYTES = exports.MAX_HEADER_PADDED_BYTES = exports.CIRCOM_FIELD_MODULUS = void 0;
exports.CIRCOM_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
exports.MAX_HEADER_PADDED_BYTES = 1024; // NOTE: this must be the same as the first arg in the email in main args circom
exports.MAX_BODY_PADDED_BYTES = 1536; // NOTE: this must be the same as the arg to sha the remainder number of bytes in the email in main args circom
// circom constants from main.circom / https://zkrepl.dev/?gist=30d21c7a7285b1b14f608325f172417b
// template RSAGroupSigVerify(n, k, levels) {
// component main { public [ modulus ] } = RSAVerify(121, 17);
// component main { public [ root, payload1 ] } = RSAGroupSigVerify(121, 17, 30);
exports.CIRCOM_BIGINT_N = 121;
exports.CIRCOM_BIGINT_K = 17;
exports.CIRCOM_LEVELS = 30;
