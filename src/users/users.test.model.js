
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ name: 'string', email: 'string', password: 'string' });
exports.default = mongoose.model('User', userSchema);