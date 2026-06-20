const mongoose = require('mongoose');

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['Resolved', 'Unresolved'];

const logSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true, index: true },
    role: { type: String },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    resourceType: { type: String, index: true },
    ipAddress: { type: String },
    region: { type: String, index: true },
    severity: { type: String, enum: SEVERITIES, index: true },
    status: { type: String, enum: STATUSES, index: true },
    timestamp: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

// Text index powers the free-text "search" box (actor, action, resource, ip)
logSchema.index({ actor: 'text', action: 'text', resource: 'text', ipAddress: 'text' });

// Common compound query pattern: filter by status+severity then sort by time
logSchema.index({ status: 1, severity: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);
module.exports.SEVERITIES = SEVERITIES;
module.exports.STATUSES = STATUSES;
