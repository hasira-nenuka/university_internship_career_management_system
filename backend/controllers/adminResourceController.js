const Company = require('../models/companyModel');
const Internship = require('../models/internshipModel');
const Payment = require('../models/paymentModel');

const createCrudHandlers = (Model, entityName) => ({
  list: async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const item = await Model.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!item) {
        return res.status(404).json({ success: false, message: `${entityName} not found` });
      }

      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: `${entityName} not found` });
      }

      return res.status(200).json({ success: true, message: `${entityName} deleted successfully` });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
});

const companyHandlers = createCrudHandlers(Company, 'Company');
const internshipHandlers = createCrudHandlers(Internship, 'Internship');
const paymentHandlers = createCrudHandlers(Payment, 'Payment');

exports.getCompanies = companyHandlers.list;
exports.createCompany = companyHandlers.create;
exports.updateCompany = companyHandlers.update;
exports.deleteCompany = companyHandlers.remove;

exports.getInternships = internshipHandlers.list;
exports.createInternship = internshipHandlers.create;
exports.updateInternship = internshipHandlers.update;
exports.deleteInternship = internshipHandlers.remove;

exports.getPayments = paymentHandlers.list;
exports.createPayment = paymentHandlers.create;
exports.updatePayment = paymentHandlers.update;
exports.deletePayment = paymentHandlers.remove;
