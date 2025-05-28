const Role = require("../models/Role.model");
exports.createInstanceRole = async (req, res) => {
  const roles = [{ name: "admin" }, { name: "artist" }, { name: "user" }];
  for (let r of roles) {
    await Role.updateOne({ name: r.name }, r, { upsert: true });
  }
};
