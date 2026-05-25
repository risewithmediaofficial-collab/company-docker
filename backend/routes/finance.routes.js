import express from 'express';
import {
  approveExpense,
  createExpense,
  createFinanceEntry,
  createInvoice,
  deleteFinanceEntry,
  deleteInvoice,
  getExpenses,
  getFinanceEntries,
  getFinanceSummary,
  getInvoice,
  getInvoices,
  getPayments,
  markInvoicePaid,
  sendInvoice,
  updateFinanceEntry,
  updateInvoice,
} from '../controllers/finance.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/summary', authorize('superAdmin', 'manager'), getFinanceSummary);

router.get('/', authorize('superAdmin', 'manager', 'employee'), getFinanceEntries);
router.post('/', authorize('superAdmin', 'manager', 'employee'), createFinanceEntry);

router.get('/invoices', authorize('superAdmin', 'manager', 'client'), getInvoices);
router.get('/invoices/:id', authorize('superAdmin', 'manager', 'client'), getInvoice);
router.post('/invoices', authorize('superAdmin', 'manager'), createInvoice);
router.put('/invoices/:id', authorize('superAdmin', 'manager'), updateInvoice);
router.post('/invoices/:id/send', authorize('superAdmin', 'manager'), sendInvoice);
router.post('/invoices/:id/mark-paid', authorize('superAdmin', 'manager'), markInvoicePaid);
router.delete('/invoices/:id', authorize('superAdmin'), deleteInvoice);
router.get('/payments', authorize('superAdmin', 'manager', 'client'), getPayments);

router.get('/expenses', authorize('superAdmin', 'manager', 'employee'), getExpenses);
router.post('/expenses', authorize('superAdmin', 'manager', 'employee'), createExpense);
router.patch('/expenses/:id/approve', authorize('superAdmin', 'manager'), approveExpense);

router.put('/:id', authorize('superAdmin', 'manager'), updateFinanceEntry);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteFinanceEntry);

export default router;
