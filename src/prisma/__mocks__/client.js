import { mockDeep, mockReset } from "jest-mock-extended";

const prisma = mockDeep();

export const reset = () => {
    mockReset(prisma);
};

export default prisma;
