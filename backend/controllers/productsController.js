const Product = require('../models/Product');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// GET /api/master/products
exports.listProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const type = req.query.type; // Goods | Service
    const isActive = req.query.isActive === 'false' ? false : true; // default true

    const filter = { ...(type ? { type } : {}), isActive };
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') },
        { hsnCode: new RegExp(q, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};

// GET /api/master/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/products
exports.createProduct = async (req, res, next) => {
  try {
    const doc = await Product.create(req.body);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const doc = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/products/:id/archive
exports.archiveProduct = async (req, res, next) => {
  try {
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, archivedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/products/:id/unarchive
exports.unarchiveProduct = async (req, res, next) => {
  try {
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true, archivedAt: null },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};
