import UsersRepository from "./repository.js";
import { validateUserPayload } from "./validator.js";
import { InvariantError } from "../../exceptions/index.js";

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