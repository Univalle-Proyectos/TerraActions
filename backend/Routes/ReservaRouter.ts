import { Router } from "express";
import { ReservaController } from "../Controllers/ReservaController";

const reservaRouter = Router();

reservaRouter.get("/", ReservaController.getReservas); 
reservaRouter.get("/catalogo/disponibles", ReservaController.getLibroStockDisponibles); 
reservaRouter.post("/directa", ReservaController.crearReservaDirecta); 


export default reservaRouter;