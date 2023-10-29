import { pool } from "../../db.js";

async function adminComprobation(group, req) {
  const existeValor = req.session.AdminG.some(
    (grupo) => req.session.AdminG === group
  );
  if (existeValor) {
    return true;
  } else {
    return false;
  }
}

export const selectProyect = async (req, res) => {
  try {
    const [proyect] = await pool.query(
      "select * from Proyectos where GrupoId = ?",
      [req.params.Id]
    );
    req.session.ProyectId = proyect.Id;
    res.status(200).json({ proyect });
  } catch {
    console.error("Error al consultar el proyecto", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const createProyect = async (req, res) => {
  try {
    const { NombreProyecto, DescripcionProyecto } = req.body;
    const { Id } = req.params;
    if (adminComprobation(Id, req)) {
      await pool.query("insert into proyectos values(Null, '?', '?' , '?')", [
        NombreProyecto,
        DescripcionProyecto,
        Id,
      ]);
      res.status(200).json({
        message: "grupo creado correctamente",
      });
    } else {
      res.status(400).json({
        message: "no eres administrador",
      });
    }
  } catch (error) {
    console.error("Error al agregar el proyecto", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const deleteProyect = async (req, res) => {
  try {
    const { Id } = req.params;
    if (adminComprobation(Id, req)) {
      await pool.query("delete from proyectos where Id = ?"[Id]);
      res.status(200).json({
        message: "grupo eliminado correctamente",
      });
    } else {
      res.status(400).json({
        message: "no eres administrador",
      });
    }
  } catch (error) {
    console.error("Error al eliminar el proyecto", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const editProyect = async (req, res) => {
  try {
    const { Id } = req.params;
    const { NombreProyecto, DescripcionProyecto } = req.body;
    if (adminComprobation(Id, req)) {
      await pool.query(
        "UPDATE proyectos SET NombreDelProyecto = ?, DescripcionDelProyecto = ? WHERE ProyectoId = ?;"[
          (NombreProyecto, DescripcionProyecto, Id)
        ]
      );
      res.status(200).json({
        message: "Proyecto actualizado correctamente",
      });
    } else {
      res.status(400).json({
        message: "no eres administrador",
      });
    }
  } catch (error) {
    console.error("Error al actualizar el proyecto", error);
    res.status(500).send("Error interno del servidor");
  }
};
//agregar usuarios al proyecto (solo admin)
export const insertUserInGroup = async (req, res) => {
  try {
    const Id = req.params;
    if (adminComprobation(Id, req.session.Id)) {
      const { correo, proyect } = req.body;
      const [proySelect] = await pool.query(
        "select * from Proyectos where NombreDelProyecto = ? AND GrupoId = ? ",
        [proyect, Id]
      );
      const [existingUser] = await pool.query(
        "Select * from Usuarios where Correo = ?",
        [correo]
      );
      const [result] = await pool.query(
        "select * from usuariosgrupso where UsuarioId = ? AND GrupoID = ?",
        [Id, existingUser.Id]
      );
      if (result.length > 0) {
        await pool.query(
          "insert into proyectogrupousuarios values(null, ?, ?, ?)",
          [proySelect.Id, Id, existingUser.Id]
        );
        res.status(200).json({ message: "usuario insertado" });
      } else {
        res.status(400).json({ error: "el usuario no esta dentro del grupo" });
      }
    } else {
      res.status(200).json({ error: "no administrador" });
    }
  } catch (error) {
    console.error("Error al insertar usuario a el proyecto", error);
    res.status(500).send("Error interno del servidor");
  }
};
//eliminar usuarios del proyecto (solo dmin o eliminarse si mismo/saalir proyecto)

export const delateUsuario = async (req, res) => {
  const Id = req.params;
  const userId = req.session.Id;
  
};
