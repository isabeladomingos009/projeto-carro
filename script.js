// Variável global para armazenar as instâncias dos veículos
let veiculos = {};
const STORAGE_KEY = 'garagemInteligenteData';

// --- FUNÇÕES DE SOM ---
function tocarBuzina() { try { new Audio('buzina.mp3').play(); } catch(e) { console.error("Erro audio buzina:", e);}}
function tocarAcelerar() { try { new Audio('acelerar.mp3').play(); } catch(e) { console.error("Erro audio acelerar:", e);}}
function tocarFrear() { try { new Audio('frear.mp3').play(); } catch(e) { console.error("Erro audio frear:", e);}}
function tocarLigar() { try { new Audio('ligar.mp3').play(); } catch(e) { console.error("Erro audio ligar:", e);}}
function tocarDesligar() { try { new Audio('desligar.mp3').play(); } catch(e) { console.error("Erro audio desligar:", e);}}

// === CLASSE MANUTENCAO ===
class Manutencao {
    constructor(id, data, tipo, custo = 0, descricao = '', status = 'Agendada') {
        if (!(data instanceof Date) || isNaN(data.getTime())) { console.warn("Data inválida no construtor Manutencao:", data); this.data = null; } else { this.data = data; }
        if (typeof tipo !== 'string' || tipo.trim() === '') { console.warn("Tipo inválido no construtor Manutencao:", tipo); this.tipo = ''; } else { this.tipo = tipo.trim(); }
        if (typeof custo !== 'number' || custo < 0) { console.warn("Custo inválido, definindo como 0:", custo); this.custo = 0; } else { this.custo = parseFloat(custo.toFixed(2)); }
        this.id = id || `maint-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        this.descricao = descricao || '';
        this.status = status;
    }
    getFormattedDate() {
        if (this.data instanceof Date && !isNaN(this.data.getTime())) {
            const dia = String(this.data.getDate()).padStart(2, '0'); const mes = String(this.data.getMonth() + 1).padStart(2, '0'); const ano = this.data.getFullYear();
            return `${dia}/${mes}/${ano}`;
        } return "Data inválida";
    }
    formatar() {
        if (!this.validar()) { return `[Registro de Manutenção Inválido - ID: ${this.id}]`; }
        const dataFormatada = this.getFormattedDate(); let representacao = `${this.tipo} em ${dataFormatada}`;
        if (this.custo > 0) { const custoFormatado = this.custo.toFixed(2).replace('.', ','); representacao += ` - R$${custoFormatado}`; }
        return representacao;
    }
    validar() {
        const ehDataValida = this.data instanceof Date && !isNaN(this.data.getTime());
        const ehTipoValido = typeof this.tipo === 'string' && this.tipo.trim().length > 0;
        const ehCustoValido = typeof this.custo === 'number' && this.custo >= 0;
        if (!ehDataValida) console.error(`Manutenção ${this.id}: Data inválida.`); if (!ehTipoValido) console.error(`Manutenção ${this.id}: Tipo inválido.`); if (!ehCustoValido) console.error(`Manutenção ${this.id}: Custo inválido.`);
        return ehDataValida && ehTipoValido && ehCustoValido;
    }
    toPlainObject() { return { id: this.id, data: this.data ? this.data.toISOString() : null, tipo: this.tipo, custo: this.custo, descricao: this.descricao, status: this.status }; }
    static fromPlainObject(obj) { if (!obj) return null; const data = obj.data ? new Date(obj.data) : null; return new Manutencao(obj.id, data, obj.tipo, obj.custo, obj.descricao, obj.status); }
}
// === FIM CLASSE MANUTENCAO ===


// --- CLASSE BASE VEICULO ---
class Veiculo {
    constructor(modelo, cor, containerId, tipoVeiculo = 'Veiculo') {
        if (!modelo || !cor || !containerId) { throw new Error("Modelo, cor e containerId são obrigatórios."); }
        this.modelo = modelo; this.ligado = false; this.velocidade = 0; this.containerId = containerId;
        this.containerElement = document.getElementById(containerId); if (!this.containerElement) { console.error(`Container ${containerId} não encontrado!`); }
        this.historicoManutencao = []; this.tipoVeiculo = tipoVeiculo;
        this.cores = ["Preto", "Branco", "Prata", "Cinza", "Vermelho", "Azul", "Verde"];
        this.indiceCorAtual = this.cores.indexOf(cor); if(this.indiceCorAtual === -1) { console.warn(`Cor inicial "${cor}" não encontrada para ${this.modelo}. Usando: ${this.cores[0]}.`); this.indiceCorAtual = 0; }
        this.cor = this.cores[this.indiceCorAtual];
    }
    ligar() {
        if (this.tipoVeiculo === 'Bicicleta') { alert("Bicicleta não liga!"); return; } if (!this.ligado) { this.ligado = true; tocarLigar(); console.log(`${this.modelo} ligado.`); this.atualizarTela(); salvarGaragem(); } else { alert(`${this.modelo} já está ligado!`); }
    }
    desligar() {
        if (this.tipoVeiculo === 'Bicicleta') { alert("Bicicleta não desliga!"); return; } if (this.ligado) { this.ligado = false; this.velocidade = 0; tocarDesligar(); if (this.desativarTurbo) { this.desativarTurbo(false); } console.log(`${this.modelo} desligado.`); this.atualizarTela(); salvarGaragem(); } else { alert(`${this.modelo} já está desligado!`); }
    }
    acelerar() {
        if (!this.ligado && this.tipoVeiculo !== 'Bicicleta') { alert(`${this.modelo} precisa estar ligado para acelerar!`); return; } this._executarAceleracao(); this.atualizarTela(); /* Salva dentro do _executarAceleracao */
    }
     _executarAceleracao() {
         console.warn("_executarAceleracao deveria ser sobrescrito"); if (this.velocidade < (this.maxVelocidade || 50)) { this.velocidade += 5; salvarGaragem(); } else { alert(`${this.modelo} na velocidade máxima!`); }
     }
    frear() {
        if (this.velocidade > 0) { const velAntes = this.velocidade; this.velocidade = Math.max(0, this.velocidade - this.getFreioIncremento()); if(this.velocidade <= 5 && this.tipoVeiculo !== 'Bicicleta') { this.velocidade = 0; } tocarFrear(); this.atualizarTela(); if(this.velocidade !== velAntes) salvarGaragem(); } else { alert(`${this.modelo} já está parado!`); }
    }
    getFreioIncremento() { return 10; }
    mudarCor() {
        if (this.cores && this.cores.length > 0) { this.indiceCorAtual = (this.indiceCorAtual + 1) % this.cores.length; this.cor = this.cores[this.indiceCorAtual]; alert(`Cor do ${this.constructor.name} mudou para ${this.cor}`); this.atualizarTela(); salvarGaragem(); } else { alert("Não é possível mudar a cor."); }
    }
    buzinar() { tocarBuzina(); console.log(`${this.modelo} (som genérico): Buzina!`); }
    adicionarManutencao(manutencaoObj) {
        if (manutencaoObj instanceof Manutencao && manutencaoObj.validar()) {
            this.historicoManutencao.push(manutencaoObj); this.historicoManutencao.sort((a, b) => { const dateA = a.data instanceof Date ? a.data.getTime() : 0; const dateB = b.data instanceof Date ? b.data.getTime() : 0; return dateA - dateB; });
            console.log(`Manutenção adicionada para ${this.modelo}: ID ${manutencaoObj.id}`); salvarGaragem(); this.atualizarDisplayManutencao(); verificarAgendamentosProximos(); return true;
        } else { console.error("Tentativa de adicionar manutenção inválida:", manutencaoObj); alert("Erro ao adicionar manutenção. Verifique Data, Tipo e Custo."); return false; }
    }
    removerManutencao(idManutencao) {
        const index = this.historicoManutencao.findIndex(m => m.id === idManutencao); if (index > -1) { const removida = this.historicoManutencao.splice(index, 1)[0]; console.log(`Manutenção removida para ${this.modelo}: ID ${removida.id}`); salvarGaragem(); this.atualizarDisplayManutencao(); return true; } console.warn(`Manutenção ${idManutencao} não encontrada.`); return false;
    }
    marcarManutencaoComo(idManutencao, novoStatus) {
        const manutencao = this.historicoManutencao.find(m => m.id === idManutencao); if (manutencao) { const statusValidos = ['Agendada', 'Realizada', 'Cancelada']; if (statusValidos.includes(novoStatus)) { manutencao.status = novoStatus; console.log(`Status da manutenção ${idManutencao} alterado para ${novoStatus}.`); salvarGaragem(); this.atualizarDisplayManutencao(); return true; } else { console.error(`Status inválido: ${novoStatus}`); alert(`Status inválido: ${novoStatus}`); return false; } } console.warn(`Manutenção ${idManutencao} não encontrada.`); return false;
    }
    getHistoricoManutencao(apenasFuturas = false, apenasAgendadas = false) {
        const agora = new Date(); return this.historicoManutencao.filter(m => { if (!m || !(m.data instanceof Date)) return false; /* Pula inválidas */ const ehFutura = m.data >= agora; const ehAgendada = m.status === 'Agendada'; if (apenasAgendadas && !ehAgendada) return false; return apenasFuturas ? ehFutura : true; });
    }
    getHistoricoManutencaoHTML(apenasFuturas = false, apenasAgendadas = false) {
        const historicoFiltrado = this.getHistoricoManutencao(apenasFuturas, apenasAgendadas); if (historicoFiltrado.length === 0) { let msg = apenasFuturas ? 'Nenhum agendamento futuro' : 'Nenhum registro'; if(apenasAgendadas && apenasFuturas) msg = 'Nenhum agendamento futuro ativo'; else if(apenasAgendadas && !apenasFuturas) msg = 'Nenhum registro ativo'; else if(!apenasAgendadas && apenasFuturas) msg = 'Nenhum agendamento futuro (inclui realizados/cancelados)'; else msg = 'Nenhum registro encontrado'; return `<p>${msg}.</p>`; }
        let html = '<ul>'; historicoFiltrado.forEach(m => { let botoesAcao = ''; if (m.status === 'Agendada') { botoesAcao += `<button class="btn-manutencao-status" data-veiculo-id="${this.getVeiculoId()}" data-manutencao-id="${m.id}" data-novo-status="Realizada" title="Marcar como Realizada">✅</button>`; botoesAcao += `<button class="btn-manutencao-status" data-veiculo-id="${this.getVeiculoId()}" data-manutencao-id="${m.id}" data-novo-status="Cancelada" title="Cancelar Agendamento">❌</button>`; } botoesAcao += `<button class="btn-manutencao-remover" data-veiculo-id="${this.getVeiculoId()}" data-manutencao-id="${m.id}" title="Remover Registro">🗑️</button>`; html += `<li><p>${m.formatar()}</p><div class="manutencao-actions"> ${botoesAcao} </div></li>`; }); html += '</ul>'; return html;
    }
    getVeiculoId() { return this.containerId.replace('container-', ''); }
    atualizarDisplayManutencao() {
        if (!this.containerElement) return; const historicoDiv = this.containerElement.querySelector('.manutencao-historico'); const agendamentosDiv = this.containerElement.querySelector('.manutencao-agendamentos');
        if (historicoDiv) { historicoDiv.innerHTML = this.getHistoricoManutencaoHTML(false); } if (agendamentosDiv) { agendamentosDiv.innerHTML = this.getHistoricoManutencaoHTML(true, true); } adicionarListenersBotoesManutencao(this.containerElement);
    }
    atualizarTela() {
        if (!this.containerElement) return;
        const corElement = this.containerElement.querySelector(`#cor-${this.getVeiculoId()}`); if (corElement) { corElement.textContent = `Cor: ${this.cor}`; }
        if (this.tipoVeiculo !== 'Bicicleta') { let statusIdMap = { Carro: 'statusCarro', CarroEsportivo: 'statusCarroEsportivo', Caminhao: 'statusCarroCaminhao', Moto: 'statusMoto'}; const statusElement = this.containerElement.querySelector(`#${statusIdMap[this.tipoVeiculo]}`); if (statusElement) { statusElement.textContent = this.ligado ? `${this.tipoVeiculo} ligado` : `${this.tipoVeiculo} desligado`; statusElement.className = this.ligado ? "ligado" : "desligado"; } }
        const velocidadeElementId = `velocidade${this.getVeiculoId() === 'carro' ? '' : '-' + this.getVeiculoId()}`; const velocidadeElement = this.containerElement.querySelector(`#${velocidadeElementId}`); const progressBar = this.containerElement.querySelector(`#velocidade-progress-${this.getVeiculoId()}`);
        // A atualização da VELOCIDADE será feita nas classes filhas se necessário (como CarroEsportivo)
        // if (velocidadeElement) { velocidadeElement.textContent = `Velocidade: ${this.velocidade} km/h`; }
        if (progressBar && this.maxVelocidade) { const porcentagemVelocidade = Math.min((this.velocidade / this.maxVelocidade) * 100, 100); progressBar.style.width = porcentagemVelocidade + "%"; } else if (progressBar) { progressBar.style.width = "0%"; }
        this.atualizarDisplayManutencao();
    }
    toPlainObject() {
        return { tipoVeiculo: this.tipoVeiculo, modelo: this.modelo, cor: this.cor, ligado: this.ligado, velocidade: this.velocidade, containerId: this.containerId, cores: this.cores, indiceCorAtual: this.indiceCorAtual, historicoManutencao: this.historicoManutencao.map(m => m.toPlainObject()) };
    }
}


