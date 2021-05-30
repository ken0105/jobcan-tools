"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
async function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
exports.sleep = sleep;
