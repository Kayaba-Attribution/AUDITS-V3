import { createLogger, format, transports } from 'winston';

import { writeFile } from 'fs/promises';

writeFile('combined.log', '')
  .then(() => console.log('Log file cleared'))
  .catch(err => console.error('Error clearing log file:', err));

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ],
});

export default logger;
