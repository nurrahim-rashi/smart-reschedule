import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;

class UsersRepository {
    constructor() {
        this.pool = new Pool();
    }

    async verifyNewEmail(email) {
        const query = {
            text: 'SELECT id FROM users WHERE email = $1',
            values: [email],
        };

        const result = await this.pool.query(query);
        return result.rows.length > 0;
    }

    async addUser({ name, email, phone, password }) {
        const passwordHash = await bcrypt.hash(password, 10);

        const query =  {
            text: 'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
            values: [name, email, phone, passwordHash],
        };

        const result = await this.pool.query(query);
        return result.rows[0].id;
    }
}

export default new UsersRepository();