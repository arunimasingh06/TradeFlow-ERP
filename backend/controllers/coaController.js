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

// POST /api/master/coa/seed-defaults
// Creates default accounts if they don't exist: Sales Income (Income), Purchase Expense (Expense), Other Expense (Expense)
exports.seedDefaults = async (req, res, next) => {
  try {
    const defaults = [
      { accountName: 'Sales Income A/c', type: 'Income', description: 'Default sales revenue account', isActive: true },
      { accountName: 'Purchase Expense A/c', type: 'Expense', description: 'Default purchase expense account', isActive: true },
      { accountName: 'Other Expense A/c', type: 'Expense', description: 'Default miscellaneous expense account', isActive: true },
    ];
    const results = [];
    for (const def of defaults) {
      const existing = await CoA.findOne({ accountName: def.accountName });
      if (existing) {
        if (!existing.isActive) {
          existing.isActive = true;
          existing.archivedAt = null;
          await existing.save();
        }
        results.push({ accountName: def.accountName, status: 'exists', id: existing._id });
      } else {
        const created = await CoA.create(def);
        results.push({ accountName: def.accountName, status: 'created', id: created._id });
      }
    }
    res.status(201).json({ success: true, results });
  } catch (err) { next(err); }
};

// GET /api/master/coa/health
// Returns whether minimal required accounts exist and are active and some stats
exports.health = async (req, res, next) => {
  try {
    const activeIncome = await CoA.findOne({ type: 'Income', isActive: true }).lean();
    const activeExpense = await CoA.findOne({ type: 'Expense', isActive: true }).lean();
    const salesIncome = await CoA.findOne({ accountName: /Sales Income/i, isActive: true }).lean();
    const purchaseExpense = await CoA.findOne({ accountName: /Purchase Expense/i, isActive: true }).lean();

    const byType = await CoA.aggregate([
      { $group: { _id: { type: '$type', isActive: '$isActive' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      requirements: {
        hasActiveIncome: !!activeIncome,
        hasActiveExpense: !!activeExpense,
        hasSalesIncomeAccount: !!salesIncome,
        hasPurchaseExpenseAccount: !!purchaseExpense,
      },
      stats: byType.map(r => ({ type: r._id.type, isActive: r._id.isActive, count: r.count })),
    });
  } catch (err) { next(err); }
};
