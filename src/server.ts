import App from './app';
import UsersController from './users/users.controller';
import AuthenticationController from './authentication/authentication.controller';
import HomeController from './home/home.controller';
import ItauController from './banks/itau/itau.controller'

const app = new App(
    [
        new AuthenticationController(),
        new HomeController(),
        new UsersController(),
        new ItauController
    ]
);
app.listen();