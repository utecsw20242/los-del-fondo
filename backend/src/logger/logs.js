const winston = require("winston");
const morgan = require("morgan");
const { combine, timestamp, json } = winston.format;
// require("winston-daily-rotate-file");

/*
 The levels fror syslog
  {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}
 */

const errorFilter = winston.format((info, opts) => {
  return info.level === "error" ? info : false;
});

const infoFilter = winston.format((info, opts) => {
  return info.level === "info" ? info : false;
});

// const fileRotateTransport = new winston.transports.DailyRotateFile({
//   filename: "combined-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   maxFiles: "30d",
// });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      format: combine(errorFilter(), timestamp(), json()),
    }),
    new winston.transports.File({
      filename: "info.log",
      level: "info",
      format: combine(infoFilter(), timestamp(), json()),
    }),
    new winston.transports.File({
      filename: "combined.log",
    }),
    // fileRotateTransport,
  ],
});

const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(tokens["response-time"](req, res)),
    });
  },
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => {
        const data = JSON.parse(message);
        logger.http(`incoming-request`, data);
      },
    },
  },
);
