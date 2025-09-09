// js/modules/ui-manager.js (arquivo completo)
// Este módulo é responsável por toda a manipulação do DOM.

/**
 * Mostra ou esconde um elemento loader.
 * @param {string} loaderId O ID do elemento loader.
 * @param {boolean} show True para mostrar, false para esconder.
 */
export function toggleLoader(loaderId, show) {
    const loader = document.getElementById(loaderId);
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

/**
 * Renderiza uma lista de veículos na página.
 * @param {Array} veiculos Array de objetos de veículo.
 */
export function renderVeiculos(veiculos) {
    const list = document.getElementById('veiculos-list');
    if (!list) {
        console.error("ERRO: Elemento 'veiculos-list' não encontrado para renderizar veículos.");
        return;
    }
    list.innerHTML = ''; // Limpa a lista antes de adicionar novos itens

    if (!veiculos || veiculos.length === 0) {
        list.innerHTML = '<p>Nenhum veículo encontrado.</p>';
        return;
    }

    veiculos.forEach(veiculo => {
        const card = document.createElement('div');
        card.className = 'card';
        // CORRIGIDO: Caminho para 'imagens/' e fallback para imagem padrão
        const imageUrl = veiculo.imageUrl ? `imagens/${veiculo.imageUrl}` : 'imagens/placeholder.png'; 
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="Imagem de ${veiculo.modelo}" class="card__image">
            <div class="card__content">
                <h3 class="card__title">${veiculo.modelo}</h3>
                <p class="card__detail"><strong>Cor:</strong> ${veiculo.cor}</p>
                <p class="card__detail"><strong>Tipo:</strong> ${veiculo.tipoVeiculo}</p>
                <p class="card__detail"><strong>Vel. Máxima:</strong> ${veiculo.maxVelocidade} km/h</p>
                <button class="card__button">Ver Detalhes</button>
            </div>
        `;
        list.appendChild(card);
    });
}

/**
 * Renderiza uma lista de veículos em destaque na seção 'veiculos-destaque-section'.
 * @param {Array} veiculos Array de objetos de veículo em destaque.
 */
export function renderVeiculosDestaque(veiculos) {
    const destaqueSection = document.getElementById('veiculos-destaque-section');
    const list = destaqueSection ? destaqueSection.querySelector('#destaque-list') : null;

    if (!destaqueSection) {
        console.error("ERRO: Elemento 'veiculos-destaque-section' não encontrado para renderizar destaques.");
        return;
    }
    if (!list) {
        console.error("ERRO: Elemento 'destaque-list' não encontrado dentro de 'veiculos-destaque-section'.");
        return;
    }

    destaqueSection.style.display = 'block'; // Garante que a seção esteja visível
    list.innerHTML = ''; // Limpa a lista antes de adicionar novos itens

    if (!veiculos || veiculos.length === 0) {
        list.innerHTML = '<p>Nenhum veículo em destaque no momento.</p>';
        return;
    }

    veiculos.forEach(veiculo => {
        const card = document.createElement('div');
        card.className = 'card destaque-card'; // Adicione uma classe extra para estilizar especificamente os destaques
        const imageUrl = veiculo.imageUrl ? `imagens/${veiculo.imageUrl}` : 'imagens/placeholder.png';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="Imagem de ${veiculo.modelo}" class="card__image">
            <div class="card__content">
                <h4 class="card__title">${veiculo.modelo} (${veiculo.ano})</h4>
                <p class="card__detail"><strong>Destaque:</strong> ${veiculo.destaque}</p>
                <button class="card__button">Ver Mais</button>
            </div>
        `;
        list.appendChild(card);
    });
}


/**
 * Renderiza uma lista de serviços na página.
 * @param {Array} servicos Array de objetos de serviço.
 */
export function renderServicos(servicos) {
    const servicosSection = document.getElementById('servicos-section');
    const list = servicosSection ? servicosSection.querySelector('#servicos-list') : null;

    if (!servicosSection) {
        console.error("ERRO: Elemento 'servicos-section' não encontrado para renderizar serviços.");
        return;
    }
    if (!list) {
        console.error("ERRO: Elemento 'servicos-list' não encontrado dentro de 'servicos-section'.");
        return;
    }

    servicosSection.style.display = 'block'; // Garante que a seção esteja visível
    list.innerHTML = ''; // Limpa a lista

    if (!servicos || servicos.length === 0) {
        list.innerHTML = '<p>Nenhum serviço disponível.</p>';
        return;
    }

    servicos.forEach(servico => {
        const card = document.createElement('div');
        card.className = 'card servico-card';
        card.innerHTML = `
            <div class="card__content">
                <h3 class="card__title">${servico.nome}</h3>
                <p class="card__detail">${servico.descricao}</p>
                <p class="card__detail"><strong>Preço Estimado:</strong> R$ ${servico.precoEstimado.toFixed(2)}</p>
                <button class="card__button">Agendar</button>
            </div>
        `;
        list.appendChild(card);
    });
}

/**
 * Renderiza uma lista de ferramentas na página.
 * @param {Array} ferramentas Array de objetos de ferramenta.
 */
export function renderFerramentas(ferramentas) {
    const ferramentasSection = document.getElementById('ferramentas-section');
    const list = ferramentasSection ? ferramentasSection.querySelector('#ferramentas-list') : null;

    if (!ferramentasSection) {
        console.error("ERRO: Elemento 'ferramentas-section' não encontrado para renderizar ferramentas.");
        return;
    }
    if (!list) {
        console.error("ERRO: Elemento 'ferramentas-list' não encontrado dentro de 'ferramentas-section'.");
        return;
    }

    ferramentasSection.style.display = 'block'; // Garante que a seção esteja visível
    list.innerHTML = ''; // Limpa a lista

    if (!ferramentas || ferramentas.length === 0) {
        list.innerHTML = '<p>Nenhuma ferramenta disponível.</p>';
        return;
    }

    ferramentas.forEach(ferramenta => {
        const card = document.createElement('div');
        card.className = 'card ferramenta-card';
        const imageUrl = ferramenta.imageUrl ? `imagens/${ferramenta.imageUrl}` : 'imagens/placeholder_ferramenta.png';

        card.innerHTML = `
            <img src="${imageUrl}" alt="Imagem de ${ferramenta.nome}" class="card__image">
            <div class="card__content">
                <h4 class="card__title">${ferramenta.nome}</h4>
                <p class="card__detail">${ferramenta.utilidade}</p>
                <button class="card__button">Detalhes</button>
            </div>
        `;
        list.appendChild(card);
    });
}


/**
 * Exibe uma mensagem de notificação na tela.
 * @param {string} message A mensagem a ser exibida.
 * @param {string} type O tipo de notificação ('success' ou 'error').
 */
export function showNotification(message, type = 'success') {
    const area = document.getElementById('notification-area');
    if (!area) {
        console.error("ERRO: Elemento 'notification-area' não encontrado para exibir notificação.");
        return;
    }
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    area.appendChild(notification);

    // Remove a notificação após 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}


// --- Funções de UI para o Planejador de Viagem (Clima) ---

export function togglePlanejadorViagem(show) {
    const planejadorSection = document.getElementById('planejador-viagem-container');
    if (planejadorSection) {
        planejadorSection.style.display = show ? 'block' : 'none';
    }
}

export function displayClimaLoading(show) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    if (resultadoDiv) {
        resultadoDiv.innerHTML = show ? '<p class="loading-message">Buscando previsão...</p>' : '';
    }
}

export function displayClimaError(message) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    if (resultadoDiv) {
        resultadoDiv.innerHTML = `<p class="error-message">Falha: ${message}</p>`;
    }
}

