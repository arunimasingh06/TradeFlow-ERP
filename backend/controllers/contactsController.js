const Contact = require('../models/Customer');

// Helpers
function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// GET /api/master/contacts
exports.listContacts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const type = req.query.type;
    const isActive = req.query.isActive === 'false' ? false : true; // default active

    const filter = { ...(type ? { type } : {}), isActive };
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { mobile: new RegExp(q, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};

// GET /api/master/contacts/:id
exports.getContact = async (req, res, next) => {
  try {
    const doc = await Contact.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// POST /api/master/contacts
exports.createContact = async (req, res, next) => {
  try {
    const doc = await Contact.create(req.body);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/master/contacts/:id
exports.updateContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/contacts/:id/archive
exports.archiveContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: false, archivedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PATCH /api/master/contacts/:id/unarchive
exports.unarchiveContact = async (req, res, next) => {
  try {
    const doc = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: true, archivedAt: null },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};
