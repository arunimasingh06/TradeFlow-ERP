const Tax = require('../models/Tax');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// GET /api/master/taxes
exports.listTaxes = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const applicableOn = req.query.applicableOn; // Sales | Purchase | Both
    const isActive = req.query.isActive === 'false' ? false : true; // default true

    const filter = { ...(applicableOn ? { applicableOn } : {}), isActive };
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      Tax.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Tax.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};

// GET /api/master/taxes/:id
exports.getTax = async (req, res, next) => {
  try {
    const doc = await Tax.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/taxes
exports.createTax = async (req, res, next) => {
  try {
    const doc = await Tax.create(req.body);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/taxes/:id
exports.updateTax = async (req, res, next) => {
  try {
    const doc = await Tax.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/taxes/:id/archive
exports.archiveTax = async (req, res, next) => {
  try {
    const doc = await Tax.findByIdAndUpdate(
      req.params.id,
      { isActive: false, archivedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/taxes/:id/unarchive
exports.unarchiveTax = async (req, res, next) => {
  try {
    const doc = await Tax.findByIdAndUpdate(
      req.params.id,
      { isActive: true, archivedAt: null },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Tax not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};
