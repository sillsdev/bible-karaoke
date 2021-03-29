// import fs from 'fs';

// see https://www.npmjs.com/package/readdir-sorted
// the Buffer and Dirent return types are not included (commented) because we are not using them
declare module 'readdir-sorted' {
  function readdirSorted(
    path: string | Buffer | URL,
    options: { encoding?: string; withFileTypes?: boolean; locale?: string; numeric?: boolean }
  ): Promise<string[]>; // | Buffer[] | fs.Dirent[]>;
  export = readdirSorted;
}
