import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../../config.js";
import {
  getUsers,
  updateUser,
  getUser,
  deleteUsers,
  logout,
  loginUser,
  createUser
} from "../../controllers/user/user.controllers.js";
const router = Router();

router.post("/login", loginUser)

router.post("/register", createUser);


function validateToken(req, res, next) {
  const accessToken = req.headers["authorization"];

  if (!accessToken) {
    return res.status(401).json({
      message: "Acceso denegado",
      info: "Token de acceso no proporcionado",
    });
  }

  jwt.verify(accessToken, SECRET, (accessTokenError, user) => {
    if (accessTokenError) {
      return res.status(401).json({
        message: "Acceso denegado",
        info: "Token de acceso inválido o expirado",
      });
    } else {
      // El token de acceso es válido, sigue adelante
      next();
    }
  });
}

router.get("/", validateToken, getUsers);

router.get("/:id",validateToken, getUser);

router.post("/logout",validateToken ,logout);

router.patch("/:id", validateToken,updateUser);

router.delete("/:id",validateToken, deleteUsers);

export default router;
