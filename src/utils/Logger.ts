export class Logger {
  static error(message: string, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }

  static warn(message: string, ...optionalParams: any[]) {
    console.warn(message, ...optionalParams);
  }

  static info(message: string, ...optionalParams: any[]) {
    console.info(message, ...optionalParams);
  }

  static debug(message: string, ...optionalParams: any[]) {
    console.debug(message, ...optionalParams);
  }
}
