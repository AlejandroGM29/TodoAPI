import { pool } from "../../db.js";
import randomstring from "randomstring";

async function insertAdminintoGroup(user, group) {
  const [admins] = await pool.query(
    "insert into administradores values (null, ?,?)",
    [user, group]
  );
  return admins;
}

async function isnertUserGroup(user, group) {
  const [rows] = await pool.query(
    "insert into usuariosgrupos values(null, ?, ?)",
    [user, group]
  );
  return rows;
}

async function adminComprobation(group,req) {
  const existeValor = req.session.AdminG.some((grupo) => req.session.AdminG === group);
  if (existeValor) {
    return true;
  } else {
    return false;
  }
}

export const createGroup = async (req, res) => {
  try {
    const { nombre, Descripcion } = req.body;
    while (true) {
      var code = randomstring.generate({
        length: 15,
      });
      const [existingGroup] = await pool.query(
        "select * from grupos where codigo = ?",
        [code]
      );
      if (existingGroup.length === 0) {
        break;
      }
    }
    const [rows] = await pool.query(
      "insert into grupos values(null, ?, ?, ?)",
      [nombre, Descripcion, code]
    );

    const [users] = isnertUserGroup([req.session.Id, rows.insertId]);
    const [admins] = insertAdminintoGroup(req.session.Id, rows.insertId);
    res.send({
      id: rows.insertId,
      nombre,
      codigo: code,
      users,
      admins,
    });
    const [update] = await pool.query("select GrupoId from administradores where UsuarioId = ?", [req.session.Id])
    const adminGroups = update[0][0]
    req.session.AdminG = adminGroups;

  } catch (error) {
    console.error("Error al crear el grupo:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const selectGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const [group] = await pool.query("select * from grupo where id = ?", [id]);
    req.session.groupId = group.Id
    res.status(200).json({
      group,
    });
  } catch (error) {
    console.error("Error al consultar la info del grupo:", error);
    res.status(400).json({
      message: "Error al consultar la info del grupo",
      error,
    });
  }
};

export const insertUserToGroup = async (req, res) => {
  try {
    const { Correo, codigo } = req.body;
    const [user] = await pool.query("select * from usuarios where Correo = ?", [
      Correo,
    ]);
    const [grupo] = await pool.query("select * from grupos where Codigo = ?", [
      codigo,
    ]);
    if (adminComprobation(grupo[0].Id,req) === true) {
      const [userExist] = await pool.query(
        "select * from usuariosgrupos where UsuarioId = ? AND GrupoId = ?",
        [user[0].Id, req.session.groupId]
      );
      if (userExist.length > 0) {
        console.error("Error al agregar el usuario a el grupo:", error);
        res.status(400).json({
          message: "Error al agregar usuario al grupo, usuario ya existente",
        });
      } else {
        const [rows] = isnertUserGroup(user[0].Id, grupo[0].Id);
        res.send({
          id: rows.insertId,
          Usuario: user[0].Correo,
          Grupo: grupo[0].codigo,
        });
      }
    } else {
      console.error("Error al agregar el usuario a el grupo:", error);
      res.status(400).json({
        message:
          "Error al agregar usuario al grupo, el usuario cliente no es administrador del grupo",
      });
    }
  } catch (error) {
    console.error("Error al agregar el usuario a el grupo:", error);
    res.status(500).send("Error interno del servidor");
  }
  //falta agregar que los usuarios no se puedan repetir, que valide que el usuario es administrador y que haga un try en caso de algun error
};

export const selectGroupsforUser = async (req, res) => {
  try {
    const [admin] = await pool.query(
      "SELECT g.Id, g.NombreDelGrupo, g.Descripcion FROM Grupos g JOIN Administradores a ON g.Id = a.GrupoId WHERE a.UsuarioId = ?;",
      [req.session.Id]
    );
    const [noAdmin] = await pool.query(
      "SELECT g.Id, g.NombreDelGrupo, g.Descripcion FROM Grupos g JOIN UsuariosGrupos ug ON g.Id = ug.GrupoId WHERE ug.UsuarioId = 27 AND g.Id NOT IN (SELECT GrupoId FROM Administradores WHERE UsuarioId = 27);",
      [req.session.Id]
    );
    res.status(200).json({
      adminGroups: admin,
      Groups: noAdmin,
    });
  } catch (error) {
    console.error(
      "Error al agregar el consultar los grupos del usuario:",
      error
    );
    res.status(400).json({
      message: "Error al consultar los grupos del usuario",
    });
  }
};

export const selectUseronGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const [admin] = await pool.query(
      "SELECT u.Id, u.Nombre, u.Correo FROM Usuarios u JOIN Administradores a ON u.Id = a.UsuarioId WHERE a.GrupoId = ?;",
      [id]
    );
    const [noAdmin] = await pool.query(
      "SELECT u.Id, u.Nombre, u.Correo FROM Usuarios u JOIN UsuariosGrupos ug ON u.Id = ug.UsuarioId WHERE ug.GrupoId = ? AND u.Id NOT IN (SELECT UsuarioId FROM Administradores WHERE GrupoId = ?)",
      [id, id]
    );
    res.status(200).json({
      admin: admin,
      users: noAdmin,
    });
  } catch (error) {
    console.error("Error al consultar los usuarios del grupo:", error);
    res.status(400).json({
      message: "Error al consultar los usuarios del grupo",
    });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (adminComprobation(grupo[0].Id,req) === true) {
      const [result] = await pool.query("CALL deleteGroup(?);", [id]);
      res.status(200).json({
        message: "grupo eliminado con sus datos",
        result,
      });
    } else {
      res.status(400).json({
        message: "no eres administrador",
      });
    }
  } catch (error) {
    console.error("Error al consultar los usuarios del grupo:", error);
    res.status(500).json({
      message: "Error del lado del servidor",
      error,
    });
  }
};

export const updateGroupData = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Descripcion } = req.body;
    if (adminComprobation(grupo[0].Id,req) === true) {
      const [result] = await pool.query(
        "UPDATE Grupos SET NombreDelGrupo = ?, Descripcion = ? WHERE Id = ?;",
        [Nombre, Descripcion, id]
      );
    } else {
      console.error("Error, no eres admin");
      res.status(400).json({
        message: "no eres administrador",
      });
    }
  } catch (error) {
    console.error("Error al consultar los usuarios del grupo:", error);
    res.status(500).json({
      message: "Error del lado del servidor",
      error,
    });
  }
};

//agregar que un usuario sea administrador
