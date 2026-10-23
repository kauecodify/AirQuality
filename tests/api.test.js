/**
 * AirQuality Monitor - API Tests
 * Tests for the Express API endpoints using Jest and Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Leitura = require('../src/models/Leitura');

// Test database connection
let testDb;

beforeAll(async () => {
  // Use in-memory MongoDB for testing
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  testDb = mongoUri;
});

// Clear database before each test
beforeEach(async () => {
  await Leitura.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('AirQuality Monitor API', () => {
  describe('GET /api/leituras', () => {
    it('should return status 200 and an array of leituras', async () => {
      // Create test data
      const testLeitura = new Leitura({
        co2: 400,
        umidade: 65,
        temperatura: 25
      });
      await testLeitura.save();

      const response = await request(app)
        .get('/api/leituras')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].co2).toBe(400);
      expect(response.body.data[0].umidade).toBe(65);
      expect(response.body.data[0].temperatura).toBe(25);
    });

    it('should return empty array when no leituras exist', async () => {
      const response = await request(app)
        .get('/api/leituras')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return leituras sorted by date descending', async () => {
      // Create multiple test readings with different timestamps
      const now = new Date();
      
      const leitura1 = new Leitura({
        co2: 300,
        umidade: 50,
        temperatura: 20,
        dataHora: new Date(now.getTime() - 3600000) // 1 hour ago
      });
      
      const leitura2 = new Leitura({
        co2: 500,
        umidade: 70,
        temperatura: 28,
        dataHora: new Date(now.getTime() - 7200000) // 2 hours ago
      });
      
      const leitura3 = new Leitura({
        co2: 400,
        umidade: 60,
        temperatura: 22,
        dataHora: now
      });

      await Promise.all([leitura1.save(), leitura2.save(), leitura3.save()]);

      const response = await request(app)
        .get('/api/leituras')
        .expect(200);

      expect(response.body.data.length).toBe(3);
      // Most recent should be first
      expect(response.body.data[0].co2).toBe(400);
      expect(response.body.data[1].co2).toBe(300);
      expect(response.body.data[2].co2).toBe(500);
    });
  });

  describe('GET /api/leituras/latest', () => {
    it('should return the latest leitura', async () => {
      const now = new Date();
      
      const oldLeitura = new Leitura({
        co2: 300,
        umidade: 50,
        temperatura: 20,
        dataHora: new Date(now.getTime() - 3600000)
      });
      
      const latestLeitura = new Leitura({
        co2: 500,
        umidade: 70,
        temperatura: 28,
        dataHora: now
      });

      await Promise.all([oldLeitura.save(), latestLeitura.save()]);

      const response = await request(app)
        .get('/api/leituras/latest')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.co2).toBe(500);
    });

    it('should return 404 when no leituras exist', async () => {
      const response = await request(app)
        .get('/api/leituras/latest')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Nenhuma leitura encontrada');
    });
  });

  describe('GET /api/leituras/stats', () => {
    it('should return statistics for all leituras', async () => {
      const leitura1 = new Leitura({
        co2: 300,
        umidade: 50,
        temperatura: 20
      });
      
      const leitura2 = new Leitura({
        co2: 500,
        umidade: 70,
        temperatura: 28
      });
      
      const leitura3 = new Leitura({
        co2: 400,
        umidade: 60,
        temperatura: 22
      });

      await Promise.all([leitura1.save(), leitura2.save(), leitura3.save()]);

      const response = await request(app)
        .get('/api/leituras/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toBeDefined();
      expect(response.body.data.statistics.avgCO2).toBeCloseTo(400, 0);
      expect(response.body.data.statistics.maxCO2).toBe(500);
      expect(response.body.data.statistics.minCO2).toBe(300);
    });
  });

  describe('GET /api/leituras/:id', () => {
    it('should return a specific leitura by ID', async () => {
      const testLeitura = new Leitura({
        co2: 400,
        umidade: 65,
        temperatura: 25
      });
      await testLeitura.save();

      const response = await request(app)
        .get(`/api/leituras/${testLeitura._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testLeitura._id.toString());
      expect(response.body.data.co2).toBe(400);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/leituras/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Leitura não encontrada');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/leituras/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ID inválido');
    });
  });

  describe('POST /api/leituras', () => {
    it('should create a new leitura with valid data', async () => {
      const newLeitura = {
        co2: 450,
        umidade: 60,
        temperatura: 22
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(newLeitura)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.co2).toBe(450);
      expect(response.body.data.umidade).toBe(60);
      expect(response.body.data.temperatura).toBe(22);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.dataHora).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidLeitura = {
        co2: 450
        // Missing umidade and temperatura
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(invalidLeitura)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid CO2 value (negative)', async () => {
      const invalidLeitura = {
        co2: -100,
        umidade: 60,
        temperatura: 22
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(invalidLeitura)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should return 400 for invalid CO2 value (too high)', async () => {
      const invalidLeitura = {
        co2: 6000,
        umidade: 60,
        temperatura: 22
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(invalidLeitura)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should return 400 for invalid umidade value (negative)', async () => {
      const invalidLeitura = {
        co2: 400,
        umidade: -10,
        temperatura: 22
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(invalidLeitura)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should return 400 for invalid umidade value (greater than 100)', async () => {
      const invalidLeitura = {
        co2: 400,
        umidade: 150,
        temperatura: 22
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(invalidLeitura)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should return 400 for invalid temperatura value (too low)', async () => {
      const invalidLeitura = {
        co2: 400,
        umidade: 60,
        temperatura: -100
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(invalidLeitura)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should return 400 for invalid temperatura value (too high)', async () => {
      const invalidLeitura = {
        co2: 400,
        umidade: 60,
        temperatura: 150
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(invalidLeitura)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should create leitura with location data', async () => {
      const newLeitura = {
        co2: 450,
        umidade: 60,
        temperatura: 22,
        localizacao: {
          type: 'Point',
          coordinates: [-46.6333, -23.5505]
        }
      };

      const response = await request(app)
        .post('/api/leituras')
        .send(newLeitura)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.localizacao).toBeDefined();
      expect(response.body.data.localizacao.type).toBe('Point');
      expect(response.body.data.localizacao.coordinates).toEqual([-46.6333, -23.5505]);
    });
  });

  describe('PUT /api/leituras/:id', () => {
    it('should update an existing leitura', async () => {
      const testLeitura = new Leitura({
        co2: 400,
        umidade: 65,
        temperatura: 25
      });
      await testLeitura.save();

      const updatedData = {
        co2: 500,
        umidade: 70,
        temperatura: 28
      };

      const response = await request(app)
        .put(`/api/leituras/${testLeitura._id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.co2).toBe(500);
      expect(response.body.data.umidade).toBe(70);
      expect(response.body.data.temperatura).toBe(28);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updatedData = {
        co2: 500,
        umidade: 70,
        temperatura: 28
      };

      const response = await request(app)
        .put(`/api/leituras/${fakeId}`)
        .send(updatedData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Leitura não encontrada');
    });

    it('should return 400 for invalid ID', async () => {
      const updatedData = {
        co2: 500,
        umidade: 70,
        temperatura: 28
      };

      const response = await request(app)
        .put('/api/leituras/invalid-id')
        .send(updatedData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ID inválido');
    });

    it('should return 400 for invalid data on update', async () => {
      const testLeitura = new Leitura({
        co2: 400,
        umidade: 65,
        temperatura: 25
      });
      await testLeitura.save();

      const invalidData = {
        co2: 6000,
        umidade: 70,
        temperatura: 28
      };

      const response = await request(app)
        .put(`/api/leituras/${testLeitura._id}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });
  });

  describe('DELETE /api/leituras/:id', () => {
    it('should delete an existing leitura', async () => {
      const testLeitura = new Leitura({
        co2: 400,
        umidade: 65,
        temperatura: 25
      });
      await testLeitura.save();

      const response = await request(app)
        .delete(`/api/leituras/${testLeitura._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leitura deletada com sucesso');

      // Verify it was deleted
      const deletedLeitura = await Leitura.findById(testLeitura._id);
      expect(deletedLeitura).toBeNull();
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/leituras/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Leitura não encontrada');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .delete('/api/leituras/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ID inválido');
    });
  });

  describe('GET /api/leituras/paginated', () => {
    it('should return paginated results', async () => {
      // Create 15 test readings
      for (let i = 0; i < 15; i++) {
        await new Leitura({
          co2: 400 + i * 10,
          umidade: 50 + i,
          temperatura: 20 + i
        }).save();
      }

      const response = await request(app)
        .get('/api/leituras/paginated?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.total).toBe(15);
      expect(response.body.pagination.totalPages).toBe(3);
    });

    it('should return second page of results', async () => {
      // Create 15 test readings
      for (let i = 0; i < 15; i++) {
        await new Leitura({
          co2: 400 + i * 10,
          umidade: 50 + i,
          temperatura: 20 + i
        }).save();
      }

      const response = await request(app)
        .get('/api/leituras/paginated?page=2&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(5);
      expect(response.body.pagination.page).toBe(2);
    });
  });
});

// Test for main routes
describe('Main Routes', () => {
  it('should serve the index.html file on root route', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.text).toContain('<!DOCTYPE html>');
    expect(response.text).toContain('AirQuality Monitor');
  });

  it('should serve static files from public directory', async () => {
    const response = await request(app)
      .get('/style.css')
      .expect(200);

    expect(response.text).toContain('/* ===== CSS Variables ===== */');
  });
});
