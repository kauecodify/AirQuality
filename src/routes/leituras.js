const express = require('express');
const router = express.Router();
const leiturasController = require('../controllers/leiturasController');

// GET /api/leituras - Get all leituras
router.get('/', leiturasController.getAllLeituras);

// GET /api/leituras/paginated - Get leituras with pagination
router.get('/paginated', leiturasController.getLeiturasPaginated);

// GET /api/leituras/latest - Get latest leitura
router.get('/latest', leiturasController.getLatestLeitura);

// GET /api/leituras/stats - Get statistics
router.get('/stats', leiturasController.getLeiturasStats);

// GET /api/leituras/:id - Get leitura by ID
router.get('/:id', leiturasController.getLeituraById);

// POST /api/leituras - Create new leitura
router.post('/', leiturasController.createLeitura);

// PUT /api/leituras/:id - Update leitura
router.put('/:id', leiturasController.updateLeitura);

// DELETE /api/leituras/:id - Delete leitura
router.delete('/:id', leiturasController.deleteLeitura);

module.exports = router;
