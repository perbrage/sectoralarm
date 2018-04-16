
class SectorAlarmError extends Error {
    constructor(code, message, innerError) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.code = code;
        this.message = message;
        this.innerError = innerError;
    }
}
module.exports = SectorAlarmError;