// (Todo o código anterior do ui-manager permanece o mesmo, até o final)
// ...

/**
 * ATUALIZAÇÃO: Gerencia a barra de navegação com base no estado de login.
 */
export function updateNav(isLoggedIn) {
    const navList = document.getElementById('main-navigation');
    if (!navList) return;

    navList.innerHTML = ''; // Limpa a navegação atual

    if (isLoggedIn) {
        // Botões para usuário logado
        navList.innerHTML = `
            <li><button class="nav-button active" data-view="garagem">Minha Garagem</button></li>
            <li><button id="logout-btn" class="nav-button">Sair</button></li>
        `;
        
        // Adiciona o listener para o botão de logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });

    } else {
        // Navegação vazia para usuário deslogado
        navList.innerHTML = '';
    }
}

// (O resto das suas funções, como renderVeiculos, displayClima, etc., continua aqui)
export function toggleLoader(loaderId, show) { const loader = document.getElementById(loaderId); if (loader) { loader.style.display = show ? 'block' : 'none'; } }
export function hideAllContentSections() { const sections = ['login-section', 'register-section', 'garagem-principal-section', 'detalhes-veiculo-section', 'planejador-viagem-container']; sections.forEach(id => { const section = document.getElementById(id); if (section) { section.style.display = 'none'; } }); }
export function showSection(sectionId) { const section = document.getElementById(sectionId); if (section) { section.style.display = 'block'; } }
export function renderVeiculos(veiculos) { const list = document.getElementById('veiculos-list'); if (!list) return; list.innerHTML = ''; if (!veiculos || veiculos.length === 0) { list.innerHTML = '<p>Nenhum veículo encontrado. Adicione um novo!</p>'; return; } veiculos.forEach(veiculo => { const card = document.createElement('div'); card.className = 'card'; const imageUrl = `imagens/imagemilustrativa.png`; card.innerHTML = `<img src="${imageUrl}" alt="Imagem de ${veiculo.modelo}" class="card__image"><div class="card__content"><h3 class="card__title">${veiculo.modelo}</h3><p class="card__detail"><strong>Cor:</strong> ${veiculo.cor}</p><p class="card__detail"><strong>Tipo:</strong> ${veiculo.tipoVeiculo}</p><button class="card__button" data-veiculo-id="${veiculo._id}">Ver Detalhes</button></div>`; list.appendChild(card); }); }
export function showNotification(message, type = 'success') { const area = document.getElementById('notification-area'); if (!area) return; const notification = document.createElement('div'); notification.className = `notification notification--${type}`; notification.textContent = message; area.appendChild(notification); setTimeout(() => notification.remove(), 5000); }
// (Funções de detalhes, manutenções e clima, se você quiser mantê-las, iriam aqui)