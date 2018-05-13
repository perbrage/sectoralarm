class SectorAlarmError extends Error {
    constructor(code, message, innerError) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.code = code;
        this.message = message;
        this.innerError = innerError;
    }

    toJson() {
        var output = {
            "code": this.code,
            "message": this.message,
            "stack": this.stack
        };

        if (this.innerError != undefined) {
            output.originalError = {
                "code": this.innerError.code,
                "message": this.innerError.message,
                "stack": this.innerError.stack
            }
        }

        return output;
    }

    
}
module.exports = SectorAlarmError;