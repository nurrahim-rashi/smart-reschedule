import UsersRepository from "./repository.js";
import { validateUserPayload } from "./validator.js";
import { InvariantError, NotFoundError } from "../../exceptions/index.js";

export const postUserHandler = async (request, h) => {
    const { name, email, phone, password } = validateUserPayload(request.payload);

    const isEmailUsed = await UsersRepository.verifyNewEmail(email);
    if (isEmailUsed) {
        throw new InvariantError('Email sudah digunakan');
    }

    const userId = await UsersRepository.addUser({ name, email, phone, password });

    return h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: { userId },
    }).code(201);
};

export const getMeHandler = async (request) => {
    const { id } = request.auth.credentials;

    const user = await UsersRepository.getUserById(id);
    if (!user) {
        throw new NotFoundError('User tidak ditemukan');
    }

    return {
        status: 'success',
        data: { user },
    };
};