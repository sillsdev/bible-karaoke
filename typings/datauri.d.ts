declare module 'datauri' {
  class DataURI {
    constructor();
    static promise(fileName: string): Promise<void>;
    static sync(fileName: string): string;
  }

  export = DataURI;
}
