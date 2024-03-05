import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT,BASE_ONION_ROUTER_PORT  } from "../config";
import {GetNodeRegistryBody, Node} from "@/src/registry/registry";

import {createRandomSymmetricKey,symEncrypt,rsaEncrypt,exportSymKey} from "../crypto";

export interface NodeRegistry {
  nodes: Node[];
}
let LastReceivedMessage : string | null= null;
let LastSentMessage: string | null =null;
let LastCircuit: Node[] = [];

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());


  _user.get("/status", (req, res) => {
    res.status(200).send("live")
  });


  _user.post("/message", (req, res) => {
    const message = req.body.message;

    LastReceivedMessage = message;

    console.log(`The received message is : ${message}`);
    res.status(200).send("success");
  });



  _user.get("/getLastReceivedMessage", (req,res)=>{
    res.json({result: LastReceivedMessage})
  });

  _user.get("/getLastSentMessage", (req,res)=>{
    res.json({result: LastSentMessage})
  });
  _user.get("/getLastCircuit", (req, res) => {
    res.status(200).json({result: LastCircuit.map((node) => node.nodeId)});
  });




  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
