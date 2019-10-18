import * as assert from 'assert';
import { expect } from 'chai';
import * as request from 'supertest';
import HomeController from '../../src/home/home.controller';
import AuthController from '../../src/authentication/authentication.controller'
import App from '../../src/app';

describe('Unit testing the / route', () => {
    describe('Unit testing the / route for unauthorized user', () => {
        const app = new App([
            new HomeController(),
        ]);
        it('should unathorized error code', function () {
            return request(app.getServer())
                .get('/')
                .then(function (response) {
                    assert.equal(response.status, 401)
                })
        });

        it('should return login page if not authenticated', function () {
            return request(app.getServer())
                .get('/')
                .then(function (response) {
                    expect(response.text).to.contain('Login');
                })
        });
    });

    describe('Unit testing the / route for authorized user', () => {
        const app = new App([
            new AuthController(),
            new HomeController(),
        ]);
        var Cookies: string;
        it('should create a user session for a valid user', function (done) {
            request(app.getServer())
                .post('/auth/login')
                .send({
                    email: 'testuser',
                    password: 'testpass',
                })
                .end(function (err, response) {
                    assert.equal(response.status, 200)
                    Cookies = response.header['set-cookie'].pop().split(';')[0];
                    done();
                });
        })

        it('should return OK code', function () {
            var req = request(app.getServer()).get('/')
            req.cookies = Cookies;
            req.then(function (response) {
                assert.equal(response.status, 200)
            })
        });


        it('should return main page if authenticated', function () {
            var req = request(app.getServer()).get('/')
            req.cookies = Cookies;
            req.then(function (response) {
                expect(response.text).to.contain('Bank Scrapper!');
            });
        });
    });
});

