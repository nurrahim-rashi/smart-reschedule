import UsersRepository from "../users/repository.js";
import TokenManager from "../../security/token-manager.js";
import { validateLoginPayload } from "./validator.js";
import { AuthenticationError } from "../../exceptions/index.js";

export const postAuthenticationHandler = async (request, h) => {
    const { email, password } = validateLoginPayload(request.payload);

    const user = await UsersRepository.verifyUserCredential(email, password);
    if (!user) {
        throw new AuthenticationError('Email atau password salah');
    }

    const accessToken = TokenManager.generateAccessToken({
        id: user.id,
        role: user.role
    });

    return h.response({
        status: 'success',
        message: 'Login berhasil',
        data: { accessToken },
    }).code(200);
};