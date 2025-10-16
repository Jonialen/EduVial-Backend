
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
  const { artnum, title, sanc } = req.query;
  const filters = {};

  if (artnum) filters.artnum = { equals: artnum, mode: 'insensitive' };
  if (title) filters.title = { contains: title, mode: 'insensitive' };
  if (sanc) filters.sanc = { contains: sanc, mode: 'insensitive' };

  try {
    const laws = await prisma.lawarticle.findMany({
      where: filters,
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
      artnum: {
        description: "Filtrar por número de artículo (búsqueda exacta, insensible a mayúsculas).",
        example: "/api/laws/filter?artnum=45"
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
