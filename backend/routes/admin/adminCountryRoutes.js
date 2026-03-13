const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminCountryController = require('../../controllers/admin/adminCountryController');
const { protect, restrictToAdmin } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validateMiddleware');

router.use(protect, restrictToAdmin);

const countryValidation = [
  body('name').notEmpty().withMessage('Tên quốc gia không được để trống'),
  body('code').notEmpty().withMessage('Mã quốc gia không được để trống').isLength({ min: 2, max: 10 })
];

router.get('/', adminCountryController.getAllCountries);
router.get('/:countryId', adminCountryController.getCountryById);
router.post('/', countryValidation, validate, adminCountryController.createCountry);
router.put('/:countryId', countryValidation, validate, adminCountryController.updateCountry);
router.delete('/:countryId', adminCountryController.deleteCountry);
router.patch('/:countryId/toggle-status', adminCountryController.toggleCountryStatus);

module.exports = router;