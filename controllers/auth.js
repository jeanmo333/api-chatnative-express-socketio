/** @format */

import bscrypt from "bcryptjs";
import { User } from "../models/index.js";
import { jwt } from "../utils/index.js";

async function register(req, res) {
  const { email, password } = req.body;

  const emailToSave = email.toLowerCase();

  const existUser = await User.findOne({ email: emailToSave });
  if (existUser) {
    const e = new Error("Usurio ya existe");
    return res.status(400).json({ msg: e.message });
  }

  const user = new User({
    email: emailToSave,
  });

  const salt = bscrypt.genSaltSync(10);
  const hashPassword = bscrypt.hashSync(password, salt);
  user.password = hashPassword;

  user.save((error, userStorage) => {
    if (error) {
      console.log(error);
      res.status(400).json({ msg: "Error al registrar el usuario" });
    } else {
      res.status(201).json(userStorage);
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const emailLowerCase = email.toLowerCase();

  const existUser = await User.findOne({ email: emailLowerCase });
  if (!existUser) {
    const e = new Error("Contraseña o Email no valido");
    return res.status(400).json({ msg: e.message });
  }

  User.findOne({ email: emailLowerCase }, (error, userStorage) => {
    if (error) {
      res.status(500).json({ msg: "Error del servidor" });
    } else {
      bscrypt.compare(password, userStorage.password, (bcryptError, check) => {
        if (bcryptError) {
          res.status(500).json({ msg: "Error del servidor" });
        } else if (!check) {
          res.status(400).json({ msg: "Contraseña o Email no valido" });
        } else {
          res.status(200).json({
            access: jwt.createAccessToken(userStorage),
            refresh: jwt.createRefreshToken(userStorage),
          });
        }
      });
    }
  });
}

async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ msg: "Token requerido" });
  }

  const hasExpired = jwt.hasExpiredToken(refreshToken);
  if (hasExpired) {
    res.status(400).json({ msg: "Token expirado" });
  }

  const { user_id } = jwt.decoded(refreshToken);

  User.findById(user_id, (error, userStorage) => {
    if (error) {
      res.status(500).json({ msg: "Error del servidor" });
    } else {
      res.status(200).json({
        accessToken: jwt.createAccessToken(userStorage),
      });
    }
  });
}

export const AuthController = {
  register,
  login,
  refreshAccessToken,
};
