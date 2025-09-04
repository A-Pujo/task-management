import mysql from "mysql2/promise";

export const dbConfig = {
  host: "localhost",
  user: "root",
  password: "12345678",
  port: 3306,
  database: "pdpsipa_tasks",
};

export async function getDbConnection() {
  return mysql.createConnection(dbConfig);
}

export async function setupDatabase() {
  const conn = await getDbConnection();
  // Create database if not exists
  await conn.query(`CREATE DATABASE IF NOT EXISTS pdpsipa_tasks`);
  await conn.query(`USE pdpsipa_tasks`);
  // Create tasks table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      inputDate DATE NOT NULL,
      deadline DATE NOT NULL,
      status VARCHAR(32) NOT NULL,
      description TEXT
    )
  `);
  // Create logs table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      taskId INT NOT NULL,
      date DATETIME NOT NULL,
      message TEXT NOT NULL,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);
  await conn.end();
}
