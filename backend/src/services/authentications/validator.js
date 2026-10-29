import Joi from "joi";
import { InvariantError } from "../../exceptions/index.js";

const loginPayloadSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const validateLoginPayload = (payload) => {
    const { error, value } = loginPayloadSchema.validate(payload ?? {});

    if (error) {
        throw new InvariantError(error.message);
    }

    return value;
};