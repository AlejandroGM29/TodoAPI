import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import user from "./routes/user/users.route.js";
import groupRoutes from "./routes/groups/group.routes.js";
import session from "express-session";
import { SECRET, SECRETR } from "./config.js";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "12x341|x", // Cambia esto a una cadena segura y secreta
    resave: false,
    saveUninitialized: true,
  })
);

async function adminComprobation(group, req) {
  await req.session.adminG; // Espera a que req.session.adminG esté disponible
  if (req.session.adminG && req.session.adminG.includes(group)) {
    return true;
  } else {
    return false;
  }
}

app.get("/", async (req,res) =>{
  const [proyect] = await pool.query(
    "select * from Proyectos where GrupoId = ?",
    [6]
  );
  console.log(proyect[0].Id)
  res.json(proyect)
})



app.use("/users", user);

app.use("/group", groupRoutes);



app.use((req, res, next) => {
  res.status(404).json({
    message: "endpoint not found",
  });
});

app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(err.status || 500); // Establecemos el código de estado HTTP del error
  //res.status(502).send("hubo un error en el servidor: " + err.message)
  res.json({
    error: {
      message: err.message, // Enviamos el mensaje de error al cliente
    },
  });
});

export default app;
