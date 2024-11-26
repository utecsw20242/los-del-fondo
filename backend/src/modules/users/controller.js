const table = "users";
const { Project } = require("../../DB/mongodb");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "secretkey";
const logger = require("../../utils/logger");

module.exports = function (db) {
  return {
    allUsers: () => {
      logger.info({ function: "users/allUsers", step: "Start" });
      db.allUsers(table);
      logger.info({ function: "users/allUsers", step: "End" });
    },
    oneUser: (id) => {
      logger.info({ function: "users/oneUsers", step: "Start" });
      logger.info({ id: id });
      db.oneUser(table, id);
      logger.info({ function: "users/oneUsers", step: "End" });
    },
    removeUser: (body) => {
      logger.info({ function: "users/oneUsers", step: "Start" });
      logger.info({ id: body.id });
      db.removeUser(table, body.id);
      logger.info({ function: "users/oneUsers", step: "End" });
    },
    addUser: async (body) => {
      logger.info({ function: "users/addUser", step: "Start" });
      const saltRounds = 10;
      if (body.password) {
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);
        body.password = hashedPassword;
      }
      body.id = uuidv4();
      try {
        const newUserResponse = await db.addUser(table, body);
        const newUser = newUserResponse.user;
        console.log("New User: ", newUser);
        if (!newUser) {
          const message = "Error creating user";
          logger.error({
            message: message,
          });
          throw new Error(message);
        }
        const mainProject = new Project({
          userId: newUser.id,
          name: "Main Project",
          status: "default",
        });
        await mainProject.save();
        const token = jwt.sign(
          { id: newUser.id, username: newUser.username },
          SECRET_KEY,
          { expiresIn: "1h" },
        );

        logger.info({ function: "users/addUsers", step: "End" });

        const { password, ...userWithoutPassword } = newUser;
        return { token, user: userWithoutPassword };
      } catch (err) {
        const message = "Error creating user or project";
        logger.error({
          message: message,
        });
        console.log("Error Creating user or project:", err);
        throw new Error(message);
      }
    },
    loginUser: async (body) => {
      logger.info({ function: "users/loginUser", step: "Start" });

      const user = await db.findUserByEmail(body.email);
      if (!user) {
        const message = "User not found";
        logger.error({
          message: message,
        });
        throw new Error(message);
      }
      const match = await bcrypt.compare(body.password.trim(), user.password);
      if (!match) {
        const message = "Invalid password";
        logger.error({
          message: message,
        });
        throw new Error(message);
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" },
      );

      logger.info({ function: "users/loginUser", step: "End" });

      const { password, ...userWithoutPassword } = user;
      return { token, user: userWithoutPassword };
    },
    findUserByEmail: (email) => db.findUserByEmail(email),
  };
};
