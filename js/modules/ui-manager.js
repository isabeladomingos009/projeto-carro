export function updateNav(isLoggedIn) {
    const navList = document.getElementById('main-navigation');
    if (!navList) return;
    navList.innerHTML = '';
    if (isLoggedIn) {
        navList.innerHTML = `
            <li><button class="nav-button active" data-view="garagem">Minha Garagem</button></li>
            <li><button class="nav-button" data-view="planejar">Planejar Viagem</button></li>
            <li><button id="logout-btn" class="nav-button">Sair</button></li>
        `;
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });
    }
}

export function toggleLoader(loaderId, show) {
    const loader = document.getElementById(loaderId);
    if (loader) { loader.style.display = show ? 'block' : 'none'; }
}

export function hideAllContentSections() {
    const sections = ['login-section', 'register-section', 'garagem-principal-section', 'detalhes-veiculo-section', 'planejador-viagem-container'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) { section.style.display = 'none'; }
    });
}

export function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) { section.style.display = 'block'; }
}

export function showNotification(message, type = 'success') {
    const area = document.getElementById('notification-area');
    if (!area) return;
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    area.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Dentro de js/modules/ui-manager.js

// SUBSTITUA a função renderVeiculos antiga por esta:
export function renderVeiculos(veiculos) {
    const list = document.getElementById('veiculos-list');
    if (!list) return;
    list.innerHTML = '';
    if (!veiculos || veiculos.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted-color);">Sua garagem está vazia. Adicione um veículo!</p>';
        return;
    }

    // Decodifica o token para saber quem é o usuário logado
    const token = localStorage.getItem('token');
    if (!token) return; // Segurança extra
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = payload.userId;

    veiculos.forEach(veiculo => {
        const card = document.createElement('div');
        card.className = 'card';
        const imageUrl = `imagens/imagemilustrativa.png`;

        let sharedLabel = '';
        // Se o veículo TEM um dono (owner) e o ID do dono é DIFERENTE do meu ID,
        // então é um carro compartilhado.
        if (veiculo.owner && veiculo.owner._id !== currentUserId) {
            sharedLabel = `<p class="card__shared-label" style="font-size: 0.8em; color: var(--accent-color); font-weight: 500; margin-bottom: 0.5rem;">Compartilhado por: ${veiculo.owner.email}</p>`;
        }

        card.innerHTML = `
            <img src="${imageUrl}" alt="Imagem de ${veiculo.modelo}" class="card__image">
            <div class="card__content">
                ${sharedLabel}
                <h3 class="card__title">${veiculo.modelo}</h3>
                <p class="card__detail"><strong>Cor:</strong> ${veiculo.cor}</p>
                <p class="card__detail"><strong>Tipo:</strong> ${veiculo.tipoVeiculo}</p>
                <button class="card__button" data-veiculo-id="${veiculo._id}">Ver Detalhes</button>
            </div>
        `;
        list.appendChild(card);
    });
}
// --- FUNÇÕES DE UI PARA O CLIMA ---
export function displayClimaLoading(show) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    if (resultadoDiv) { resultadoDiv.innerHTML = show ? '<p class="loading-message">Buscando...</p>' : ''; }
}

export function displayClimaError(message) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    if (resultadoDiv) { resultadoDiv.innerHTML = `<p class="error-message">${message}</p>`; }
}

function formatarDataParaExibicao(dataStr) {
    const dataObj = new Date(dataStr + 'T00:00:00');
    return dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function renderPrevisaoDetalhada(previsao, nomeCidade) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    if (!resultadoDiv) return;
    resultadoDiv.innerHTML = '';
    const tituloEl = document.createElement('h3');
    tituloEl.innerHTML = `Previsão para <strong>${nomeCidade}</strong>`;
    resultadoDiv.appendChild(tituloEl);
    const previsaoContainer = document.createElement('div');
    previsaoContainer.className = 'previsao-dias-container';
    resultadoDiv.appendChild(previsaoContainer);
    if (!previsao || previsao.length === 0) {
        previsaoContainer.innerHTML = '<p>Nenhuma previsão disponível.</p>';
        return;
    }
    previsao.forEach(dia => {
        const diaCard = document.createElement('div');
        diaCard.className = 'previsao-dia-card';
        const dataFormatada = formatarDataParaExibicao(dia.data);
        const descricaoCapitalizada = dia.descricao.charAt(0).toUpperCase() + dia.descricao.slice(1);
        diaCard.innerHTML = `<h4>${dataFormatada}</h4><img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${descricaoCapitalizada}"><p class="descricao-tempo">${descricaoCapitalizada}</p><p class="temperaturas"><span class="temp-max">${dia.temp_max.toFixed(0)}°C</span> / <span class="temp-min">${dia.temp_min.toFixed(0)}°C</span></p>`;
        previsaoContainer.appendChild(diaCard);
    });
}
export function renderVeiculoDetalhes(veiculo, container) {
    if (!container) return;
    const imageUrl = `imagens/imagemilustrativa.png`;

    // Lógica simples para verificar se o usuário é o dono
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isOwner = veiculo.owner === payload.userId; // No backend, o owner é apenas o ID

    const shareFormHTML = isOwner ? `
        <h3>Compartilhar Veículo</h3>
        <form id="form-share-veiculo" data-veiculo-id="${veiculo._id}">
            <div class="form-group">
                <label for="share-email">Email do usuário:</label>
                <input type="email" id="share-email" name="email" placeholder="amigo@email.com" required>
            </div>
            <button type="submit" class="btn btn--secondary">Compartilhar</button>
        </form>
    ` : '';

    container.innerHTML = `
        <div class="veiculo-detalhes-card">
            <img src="${imageUrl}" alt="Imagem de ${veiculo.modelo}">
            <div class="card__content">
                <h3>${veiculo.modelo}</h3>
                <p><strong>Cor:</strong> ${veiculo.cor}</p>
                <p><strong>Tipo:</strong> ${veiculo.tipoVeiculo}</p>
                <p><strong>Velocidade Máxima:</strong> ${veiculo.maxVelocidade} km/h</p>
                <hr style="margin: 1.5rem 0; border-color: rgba(0,0,0,0.1);">
                ${shareFormHTML}
            </div>
        </div>
    `;
}