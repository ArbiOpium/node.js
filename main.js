import * as fs from 'node:fs/promises';

const filename = "config.ini";

fs.access(filename)
    .then(() => {
        console.log("File exists");

        fs.open(filename, 'r')
            .then(async file => {
                const config = {};

                for await (let line of file.readLines()) {
                    line = line.trim();
                    if (!line || !line.includes('=')) {
                        continue;
                    }

                    const [key, value] = line.split('=');
                    if (key && value !== undefined) {
                        config[key.trim()] = value.trim();
                    }
                }

                await file.close();

                console.log("JS object:", config);
            })
            .catch(err => {
                console.log("Error reading file:", err.message);
            });
    })
    .catch(async () => {
        console.log("File does not exist");
        let file = await fs.open(filename, 'w');
        await file.close();
    });