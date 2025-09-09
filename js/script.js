// js/script.js (arquivo completo)
import * as api from './modules/api-service.js';
import * as ui from './modules/ui-manager.js';

// === VARIÁVEIS GLOBAIS ===
let dadosPrevisaoAtual = null; // Para uso da UI do clima
let currentView = 'garagem'; // Controla qual seção está ativa


/**
 * Função principal para inicializar a aplicação.
 * É MUITO IMPORTANTE que ela chame as funções de carregamento iniciais.
 */
async function init() {
    setupNavigationListeners(); // Configura os botões do menu lateral
    setupFormListener(); // Configura o formulário de adicionar veículo
    setupClimaListener(); // Configura o botão de verificar clima

    // Carrega a view inicial
    await navigateToView('garagem'); // Começa na garagem

    console.log("Aplicação Garagem Virtual inicializada.");
}

/**
 * Carrega a view correspondente e exibe os dados.
 * @param {string} viewName O nome da view a ser carregada ('garagem', 'agendar', 'planejar', etc.).
 */
async function navigateToView(viewName) {
    console.log(`[Frontend] Navegando para view: ${viewName}`);
    currentView = viewName;
    updateNavButtons(); // Atualiza o estilo do botão ativo

    // Esconde todas as seções de conteúdo e mostra a principal
    document.getElementById('add-veiculo-section').style.display = 'none';
    document.getElementById('veiculos-section').style.display = 'none';
    document.getElementById('veiculos-destaque-section').style.display = 'none';
    document.getElementById('servicos-section').style.display = 'none';
    document.getElementById('ferramentas-section').style.display = 'none';
    document.getElementById('planejador-viagem-container').style.display = 'none';

    // Mostra a seção relevante e carrega os dados
    switch (viewName) {
        case 'garagem':
            document.getElementById('add-veiculo-section').style.display = 'block';
            document.getElementById('veiculos-section').style.display = 'block';
            document.getElementById('veiculos-destaque-section').style.display = 'block';
            await carregarVeiculos(); // Carrega os veículos CRUD
            await carregarVeiculosDestaque(); // Carrega os veículos em destaque
            break;
        case 'agendar':
            // Lógica para agendar (futuro)
            document.getElementById('servicos-section').style.display = 'block';
            await carregarServicos(); // Carrega os serviços para agendamento
            document.getElementById('ferramentas-section').style.display = 'block';
            await carregarFerramentas(); // Carrega as ferramentas para referência
            break;
        case 'planejar':
            ui.togglePlanejadorViagem(true); // Mostra o container do planejador
            // A lógica de busca de clima é disparada pelo botão dentro da seção
            break;
        default:
            ui.showNotification(`View desconhecida: ${viewName}`, 'error');
            break;
    }
}


/**
 * Carrega os veículos da API e os exibe na UI.
 */
async function carregarVeiculos() {
    ui.toggleLoader('veiculos-loader', true);
    document.getElementById('veiculos-list').innerHTML = ''; // Limpa antes de carregar

    try {
        const veiculos = await api.getVeiculos();
        ui.renderVeiculos(veiculos);
    } catch (error) {
        ui.showNotification(`Erro ao carregar veículos: ${error.message}`, 'error');
        document.getElementById('veiculos-list').innerHTML = '<p>Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
    } finally {
        ui.toggleLoader('veiculos-loader', false);
    }
}

/**
 * Carrega os veículos em destaque da API e os exibe na UI.
 */
async function carregarVeiculosDestaque() {
    // A seção já é criada e um loader inicializado em navigateToView('garagem')
    const destaqueList = document.getElementById('destaque-list');
    if (destaqueList) destaqueList.innerHTML = '<p class="loading-message">Carregando destaques...</p>';

    try {
        const veiculosDestaque = await api.request('/garagem/veiculos-destaque'); // Chama o endpoint específico do backend
        ui.renderVeiculosDestaque(veiculosDestaque); // Usa a nova função de UI para renderizar
    } catch (error) {
        ui.showNotification(`Erro ao carregar veículos em destaque: ${error.message}`, 'error');
        if (destaqueList) destaqueList.innerHTML = '<p class="error-message">Não foi possível carregar os destaques.</p>';
    }
}

