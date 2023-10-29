import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../../config.js";

import {createGroup, insertUserToGroup,selectGrupo,selectGroupsforUser,selectUseronGroup,deleteGroup,updateGroupData} from "../../controllers/groups/group.controllers.js"
const router = Router();


function validateToken(req, res, next) {
  const accessToken = req.headers["authorization"];
  if (!accessToken) res.status(400).json({ message: "accesso denegado" });
  jwt.verify(accessToken, SECRET, (err, user) => {
    if (err) {
      res.status(400).json({
        message: "accesso denegado",
        info: "token expiro o incorrecto",
      });
    } else {
      next();
    }
  });
}

router.post("/group",validateToken,createGroup)

router.post("/groupInsert", validateToken, insertUserToGroup)

router.get("/group", validateToken, selectGrupo)

router.get("/group", validateToken, selectGroupsforUser)

router.get("/groupUser/:id", validateToken, selectUseronGroup)

router.delete("/group", validateToken, deleteGroup)

router.patch("/group", validateToken, updateGroupData)

export default router;