// --- CLASSES FILHAS ---

class Carro extends Veiculo {
    constructor(modelo, cor, containerId, idVelocidade, idStatus, idProgressBar) {
        super(modelo, cor, containerId, 'Carro'); this.maxVelocidade = 180; this.cores = ["Prata", "Branco", "Preto", "Cinza", "Vermelho", "Azul"]; this.indiceCorAtual = this.cores.indexOf(cor); if(this.indiceCorAtual === -1) this.indiceCorAtual = 0; this.cor = this.cores[this.indiceCorAtual];
    }
    _executarAceleracao() { if (this.velocidade < this.maxVelocidade) { const vAntes = this.velocidade; this.velocidade = Math.min(this.velocidade + 10, this.maxVelocidade); tocarAcelerar(); if(vAntes !== this.velocidade) salvarGaragem(); } else { alert(`O ${this.modelo} atingiu a vel. máxima!`); } }
    buzinar() { tocarBuzina(); console.log(`${this.modelo}: Fom Fom!`); }
    atualizarTela() { // Sobrescreve para atualizar seu próprio display de velocidade
        super.atualizarTela();
        const velocidadeElement = this.containerElement?.querySelector('#velocidade'); // ID específico do Carro
        if (velocidadeElement) { velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h"; }
    }
    toPlainObject() { const plain = super.toPlainObject(); plain.maxVelocidade = this.maxVelocidade; return plain; }
}

class CarroEsportivo extends Carro {
    constructor(modelo, cor, containerId, idVelocidade, idStatus, idProgressBar, idTurboStatus) {
        super(modelo, cor, containerId, idVelocidade, idStatus, idProgressBar); this.tipoVeiculo = 'CarroEsportivo'; this.maxVelocidadeNormal = 250; this.maxVelocidadeTurbo = 320; this.maxVelocidade = this.maxVelocidadeNormal; this.turboAtivado = false; this.idTurboStatus = idTurboStatus; this.cores = ["Vermelha", "Amarela", "Azul Esportivo", "Verde Limão", "Preto Fosco"]; this.indiceCorAtual = this.cores.indexOf(cor); if(this.indiceCorAtual === -1) this.indiceCorAtual = 0; this.cor = this.cores[this.indiceCorAtual];
    }
    ativarTurbo() { if (!this.ligado) { alert("Ligue o carro!"); return; } if (!this.turboAtivado) { this.turboAtivado = true; this.maxVelocidade = this.maxVelocidadeTurbo; this.velocidade = Math.min(this.velocidade + 30, this.maxVelocidade); console.log("Turbo Ativado!"); alert("Turbo Ativado!"); this.atualizarTela(); salvarGaragem(); } else { alert("Turbo já ativado!"); } }
    desativarTurbo(mostrarAlerta = true) { if (this.turboAtivado) { this.turboAtivado = false; this.maxVelocidade = this.maxVelocidadeNormal; if (this.velocidade > this.maxVelocidade) { this.velocidade = this.maxVelocidade; } console.log("Turbo Desativado!"); if(mostrarAlerta) alert("Turbo Desativado!"); this.atualizarTela(); salvarGaragem(); } else { if(mostrarAlerta) alert("Turbo já desativado!"); } }
    _executarAceleracao() { const inc = this.turboAtivado ? 20 : 15; if (this.velocidade < this.maxVelocidade) { const vAntes = this.velocidade; this.velocidade = Math.min(this.velocidade + inc, this.maxVelocidade); tocarAcelerar(); if(vAntes !== this.velocidade) salvarGaragem(); } else { alert(`O ${this.modelo} na vel. máxima (${this.maxVelocidade} km/h)!`); } }
    buzinar() { tocarBuzina(); console.log(`${this.modelo}: VRUUUUUM!`); }