/**
 * Carrega os serviços da API e os exibe na UI.
 */
async function carregarServicos() {
    ui.toggleLoader('servicos-loader', true);
    document.getElementById('servicos-list').innerHTML = '';

    try {
        const servicos = await api.getServicos();
        ui.renderServicos(servicos);
    } catch (error) {
        ui.showNotification(`Erro ao carregar serviços: ${error.message}`, 'error');
        document.getElementById('servicos-list').innerHTML = '<p>Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
    } finally {
        ui.toggleLoader('servicos-loader', false);
    }
}

/**
 * Carrega as ferramentas da API e as exibe na UI.
 */
async function carregarFerramentas() {
    ui.toggleLoader('ferramentas-loader', true);
    document.getElementById('ferramentas-list').innerHTML = '';

    try {
        const ferramentas = await api.getFerramentas();
        ui.renderFerramentas(ferramentas);
    } catch (error) {
        ui.showNotification(`Erro ao carregar ferramentas: ${error.message}`, 'error');
        document.getElementById('ferramentas-list').innerHTML = '<p>Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
    } finally {
        ui.toggleLoader('ferramentas-loader', false);
    }
}


/**
 * Configura o event listener para o formulário de adicionar veículo.
 */
function setupFormListener() {
    const form = document.getElementById('form-add-veiculo');
    if (!form) {
        console.error("ERRO: O formulário com o ID 'form-add-veiculo' não foi encontrado!");
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("Formulário de adicionar veículo enviado!");

        const formData = new FormData(form);
        const veiculoData = Object.fromEntries(formData.entries());

        veiculoData.maxVelocidade = Number(veiculoData.maxVelocidade);

        try {
            const novoVeiculo = await api.createVeiculo(veiculoData);
            ui.showNotification(`Veículo "${novoVeiculo.modelo}" adicionado com sucesso!`, 'success');
            form.reset();
            await carregarVeiculos(); // Recarrega a lista principal após adicionar
        } catch (error) {
            ui.showNotification(`Erro ao adicionar veículo: ${error.message}`, 'error');
        }
    });
}

/**
 * Configura os event listeners para os botões de navegação lateral.
 */
function setupNavigationListeners() {
    const navButtons = document.querySelectorAll('.sidebar-nav .nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const viewName = button.dataset.view;
            if (viewName) {
                navigateToView(viewName);
            }
        });
    });
}

/**
 * Atualiza o estilo dos botões de navegação para indicar a view ativa.
 */
