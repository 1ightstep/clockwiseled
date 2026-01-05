const logger = {
    format: (level, message, context = {}) => {
        const timestamp = new Date().toISOString();
        const contextString = Object.keys(context).length
            ? ` | Context: ${JSON.stringify(context)}`
            : '';

        return `[${timestamp}] [${level.toUpperCase()}]: ${message}${contextString}`;
    },

    info: (msg, ctx) => console.log(logger.format('info', msg, ctx)),

    warn: (msg, ctx) => console.warn(logger.format('warn', msg, ctx)),

    error: (msg, ctx) => {
        console.error(logger.format('error', msg, ctx));
    }
};

module.exports = logger;