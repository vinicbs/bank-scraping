# Bank Scraping

A simple Web Scraper NodeJS project to keep up with your banking statement and some other informations

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
```

Install nodemon globally

```
npm install -g nodemon
```

Run to start the application in development mode

```
npm run dev
```

### Testing

Run to start the tests

```
npm run test-dev
```

## Commit messages

* **MAJOR**: Add new feature or some major changes in core functionalities
* **MINOR**: Minor changes that probably won't affect any functionalities
* **FIX**: Bugfixes

## External Modules Documentation

* [Express](https://expressjs.com/)
* [mongoose](https://mongoosejs.com/)
* [TypeScript](http://www.typescriptlang.org/)