    // ===== MÉTODO ATUALIZADO (CORRIGIDO) =====
    atualizarTela() {
        super.atualizarTela(); // Chama pai (Carro -> Veiculo) para cor, status base, manutenção
        // 1. Atualiza VELOCIDADE TEXTO (com ID correto)
        const velocidadeElement = this.containerElement?.querySelector('#velocidade-esportivo');
        if (velocidadeElement) { velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h"; }
        else { console.warn(`Elemento #velocidade-esportivo não encontrado para ${this.modelo}`); }
        // 2. Atualiza TURBO STATUS
        const turboStatusElement = this.containerElement?.querySelector(`#${this.idTurboStatus}`);
        if (turboStatusElement) { turboStatusElement.textContent = `Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`; }
        // 3. Atualiza BARRA DE PROGRESSO (cor e largura)
        const progressBar = this.containerElement?.querySelector(`#velocidade-progress-${this.getVeiculoId()}`);
        if (progressBar) {
            const porcentagemVelocidade = Math.min((this.velocidade / this.maxVelocidade) * 100, 100);
            progressBar.style.width = porcentagemVelocidade + "%";
            progressBar.style.backgroundColor = this.turboAtivado ? '#e74c3c' : '#3498db';
        }
    }
    // ===== FIM MÉTODO ATUALIZADO =====

    toPlainObject() { const plain = super.toPlainObject(); plain.turboAtivado = this.turboAtivado; plain.maxVelocidadeNormal = this.maxVelocidadeNormal; plain.maxVelocidadeTurbo = this.maxVelocidadeTurbo; plain.idTurboStatus = this.idTurboStatus; return plain; }
}

class Caminhao extends Carro {
    constructor(modelo, cor, containerId, idVelocidade, idStatus, idProgressBar, capacidadeCarga, idCargaAtual) {
        super(modelo, cor, containerId, idVelocidade, idStatus, idProgressBar); this.tipoVeiculo = 'Caminhao'; this.maxVelocidade = 120; this.capacidadeCarga = capacidadeCarga; this.cargaAtual = 0; this.idCargaAtual = idCargaAtual; this.cores = ["Azul Escuro", "Laranja", "Verde Musgo", "Marrom", "Branco Gelo"]; this.indiceCorAtual = this.cores.indexOf(cor); if(this.indiceCorAtual === -1) this.indiceCorAtual = 0; this.cor = this.cores[this.indiceCorAtual];
    }
    carregar(carga) { const cargaNum = Number(carga); if (isNaN(cargaNum) || cargaNum <= 0) { alert("Insira carga positiva."); return; } if (this.cargaAtual + cargaNum <= this.capacidadeCarga) { this.cargaAtual += cargaNum; this.atualizarTela(); salvarGaragem(); console.log(`Carga: ${this.cargaAtual} kg`); alert(`Carregado ${cargaNum}kg. Total: ${this.cargaAtual}kg`); const input = document.getElementById('carga'); if (input) input.value = ''; } else { alert(`Carga excede limite: ${this.capacidadeCarga} kg.`); } }
    _executarAceleracao() { const fatorCarga = Math.max(0.3, 1 - (this.cargaAtual / this.capacidadeCarga)); const inc = Math.round(8 * fatorCarga); if (this.velocidade < this.maxVelocidade) { const vAntes = this.velocidade; this.velocidade = Math.min(this.velocidade + inc, this.maxVelocidade); tocarAcelerar(); if(vAntes !== this.velocidade) salvarGaragem(); } else { alert(`O ${this.modelo} atingiu a vel. máxima!`); } }
    getFreioIncremento() { const fatorCarga = 1 + (this.cargaAtual / this.capacidadeCarga) * 0.5; return Math.max(5, Math.round(12 / fatorCarga)); }
    buzinar() { tocarBuzina(); console.log(`${this.modelo}: POOOOOOM!`); }
    atualizarTela() { // Sobrescreve para atualizar seu próprio display de velocidade E carga
        super.atualizarTela(); // Chama pai (Carro -> Veiculo)
        const velocidadeElement = this.containerElement?.querySelector('#velocidade-caminhao');
        const cargaAtualElement = this.containerElement?.querySelector(`#${this.idCargaAtual}`);
        if (velocidadeElement) { velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h"; }
        if (cargaAtualElement) { cargaAtualElement.textContent = `Carga Atual: ${this.cargaAtual} kg / ${this.capacidadeCarga} kg`; }
    }
    toPlainObject() { const plain = super.toPlainObject(); plain.capacidadeCarga = this.capacidadeCarga; plain.cargaAtual = this.cargaAtual; plain.idCargaAtual = this.idCargaAtual; return plain; }
}

class Moto extends Veiculo {
    constructor(modelo, cor, containerId, idVelocidade, idStatus, idProgressBar) {
        super(modelo, cor, containerId, 'Moto'); this.maxVelocidade = 200; this.cores = ["Preta", "Vermelha", "Azul Royal", "Branca Pérola", "Verde Kawasaki"]; this.indiceCorAtual = this.cores.indexOf(cor); if(this.indiceCorAtual === -1) this.indiceCorAtual = 0; this.cor = this.cores[this.indiceCorAtual];
    }
    _executarAceleracao() { if (this.velocidade < this.maxVelocidade) { const vAntes = this.velocidade; this.velocidade = Math.min(this.velocidade + 15, this.maxVelocidade); tocarAcelerar(); if(vAntes !== this.velocidade) salvarGaragem(); } else { alert("A moto na vel. máxima!"); } }
    getFreioIncremento() { return 12; }
    buzinar() { tocarBuzina(); console.log(`${this.modelo}: Bip Bip!`); }
     atualizarTela() { // Sobrescreve para atualizar seu próprio display de velocidade
        super.atualizarTela();
        const velocidadeElement = this.containerElement?.querySelector('#velocidade-moto');
        if (velocidadeElement) { velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h"; }
    }
    toPlainObject() { const plain = super.toPlainObject(); plain.maxVelocidade = this.maxVelocidade; return plain; }
}

class Bicicleta extends Veiculo {
    constructor(modelo, cor, containerId, idVelocidade) {
        super(modelo, cor, containerId, 'Bicicleta'); this.maxVelocidade = 40; this.ligado = true; this.cores = ["Verde", "Azul Claro", "Vermelha", "Preta", "Amarela"]; this.indiceCorAtual = this.cores.indexOf(cor); if(this.indiceCorAtual === -1) this.indiceCorAtual = 0; this.cor = this.cores[this.indiceCorAtual];
    }
    ligar() { alert("Bicicleta não liga!"); } desligar() { alert("Bicicleta não desliga!"); }
    _executarAceleracao() { if (this.velocidade < this.maxVelocidade) { const vAntes = this.velocidade; this.velocidade = Math.min(this.velocidade + 5, this.maxVelocidade); if(vAntes !== this.velocidade) salvarGaragem(); } else { alert("Bicicleta na vel. máxima!"); } }
    getFreioIncremento() { return 5; }
    buzinar() { console.log(`${this.modelo}: Trim Trim!`); alert("Trim Trim!"); }
    atualizarTela() { // Sobrescreve para atualizar apenas o necessário
         super.atualizarTela(); // Chama pai (cor, manutenção)
         const velocidadeElement = this.containerElement?.querySelector('#velocidade-bicicleta');
         if (velocidadeElement) { velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h"; }
    }
    toPlainObject() { const plain = super.toPlainObject(); plain.maxVelocidade = this.maxVelocidade; return plain; }
}


// --- PERSISTÊNCIA (LocalStorage) ---
function salvarGaragem() { /* ...como antes... */
    const garagemData = {}; for (const idVeiculo in veiculos) { if (veiculos.hasOwnProperty(idVeiculo)) { try { garagemData[idVeiculo] = veiculos[idVeiculo].toPlainObject(); } catch (error) { console.error(`Erro ao serializar ${idVeiculo}:`, error); } } } try { localStorage.setItem(STORAGE_KEY, JSON.stringify(garagemData)); } catch (error) { console.error("Erro ao salvar:", error); }
}
function carregarGaragem() { /* ...como antes... */
    const dataJson = localStorage.getItem(STORAGE_KEY); if (!dataJson) { console.log("Nenhum dado salvo."); inicializarVeiculosPadrao(); return; } try { const garagemDataPlain = JSON.parse(dataJson); veiculos = {}; for (const idVeiculo in garagemDataPlain) { if (garagemDataPlain.hasOwnProperty(idVeiculo)) { const veiculoPlain = garagemDataPlain[idVeiculo]; if(!veiculoPlain || !veiculoPlain.tipoVeiculo) { console.warn(`Dados inválidos para ${idVeiculo}. Pulando.`); continue; } let veiculoInstance = null; const containerId = veiculoPlain.containerId || `container-${idVeiculo}`; const idVelocidade = `velocidade${idVeiculo === 'carro' ? '' : '-' + idVeiculo}`; const idStatusMap = { Carro: 'statusCarro', CarroEsportivo: 'statusCarroEsportivo', Caminhao: 'statusCarroCaminhao', Moto: 'statusMoto'}; const idStatus = idStatusMap[veiculoPlain.tipoVeiculo]; const idProgressBar = `velocidade-progress-${idVeiculo}`; const idTurboStatus = veiculoPlain.idTurboStatus || `turbo-status`; const idCargaAtual = veiculoPlain.idCargaAtual || `carga-atual`; switch (veiculoPlain.tipoVeiculo) { case 'Carro': veiculoInstance = new Carro(veiculoPlain.modelo, veiculoPlain.cor, containerId, idVelocidade, idStatus, idProgressBar); break; case 'CarroEsportivo': veiculoInstance = new CarroEsportivo(veiculoPlain.modelo, veiculoPlain.cor, containerId, idVelocidade, idStatus, idProgressBar, idTurboStatus); break; case 'Caminhao': veiculoInstance = new Caminhao(veiculoPlain.modelo, veiculoPlain.cor, containerId, idVelocidade, idStatus, idProgressBar, veiculoPlain.capacidadeCarga || 10000, idCargaAtual); break; case 'Moto': veiculoInstance = new Moto(veiculoPlain.modelo, veiculoPlain.cor, containerId, idVelocidade, idStatus, idProgressBar); break; case 'Bicicleta': veiculoInstance = new Bicicleta(veiculoPlain.modelo, veiculoPlain.cor, containerId, idVelocidade); break; default: console.warn(`Tipo desconhecido: ${veiculoPlain.tipoVeiculo}`); continue; } if (veiculoInstance) { veiculoInstance.ligado = veiculoPlain.ligado || false; veiculoInstance.velocidade = veiculoPlain.velocidade || 0; if (veiculoInstance instanceof CarroEsportivo) { veiculoInstance.turboAtivado = veiculoPlain.turboAtivado || false; veiculoInstance.maxVelocidade = veiculoInstance.turboAtivado ? veiculoInstance.maxVelocidadeTurbo : veiculoInstance.maxVelocidadeNormal;} if (veiculoInstance instanceof Caminhao) { veiculoInstance.cargaAtual = veiculoPlain.cargaAtual || 0; } if(veiculoPlain.cores) veiculoInstance.cores = veiculoPlain.cores; if(veiculoPlain.indiceCorAtual !== undefined) veiculoInstance.indiceCorAtual = veiculoPlain.indiceCorAtual; veiculoInstance.cor = veiculoInstance.cores[veiculoInstance.indiceCorAtual]; veiculoInstance.historicoManutencao = (veiculoPlain.historicoManutencao || []).map(mPlain => Manutencao.fromPlainObject(mPlain)).filter(m => m !== null); veiculos[idVeiculo] = veiculoInstance; } } } console.log("Garagem carregada."); atualizarInterfaceCompleta(); verificarAgendamentosProximos(); } catch (error) { console.error("Erro ao carregar:", error); alert("Erro ao carregar. Iniciando com padrão."); localStorage.removeItem(STORAGE_KEY); inicializarVeiculosPadrao(); }
}
function inicializarVeiculosPadrao() { /* ...como antes... */
    veiculos = {}; try { veiculos.carro = new Carro('Jackson Storm', 'Preto', 'container-carro', 'velocidade', 'statusCarro', 'velocidade-progress-carro'); veiculos.carroEsportivo = new CarroEsportivo('Ferrari', 'Vermelha', 'container-carroEsportivo', 'velocidade-esportivo', 'statusCarroEsportivo', 'velocidade-progress-carroEsportivo', 'turbo-status'); veiculos.caminhao = new Caminhao('Scania', 'Azul Escuro', 'container-caminhao', 'velocidade-caminhao', 'statusCarroCaminhao', 'velocidade-progress-caminhao', 10000, 'carga-atual'); veiculos.moto = new Moto('Esportiva', 'Preta', 'container-moto', 'velocidade-moto', 'statusMoto', 'velocidade-progress-moto'); veiculos.bicicleta = new Bicicleta('Mountain Bike', 'Verde', 'container-bicicleta', 'velocidade-bicicleta'); console.log("Veículos padrão inicializados."); salvarGaragem(); atualizarInterfaceCompleta(); } catch (error) { console.error("Erro ao instanciar padrão:", error); alert("Erro crítico inicializar."); }
}
function atualizarInterfaceCompleta() { /* ...como antes... */
    for (const idVeiculo in veiculos) { if (veiculos.hasOwnProperty(idVeiculo)) { veiculos[idVeiculo].atualizarTela(); } } adicionarListenersFormularioManutencao(); /* Listeners delegados já estão no DOMContentLoaded */
}

// --- LÓGICA DA INTERFACE DE MANUTENÇÃO ---
function adicionarListenersFormularioManutencao() { /* ...como antes... */
    document.querySelectorAll('.btn-toggle-form').forEach(button => { button.removeEventListener('click', handleToggleForm, true); button.addEventListener('click', handleToggleForm, true); }); document.querySelectorAll('.btn-cancelar-form').forEach(button => { button.removeEventListener('click', handleCancelarForm, true); button.addEventListener('click', handleCancelarForm, true); }); document.querySelectorAll('.form-agendamento').forEach(form => { form.removeEventListener('submit', handleAgendarManutencao, true); form.addEventListener('submit', handleAgendarManutencao, true); });
}
function handleToggleForm(event) { /* ...como antes... */
    event.stopPropagation(); const button = event.currentTarget; const targetFormId = button.dataset.targetForm; const formElement = document.querySelector(targetFormId); if (formElement) { const isHidden = formElement.style.display === 'none' || formElement.style.display === ''; formElement.style.display = isHidden ? 'block' : 'none'; button.textContent = isHidden ? 'Ocultar Formulário' : 'Agendar Nova'; } else { console.error("Form alvo não encontrado:", targetFormId); }
}
function handleCancelarForm(event) { /* ...como antes... */
    event.stopPropagation(); const form = event.target.closest('form'); if (form) { form.style.display = 'none'; const toggleButton = document.querySelector(`.btn-toggle-form[data-target-form="#${form.id}"]`); if (toggleButton) { toggleButton.textContent = 'Agendar Nova'; } form.reset(); }
}
function handleAgendarManutencao(event) { /* ...como antes... */
    event.preventDefault(); event.stopPropagation(); const form = event.target; const veiculoId = form.veiculoId.value; const veiculo = veiculos[veiculoId]; if (!veiculo) { alert(`Erro: Veículo ${veiculoId} não encontrado.`); return; } const dataStr = form.data.value; const horaStr = form.hora.value || '00:00'; const tipo = form.tipo.value; const custo = parseFloat(form.custo.value) || 0; const descricao = form.descricao.value; if (!dataStr || !tipo) { alert("Data e Tipo são obrigatórios!"); return; } const dataCompleta = new Date(`${dataStr}T${horaStr}:00`); if (isNaN(dataCompleta.getTime())) { alert("Data/hora inválida!"); return; } const novaManutencao = new Manutencao(null, dataCompleta, tipo, custo, descricao, 'Agendada'); if (veiculo.adicionarManutencao(novaManutencao)) { alert(`Manutenção "${tipo}" agendada para ${veiculo.modelo} em ${novaManutencao.getFormattedDate()}!`); form.reset(); form.style.display = 'none'; const toggleButton = document.querySelector(`.btn-toggle-form[data-target-form="#${form.id}"]`); if (toggleButton) { toggleButton.textContent = 'Agendar Nova'; } }
}
function adicionarListenersBotoesManutencao(parentElement) { /* ...como antes... */
    if(!parentElement) return; parentElement.querySelectorAll('.btn-manutencao-status').forEach(btn => { btn.onclick = handleMarcarStatusManutencao; }); parentElement.querySelectorAll('.btn-manutencao-remover').forEach(btn => { btn.onclick = handleRemoverManutencao; });
}
function handleMarcarStatusManutencao(event) { /* ...como antes... */
    event.stopPropagation(); const button = event.currentTarget; const veiculoId = button.dataset.veiculoId; const manutencaoId = button.dataset.manutencaoId; const novoStatus = button.dataset.novoStatus; const veiculo = veiculos[veiculoId]; if (veiculo && manutencaoId && novoStatus) { const manutencao = veiculo.historicoManutencao.find(m => m.id === manutencaoId); if (manutencao && confirm(`Marcar "${manutencao.tipo}" como "${novoStatus}"?`)) { veiculo.marcarManutencaoComo(manutencaoId, novoStatus); } } else { console.error("Dados incompletos p/ marcar status"); }
}
function handleRemoverManutencao(event) { /* ...como antes... */
    event.stopPropagation(); const button = event.currentTarget; const veiculoId = button.dataset.veiculoId; const manutencaoId = button.dataset.manutencaoId; const veiculo = veiculos[veiculoId]; if (veiculo && manutencaoId) { const manutencao = veiculo.historicoManutencao.find(m => m.id === manutencaoId); if (manutencao && confirm(`REMOVER registro "${manutencao.tipo}"?`)) { veiculo.removerManutencao(manutencaoId); } } else { console.error("Dados incompletos p/ remover"); }
}
function verificarAgendamentosProximos() { /* ...como antes... */
    const agora = new Date(); agora.setHours(0, 0, 0, 0); const umDiaEmMs = 24 * 60 * 60 * 1000; const limite = new Date(agora.getTime() + umDiaEmMs * 3); let alertas = []; for (const idVeiculo in veiculos) { if (veiculos.hasOwnProperty(idVeiculo)) { const veiculo = veiculos[idVeiculo]; const agendamentos = veiculo.getHistoricoManutencao(true, true); agendamentos.forEach(m => { if (m.data <= limite) { alertas.push(`- ${veiculo.modelo}: ${m.tipo} em ${m.getFormattedDate()}`); } }); } } if (alertas.length > 0) { setTimeout(() => { alert("🔔 LEMBRETE DE AGENDAMENTOS PRÓXIMOS 🔔\n\n" + alertas.join("\n")); }, 500); }
}

// --- FUNÇÃO DE INTERAÇÃO PRINCIPAL ---
function interagirVeiculo(idVeiculo, acao) { /* ...como antes... */
    const veiculo = veiculos[idVeiculo]; if (!veiculo) { console.error("Veículo não encontrado:", idVeiculo); alert(`Erro: Veículo ${idVeiculo} não reconhecido.`); return; } console.log(`Ação: ${acao} no veículo: ${idVeiculo}`); try { switch (acao) { case 'ligar': veiculo.ligar(); break; case 'desligar': veiculo.desligar(); break; case 'acelerar': veiculo.acelerar(); break; case 'frear': veiculo.frear(); break; case 'buzinar': veiculo.buzinar(); break; case 'mudarCor': veiculo.mudarCor(); break; case 'ativarTurbo': if (veiculo.ativarTurbo) veiculo.ativarTurbo(); else alert("Sem turbo."); break; case 'desativarTurbo': if (veiculo.desativarTurbo) veiculo.desativarTurbo(); else alert("Sem turbo."); break; case 'carregar': if (veiculo.carregar) { const input = document.getElementById('carga'); if(input) veiculo.carregar(input.value); } else alert("Não pode carregar."); break; default: console.warn("Ação desconhecida:", acao); alert(`Ação ${acao} não reconhecida.`); } } catch (error) { console.error(`Erro ao executar ${acao}:`, error); alert(`Erro ao ${acao}. Veja console.`); }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarGaragem(); // Carrega ou inicializa
    // Adiciona listeners delegados para botões de ação da manutenção
    document.body.addEventListener('click', function(event) { const target = event.target; if (target.classList.contains('btn-manutencao-status')) handleMarcarStatusManutencao(event); else if (target.classList.contains('btn-manutencao-remover')) handleRemoverManutencao(event); });
    // Adiciona listeners específicos dos formulários
    adicionarListenersFormularioManutencao();
});