/** @format */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Group, User } from "../models/index.js";
import { getFilePath } from "../utils/index.js";

async function getMe(req, res) {
  return res.json(req.user);
}

async function getUsers(req, res) {
  try {
    const { _id } = req.user;
    const users = await User.find({ _id: { $ne: _id } }).select(["-password"]);

    if (!users) {
      res.status(400).json({ msg: "No se han encontardo usuarios" });
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    res.status(500).json({ msg: "Error del servidor" });
  }
}

async function getUser(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const e = new Error("usuario no valido");
    return res.status(400).json({ msg: e.message });
  }

  try {
    const response = await User.findById(id).select(["-password"]);

    if (!response) {
      res.status(400).json({ msg: "No se ha encontrado el usuario" });
    } else {
      res.status(200).json(response);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error del servidor" });
  }
}

async function updateUser(req, res) {
  const { _id } = req.user;
  const userData = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    const e = new Error("usuario no valido");
    return res.status(400).json({ msg: e.message });
  }

  if (req.files.avatar) {
    const imagePath = getFilePath(req.files.avatar);
    userData.avatar = imagePath;
  }

  User.findByIdAndUpdate({ _id }, userData, (error) => {
    if (error) {
      res.status(400).json({ msg: "Error al actualizar el usuario" });
    } else {
      res.status(200).json(userData);
    }
  });
}

async function getUsersExeptParticipantsGroup(req, res) {
  const { group_id } = req.params;

  const group = await Group.findById(group_id);
  const participantsStrings = group.participants.toString();
  const participants = participantsStrings.split(",");

  const response = await User.find({ _id: { $nin: participants } }).select([
    "-password",
  ]);

  if (!response) {
    res.status(400).json({ msg: "No se ha encontrado ningun usuario" });
  } else {
    res.status(200).json(response);
  }
}

export const UserController = {
  getMe,
  getUsers,
  getUser,
  updateUser,
  getUsersExeptParticipantsGroup,
};
