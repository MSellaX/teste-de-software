import { connection } from "../../src/configs/Database.js";

export class MontadoraFactory {
    static async create(nome, pais) {
        const [result] = await connection.execute(
            `INSERT INTO montadoras
                (nome, pais)
                VALUE
                (?,?)`,
            [nome, pais]
        )

        return {
            id: result.insertId,
            nome,
            pais
        }
    }
}