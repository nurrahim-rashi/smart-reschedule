import { AuthorizationError } from "../exceptions/index.js";

export const verifyAdmin = (credentials) => {
    if (credentials.role !== 'admin') {
        throw new AuthorizationError('Hanya admin yang boleh mengakses resource ini');
    }
};
