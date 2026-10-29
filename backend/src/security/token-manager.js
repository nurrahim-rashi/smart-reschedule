import Jwt from "@hapi/jwt";

const TokenManager = {
    generateAccessToken: (payload) =>
        Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
};

export default TokenManager;