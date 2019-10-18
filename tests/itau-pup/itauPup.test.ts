import * as chai from 'chai';
import * as request from 'supertest';
import ItauPupController from '../../src/banks/itauPup/itauPup.controller';
import AuthController from '../../src/authentication/authentication.controller'
import { ITAU_BRANCH, ITAU_ACCOUNT, ITAU_PASSWORD } from '../../src/utils/config'
import App from '../../src/app';

describe('Unit testing the /itau route', () => {
    describe('Unit testing the / route for unauthorized user', () => {
        var app = new App([
            new ItauPupController(),
        ]);
        it('should return user to login page if not authenticated', function () {
            return request(app.getServer())
                .post('/itau-pup')
                .send({
                    branch: ITAU_BRANCH,
                    account: ITAU_ACCOUNT,
                    password: ITAU_PASSWORD,
                    days: '7'
                })
                .then((response: any) => {
                    chai.expect(response.status).to.eql(401);
                    chai.expect(response.text).to.contain('Login');
                })
        });
    });

    describe('Unit testing the / route for authorized user', () => {
        var app = new App([
            new AuthController(),
            new ItauPupController(),
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
                    chai.assert.equal(response.status, 200)
                    Cookies = response.header['set-cookie'].pop().split(';')[0];
                    done();
                });
        })
        it('should return body with account informations', function (done) {
            this.timeout(120000)
            var req = request(app.getServer()).post('/itau-pup')
                .send({
                    branch: ITAU_BRANCH,
                    account: ITAU_ACCOUNT,
                    password: ITAU_PASSWORD,
                    days: '7'
                })
            req.cookies = Cookies;
            req.then(function (response) {
                chai.expect(response.body.balance).to.be.a('number');
                chai.expect(response.body.statement.received).to.be.a('number');
                chai.expect(response.body.statement.spent).to.be.a('number');
                chai.expect(response.status).to.eql(200);
                done()
            });
        });
    });
});