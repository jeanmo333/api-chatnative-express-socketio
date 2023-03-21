/** @format */

import mongoose from "mongoose";
import { server } from "./app.js";
import { IP_SERVER, PORT, DB_USER, DB_PASSWORD, DB_HOST } from "./constants.js";
import { io } from "./utils/index.js";

const mongoDbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/`;
const mongoDbLocal = "mongodb://localhost:27017/chatAppAugustin";

mongoose.set("strictQuery", true);
mongoose.connect(mongoDbLocal, (error) => {
  if (error) throw error;

  // const app = express();
  // const server = http.createServer(app);
  // initSocketServer(server);

  // // Configure Body Parser
  // app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(bodyParser.json());

  // // Configure static folder
  // app.use(express.static("uploads"));

  // // Configure Header HTTP - CORS
  // app.use(cors());

  // // Configure logger HTTP request
  // app.use(morgan("dev"));

  // // Configure routings
  // app.use("/api", authRoutes);
  // app.use("/api", userRoutes);
  // app.use("/api", chatRoutes);
  // app.use("/api", chatMessageRoutes);
  // app.use("/api", groupRoutes);
  // app.use("/api", groupMessageRoutes);

  server.listen(PORT, () => {
    console.log("######################");
    console.log("###### API REST ######");
    console.log("######################");
    console.log(`http://${IP_SERVER}:${PORT}/api`);

    io.sockets.on("connection", (socket) => {
      console.log("NUEVO USUARIO CONECTADO");

      socket.on("disconnect", () => {
        console.log("USUARIO DESCONECTADO");
      });

      socket.on("subscribe", (room) => {
        socket.join(room);
      });

      socket.on("unsubscribe", (room) => {
        socket.leave(room);
      });
    });
  });
});

// export { server };
