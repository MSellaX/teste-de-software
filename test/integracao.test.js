import app from '../src/app.js'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MontadoraFactory } from './factories/MontadoraFactory.js'
import { clearDatabase } from './utils/clearDatabase.js'

describe('API de montadoras', () => {
    let montadora

    beforeEach(async () => {
        montadora = await MontadoraFactory.create('Toyota', 'Japão')

        vi.clearAllMocks()
    })

    afterEach(async () => {
        await clearDatabase()

        vi.resetAllMocks()
    })

    it("deve criar uma montadora com sucesso.", async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: 'Hyundai',
                pais: 'Coreia do Sul'
            })

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('insertId')
    })

    it("NÃO deve cadastrar uma montadora sem nome.", async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: '',
                pais: 'Coreia do Sul'
            })

        expect(response.status).toBe(400)
    })

    it("deve atualizar uma montadora com sucesso.", async () => {
        const criar = await request(app)
            .post('/montadoras')
            .send({
                nome: 'Toyota',
                pais: 'Japão'
            })

        const id = criar.body.data.insertId

        console.log("ID da montadora:", id)

        const response = await request(app)
            .put(`/montadoras?id=${id}`)
            .send({
                nome: 'Honda',
                pais: 'Japão'
            })

        expect(response.status).toBe(200)
        expect(response.body.data).toHaveProperty('affectedRows')
    })

    it("deve criar um cliente com sucesso.", async () => {
        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                cpf: '12345678900',
                cep: '01001000',
                numero: '123',
                complemento: 'Apto 10'
            })

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('insertId')
    })

    it("NÃO deve cadastrar um cliente com CEP inválido.", async () => {
        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                cpf: '12345678900',
                cep: '131801',
                numero: '123',
                complemento: 'Apto 10'
            })

        expect(response.status).toBe(400)
    })

    it("deve cadastrar um cliente com CEP válido.", async () => {
        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                cpf: '12345678900',
                cep: '13180100',
                numero: '123',
                complemento: 'Apto 10'
            })

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('insertId')
    })

    it("deve cadastrar um veículo com sucesso.", async () => {
        const cliente = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                cpf: '12345678900',
                cep: '13180100',
                numero: '123',
                complemento: 'Apto 10'
            })

        const idCliente = cliente.body.data.insertId
        const idMontadora = montadora.id

        const response = await request(app)
            .post('/veiculos')
            .send({
                idCliente: idCliente,
                idMontadora: idMontadora,
                modelo: 'Civic',
                placa: 'ABC1D23',
                ano: 2024,
                cor: 'Preto',
                valor: 120000
            })

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('insertId')
    })

    it("Não deve cadastrar um veiculo pois o ano é invalido.", async () => {
        const cliente = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                cpf: '12345678900',
                cep: '13180100',
                numero: '123',
                complemento: 'Apto 10'
            })

        const idCliente = cliente.body.data.insertId
        const idMontadora = montadora.id

        const response = await request(app)
            .post('/veiculos')
            .send({
                idCliente: idCliente,
                idMontadora: idMontadora,
                modelo: 'Civic',
                placa: 'ABC1D23',
                ano: 20240,
                cor: 'Preto',
                valor: 120000
            })

        expect(response.status).toBe(500);
    })

    it("deve atualizar um veículo com sucesso.", async () => {
        const cliente = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                cpf: '12345678900',
                cep: '13180100',
                numero: '123',
                complemento: 'Apto 10'
            });

        const idCliente = cliente.body.data.insertId;
        const idMontadora = montadora.id;

        const criar = await request(app)
            .post('/veiculos')
            .send({
                idCliente: idCliente,
                idMontadora: idMontadora,
                modelo: 'Civic',
                placa: 'ABC1D23',
                ano: 2024,
                cor: 'Preto',
                valor: 120000
            });

        expect(criar.status).toBe(201);

        const id = criar.body.data.insertId;

        console.log("ID do veículo:", id);

        const response = await request(app)
            .put(`/veiculos?id=${id}`)
            .send({
                idCliente: idCliente,
                idMontadora: idMontadora,
                modelo: 'Lancer',
                placa: 'ABC1D24',
                ano: 2024,
                cor: 'Preto',
                valor: 120000
            });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('affectedRows');
    })

    it("deve deletar um veículo com sucesso.", async () => {
        const cliente = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                cpf: '12345678900',
                cep: '13180100',
                numero: '123',
                complemento: 'Apto 10'
            });

        const idCliente = cliente.body.data.insertId;
        const idMontadora = montadora.id;

        const criar = await request(app)
            .post('/veiculos')
            .send({
                idCliente,
                idMontadora,
                modelo: 'Civic',
                placa: 'ABC1D23',
                ano: 2024,
                cor: 'Preto',
                valor: 120000
            });

        expect(criar.status).toBe(201);

        const idVeiculo = criar.body.data.insertId;

        const response = await request(app)
            .delete(`/veiculos/${idVeiculo}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('affectedRows');
        expect(response.body.data.affectedRows).toBe(1);
    })

    it("deve listar os veículos com sucesso.", async () => {
        const response = await request(app)
            .get('/veiculos');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("deve listar os clientes com sucesso.", async () => {
        const response = await request(app)
            .get('/clientes');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("deve listar as montadoras com sucesso.", async () => {
        const response = await request(app)
            .get('/montadoras');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
    });
})