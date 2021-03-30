import { join } from 'path';
import fs from 'fs-extra';
import { format as dateFormat } from 'date-fns';
import winston from 'winston';
import os from 'os';

export function prepareLogger(numLogsToKeep = 10, pathToLogDir = ''): winston.Logger {
  // make sure the logging directory exists
  const homedir = os.homedir();
  if (pathToLogDir == '') {
    switch (process.platform) {
      case 'darwin':
        pathToLogDir = join(homedir, 'Library', 'Logs', 'bible-karaoke');
        break;

      case 'win32':
        pathToLogDir = join(homedir, 'AppData', 'Roaming', 'bible-karaoke', 'logs');
        break;

      default:
        pathToLogDir = join(homedir, '.config', 'bible-karaoke', 'logs');
        break;
    }
  }
  fs.mkdirsSync(pathToLogDir);

  // remove log files that are > numLogsToKeep
  const entries = fs.readdirSync(pathToLogDir);
  while (entries && entries.length > numLogsToKeep) {
    const fileToRemove = entries.shift();
    if (fileToRemove != undefined) {
      const pathToFile = join(pathToLogDir, fileToRemove);
      fs.rmSync(pathToFile);
    } else {
      break;
    }
  }

  // now create a Logger with a new log file:
  const name = `${dateFormat(new Date(), 'yyyyMMdd_HHmmss')}.log`;
  const pathLogFile = join(pathToLogDir, name);

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [new winston.transports.File({ filename: pathLogFile })],
  });
  logger.info('Logger Initialized');

  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      })
    );
  }

  return logger;
}