function updateNavButtons() {
    const navButtons = document.querySelectorAll('.sidebar-nav .nav-button');
    navButtons.forEach(button => {
        if (button.dataset.view === currentView) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Configura o event listener para o botão de verificar clima.
 */
function setupClimaListener() {
    const verificarClimaBtn = document.getElementById('verificar-clima-btn');
    if (!verificarClimaBtn) {
        console.warn("Botão #verificar-clima-btn não encontrado.");
        return;
    }

    verificarClimaBtn.addEventListener('click', handleVerificarClimaClick);
}


async function handleVerificarClimaClick() {
    const destinoInput = document.getElementById('destino-viagem');
    if (!destinoInput) {
        console.error("Elementos do DOM para clima (destino-viagem) não encontrados.");
        ui.showNotification("Erro interno na página (campo de destino).", 'error');
        return;
    }

    const nomeCidade = destinoInput.value.trim();
    if (!nomeCidade) {
        ui.showNotification("Por favor, digite o nome da cidade.", 'error');
        destinoInput.focus();
        return;
    }

    ui.displayClimaLoading(true); // Mostra "Buscando previsão..."

    try {
        // Usa a nova função getClima do api-service
        const dadosApi = await api.getClima(nomeCidade); 
        
        if (dadosApi && !dadosApi.error) {
            const previsaoProcessada = processarDadosForecast(dadosApi); // Sua função de processamento
            if (previsaoProcessada && previsaoProcessada.length > 0) {
                ui.renderPrevisaoDetalhada(previsaoProcessada, nomeCidade); // Usa função de UI
            } else {
                ui.displayClimaError('Não foi possível processar os dados da previsão. Verifique o console.');
                console.warn("[Frontend] processarDadosForecast retornou nulo/vazio. API Response:", dadosApi);
            }
        } else {
            // Se o backend retornou um erro específico da OpenWeatherMap
            ui.displayClimaError(dadosApi?.message || 'Não foi possível obter a previsão.');
        }
    } catch (error) {
        // Erros de rede ou erros lançados pelo api.getClima
        ui.displayClimaError(error.message || 'Não foi possível obter a previsão. Verifique sua conexão.');
        console.error("[Frontend] Falha na requisição ou processamento da previsão:", error);
    } finally {
        ui.displayClimaLoading(false); // Esconde "Buscando previsão..."
    }
}

// Sua função de processamento de forecast. Mantida aqui por ser mais de lógica de dados do que de UI.
function processarDadosForecast(dataApi) {
    if (!dataApi || !dataApi.list || !Array.isArray(dataApi.list) || dataApi.list.length === 0) {
        console.error("[Processamento Forecast] Dados da API inválidos ou lista de previsão vazia.", dataApi);
        return null;
    }
    const previsoesAgrupadasPorDia = {};
    dataApi.list.forEach(item => {
        const diaStr = item.dt_txt.split(' ')[0];
        if (!previsoesAgrupadasPorDia[diaStr]) {
            previsoesAgrupadasPorDia[diaStr] = { data: diaStr, entradas: [] };
        }
        previsoesAgrupadasPorDia[diaStr].entradas.push({
            hora: item.dt_txt.split(' ')[1].substring(0, 5),
            temp: item.main.temp,
            descricao: item.weather[0].description,
            icone: item.weather[0].icon,
            umidade: item.main.humidity,
            vento_velocidade: item.wind.speed,
        });
    });
    const resultadoFinal = [];
    for (const diaKey in previsoesAgrupadasPorDia) {
        const diaData = previsoesAgrupadasPorDia[diaKey];
        if (diaData.entradas.length === 0) continue;
        const temperaturas = diaData.entradas.map(e => e.temp);
        const umidades = diaData.entradas.map(e => e.umidade);
        const velocidades_vento = diaData.entradas.map(e => e.vento_velocidade);
        let previsaoRepresentativa = diaData.entradas.find(e => e.hora === "12:00" || e.hora === "15:00" || e.hora === "09:00") || diaData.entradas[0];

        if (!previsaoRepresentativa) {
            console.warn(`[Processamento Forecast] Nenhuma previsão horária encontrada para o dia ${diaKey}. Pulando este dia.`);
            continue;
        }

        resultadoFinal.push({
            data: diaData.data,
            temp_min: parseFloat(Math.min(...temperaturas).toFixed(1)),
            temp_max: parseFloat(Math.max(...temperaturas).toFixed(1)),
            descricao: previsaoRepresentativa.descricao,
            icone: previsaoRepresentativa.icone,
            umidade_media: parseFloat((umidades.reduce((a, b) => a + b, 0) / umidades.length).toFixed(1)),
            vento_velocidade_media: parseFloat((velocidades_vento.reduce((a, b) => a + b, 0) / velocidades_vento.length).toFixed(1)),
            previsoes_horarias: diaData.entradas
        });
    }
    resultadoFinal.sort((a, b) => new Date(a.data) - new Date(b.data));
    console.log("[Processamento Forecast] Dados processados por dia:", resultadoFinal);
    return resultadoFinal;
}

// Adiciona um ouvinte de evento para executar o código quando o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', init);