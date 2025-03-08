// logger 위치가 왜 여기인가: .logs 폴더가 하나만 만들어지도록 하다보니
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = `../../.logs`;
const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

function setTransport(level: string) {
  return new DailyRotateFile({
    level: level,
    datePattern: 'YYYY-MM-DD',
    dirname: logDir,
    filename: `%DATE%.${level}.log`,
    maxFiles: '30',
    maxSize: '20m',
    zippedArchive: true,
  });
}

export const logger = winston.createLogger({
  format: combine(
    label({
      label: 'STARTER',
    }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat
  ),
  transports: [setTransport('info'), setTransport('error'), setTransport('debug')],
  handleExceptions: true,
  exceptionHandlers: [setTransport('exception')],
});

logger.add(
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  })
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
process.on('unhandledRejection', (reason, promise) => {
  throw reason;
});
