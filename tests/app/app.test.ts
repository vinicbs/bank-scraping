import assert from 'assert';
import {expect} from 'chai';
import request from 'supertest';
import App from '../../src/app';

describe('Unit testing the /home route', () => {

    it('should return OK status', function() {
      return request(App)
        .get('/')
        .then(function(response){
            assert.equal(response.status, 200)
        })
    });

    it('should return message on rendering', function() {
        return request(App)
            .get('/')
            .then(function(response){
                expect(response.text).to.contain('Welcome to bank-scraper !!');
            })
    });

});