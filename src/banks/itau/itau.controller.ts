import * as express from 'express';
import * as cheerio from 'cheerio';
import * as request from 'request';
import axios from 'axios';

// Users
import Controller from '../../interfaces/controller.interface';
// Exceptions
import HttpException from '../../exceptions/HttpException';
// Middlewares
import validationMiddleware from '../../middleware/validation.middleware';
import authViewMiddleware from '../../middleware/auth.view.middleware'

class ItauController implements Controller {
    public path = '/itau';
    public itauUrl = 'https://www.itau.com.br';
    public routerUrl1 = 'https://internetpf.itau.com.br/router-app/router'
    public routerUrl2 = 'https://internetpf2.itau.com.br/router-app/router'
    public router = express.Router();
    public itauRequest = request.defaults({
        headers: {
            "User-Agent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36; ' +
                '(KHTML, like Gecko) Ubuntu Chromium/72.0.3626.121; ' +
                'Chrome/72.0.3626.121 Safari/537.36;'
        }
    })
    public cookieJar = request.jar();
    public agency = '';
    public account = '';
    public account_digit = '';
    public password = '';

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.initAuth);
    }

    private initAuth = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        this.auth0().then(resultAuth0 => {
            this.auth1(resultAuth0.id, resultAuth0.op).then(resultAuth1 => {
                this.auth2().then(resultAuth2 => {

                })
            }).catch(err => {
                response.send(err);
            })
        }).catch(err => {
            response.send(err);
        })
    }

    private auth0 = () => {
        return new Promise<{ id: string, op: string }>((resolve, reject) => {
            this.itauRequest.get({ url: this.itauUrl, jar: this.cookieJar }, (err, response, body) => {
                if (err) {
                    reject(err)
                } else {
                    const $ = cheerio.load(body);
                    const form = $('form[name=banklineAgConta]');
                    const id: string = form.find($('input[name=id]')).val();
                    const op: string = form.find($('input[name=op]')).val();
                    resolve({ id: id, op: op });
                }
            })
        })
    }

    private auth1 = (id: string, op: string) => {
        return new Promise<boolean>((resolve, reject) => {
            const data = {
                id: id,
                op: op,
                agencia: this.agency,
                conta: this.account,
                dac: this.account_digit,
                tipousuario: 'X',
                origem: 'H'
            }
            const url = 'https://bankline.itau.com.br/GRIPNET/bklcom.dll';
            this.itauRequest.post({url: url, body: data, jar: this.cookieJar, json: true}, (err, response, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })
    }

    private auth2 = () => {
        return new Promise((resolve, reject) => {
            const data = {
                "portal": '005',
                "pre-login": 'pre-login',
                "tipoLogon": '7',
                "usuario.agencia": this.agency,
                "usuario.conta": this.account,
                "usuario.dac": this.account_digit,
                "destino": '',
            }
            console.log(this.cookieJar)
            this.itauRequest.post({url: this.routerUrl1, body: data, jar: this.cookieJar, json: true}, (err, response, body) => {
                if(err) {
                    console.log('error')
                } else {
                    console.log(this.cookieJar)
                    this.itauRequest.post({url: this.routerUrl2, body: data, jar: this.cookieJar, json: true}, (err, response, body) => {
                        if(err) {
                            console.log('error')
                        } else {
                            console.log(response.statusCode)
                            console.log(response.statusMessage)
                        }
                    })
                }
            })
        })
    }

}

export default ItauController;