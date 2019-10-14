import App from './app';
import UsersController from './users/users.controller';
import AuthenticationController from './authentication/authentication.controller';

const app = new App(
    [
        new AuthenticationController(),
        new UsersController(),
    ]
);
app.listen();