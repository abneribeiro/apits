import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireRole, requireSelfOrAdmin } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema, loginSchema, changePasswordSchema, paginationSchema } from '../validation/user.validation';

const router = Router();
const userController = new UserController();

router.post('/register', validateBody(createUserSchema), userController.register);
router.post('/login', validateBody(loginSchema), userController.login);
router.post('/logout', authenticateToken, userController.logout);
router.post('/refresh-token', userController.refreshToken);

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validateBody(updateUserSchema), userController.updateProfile);
router.put('/profile/change-password', authenticateToken, validateBody(changePasswordSchema), userController.changePassword);

router.get('/', authenticateToken, requireRole(['admin']), validateQuery(paginationSchema), userController.getAllUsers);
router.get('/:id', authenticateToken, requireSelfOrAdmin, userController.getUserById);
router.put('/:id', authenticateToken, requireRole(['admin']), validateBody(updateUserSchema), userController.updateUser);
router.delete('/:id', authenticateToken, requireRole(['admin']), userController.deleteUser);
router.put('/:id/deactivate', authenticateToken, requireRole(['admin']), userController.deactivateUser);
router.put('/:id/activate', authenticateToken, requireRole(['admin']), userController.activateUser);

export default router;