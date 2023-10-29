import { response } from "express";
import { pool } from "../../db.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET } from "../../config.js";

//methods to not loged user

export const createUser = async (req, res) => {
  console.log(req.body);
  if (req.session.loggedin != true) {
    try {
      const { nombre, correo, contraseña } = req.body;
      const [existingUser] = await pool.query(
        "select * from usuarios where Correo = ?",
        [correo]
      );
      console.log(correo);
      if (existingUser.length > 0) {
        return res.status(400).json({
          error: "el usuario ya existe",
        });
      }
      const contraseñaHash = await bcrypt.hash(contraseña, 12); // Usa async/await para obtener el hash
      console.log(contraseñaHash); // Esto imprimirá el hash correctamente
      const [rows] = await pool.query(
        "INSERT INTO usuarios VALUES (null,?,?,?)",
        [correo, nombre, contraseñaHash]
      );

      res.send({
        id: rows.insertId,
        nombre,
        correo,
        contraseña: contraseñaHash,
      });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).send("Error interno del servidor");
    }
  } else {
    res.status(400).json({
      message: "ya tienes una sesion iniciada",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    const [existingUser] = await pool.query(
      "SELECT * FROM usuarios WHERE Correo = ?",
      [correo]
    );
    
    console.log(existingUser[0]);
    if (existingUser.length > 0) {
      const isMatch = await bcrypt.compare(
        contraseña,
        existingUser[0].Contraseña
      );
      if (!isMatch) {
        return res.status(400).json({
          error: "Contraseña incorrecta",
        });
      } else {

        req.session.loggedin = true;
        req.session.Id = existingUser[0].Id;
        req.session.name = existingUser[0].Nombre;
        
        const resp = await pool.query("select GrupoId from administradores where UsuarioId = ?", [req.session.Id])
        const adminGroups = resp[0][0]

        req.session.AdminG = adminGroups;

        const user = {
          Id: existingUser[0].Id,
          nombre: existingUser[0].Nombre,
          correo: existingUser[0].Correo,
          adminGroups
        };

        const { accessToken } = generateTokens(user);
  
        res.header("authorization", accessToken).status(200).json({
          message: "Inicio de sesión exitoso",
          user,
          accessToken,
        });
      }
    } else {
      return res.status(400).json({
        error: "El usuario no existe",
      });
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send("Error interno del servidor");
  }
};

function generateTokens(user) {
  const accessToken = jwt.sign({ user }, SECRET); // Cambia ACCESS_SECRET por tu clave secreta para los tokens de acceso
  return { accessToken };
}

//methods to loged users

export const logout = (req, res) => {
  req.session.loggedin = false;
  const tokenDeAcceso = req.headers.authorization;
  res.status(200).json({
    message: "cerrado correctamente",
  });
};

export const getUsers = async (req, res) => {
  const [result] = await pool.query("select * from usuarios");

  // Extrae solo los datos de los usuarios del primer elemento del array de resultados
  const usersData = result;

  res.json(usersData);
};

export const getUser = async (req, res, next) => {
  console.log(req.params.id);
  const [rows] = await pool.query("select * from usuarios where id = ?", [
    req.params.id,
  ]);
  if (rows.length <= 0)
    return res.status(404).json({
      message: "Usuario no encontrado",
    });
  res.json(rows[0]);
};

export const deleteUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("delete from usuarios where id = ?", [
      id,
    ]);

    if (result.affectedRows <= 0) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, contraseña } = req.body;

    const [result] = await pool.query(
      "UPDATE Usuarios SET nombre = ?, correo = ?, , contraseña = ? WHERE id = ?",
      [nombre, correo, contraseña, id]
    );

    if (result.affectedRows <= 0) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).send("Error interno del servidor");
  }
};
