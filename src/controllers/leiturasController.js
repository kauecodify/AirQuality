const Leitura = require('../models/Leitura');

// Get all leituras
const getAllLeituras = async (req, res) => {
  try {
    const leituras = await Leitura.find().sort({ dataHora: -1 });
    res.status(200).json({
      success: true,
      count: leituras.length,
      data: leituras
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leituras',
      message: error.message
    });
  }
};

// Get leituras with pagination
const getLeiturasPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const leituras = await Leitura.find()
      .sort({ dataHora: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Leitura.countDocuments();

    res.status(200).json({
      success: true,
      data: leituras,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leituras paginadas',
      message: error.message
    });
  }
};

// Get latest leitura
const getLatestLeitura = async (req, res) => {
  try {
    const latest = await Leitura.findOne().sort({ dataHora: -1 });
    
    if (!latest) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma leitura encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: latest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar a última leitura',
      message: error.message
    });
  }
};

// Create new leitura
const createLeitura = async (req, res) => {
  try {
    const { co2, umidade, temperatura, localizacao } = req.body;

    // Validate required fields
    if (!co2 || !umidade || !temperatura) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios ausentes',
        missingFields: []
      });
    }

    // Create new leitura
    const newLeitura = new Leitura({
      co2,
      umidade,
      temperatura,
      localizacao: localizacao || { type: 'Point', coordinates: [0, 0] }
    });

    // Save to database
    const savedLeitura = await newLeitura.save();

    res.status(201).json({
      success: true,
      message: 'Leitura criada com sucesso',
      data: savedLeitura
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        validationErrors: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao criar leitura',
      message: error.message
    });
  }
};

// Get leitura by ID
const getLeituraById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    const leitura = await Leitura.findById(id);

    if (!leitura) {
      return res.status(404).json({
        success: false,
        error: 'Leitura não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: leitura
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leitura',
      message: error.message
    });
  }
};

// Update leitura
const updateLeitura = async (req, res) => {
  try {
    const { id } = req.params;
    const { co2, umidade, temperatura } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    const updatedLeitura = await Leitura.findByIdAndUpdate(
      id,
      { co2, umidade, temperatura },
      { new: true, runValidators: true }
    );

    if (!updatedLeitura) {
      return res.status(404).json({
        success: false,
        error: 'Leitura não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leitura atualizada com sucesso',
      data: updatedLeitura
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        validationErrors: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar leitura',
      message: error.message
    });
  }
};

// Delete leitura
const deleteLeitura = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    const deletedLeitura = await Leitura.findByIdAndDelete(id);

    if (!deletedLeitura) {
      return res.status(404).json({
        success: false,
        error: 'Leitura não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leitura deletada com sucesso',
      data: deletedLeitura
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar leitura',
      message: error.message
    });
  }
};

// Get statistics
const getLeiturasStats = async (req, res) => {
  try {
    const stats = await Leitura.aggregate([
      {
        $group: {
          _id: null,
          avgCO2: { $avg: '$co2' },
          maxCO2: { $max: '$co2' },
          minCO2: { $min: '$co2' },
          avgUmidade: { $avg: '$umidade' },
          maxUmidade: { $max: '$umidade' },
          minUmidade: { $min: '$umidade' },
          avgTemperatura: { $avg: '$temperatura' },
          maxTemperatura: { $max: '$temperatura' },
          minTemperatura: { $min: '$temperatura' },
          count: { $sum: 1 }
        }
      }
    ]);

    const latest = await Leitura.findOne().sort({ dataHora: -1 });

    res.status(200).json({
      success: true,
      data: {
        statistics: stats[0] || {},
        latest: latest || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao calcular estatísticas',
      message: error.message
    });
  }
};

module.exports = {
  getAllLeituras,
  getLeiturasPaginated,
  getLatestLeitura,
  createLeitura,
  getLeituraById,
  updateLeitura,
  deleteLeitura,
  getLeiturasStats
};
