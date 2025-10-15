import prisma from "../prisma/client.js";

// GET /api/quest → todas las preguntas
export const getAllQuests = async (req, res) => {
    try {
        const quests = await prisma.quest.findMany();
        res.json(quests);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener preguntas" });
    }
};

// GET /api/quest/:id → una pregunta
export const getQuest = async (req, res) => {
    const id = parseInt(req.params.id);

    const quest = await prisma.quest.findUnique({
        where: { id },
        include: { lawarticle: true },
    });

    if (!quest) return res.status(404).json({ error: "Pregunta no encontrada" });

    res.json(quest);
};

// GET /api/quest/:id/options → opciones de la pregunta
export const getOptions = async (req, res) => {
    const qid = parseInt(req.params.id);

    const options = await prisma.opt.findMany({
        where: { qid },
    });

    res.json(options);
};

// POST /api/quest/:id/answer → responder pregunta
export const answerQuestion = async (req, res) => {
    const uid = req.user.userId; // asumimos autenticado
    const qid = parseInt(req.params.id);
    const { optid } = req.body;

    const opt = await prisma.opt.findUnique({
        where: { id: optid },
        select: { correct: true },
    });

    if (!opt) return res.status(400).json({ error: "Opción inválida" });

    const answer = await prisma.ans.create({
        data: {
            uid,
            qid,
            optid,
            correct: opt.correct,
        },
    });

    res.status(201).json(answer);
};

export const searchQuests = async (req, res) => {
    const { search } = req.query;

    try {
        const quests = await prisma.quest.findMany({
            where: {
                question: {
                    contains: search,
                },
            },
        });
        res.json(quests);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar preguntas" });
    }
};
