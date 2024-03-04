import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";


let LastReceivedMessage : string | null= null;
let LastSentMessage: string | null =null;

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // TODO implement the status route
  _user.get("/status", (req, res) => {
    res.status(200).send("live")
  });

  _user.get("/getLastReceivedMessage", (req,res)=>{
    res.json({result: LastReceivedMessage})
  });

  _user.get("/getLastSentMessage", (req,res)=>{
    res.json({result: LastSentMessage})
  });



  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
