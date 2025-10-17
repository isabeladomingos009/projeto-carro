const BASE_URL = 'http://localhost:5000/api';

async function handleResponse(response) {
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
        throw new Error('Sessão expirada. Faça login novamente.');
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.error || errorData.message || `Erro ${response.status}`);
    }
    if (response.status === 204) return {};
    return response.json();
}

function createAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
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

// --- VEÍCULOS ---
export async function getVeiculos() {
    const response = await fetch(`${BASE_URL}/veiculos`, { headers: createAuthHeaders() });
    const data = await handleResponse(response);
    return data.data || [];
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

// --- CLIMA ---
export async function getClima(cidade) {
    const response = await fetch(`${BASE_URL}/clima/${encodeURIComponent(cidade)}`);
    const data = await handleResponse(response);
    return data.data;
}

// ==========================================================
// NOVA FUNÇÃO PARA COMPARTILHAR VEÍCULO
// ==========================================================
export async function shareVeiculo(veiculoId, email) {
    const response = await fetch(`${BASE_URL}/veiculos/${veiculoId}/share`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ email })
    });
    return handleResponse(response);
}