import fs from 'fs';
import solc from 'solc';

const tokenSrc = fs.readFileSync('./contracts/DaveyTestToken.sol', 'utf8');
const stakingSrc = fs.readFileSync('./contracts/Staking.sol', 'utf8');

// I need to resolve openzeppelin somehow...
// Wait, compiling with openzeppelin via raw solc is hard because of the import paths.
// I will just download the openzeppelin contracts or use the bundled ones in node_modules!
