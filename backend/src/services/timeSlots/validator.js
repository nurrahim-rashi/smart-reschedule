import Joi from "joi";
import { InvariantError } from "../../exceptions/index.js";

const recommendationQuerySchema = Joi.object({
    day: Joi.string().trim().lowercase().max(20).empty(''),
    period: Joi.string().trim().lowercase().valid('pagi', 'siang', 'sore', 'malam').empty(''),
    time: Joi.string().trim().max(20).empty(''),
    excludeSlotId: Joi.number().integer().positive(),
});

export const validateRecommendationQuery = (query) => {
    const { error, value } = recommendationQuerySchema.validate(query ?? {});

    if (error) {
        throw new InvariantError(error.message);
    }

    return value;
};
