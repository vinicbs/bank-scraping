# Bank Scraping

A simple Web Scraper NodeJS project to keep up with your banking statement and some other informations

## Informations

| Bank| Info    | Statement Backlog in Days| Method | Status |
| --- | ------- | -------------------------- | ------ | ------ |
| Itaú| Current balance, total spent and total received in period of time | 3, 5, 7, 15, 30, 60, 90 | Headless Browser| OK |
|     |         |                            |        |        |

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


### Prerequisites

* [Node.js](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/)

### Installing

Clone the project

```
git clone https://github.com/vinicbs/bank-scraping.git
```

Navigate to directory

```
cd bank-scraping/
```

Install modules

```
npm install
```

Create a file named *.env* in the main project folder and copy the code below to setup the database

```
DB_HOST=*path to your mongodb host*
SERVER_PORT=*port you wish to run the application*
JWT_SECRET=*token to verify user authentication*
ITAU_BRANCH=*itau card branch for testing*
ITAU_ACCOUNT=*itau card account for testing*
ITAU_PASSWORD=*itau online password for testing*
```

Install nodemon globally - *recommended*

```
npm install -g nodemon
```

Run database seeds

```
npm run seeds
```

Run to start the application in development mode

```
npm run dev
```

### Testing

Run to start the tests

```
npm run test
```

## Commit messages

* **MAJOR**: Add new feature or some major changes in core functionalities
* **MINOR**: Minor changes that probably won't affect any functionalities
* **FIX**: Bugfixes

## External Modules Documentation

* [Express](https://expressjs.com/)
* [mongoose](https://mongoosejs.com/)
* [TypeScript](http://www.typescriptlang.org/)