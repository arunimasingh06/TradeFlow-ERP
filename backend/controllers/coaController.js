const CoA = require('../models/CoA');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// GET /api/master/coa
exports.listAccounts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const type = req.query.type; // Asset | Liability | Expense | Income | Equity
    const isActive = req.query.isActive === 'false' ? false : true; // default true

    let filter = {};
    if (type) {
      filter.type = type;   // e.g. "Asset"
    }
    filter.isActive = isActive; // true/false

    if (q) {
      filter.$or = [
        { accountName: new RegExp(q, 'i') },  // i = case insensitive, Cash, cash same
        { description: new RegExp(q, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      CoA.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CoA.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};

// GET /api/master/coa/:id
exports.getAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/coa
exports.createAccount = async (req, res, next) => {
  try {
    const doc = await CoA.create(req.body);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/coa/:id
exports.updateAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/coa/:id/archive
exports.archiveAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findByIdAndUpdate(
      req.params.id,
      { isActive: false, archivedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/coa/:id/unarchive
exports.unarchiveAccount = async (req, res, next) => {
  try {
    const doc = await CoA.findByIdAndUpdate(
      req.params.id,
      { isActive: true, archivedAt: null },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Account not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};
