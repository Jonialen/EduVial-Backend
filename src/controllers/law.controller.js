
import prisma from '../prisma/client.js';

// 1. Obtener todos los artículos de ley con sus categorías
export const getAllLaws = async (req, res) => {
  try {
    const laws = await prisma.lawarticle.findMany({
      include: {
        lawartcat: {
          include: {
            lawcat: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Formatear la respuesta para que sea más amigable
    const formattedLaws = laws.map(law => ({
      id: law.id,
      articleNumber: law.artnum,
      title: law.title,
      description: law.descr,
      sanction: law.sanc,
      categories: law.lawartcat.map(ac => ac.lawcat.name),
    }));

    res.status(200).json(formattedLaws);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching laws', error: error.message });
  }
};

// 2. Obtener leyes por nombre de categoría
export const getLawsByCategory = async (req, res) => {
  const { categoryName } = req.params;
  try {
    const laws = await prisma.lawarticle.findMany({
      where: {
        lawartcat: {
          some: {
            lawcat: {
              name: {
                equals: categoryName,
                mode: 'insensitive',
              },
            },
          },
        },
      },
      include: {
        lawartcat: {
          include: {
            lawcat: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (laws.length === 0) {
      return res.status(404).json({ message: 'No laws found for this category' });
    }
    
    const formattedLaws = laws.map(law => ({
      id: law.id,
      articleNumber: law.artnum,
      title: law.title,
      description: law.descr,
      sanction: law.sanc,
      categories: law.lawartcat.map(ac => ac.lawcat.name),
    }));


    res.status(200).json(formattedLaws);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching laws by category', error: error.message });
  }
};

// 3. Obtener leyes con filtros dinámicos
export const getLawsByFilter = async (req, res) => {
  const { article, title, sanc, search } = req.query;
  const where = {};
  const andConditions = [];

  if (article) {
    andConditions.push({ artnum: { equals: article, mode: 'insensitive' } });
  }
  if (title) {
    andConditions.push({ title: { contains: title, mode: 'insensitive' } });
  }
  if (sanc) {
    andConditions.push({ sanc: { contains: sanc, mode: 'insensitive' } });
  }

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { descr: { contains: search, mode: 'insensitive' } },
        { sanc: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  try {
    const laws = await prisma.lawarticle.findMany({
      where,
       include: {
        lawartcat: {
          include: {
            lawcat: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (laws.length === 0) {
      return res.status(404).json({ message: 'No laws found matching the criteria' });
    }
    
    const formattedLaws = laws.map(law => ({
      id: law.id,
      articleNumber: law.artnum,
      title: law.title,
      description: law.descr,
      sanction: law.sanc,
      categories: law.lawartcat.map(ac => ac.lawcat.name),
    }));

    res.status(200).json(formattedLaws);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching laws with filters', error: error.message });
  }
};

// 4. Obtener todas las categorías de leyes
export const getLawCategories = async (req, res) => {
  try {
    const categories = await prisma.lawcat.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    // Extraer solo los nombres en un array de strings
    const categoryNames = categories.map(cat => cat.name);
    res.status(200).json(categoryNames);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching law categories', error: error.message });
  }
};

// 5. Obtener información sobre los filtros disponibles
export const getAvailableFilters = (req, res) => {
  const filtersInfo = {
    message: "Filtros disponibles para el endpoint GET /api/laws/filter. Combina los parámetros que necesites.",
    filters: {
      search: {
        description: "Búsqueda de texto libre en título, descripción y sanción (búsqueda parcial, insensible a mayúsculas).",
        example: "/api/laws/filter?search=estacionamiento"
      },
      article: {
        description: "Filtrar por número de artículo (búsqueda exacta, insensible a mayúsculas).",
        example: "/api/laws/filter?article=45"
      },
      title: {
        description: "Filtrar por palabras en el título (búsqueda parcial, insensible a mayúsculas).",
        example: "/api/laws/filter?title=Seguridad Vial"
      },
      sanc: {
        description: "Filtrar por palabras en el texto de la sanción (búsqueda parcial, insensible a mayúsculas).",
        example: "/api/laws/filter?sanc=multa"
      }
    }
  };
  res.status(200).json(filtersInfo);
};
