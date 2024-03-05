import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

let nodeRegistry: Node[] = [];

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};



export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  _registry.get("/status", (req, res) => {
    res.status(200).send("live")
  });

  

  
 _registry.post("/registerNode", async (req: Request<{}, {}, RegisterNodeBody>, res: Response) => {
   const newNode: Node = {
    nodeId: req.body.nodeId,
    pubKey: req.body.pubKey,
    };
  const existingNode = nodeRegistry.find(node => node.nodeId === req.body.nodeId);
    if (existingNode) {
      res.status(400).json({ error: "Node already registered" });
    }
    else{
 
  nodeRegistry.push(newNode);


  res.status(201).json({ message: "Node registered successfully", node: newNode });
    }
  });

  

  _registry.get("/getNodeRegistry", (req, res) => {
  res.json({ nodes: nodeRegistry });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
