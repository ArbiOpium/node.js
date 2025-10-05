// import * as mysql2 from 'mysql2';

// const connectionData = {
//     host: 'localhost',
//     port: 3306,
//     user: 'user_231',
//     password: 'pass_231',
//     database: 'node_231',
//     charset: 'utf8mb4',
// };

// const dbpool = mysql2.createPool(connectionData).promise();

// async function main() {
//     try {
//         const [rows] = await dbpool.query("SELECT id, name, parent_id FROM categories ORDER BY parent_id, id");
//         const tree = buildTree(rows, null);
//         printTree(tree);

//     } catch (err) {
//         console.error("Ошибка:", err);
//     } finally {
//         dbpool.end();
//     }
// }

// function buildTree(items, parentId = null) {
//     return items
//         .filter(item => item.parent_id === parentId)
//         .map(item => ({
//             ...item,
//             children: buildTree(items, item.id)
//         }));
// }

// function printTree(nodes, prefix = "") {
//     for (const node of nodes) {
//         console.log(prefix + "📦 " + node.name);
//         if (node.children.length > 0) {
//             printTree(node.children, prefix + "   ");
//         }
//     }
// }
// main();

import express from "express";
import * as mysql2 from "mysql2";

const connectionData = {
  host: "localhost",
  port: 3306,
  user: "user_231",
  password: "pass_231",
  database: "node_231",
  charset: "utf8mb4",
};

const dbpool = mysql2.createPool(connectionData).promise();
const app = express();
const PORT = 3000;

// Будуємо дерево з flat-таблиці (id, name, parent_id)
function buildTree(items, parentId = null) {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      id: item.id,
      name: item.name,
      children: buildTree(items, item.id)
    }));
}

// API: повертає дерево категорій
app.get("/categories", async (req, res) => {
  try {
    const [rows] = await dbpool.query(
      "SELECT id, name, parent_id FROM categories ORDER BY parent_id, id"
    );
    const tree = buildTree(rows, null);
    res.json(tree);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Старт сервера
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

