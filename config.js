exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/fit-pets';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
// exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*'; 
exports.TEST_DATABASE_URL = (
	process.env.TEST_DATABASE_URL ||
	'mongodb://localhost/test-fit-pets');