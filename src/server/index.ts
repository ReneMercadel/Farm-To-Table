/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Express, Request, Response } from "express";

//import { postEvent } from "./routes/EventRoutes";

//console.log(postEvent);
import dotenv from "dotenv";
const path = require("path");
require("./db/database.ts");
import Events from "./db/models/Events";
import {
  Farms,
  Roles,
  // Events,
  Orders,
  DeliveryZones,
  Products,
  RSVP,
  Subscriptions,
  Users,
  Vendors,
} from "./db/models";
console.log(
  Farms,
  Roles,
  Events,
  Orders,
  DeliveryZones,
  Products,
  RSVP,
  Subscriptions,
  Users,
  Vendors
);

dotenv.config();

const app: Express = express();
const port = process.env.LOCAL_PORT;

const dist = path.resolve(__dirname, "..", "..", "dist");
console.log("LINE 37 || INDEX.TSX", __dirname);

app.use(express.json());
app.use(express.static(dist));
app.use(express.urlencoded({ extended: true }));

// NEED TO FIGURE OUT HOW TO GET INDEX.HTML TO POPULATE IN THE DIST FOLDER SO WE CAN SERVE IT FROM HERE
// THE INDEX.HTML HARDCODED IN DIST FOLDER BY CAITY'S GROUP. MIGHT BE WORTH TRYING IF HTMLWEBPACKPLUGIN DOESN'T WORKasdf

//Events resquests
app.post("/event", (req: Request, res: Response) => {
  const { eventName, description, thumbnail, category } = req.body.event;
  console.log("Request Object postEvent", req);
  console.log(
    "55 Request object postEvent",
    eventName,
    description,
    thumbnail,
    category
  );
  Events.create({
    eventName,
    description,
    thumbnail,
    category,
  })
    .then((data: object) => {
      console.log("Return Events Route || Post Request", data);
      res.status(201);
    })
    .catch(
      (err: string) => console.error("Post Request Failed", err),
      res.sendStatus(500)
    );
});

// KEEP AT BOTTOM OF GET REQUESTS
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.resolve(dist, "index.html"));
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
