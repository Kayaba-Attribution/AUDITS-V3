// > Implement the ConfigurationManager:

// Develop functionality to read and parse configuration files (JSON, YAML, etc.).

// Include options for different aspects of the report (e.g., verbosity, sections to include) and analysis parameters.

import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

export default config;