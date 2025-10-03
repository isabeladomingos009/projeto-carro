import * as api from './modules/api-service.js';
import * as ui from './modules/ui-manager.js';

/**
 * Função principal que inicializa a aplicação.
 */
function init() {
    console.log("Aplicação iniciada.");
    
    // Configura os listeners dos formulários de autenticação
    setupAuthListeners();
    
    // Verifica o estado de login do usuário
    checkLoginState();
}

/**
 * Verifica se existe um token de login e atualiza a UI de acordo.
 */
function checkLoginState() {
    const token = localStorage.getItem('token');
    
    ui.hideAllContentSections(); // Esconde tudo primeiro

    if (token) {
        // Se o usuário está logado
        console.log("Usuário está logado. Mostrando garagem.");
        ui.updateNav(true); // Mostra navegação de usuário logado
        setupAppListeners(); // Configura os listeners da aplicação principal
        ui.showSection('garagem-principal-section');
        carregarVeiculos();
    } else {
        // Se o usuário não está logado
        console.log("Usuário não está logado. Mostrando tela de login.");
        ui.updateNav(false); // Mostra navegação de usuário deslogado
        ui.showSection('login-section');
    }
}

/**
 * Configura os listeners para os formulários de login e registro.
 */
function setupAuthListeners() {
    // Formulário de Login
    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const data = await api.login(email, password);
            localStorage.setItem('token', data.token);
            ui.showNotification('Login bem-sucedido!', 'success');
            checkLoginState(); // Reavalia o estado da aplicação
        } catch (error) {
            ui.showNotification(error.message, 'error');
        }
    });

    // Formulário de Registro
    document.getElementById('form-register').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            await api.register(email, password);
            ui.showNotification('Registro bem-sucedido! Por favor, faça o login.', 'success');
            ui.showSection('login-section'); // Mostra a tela de login após o registro
            document.getElementById('register-section').style.display = 'none';
        } catch (error) {
            ui.showNotification(error.message, 'error');
        }
    });

    // Links para alternar entre login e registro
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        ui.hideAllContentSections();
        ui.showSection('register-section');
    });
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        ui.hideAllContentSections();
        ui.showSection('login-section');
    });
}

/**
 * Configura os listeners para a aplicação principal (após o login).
 */
function setupAppListeners() {
    // Formulário de adicionar veículo
    const formAddVeiculo = document.getElementById('form-add-veiculo');
    if (formAddVeiculo) {
        formAddVeiculo.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(formAddVeiculo);
            const veiculoData = Object.fromEntries(formData.entries());
            veiculoData.maxVelocidade = Number(veiculoData.maxVelocidade);
            try {
                await api.createVeiculo(veiculoData);
                ui.showNotification('Veículo adicionado com sucesso!', 'success');
                formAddVeiculo.reset();
                carregarVeiculos();
            } catch (error) {
                ui.showNotification(error.message, 'error');
            }
        });
    }

    // (Outros listeners como o de clique nos cards podem ser adicionados aqui se necessário)
}

/**
 * Carrega os veículos do usuário logado da API e os exibe na UI.
 */
async function carregarVeiculos() {
    ui.toggleLoader('veiculos-loader', true);
    try {
        const veiculos = await api.getVeiculos();
        ui.renderVeiculos(veiculos);
    } catch (error) {
        ui.showNotification(error.message, 'error');
        document.getElementById('veiculos-list').innerHTML = `<p class="error-message">${error.message}</p>`;
    } finally {
        ui.toggleLoader('veiculos-loader', false);
    }
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);