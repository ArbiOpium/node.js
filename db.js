import * as mysql2 from 'mysql2';

const connectionData = {
    host: 'localhost',
    port: 3306,
    user: 'user_231',
    password: 'pass_231',
    database: 'node_231',
    charset: 'utf8mb4',
};

const dbpool = mysql2.createPool(connectionData).promise();

async function main() {
    try {
        // Получаем все категории
        const [rows] = await dbpool.query("SELECT id, name, parent_id FROM categories ORDER BY parent_id, id");

        // Строим дерево
        const tree = buildTree(rows, null);

        // Печатаем дерево
        printTree(tree);

    } catch (err) {
        console.error("Ошибка:", err);
    } finally {
        dbpool.end();
    }
}

// 🔹 Построение дерева из списка
function buildTree(items, parentId = null) {
    return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
            ...item,
            children: buildTree(items, item.id)
        }));
}

// 🔹 Красивый вывод в консоль
function printTree(nodes, prefix = "") {
    for (const node of nodes) {
        console.log(prefix + "📦 " + node.name);
        if (node.children.length > 0) {
            printTree(node.children, prefix + "   ");
        }
    }
}

main();
