const mysqlPool = require("../lib/mysqlPool");
const { extractValidFields } = require("../lib/validation");
const bcrypt = require("bcryptjs");

const UserSchema = {
	name: { required: true },
	email: { required: true },
	password: { required: true },
	admin: { required: false },
};

exports.UserSchema = UserSchema;

async function insertNewUser(user) {
	user = extractValidFields(user, UserSchema);
	user.password = await bcrypt.hash(user.password, 8);

	const [result] = await mysqlPool.query("INSERT INTO users SET ?", user);

	return result.insertId;
}

exports.getUserByEmail = async function (email, includePassword) {
	try {
		const [result] = await mysqlPool.query(
			"SELECT * FROM users WHERE email = ?",
			email
		);

		return result[0];
	} catch (err) {
		console.log(err);
	}
};

exports.getUserById = async function (id) {
	try {
		const [result] = await mysqlPool.query(
			"SELECT * FROM users WHERE id = ?",
			id
		);
		return result[0];
	} catch (err) {
		console.log(err);
	}
};

exports.validateUser = async function (id, password) {
	const user = await exports.getUserById(id, true);
	return user && (await bcrypt.compare(password, user.password));
};

exports.insertNewUser = insertNewUser;
