import express, { text } from "express";
import ClassessController from "./controllers/ClassesController";
import ConnectionsController from "./controllers/ConnectionsController";

const routes = express.Router();
const classesControllers = new ClassessController();
const connectionsControllers = new ConnectionsController();

routes.post("/classes", classesControllers.create);
routes.get("/classes", classesControllers.index);
routes.post("/connections", connectionsControllers.create);
routes.get("/connections", connectionsControllers.index);

export default routes;
