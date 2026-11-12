import Joi from "joi";
import { InvariantError } from "../../exceptions/index.js";

const requestPayloadSchema = Joi.object({
    bookingId: Joi.number().integer().positive().required(),
    requestedSlotId: Joi.number().integer().positive().required(),
    message: Joi.string().trim().max(1000).required(),
});

const reviewPayloadSchema = Joi.object({
    adminNote: Joi.string().trim().max(1000).allow(''),
});

const requestQuerySchema = Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected'),
});

const validate = (schema, payload) => {
    const { error, value } = schema.validate(payload ?? {});

    if (error) {
        throw new InvariantError(error.message);
    }

    return value;
};

export const validateRequestPayload = (payload) => validate(requestPayloadSchema, payload);
export const validateReviewPayload = (payload) => validate(reviewPayloadSchema, payload);
export const validateRequestQuery = (query) => validate(requestQuerySchema, query);
