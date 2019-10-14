import * as express from 'express';
// Users
import Controller from '../interfaces/controller.interface';
// Exceptions
import HttpException from '../exceptions/HttpException';
// Middlewares
import validationMiddleware from '../middleware/validation.middleware';
import authViewMiddleware from '../middleware/auth.view.middleware'

class HomeController implements Controller {
    public path = '/';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, authViewMiddleware, this.showHomePage);
        this.router.get(`${this.path}register`, this.showRegisterPage);
    }

    private showHomePage = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        response.render('index', {
            message: 'Welcome to bank-scraper !!'
        })
    }

    private showRegisterPage = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        response.render('register')
    }
}

export default HomeController;