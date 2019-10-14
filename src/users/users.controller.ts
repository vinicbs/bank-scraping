import * as express from 'express';
// Users
import User from './users.interface';
import Controller from '../interfaces/controller.interface';
import userModel from './users.model';
import CreateUserDto from './users.dto';
// Exceptions
import HttpException from '../exceptions/HttpException';
// Middlewares
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware'

class UsersController implements Controller {
    public path = '/users';
    public router = express.Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllUsers);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getUserById);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteUser);
        this.router.post(this.path, validationMiddleware(CreateUserDto), this.createUser);
    }

    private getAllUsers = (request: express.Request, response: express.Response) => {
        this.user.find().then((users) => {
            response.send(users);
        }).catch(err => {
            console.log(err);
            response.send(err);
        });
    }

    private getUserById = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        console.log(id)
        this.user.findById(id).then((user) => {
            if (user) {
                response.send(user);
            } else {
                next(new HttpException(404, 'User not found'));
            }
        }).catch(err => {
            console.log('ERRO: ', err)
        });
    }

    private deleteUser = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        this.user.findByIdAndDelete(id).then((successResponse) => {
            if (successResponse) {
                response.send(200);
            } else {
                next(new HttpException(404, 'User not found'));
            }
        });
    }

    private createUser = (request: express.Request, response: express.Response) => {
        const userData: User = request.body;
        const createdPost = new this.user(userData);
        createdPost.save().then((savedUser) => {
            response.send(savedUser);
        });
    }
}

export default UsersController;