export function renderPrevisaoDetalhada(previsaoDiariaProcessada, nomeCidade) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    if (!resultadoDiv) {
        console.error("Div #previsao-tempo-resultado não encontrada.");
        return;
    }
    resultadoDiv.innerHTML = ''; 

    const tituloEl = document.createElement('h3');
    tituloEl.innerHTML = `Previsão para <strong>${nomeCidade}</strong> (Próximos Dias)`;
    resultadoDiv.appendChild(tituloEl);

    const previsaoContainer = document.createElement('div');
    previsaoContainer.className = 'previsao-dias-container';
    resultadoDiv.appendChild(previsaoContainer);

    if (!previsaoDiariaProcessada || previsaoDiariaProcessada.length === 0) {
        previsaoContainer.innerHTML = '<p>Nenhuma previsão disponível ou erro ao processar.</p>';
        return;
    }

    previsaoDiariaProcessada.forEach((dia, index) => {
        const diaCard = document.createElement('div');
        diaCard.className = 'previsao-dia-card';

        const dataFormatada = formatarDataParaExibicao(dia.data);
        const descricaoCapitalizada = dia.descricao.charAt(0).toUpperCase() + dia.descricao.slice(1);
        const ventoKmH = (dia.vento_velocidade_media * 3.6).toFixed(1);

        diaCard.innerHTML = `
            <h4>${dataFormatada}</h4>
            <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${descricaoCapitalizada}" title="${descricaoCapitalizada}">
            <p class="descricao-tempo">${descricaoCapitalizada}</p>
            <p class="temperaturas">
                <span class="temp-max" title="Temperatura Máxima">${dia.temp_max.toFixed(0)}°C</span> / 
                <span class="temp-min" title="Temperatura Mínima">${dia.temp_min.toFixed(0)}°C</span>
            </p>
            <div class="detalhes-dia-info">
                <p title="Velocidade média do vento">Vento: ${ventoKmH} km/h</p>
                <p title="Umidade média do ar">Umidade: ${dia.umidade_media.toFixed(0)}%</p>
            </div>
            <button class="btn-ver-detalhes-dia" data-dia-index="${index}">Mais Informações</button>
            <div class="previsao-dia-detalhes-expansivel" style="display: none;"></div>
        `;
        previsaoContainer.appendChild(diaCard);

        const detalhesButton = diaCard.querySelector('.btn-ver-detalhes-dia');
        if (detalhesButton) {
            detalhesButton.addEventListener('click', (event) => handleCardDiaClick(event, previsaoDiariaProcessada, nomeCidade));
        }
    });
}

