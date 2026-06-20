const express = require('express');
const router = express.Router();
const { bulkUpload, getLogs, getLogById } = require('../controllers/logController');

router.post('/bulk', bulkUpload);
router.get('/', getLogs);
router.get('/:id', getLogById);

module.exports = router;
