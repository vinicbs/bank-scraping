import App from './app';
import UsersController from './users/users.controller';
import AuthenticationController from './authentication/authentication.controller';
import HomeController from './home/home.controller';
import ItauController from './banks/itau/itau.controller'
import ItauMobController from './banks/itauMob/itauMob.controller';

const app = new App(
    [
        new AuthenticationController(),
        new HomeController(),
        new UsersController(),
        new ItauController(),
        new ItauMobController()
    ]
);
app.listen();