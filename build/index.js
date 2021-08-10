"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = __importDefault(require("./env-config"));
const App_1 = __importDefault(require("./App"));
const mongoString = env_config_1.default.APP_DB_URI;
const mongoOptions = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
};
/**
 * single connection for now
 * looks like we might have to extend Document on models if we use
 * Connection.model instead of Mongoose.model
 */
mongoose_1.default
    .connect(mongoString, mongoOptions)
    .then(() => {
    const myApp = App_1.default.getInstance();
    myApp.listen(env_config_1.default.APP_PORT);
})
    .catch((error) => {
    console.log("error", `Error in index.ts: ${error}`);
});
mongoose_1.default.Promise = global.Promise;
