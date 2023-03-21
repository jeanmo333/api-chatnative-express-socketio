/** @format */

import mongoose from "mongoose";
import { Chat, ChatMessage, User } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

async function sendText(req, res) {
  const { chat_id, message } = req.body;
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    const e = new Error("chat no valido");
    return res.status(400).json({ msg: e.message });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    const e = new Error("usuario no valido");
    return res.status(400).json({ msg: e.message });
  }

  // const existChat = await Chat.findById(chat_id);
  // if (!existChat) {
  //   const e = new Error("chat no existe");
  //   return res.status(400).json({ msg: e.message });
  // }

  const existUser = await User.findById(_id);
  if (!existUser) {
    const e = new Error("usuario no existe");
    return res.status(400).json({ msg: e.message });
  }

  const chat_message = new ChatMessage({
    chat: chat_id,
    user: _id,
    message,
    type: "TEXT",
  });

  chat_message.save(async (error) => {
    if (error) {
      res.status(400).json({ msg: "Error al enviar el mensaje" });
    } else {
      const data = await chat_message.populate("user");
      io.sockets.in(chat_id).emit("message", data);
      io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);
      res.status(201).json({});
    }
  });
}

async function sendImage(req, res) {
  const { chat_id } = req.body;
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    const e = new Error("chat no valido");
    return res.status(400).json({ msg: e.message });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    const e = new Error("usuario no valido");
    return res.status(400).json({ msg: e.message });
  }

  // const existChat = await Chat.findById(chat_id);
  // if (!existChat) {
  //   const e = new Error("chat no existe");
  //   return res.status(400).json({ msg: e.message });
  // }

  const existUser = await User.findById(_id);
  if (!existUser) {
    const e = new Error("usuario no existe");
    return res.status(400).json({ msg: e.message });
  }

  const chat_message = new ChatMessage({
    chat: chat_id,
    user: _id,
    message: getFilePath(req.files.image),
    type: "IMAGE",
  });

  chat_message.save(async (error) => {
    if (error) {
      res.status(400).json({ msg: "Error al enviar el mensaje" });
    } else {
      const data = await chat_message.populate("user");
      io.sockets.in(chat_id).emit("message", data);
      io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);
      res.status(201).json({});
    }
  });
}

async function getAll(req, res) {
  const { chat_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    const e = new Error("chat no valido");
    return res.status(400).json({ msg: e.message });
  }

  // const existChat = await Chat.findById(chat_id);
  // if (!existChat) {
  //   const e = new Error("chat no existe");
  //   return res.status(400).json({ msg: e.message });
  // }

  try {
    const messages = await ChatMessage.find({ chat: chat_id })
      .sort({
        createdAt: 1,
      })
      .populate("user");

    const total = await ChatMessage.find({ chat: chat_id }).count();

    res.status(200).send({ messages, total });
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

async function getTotalMessages(req, res) {
  const { chat_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    const e = new Error("chat no valido");
    return res.status(400).json({ msg: e.message });
  }

  //const existChat = await Chat.findById(chat_id);
  // if (!existChat) {
  //   const e = new Error("chat no existe");
  //   return res.status(400).json({ msg: e.message });
  // }

  try {
    const response = await ChatMessage.find({ chat: chat_id }).count();
    res.status(200).send(JSON.stringify(response));
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

async function getLastMessage(req, res) {
  const { chat_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    const e = new Error("chat no valido");
    return res.status(400).json({ msg: e.message });
  }

  //const existChat = await Chat.findById(chat_id);
  // if (!existChat) {
  //   const e = new Error("chat no existe");
  //   return res.status(400).json({ msg: e.message });
  // }

  try {
    const response = await ChatMessage.findOne({ chat: chat_id }).sort({
      createdAt: -1,
    });
    res.status(200).send(response || {});
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

export const ChatMessageController = {
  sendText,
  sendImage,
  getAll,
  getTotalMessages,
  getLastMessage,
};
