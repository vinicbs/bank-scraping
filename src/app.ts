import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import * as mongoose from 'mongoose';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as config from './utils/config';
import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'ejs');
        this.app.set('port', config.SERVER_PORT);

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeErrorHandling();
        this.initializeControllers(controllers);
    }

    public listen() {
        this.app.listen(config.SERVER_PORT, () => {
            console.log(`App listening on the port ${config.SERVER_PORT}`);
        });
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    private connectToTheDatabase() {
        mongoose.connect(config.DB_HOST,
            { useNewUrlParser: true, useUnifiedTopology: true });
    }
}

export default App;