import { prisma } from '@/lib/prisma';

const orderSelects = {  
    id: true,  
    pedido: true,  
    quantidade: true,  
    status: true,  
    entregador: true, 
    rua: true,  
    numero: true,  
    complemento: true,  
    cep: true,  
    cidade: true,  
    estado: true,  
    tel: true,  
    metodo_pag: true,  
    instrucoes: true,  
    createdBy: true,  
    createdAt: true
};  

export const fetchApiKeys = async (teamId: string) => {
    return prisma.apiKey.findMany({
        where: {
            teamId,
        },
        select: {
            id: true,
            name: true,
            createdAt: true,
        },
    });
};

export async function setOrderHeaders(teamId: string) {
    try {
        const apiKeys = await fetchApiKeys(teamId);
        if (!apiKeys || apiKeys.length === 0) {
            console.warn("No API keys found for the team.");
            return {};
        }

        const orderHeaders = {
            apiKeys: apiKeys.map(key => key.name).join(', '),
            "Content-Type": "application/json",
        };

        return orderHeaders;
    } catch (error) {
        console.error("Error fetching API keys:", error);
        return {};
    }
}

export const validateApiKey = async (apiKey: string, teamId: string) => {
    const keys = await fetchApiKeys(teamId);
    return keys.some(key => key.name === apiKey);
};

export async function getOrdersAuthenticate(teamId: string, req, res) {  
    
    const headers = await setOrderHeaders(teamId);
    
    headers['Content-Type'] = 'application/json';

    const apiKey = req.headers['authorization']?.split(' ')[1];

    if (!apiKey || !(await validateApiKey(apiKey, teamId))) {
        return res.status(403).json({ message: 'Acesso negado: chave da API inválida.' });
    }

    return await prisma.order.findMany({  
        where: { teamId: teamId },  
        select: orderSelects  
    });  
}  
