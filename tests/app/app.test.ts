import assert from 'assert';
import {expect} from 'chai';
import request from 'supertest';
import app from '../../src/app/app';

describe('Unit testing the /home route', () => {

    it('should return OK status', function() {
      return request(app)
        .get('/')
        .then(function(response){
            assert.equal(response.status, 200)
        })
    });

    it('should return message on rendering', function() {
        return request(app)
            .get('/')
            .then(function(response){
                expect(response.text).to.contain('Welcome to bank-scraper !!');
            })
    });

});