var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../core/baseService", "basic-ftp", "path", "fs"], function (require, exports, baseService_1, basic_ftp_1, path_1, fs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IHMService = void 0;
    path_1 = __importDefault(path_1);
    fs_1 = __importDefault(fs_1);
    class IHMService extends baseService_1.BaseService {
        constructor(ip, user = 'anonymous', password = '') {
            super('IHMService');
            this.ip = ip;
            this.user = user;
            this.password = password;
        }
        findAndDownloadNewFiles(localDir) {
            return __awaiter(this, void 0, void 0, function* () {
                const client = new basic_ftp_1.Client();
                try {
                    yield client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
                    yield client.useDefaultSettings();
                    yield client.cd('/');
                    const list = yield client.list();
                    const csvs = list.filter((f) => f.isFile && f.name.toLowerCase().endsWith('.csv'));
                    const results = [];
                    for (const f of csvs) {
                        const local = path_1.default.join(localDir, f.name);
                        yield client.downloadTo(local, f.name, 0);
                        const stat = fs_1.default.statSync(local);
                        results.push({ name: f.name, localPath: local, size: stat.size });
                    }
                    return results;
                }
                finally {
                    client.close();
                }
            });
        }
    }
    exports.IHMService = IHMService;
});
