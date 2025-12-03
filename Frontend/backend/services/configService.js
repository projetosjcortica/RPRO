"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configService = void 0;
const dbService_1 = require("./dbService");
const entities_1 = require("../entities");
const runtimeConfig_1 = require("../core/runtimeConfig");
class ConfigService {
    getSetting(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            const repo = dbService_1.AppDataSource.getRepository(entities_1.Setting);
            const setting = yield repo.findOne({ where: { key } });
            return setting ? setting.value : null;
        });
    }
    setSetting(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            const repo = dbService_1.AppDataSource.getRepository(entities_1.Setting);
            let setting = yield repo.findOne({ where: { key } });
            if (setting) {
                setting.value = value;
            }
            else {
                setting = repo.create({ key, value });
            }
            yield repo.save(setting);
            // update runtime config too
            try {
                (0, runtimeConfig_1.setRuntimeConfig)(key, value);
            }
            catch (e) { /* ignore */ }
        });
    }
    setSettings(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!obj || typeof obj !== 'object')
                return;
            yield this.ensureInitialized();
            const repo = dbService_1.AppDataSource.getRepository(entities_1.Setting);
            for (const k of Object.keys(obj)) {
                const v = typeof obj[k] === 'string' ? obj[k] : JSON.stringify(obj[k]);
                let s = yield repo.findOne({ where: { key: k } });
                if (s) {
                    s.value = v;
                }
                else {
                    s = repo.create({ key: k, value: v });
                }
                yield repo.save(s);
            }
            // update runtime config map
            try {
                (0, runtimeConfig_1.setRuntimeConfigs)(obj);
            }
            catch (e) { /* ignore */ }
        });
    }
    getAllSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureInitialized();
            const repo = dbService_1.AppDataSource.getRepository(entities_1.Setting);
            const settings = yield repo.find();
            const result = {};
            settings.forEach(s => {
                result[s.key] = s.value;
            });
            return result;
        });
    }
    ensureInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure DBService has initialized the underlying DataSource (handles fallbacks and entities)
            yield dbService_1.dbService.init();
        });
    }
}
exports.configService = new ConfigService();
//# sourceMappingURL=configService.js.map