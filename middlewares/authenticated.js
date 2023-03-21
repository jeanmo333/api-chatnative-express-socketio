/** @format */

import { User } from "../models/user.js";
import { jwt } from "../utils/index.js";

async function asureAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ msg: "Hace falta el token" });
  }

  const token = req.headers.authorization.replace("Bearer ", "");
  try {
    const hasExpired = jwt.hasExpiredToken(token);

    if (hasExpired) {
      return res.status(400).json({ msg: "El token ha expirado" });
    }

    const payload = jwt.decoded(token);
    const user = await User.findById(payload.user_id).select("-password");

    if (!user) {
      const error = new Error("No autorizado");
      return res.status(403).json({ msg: error.message });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(400).json({ msg: "Token invalido" });
  }
}

export const mdAuth = {
  asureAuth,
};
