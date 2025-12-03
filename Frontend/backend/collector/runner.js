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
const index_1 = require("./index");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[collector-runner] starting collector...');
        (0, index_1.startCollector)().catch((err) => {
            console.error('[collector-runner] collector error:', err);
            process.exit(1);
        });
        // Listen to parent messages to allow stopping
        if (typeof process.on === 'function') {
            process.on('message', (m) => {
                if (m && m.type === 'stop') {
                    console.log('[collector-runner] stop requested');
                    (0, index_1.stopCollector)();
                    setTimeout(() => process.exit(0), 1000);
                }
            });
        }
    });
}
if (require.main === module)
    main();
//# sourceMappingURL=runner.js.map