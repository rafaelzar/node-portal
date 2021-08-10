import express, { Request, Response, NextFunction } from 'express';
import MainRouter from './MainRouter';
import ErrorHandler from './errors/ErrorHandler';
import cors from 'cors';
// import { validateJWT } from './middleware/validate-jwt';
/**
 * Express server application class using singleton
 * @description tbd
 */

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>;
    }
  }
}

class App {
  private static _Instance: App;
  private static _port: number;
  private _app = express();
  private _router = MainRouter;

  private constructor() {
    // initialize middleware in order
    this._app.use(express.json({ limit: '50mb' }));
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(cors());

    // public routes go below here but before the private routes, make a public router class if you add any
    this._app.use('/public', (req: Request, res: Response, next: NextFunction) => {
      res.send({ success: true });
    });

    /**
     * final two middleware -> next(error) called within routers formats passed ErrorHandler
     * validateJWT secures each route beyond '/'
     */

    // private routes go below here
    this._app.use('/', this._router);

    this._app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
      res.status(err.statusCode || 500).json({
        status: 'error',
        statusCode: err.statusCode,
        message: err.message,
      });
    });
  }

  public static getInstance() {
    if (!App._Instance) {
      App._Instance = new App();
    }
    return App._Instance;
  }

  public listen(port: number) {
    const port_as_num = port;
    if (!App._port) {
      App._port = port_as_num;
      App._Instance._app.listen(port_as_num, () => console.log(`> Listening on port ${port_as_num}`));
    } else {
      console.log(`App instance already in use on ${App._port}.`);
    }
  }
}

export default App;
