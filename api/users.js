const router = require("express").Router();

const { validateAgainstSchema } = require("../lib/validation");

const {
	insertNewUser,
	UserSchema,
	validateUser,
	getUserById,
	getUserByEmail,
} = require("../models/users");

const {
	generateAuthToken,
	requireAuthentication,
	checkIfAdmin,
} = require("../lib/auth");

/*
 * Route to create a new user.
 */
router.post("/", async (req, res) => {
	if (validateAgainstSchema(req.body, UserSchema)) {
		try {
			const id = await insertNewUser(req.body);
			res.status(201).send({
				id: id,
			});
		} catch (err) {
			console.error(err);
			res.status(500).send({
				error: "Error inserting user into DB.  Please try again later.",
			});
		}
	} else {
		res.status(400).send({
			error: "Request body is not a valid user object",
		});
	}
});

/*
 * Route to get a user by ID
 */
router.get("/:id", requireAuthentication, async (req, res, next) => {
	if (req.user === parseInt(req.params.id) || req.admin) {
		try {
			const user = await getUserById(parseInt(req.params.id));
			if (user) {
				delete user.password;
				res.status(200).send({ user: user });
			} else {
				next();
			}
		} catch (err) {
			console.error(err);
			res.status(500).send({
				error: "Unable to fetch user.  Please try again later.",
			});
		}
	} else {
		res.status(403).send({
			error: "Unauthorized to access the specified resource",
		});
	}
});

/*
 * Route to log in
 */

router.post("/login", async (req, res) => {
	if (req.body && req.body.email && req.body.password) {
		try {
			const user = await getUserByEmail(req.body.email);

			if (user) {
				const authenticated = await validateUser(user.id, req.body.password);

				if (authenticated) {
					const token = await generateAuthToken(user.id);
					res.status(200).send({
						token: token,
					});
				} else {
					res.status(401).send({
						error: "Invalid authentication credentials.",
					});
				}
			} else {
				res.status(401).send({
					error: "User does not exists",
				});
			}
		} catch (err) {
			console.error("  -- error:", err);
			res.status(500).send({
				error: "Error logging in.  Try again later.",
			});
		}
	} else {
		res.status(400).send({
			error: "Request body needs a user ID and password.",
		});
	}
});

module.exports = router;
