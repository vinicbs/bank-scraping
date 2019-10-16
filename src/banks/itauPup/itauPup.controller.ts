import * as express from 'express';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer'
import * as request from 'request';
import axios from 'axios';

// Itau
import Controller from '../../interfaces/controller.interface';
import CreateItauPupDto from './itauPup.dto';
import ItauPup from './itauPup.interface'
// Exceptions
import HttpException from '../../exceptions/HttpException';
// Middlewares
import validationMiddleware from '../../middleware/validation.middleware';
import authViewMiddleware from '../../middleware/auth.view.middleware'

class ItauPupController implements Controller {
    public path = '/itau-pup';
    public router = express.Router();
    public itauUrl = "https://www.itau.com.br";
    private itau: ItauPup;

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(this.path, (authViewMiddleware), this.initAuth);
    }

    private initAuth = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        this.itau = request.body;
        const browser = await puppeteer.launch({
            headless: false,
            //devtools: false,
            timeout: 600000
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1024,
            height: 768
        });
        await this.firstPage(page);
        await this.passwordLogin(page);
        await this.closePopup(page);
        await this.checkBankStatament(page);
        await page.close()
        await browser.close()
        response.redirect('/')
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
        await page.waitForSelector('div.mfp-wrap', { timeout: 4000 })
            .then(() => page.evaluate(() => popFechar()))
            .catch(() => { });
    };

    private checkBankStatament = async (page: puppeteer.Page) => {
        console.log('Opening statement page...');
        await page.waitFor('a[id="VerExtrato"]');
        console.log('Waited for ver extrato.');
        await page.click('a[id="VerExtrato"]');
        await page.waitFor('div.select');
        await page.waitFor(2000);
        console.log('Statement page loaded.');
        let options = await page.$x('//select[class=contains(text(), "select")]');
        await options[0].select('90')
        console.log('Selected last 90 days.')
        await this.checkReceivedStatement(page);
        await this.checkSpentStatement(page);
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
        console.log('Seus ganhos foram: ', total)
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
        console.log('Você gastou: ', total);
    }
}

export default ItauPupController;