import Joi from "joi";
import { InvariantError } from "../../exceptions/index.js";

const bookingPayloadSchema = Joi.object({
    slotId: Joi.number().integer().positive().required(),
});

const bookingParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const validateBookingPayload = (payload) => {
    const { error, value } = bookingPayloadSchema.validate(payload ?? {});

    if (error) {
        throw new InvariantError(error.message);
    }

    return value;
};

export const validateBookingParams = (params) => {
    const { error, value } = bookingParamsSchema.validate(params ?? {});

    if (error) {
        throw new InvariantError(error.message);
    }

    return value;
};
