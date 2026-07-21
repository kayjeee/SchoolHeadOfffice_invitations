interface LogOptions {
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log({ level, component, message, data }: LogOptions) {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toISOString();
    const styles = {
      info: 'color: blue; font-weight: bold;',
      warn: 'color: orange; font-weight: bold;',
      error: 'color: red; font-weight: bold;',
      debug: 'color: gray; font-weight: bold;'
    };

    console[level](
      `%c[${timestamp}] ${component}: ${message}`,
      styles[level],
      data || ''
    );
  }

  info(component: string, message: string, data?: any) {
    this.log({ level: 'info', component, message, data });
  }

  warn(component: string, message: string, data?: any) {
    this.log({ level: 'warn', component, message, data });
  }

  error(component: string, message: string, data?: any) {
    this.log({ level: 'error', component, message, data });
  }

  debug(component: string, message: string, data?: any) {
    this.log({ level: 'debug', component, message, data });
  }
}

export const logger = new Logger();