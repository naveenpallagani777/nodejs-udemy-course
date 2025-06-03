const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/moviesController');
const { protectMiddleware } = require('../middleware/protectMiddleware');
const restrictToMiddleware = require('../middleware/restrictToMiddleware');

router.use(protectMiddleware); 

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', restrictToMiddleware('admin'), create);
router.put('/:id', restrictToMiddleware('admin'), update);
router.delete('/:id',restrictToMiddleware('admin'), remove);

module.exports = router;