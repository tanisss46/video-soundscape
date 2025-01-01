type LogLevel = 'info' | 'warn' | 'error' | 'success';

export enum DownloadError {
  FETCH_FAILED = 'FETCH_FAILED',
  BLOB_CREATION_FAILED = 'BLOB_CREATION_FAILED',
  DOWNLOAD_TRIGGER_FAILED = 'DOWNLOAD_TRIGGER_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_URL = 'INVALID_URL',
}

class DownloadLogger {
  private static log(level: LogLevel, message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, error);
        break;
      case 'warn':
        console.warn(logMessage, error);
        break;
      case 'success':
        console.log('%c' + logMessage, 'color: green');
        break;
      default:
        console.log(logMessage);
    }
  }

  static info(message: string) {
    this.log('info', message);
  }

  static error(message: string, error: any) {
    this.log('error', message, error);
  }

  static success(message: string) {
    this.log('success', message);
  }

  static warn(message: string) {
    this.log('warn', message);
  }
}

export default DownloadLogger;