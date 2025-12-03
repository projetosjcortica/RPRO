"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuntimeConfig = getRuntimeConfig;
exports.setRuntimeConfig = setRuntimeConfig;
exports.setRuntimeConfigs = setRuntimeConfigs;
exports.getAllRuntimeConfigs = getAllRuntimeConfigs;
// Simple runtime configuration store used by backend services
const store = {};
function getRuntimeConfig(key) {
    return store[key];
}
function setRuntimeConfig(key, value) {
    store[key] = value;
}
function setRuntimeConfigs(obj) {
    if (!obj)
        return;
    Object.keys(obj).forEach(k => { store[k] = obj[k]; });
}
function getAllRuntimeConfigs() {
    return Object.assign({}, store);
}
exports.default = {
    get: getRuntimeConfig,
    set: setRuntimeConfig,
    setMany: setRuntimeConfigs,
    all: getAllRuntimeConfigs,
};
//# sourceMappingURL=runtimeConfig.js.map