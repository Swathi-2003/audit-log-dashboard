const Log = require('../models/Log');

const ALLOWED_SORT_FIELDS = new Set([
  'timestamp', 'actor', 'action', 'severity', 'status', 'region', 'resourceType'
]);

// POST /api/logs/bulk
// Accepts { logs: [ {...}, {...} ] } - up to 10,000 records.
// Inserted in chunks with ordered:false so one bad record doesn't abort the batch.
exports.bulkUpload = async (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'Request body must include a non-empty "logs" array.' });
    }
    if (logs.length > 10000) {
      return res.status(400).json({ error: 'Maximum 10,000 records per request.' });
    }

    const CHUNK_SIZE = 1000;
    let insertedCount = 0;
    const errors = [];

    for (let i = 0; i < logs.length; i += CHUNK_SIZE) {
      const chunk = logs.slice(i, i + CHUNK_SIZE);
      try {
        const result = await Log.insertMany(chunk, { ordered: false });
        insertedCount += result.length;
      } catch (err) {
        // insertMany with ordered:false still inserts valid docs and reports failures
        if (err.insertedDocs) insertedCount += err.insertedDocs.length;
        if (err.writeErrors) {
          err.writeErrors.forEach((we) =>
            errors.push({ index: i + we.index, message: we.errmsg })
          );
        } else {
          errors.push({ chunkStart: i, message: err.message });
        }
      }
    }

    res.status(201).json({
      requested: logs.length,
      inserted: insertedCount,
      failed: logs.length - insertedCount,
      errors: errors.slice(0, 50) // cap error detail returned
    });
  } catch (err) {
    res.status(500).json({ error: 'Bulk upload failed', detail: err.message });
  }
};

// GET /api/logs
// Server-side filter, search, sort, and pagination.
exports.getLogs = async (req, res) => {
  try {
    const {
      severity, status, region, actor, action, resourceType,
      from, to, search,
      sortBy = 'timestamp', order = 'desc',
      page = 1, limit = 25
    } = req.query;

    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (region) filter.region = region;
    if (resourceType) filter.resourceType = resourceType;
    if (actor) filter.actor = actor;
    if (action) filter.action = action;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }
    if (search) {
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  filter.$or = [
    { actor: regex },
    { action: regex },
    { resource: regex },
    { ipAddress: regex }
  ];
}

    const sortField = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : 'timestamp';
    const sortDir = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum).lean(),
      Log.countDocuments(filter)
    ]);

    res.json({
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    res.status(500).json({ error: 'Query failed', detail: err.message });
  }
};

// GET /api/logs/:id
exports.getLogById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: 'Invalid id', detail: err.message });
  }
};
