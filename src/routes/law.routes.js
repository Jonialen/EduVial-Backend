import { Router } from 'express';
import {
  getAllLaws,
  getLawsByCategory,
  getLawsByFilter,
  getLawCategories,
  getAvailableFilters,
} from '../controllers/law.controller.js';

const router = Router();

// --- Rutas de descubrimiento ---
// Endpoint para obtener todas las categorías
router.get('/categories', getLawCategories);

// Endpoint para obtener información sobre los filtros
router.get('/filters/info', getAvailableFilters);


// --- Rutas de datos ---
// Endpoint para obtener todas las leyes
router.get('/', getAllLaws);

// Endpoint para filtrar por nombre de categoría
router.get('/category/:categoryName', getLawsByCategory);

// Endpoint para filtrar por campos (query params)
router.get('/filter', getLawsByFilter);

export default router;
