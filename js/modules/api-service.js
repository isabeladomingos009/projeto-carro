// js/modules/api-service.js (arquivo completo)
// 1.1 & 3 - Módulo para encapsular chamadas fetch ao backend

// 3. - Atualizar a URL para a de produção quando fizer o deploy
// Por enquanto, LOCALHOST. A porta aqui deve ser a mesma do seu server.js
const BACKEND_URL = 'http://localhost:5000/api'; 

/**
 * Função genérica para realizar requisições fetch.
 * @param {string} endpoint O endpoint da API (ex: '/veiculos').
 * @param {object} options Opções da requisição fetch (method, headers, body).
 * @returns {Promise<any>} Os dados da resposta.
 * @throws {Error} Lança um erro se a requisição falhar.
 */
async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, options);

        if (!response.ok) {
            let errorData = { message: `Erro HTTP: ${response.status}` };
            try {
                errorData = await response.json(); // Tenta ler o JSON de erro do backend
            } catch (parseError) {
                // Se não conseguir parsear, usa a mensagem HTTP padrão
                console.warn(`[API Service] Erro ao parsear JSON de erro da API para ${endpoint}:`, parseError.message);
            }
            // 3. - Tratamento de erros abrangente: pega a mensagem de erro do backend
            throw new Error(errorData.error || errorData.message || `Erro HTTP: ${response.status}`);
        }

        // Se a resposta não tiver corpo (ex: DELETE com status 204 No Content), retorna um objeto de sucesso
        if (response.status === 204) {
            return { success: true };
        }
        
        const data = await response.json();
        return data.data; // Retorna apenas o campo 'data' da resposta padronizada do backend

    } catch (error) {
        console.error(`[API Service] Erro na API [${endpoint}]:`, error.message);
        // Propaga o erro para que a UI possa tratá-lo
        throw error;
    }
}

// Exporta funções específicas para cada recurso da API
export const getVeiculos = () => request('/veiculos');
// Futuramente:
export const getServicos = () => request('/servicos');
export const getFerramentas = () => request('/ferramentas');
export const getClima = (cidade) => request(`/clima/${encodeURIComponent(cidade)}`);
export const createVeiculo = (veiculoData) => request('/veiculos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(veiculoData)
});

// Exemplo futuro:
// export const getVeiculoById = (id) => request(`/veiculos/${id}`);
// export const updateVeiculo = (id, veiculoData) => request(`/veiculos/${id}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(veiculoData)
// });
// export const deleteVeiculo = (id) => request(`/veiculos/${id}`, { method: 'DELETE' });
// export const addManutencao = (veiculoId, manutencaoData) => request(`/veiculos/${veiculoId}/manutencoes`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(manutencaoData)
// });