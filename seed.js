var seeder = require('mongoose-seed');
var bcrypt = require('bcrypt')
require('dotenv').config()

bcrypt.hash('testpass', 10).then((result) => {
    console.log(result)
    seeder.connect(process.env.DB_HOST, function () {
        seeder.loadModels([
            './src/users/users.test.model.js'
        ]);

        seeder.clearModels(['User'], function () {
            seeder.populateModels(data, function () {
                seeder.disconnect();
            });
        });
    });

    var data = [
        {
            'model': 'User',
            'documents': [
                {
                    'name': 'Test User',
                    'email': 'testuser',
                    'password': result
                }
            ]
        }
    ];
})
