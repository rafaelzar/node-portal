"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MainRouter_1 = __importDefault(require("./MainRouter"));
const cors_1 = __importDefault(require("cors"));
// import { validateJWT } from './middleware/validate-jwt';
/**
 * Express server application class using singleton
 * @description tbd
 */
class App {
    constructor() {
        this._app = express_1.default();
        this._router = MainRouter_1.default;
        // initialize middleware in order
        this._app.use(express_1.default.json({ limit: '50mb' }));
        this._app.use(express_1.default.urlencoded({ extended: true }));
        this._app.use(cors_1.default());
        // public routes go below here but before the private routes, make a public router class if you add any
        this._app.use('/public', (req, res, next) => {
            res.send({ success: true });
        });
        /**
         * final two middleware -> next(error) called within routers formats passed ErrorHandler
         * validateJWT secures each route beyond '/'
         */
        // private routes go below here
        this._app.use('/', this._router);
        this._app.use((err, req, res, next) => {
            res.status(err.statusCode || 500).json({
                status: 'error',
                statusCode: err.statusCode,
                message: err.message,
            });
        });
    }
    static getInstance() {
        if (!App._Instance) {
            App._Instance = new App();
        }
        return App._Instance;
    }
    listen(port) {
        const port_as_num = port;
        if (!App._port) {
            App._port = port_as_num;
            App._Instance._app.listen(port_as_num, () => console.log(`> Listening on port ${port_as_num}`));
        }
        else {
            console.log(`App instance already in use on ${App._port}.`);
        }
    }
}
exports.default = App;