// Adaptação da sua função handleCardDiaClick para ser exportada ou chamada de forma modular
function handleCardDiaClick(event, dadosPrevisaoAtual, nomeCidade) { // Recebe dadosPrevisaoAtual
    const botaoClicado = event.currentTarget; 
    const cardClicado = botaoClicado.closest('.previsao-dia-card'); 

    if (!cardClicado) {
        console.error("Card pai não encontrado para o botão clicado.");
        return;
    }
    const diaIndex = parseInt(botaoClicado.dataset.diaIndex);

    if (dadosPrevisaoAtual && dadosPrevisaoAtual[diaIndex]) {
        const dadosDoDia = dadosPrevisaoAtual[diaIndex];
        const detalhesDiv = cardClicado.querySelector('.previsao-dia-detalhes-expansivel');

        if (!detalhesDiv) {
            console.error("Div de detalhes expansível não encontrada no card.");
            return;
        }

        const isVisible = detailsDiv.style.display === 'block';
        
        // Esta parte pode ser otimizada para não afetar outros cards se você quiser múltiplos abertos,
        // mas para um por vez, a lógica de fechar outros é boa.
        const todosCards = cardClicado.closest('.previsao-dias-container').querySelectorAll('.previsao-dia-card');
        todosCards.forEach(outroCard => {
            if (outroCard !== cardClicado) {
                const outroDetalheDiv = outroCard.querySelector('.previsao-dia-detalhes-expansivel');
                const outroBotao = outroCard.querySelector('.btn-ver-detalhes-dia');
                if (outroDetalheDiv) {
                    outroDetalheDiv.style.display = 'none';
                    outroDetalheDiv.innerHTML = '';
                }
                if (outroBotao) {
                    outroBotao.textContent = 'Mais Informações'; 
                }
            }
        });

        if (isVisible) {
            detalhesDiv.style.display = 'none';
            detalhesDiv.innerHTML = ''; 
            botaoClicado.textContent = 'Mais Informações'; 
        } else {
            detalhesDiv.style.display = 'block';
            let htmlDetalhes = '<h5>Previsão Horária:</h5><ul>';
            dadosDoDia.previsoes_horarias.forEach(ph => {
                const descricaoHorariaCapitalizada = ph.descricao.charAt(0).toUpperCase() + ph.descricao.slice(1);
                const ventoHorarioKmH = (ph.vento_velocidade * 3.6).toFixed(1);
                htmlDetalhes += `<li>
                    <div class="hora-icone">
                        <strong>${ph.hora}</strong>
                        <img src="https://openweathermap.org/img/wn/${ph.icone}.png" alt="${descricaoHorariaCapitalizada}" title="${descricaoHorariaCapitalizada}">
                    </div>
                    <div class="info-horaria">
                        <span>${ph.temp.toFixed(0)}°C, ${descricaoHorariaCapitalizada}</span>
                        <span>Vento: ${ventoHorarioKmH} km/h, Umidade: ${ph.umidade}%</span>
                    </div>
                </li>`;
            });
            htmlDetalhes += '</ul>';
            detalhesDiv.innerHTML = htmlDetalhes;
            botaoClicado.textContent = 'Ocultar Detalhes'; 
        }
    } else {
        console.error("Não foi possível encontrar os dados para o dia clicado.", diaIndex, dadosPrevisaoAtual);
    }
}

// Função utilitária de formatação de data (mantida aqui, pois é de UI)
function formatarDataParaExibicao(dataStr) {
    if (!dataStr || typeof dataStr !== 'string') return "Data inválida";
    try {
        const [year, month, day] = dataStr.split('-');
        const dataObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (isNaN(dataObj.getTime())) { throw new Error("Data inválida após parse."); }
        return dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) { console.error("Erro ao formatar data:", dataStr, e); return "Data inválida"; }
}