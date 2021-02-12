const jwt = require("jsonwebtoken");
const secretKey = "somethingdifferent";
const mysqlPool = require("./mysqlPool");

exports.generateAuthToken = async function (userId) {
	admin = false;
	try {
		const [
			result,
		] = await mysqlPool.query("SELECT admin FROM users WHERE id = ?", [userId]);
		admin = result[0].admin === 0 ? false : true;
	} catch (err) {
		console.log(err);
	}

	const payload = { sub: userId, admin: admin };
	return jwt.sign(payload, secretKey, { expiresIn: "24h" });
};

exports.requireAuthentication = function (req, res, next) {
	const authHeader = req.get("Authorization") || "";
	const authHeaderParts = authHeader.split(" ");
	const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

	try {
		const payload = jwt.verify(token, secretKey);
		req.user = payload.sub;
		req.admin = payload.admin;

		next();
	} catch (err) {
		console.error("  -- error:", err);
		res.status(401).send({
			error: "Invalid authentication token",
		});
	}
};

exports.checkIfAdmin = function (req, res, next) {
	const authHeader = req.get("Authorization") || "";
	const authHeaderParts = authHeader.split(" ");
	const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

	try {
		const payload = jwt.verify(token, secretKey);
		req.admin = payload.admin;
	} catch (err) {
		req.admin = false;
	}

	next();
};
