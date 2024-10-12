import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { IUserPayload } from "../@types/userType";
import { userJoin, userLeave } from "../utils/userSockets";

const io = new Server({
  cors: {
    origin: ["http://localhost:3000", String(process.env.CLIENT_URL)],
    credentials: true,
  },
});

const getUserOrNull = (socket: Socket): IUserPayload | null => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in the environment");
  }

  const token = socket.request.headers.cookie?.split(";")[0].split("=")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as IUserPayload;

      return decoded;
    } catch (err) {}
  }

  return null;
};

io.on("connect", (socket) => {
  const user = getUserOrNull(socket);

  if (user) {
    userJoin({ id: user.id as unknown as string, socket });
  }
});

io.on("disconnect", (socket) => {
  const user = getUserOrNull(socket);

  if (user) {
    userLeave(user.id as unknown as string);
  }
});

export { io };
