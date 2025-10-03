const BASE_URL = 'http://localhost:5000/api';

/**
 * Função genérica para lidar com respostas da API.
 */
async function handleResponse(response) {
    // Se a resposta for um erro 401 (Não autorizado), desloga o usuário
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload(); // Recarrega a página para mostrar a tela de login
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.error || errorData.message || `Erro ${response.status}`);
    }
    
    // Retorna vazio para respostas sem corpo (como DELETE 204)
    if (response.status === 204) return {};

    return response.json();
}

/**
 * Função genérica para criar cabeçalhos, incluindo o token JWT.
 */
function createAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// --- AUTENTICAÇÃO ---

export async function login(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
}

export async function register(email, password) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
}

// --- VEÍCULOS (agora com autenticação) ---

export async function getVeiculos() {
    const response = await fetch(`${BASE_URL}/veiculos`, {
        headers: createAuthHeaders()
    });
    const data = await handleResponse(response);
    return data.data;
}

export async function getVeiculoById(id) {
    const response = await fetch(`${BASE_URL}/veiculos/${id}`, {
        headers: createAuthHeaders()
    });
    const data = await handleResponse(response);
    return data.data;
}

export async function createVeiculo(veiculoData) {
    const response = await fetch(`${BASE_URL}/veiculos`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(veiculoData)
    });
    const data = await handleResponse(response);
    return data.data;
}

// (Funções de deletar e atualizar também precisam do token, mas não estão ativas no momento)

// --- CLIMA (não precisa de autenticação) ---

export async function getClima(cidade) {
    const response = await fetch(`${BASE_URL}/clima/${encodeURIComponent(cidade)}`);
    return handleResponse(response); // A rota de clima é pública
}