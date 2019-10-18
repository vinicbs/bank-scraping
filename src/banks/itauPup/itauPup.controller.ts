import * as express from 'express';
import * as puppeteer from 'puppeteer'
import * as request from 'request';
import axios from 'axios';

// Itau
import Controller from '../../interfaces/controller.interface';
import CreateItauPupDto from './itauPup.dto';
import ItauPup from './itauPup.interface'
import ItauPupModel from './itauPup.model'
// Exceptions
import HttpException from '../../exceptions/HttpException';
// Middlewares
import validationMiddleware from '../../middleware/validation.middleware';
import authMiddleware from '../../middleware/auth.view.middleware'
import { ValidationError } from 'class-validator';

class ItauPupController implements Controller {
    public path = '/itau-pup';
    public router = express.Router();
    public itauUrl = "https://www.itau.com.br";
    private itau: ItauPup;
    private itauPup = ItauPupModel;

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(this.path, authMiddleware, validationMiddleware(CreateItauPupDto), this.initAuth);
        this.router.post(this.path + '/create', validationMiddleware(CreateItauPupDto), authMiddleware, this.createItauPup)
    }

    private createItauPup = async (request: express.Request, response: express.Response) => {
        const itauPupData: CreateItauPupDto = request.body;
        const createdItauPup = new this.itauPup({
            ...itauPupData,
            user: response.locals.user._id,
        });
        const savedItauPup = await createdItauPup.save();
        await savedItauPup.populate('user', '-password').execPopulate();
        response.send(savedItauPup);
    }

    private initAuth = async (request: express.Request, response: express.Response, next: express.NextFunction) => {

        this.itau = request.body;
        try {
            const browser = await puppeteer.launch({
                headless: true,
                devtools: false,
                timeout: 600000
            });
            const page = await browser.newPage();
            await page.setViewport({
                width: 1024,
                height: 768
            });
            try {
                await this.firstPage(page);
                await this.passwordLogin(page);
                //await this.closePopup(page);
                let balance = await this.checkBankBalance(page);
                let statement = await this.checkBankStatament(page, request.body.days);
                await page.close()
                await browser.close()
                response.send({
                    status: true,
                    balance: balance,
                    statement: statement
                })
            } catch (err) {
                console.log(err)
                await page.close()
                await browser.close()
                response.status(500).send({
                    status: false,
                    message: 'não foi possivel efetuar o scraping da conta'
                })
            }
        } catch (err) {
            console.log(err)
            response.status(500).send({
                status: false,
                message: 'erro'
            })
        }


    }

    private firstPage = async (page: puppeteer.Page) => {
        console.log('Opening bank homepage...');
        await page.goto(this.itauUrl);
        console.log('Homepage loaded.');
        await page.type('#agencia', this.itau.branch);
        await page.type('#conta', this.itau.account);
        console.log('Account and branch number has been filled.');
        await page.waitFor(500);
        await page.click('#btnLoginSubmit');
        await page.waitFor('div.modulo-login');
    }

    private passwordLogin = async (page: puppeteer.Page) => {
        console.log('Password page loaded.');
        let passwordKeys = await this.passwordMap(page);
        let keyClickOption = { delay: 300 };
        await page.waitFor(500);
        console.log('Filling account password...');
        for (const digit of this.itau.password) {
            await passwordKeys[digit].click(keyClickOption);
        }
        console.log('Password has been filled...login...');
        await page.waitFor(500);
        page.click('#acessar', keyClickOption);
        await page.waitFor('#sectionHomePessoaFisica');
        console.log('Logged!');
    }

    private passwordMap = async (page: puppeteer.Page) => {
        let keys = await page.$$('.teclas .tecla');
        let keyMapped: any = {};

        for (const key of keys) {
            let text: string = await page.evaluate(element => element.textContent, key);
            if (text.includes('ou')) {
                let digits = text.split('ou').map(digit => digit.trim());
                keyMapped[digits[0]] = key;
                keyMapped[digits[1]] = key;
            }
        }
        return keyMapped;
    }

    private closePopup = async (page: puppeteer.Page) => {
        // await page.waitForSelector('div.mfp-wrap', { timeout: 4000 })
        //     .then(() => page.evaluate(() => popFechar()))
        //     .catch(() => { });
    };

    private checkBankBalance = async (page: puppeteer.Page) => {
        await page.waitFor(3000);
        console.log('Getting bank balance')
        const element = await page.$('.valor-fatura');
        const text = await page.evaluate(element => element.textContent, element);
        return parseFloat(text.replace(/R\$/, '').replace(/\./g, '').replace(/,/g, "."))
    }

    private checkBankStatament = async (page: puppeteer.Page, days: string) => {
        console.log('Opening statement page...');
        await page.waitFor('a[id="VerExtrato"]');
        console.log('Waited for ver extrato.');
        await page.click('a[id="VerExtrato"]');
        await page.waitFor('div.select');
        await page.waitFor(2000);
        console.log('Statement page loaded.');
        let options = await page.$x('//select[class=contains(text(), "select")]');
        await options[0].select(days)
        console.log(`Selected last ${days} days.`)
        let received = await this.checkReceivedStatement(page);
        let spent = await this.checkSpentStatement(page);
        return ({ received, spent })
    }

    private checkReceivedStatement = async (page: puppeteer.Page) => {
        await page.waitFor(3000);
        let buttonEntradas = await page.$x('//button[class=contains(text(), "entradas-filtro-extrato-pf")]');
        for (const button of buttonEntradas) {
            let text: string = await page.evaluate(button => button.textContent, button)
            if (text.includes('entradas')) {
                await button.click();
                break;
            }
        }
        console.log('Clicked Entradas');
        await page.waitFor(2000);
        let total = 0;
        let entries = await page.$x('//td[class=contains(text(), "valor-lancamento-positivo-pf")]');
        for (const entry of entries) {
            let text = await page.evaluate(entry => entry.textContent, entry)
            if (!text.includes('/')) {
                let entryValue = parseFloat(text.replace(/\./g, '').replace(/,/g, "."));
                if (entryValue) {
                    total += entryValue;
                    //console.log('FLOAT: ', entryValue)
                }
            }
        }
        return (Math.round(total))
    }

    private checkSpentStatement = async (page: puppeteer.Page) => {
        await page.waitFor(2000);
        let buttonSaidas = await page.$x('//button[class=contains(text(), "entradas-filtro-extrato-pf")]');
        for (const button of buttonSaidas) {
            let text: string = await page.evaluate(button => button.textContent, button)
            if (text.includes('saídas')) {
                await button.click()
                break;
            }
        }
        console.log('Clicked Saidas');
        await page.waitFor(2000);
        let total = 0;
        let nentries = await page.$x('//td[class=contains(text(), "valor-lancamento-negativo-pf")]');
        for (const entry of nentries) {
            let text = await page.evaluate(entry => entry.textContent, entry)
            if (!text.includes('/')) {
                let entryValue = parseFloat(text.replace(/\./g, '').replace(/,/g, "."));
                if (entryValue) {
                    total += entryValue;
                    //console.log('FLOATN: ', entryValue)
                }
            }
        }
        return (Math.round(total))
    }
}

export default ItauPupController;