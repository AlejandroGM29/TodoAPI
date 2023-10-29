import { config } from "dotenv";
config()

export const SECRET = process.env.SECRET || '123axzs'
export const SECRETR = process.env.SECRETR || 'XDALEKEYXD12S'
export const PORT = process.env.PORT || 3000
export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_Port = process.env.DB_Port || '3308*'
export const DB_USER = process.env.DB_USER || 'root'
export const DB_Password = process.env.DB_Password || 'Sobrecarga2*'
export const DB_Database = process.env.DB_Database || 'bdtodo'
