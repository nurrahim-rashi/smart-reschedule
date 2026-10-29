import Joi from "joi";
import { InvariantError } from "../../exceptions/index.js";

const userPayloadSchema = Joi.object({
    name: Joi.string().max(100).required(),
    email: Joi.string().email().max(255).required(),
    phone: Joi.string().max(20),
    password: Joi.string().min(6).required(),
});

export const validateUserPayload = (payload) => {
    const { error, value } = userPayloadSchema.validate(payload ?? {});

    if (error) {
        throw new InvariantError(error.message);
    }

    return value;
};