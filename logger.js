import Logger from 'node-json-logger';
import fs from 'fs';
import { config as configDotenv } from "dotenv";
configDotenv();
let logger;

if (process.env.test === 'Testenv') {
    logger = new Logger();
} else {
    const filePath = process.env.LOG_FILE_PATH || '/var/log/myapp.log'; // '/var/log/myapp.log';
    const logStream = fs.createWriteStream(filePath, { flags: 'a' });
    logger = new Logger({ stream: logStream });

    // Redirecting stdout and stderr to logStream
    process.stdout.write = logStream.write.bind(logStream);
    process.stderr.write = logStream.write.bind(logStream);
}


export default logger;
