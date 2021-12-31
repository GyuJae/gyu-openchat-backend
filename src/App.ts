import express from "express";
import { Server } from "socket.io";
import {
  BYE_ROOM,
  CHATTING,
  NICKNAME,
  ROOMNAME,
  WHO_COME_ROOM,
} from "./socket.constants";

class App {
  public app: express.Application;

  public port: number;

  public server: any;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.router();
  }

  private router(): void {
    this.app.get("/", (req: express.Request, res: express.Response) => {
      res.send("hello").status(200);
    });
  }

  public listen() {
    this.server = this.app.listen(this.port, () => {
      console.log(`App listening on the port http://localhost:${this.port}`);
    });
    const io = new Server(this.server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });
    io.on("connection", (socket) => {
      socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit(BYE_ROOM));
      });
      socket.on(NICKNAME, (nickname, done) => {
        done();
      });
      socket.on(
        ROOMNAME,
        (
          { roomName, nickname }: { roomName: string; nickname: string },
          done
        ) => {
          socket.join(roomName);
          socket.to(roomName).emit(WHO_COME_ROOM, nickname);
          done();
        }
      );
      socket.on(
        CHATTING,
        (
          {
            payload,
            nickname,
            roomName,
          }: {
            payload: string;
            nickname: string;
            roomName: string;
          },
          done
        ) => {
          done();
          socket.to(roomName).emit(CHATTING, { payload, nickname });
        }
      );
    });
  }
}

export default App;
