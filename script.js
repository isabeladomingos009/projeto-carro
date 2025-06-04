// === VARIÁVEIS GLOBAIS E CONSTANTES ===
let veiculos = {};
const STORAGE_KEY = 'garagemInteligenteData_v2';
let currentView = 'garagem';
let currentVehicleId = null;
let dadosPrevisaoAtual = null;

// A CHAVE DA API FOI MOVIDA PARA O BACKEND (server.js e .env)
// const OPENWEATHER_API_KEY = "SUA_CHAVE_AQUI_FOI_REMOVIDA"; 

// --- FUNÇÕES DE SOM ---
function tocarSom(nomeArquivo) { try { new Audio(`${nomeArquivo}`).play(); } catch (e) { console.warn(`Erro ao tocar o som '${nomeArquivo}':`, e); } }
function tocarBuzina() { tocarSom('buzina.mp3'); }
function tocarAcelerar() { tocarSom('acelerar.mp3'); }
function tocarFrear() { tocarSom('frear.mp3'); }
function tocarLigar() { tocarSom('ligar.mp3'); }
function tocarDesligar() { tocarSom('desligar.mp3'); }

// === CLASSE MANUTENCAO ===
class Manutencao {
    constructor(id, data, tipo, custo = 0, descricao = '', status = 'Agendada') {
        this.data = (data instanceof Date && !isNaN(data.getTime())) ? data : null;
        this.tipo = (typeof tipo === 'string' && tipo.trim() !== '') ? tipo.trim() : '';
        this.custo = (typeof custo === 'number' && custo >= 0) ? parseFloat(custo.toFixed(2)) : 0;
        this.descricao = String(descricao || '');
        this.status = ['Agendada', 'Realizada', 'Cancelada'].includes(status) ? status : 'Agendada';
        this.id = id || `maint-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        if (this.data === null) console.warn(`Manutenção ${this.id}: Data inválida.`);
        if (this.tipo === '') console.warn(`Manutenção ${this.id}: Tipo inválido.`);
    }
    getFormattedDate() { if (this.data) { const d=this.data; return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; } return "Data inválida"; }
    getFormattedTime() { if (this.data) { const d=this.data; return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; } return ""; }
    formatar() { if (!this.validar(false)) return `[Registro Inválido: ${this.id}]`; let s=`${this.tipo} em ${this.getFormattedDate()}`; if(this.custo>0) s+=` - R$ ${this.custo.toFixed(2).replace('.',',')}`; if(this.descricao) s+=` (${this.descricao})`; return s;}
    validar(l=true) { const d=this.data instanceof Date&&!isNaN(this.data.getTime()), t=typeof this.tipo==='string'&&this.tipo.trim().length>0, c=typeof this.custo==='number'&&this.custo>=0, s=['Agendada','Realizada','Cancelada'].includes(this.status); if(l){if(!d)console.error(`M ${this.id}: Data inválida.`); if(!t)console.error(`M ${this.id}: Tipo inválido.`); if(!c)console.error(`M ${this.id}: Custo inválido.`); if(!s)console.error(`M ${this.id}: Status inválido.`);} return d&&t&&c&&s;}
    toPlainObject() { return {id:this.id, data:this.data?this.data.toISOString():null, tipo:this.tipo, custo:this.custo, descricao:this.descricao, status:this.status};}
    static fromPlainObject(o) { if(!o)return null; const d=o.data?new Date(o.data):null; if (o.data && (d === null || isNaN(d.getTime()))) { console.warn(`Manutenção ${o.id || 'desconhecido'}: Data inválida (${o.data}). Será null.`); return new Manutencao(o.id, null, o.tipo, o.custo, o.descricao, o.status); } return new Manutencao(o.id, d, o.tipo, o.custo, o.descricao, o.status);}
}

// === CLASSE BASE VEICULO ===
class Veiculo {
    static CORES_PADRAO = ["Preto", "Branco", "Prata", "Cinza", "Vermelho", "Azul", "Verde"];
    constructor(modelo, cor, tipoVeiculo = 'Veiculo', idVeiculo) {
        if (!modelo || !cor || !idVeiculo) throw new Error("Modelo, cor e idVeiculo obrigatórios.");
        this.idVeiculo=idVeiculo; this.modelo=String(modelo); this.tipoVeiculo=String(tipoVeiculo); this.ligado=false; this.velocidade=0; this.historicoManutencao=[]; this.cores=[...Veiculo.CORES_PADRAO]; this.indiceCorAtual = this.cores.indexOf(String(cor)); if(this.indiceCorAtual===-1){console.warn(`Cor "${cor}" não encontrada para ${this.modelo}(${idVeiculo}). Usando ${this.cores[0]}.`); this.indiceCorAtual=0;} this.cor=this.cores[this.indiceCorAtual]; this.maxVelocidade=50;
    }
    ligar(){if(this.tipoVeiculo==='Bicicleta'){alert("Bicicleta não liga!");return;} if(!this.ligado){this.ligado=true;tocarLigar();console.log(`${this.modelo}(${this.idVeiculo}) ligado.`);this.atualizarTela();salvarGaragem();}else{alert(`${this.modelo} já ligado!`);}}
    desligar(){if(this.tipoVeiculo==='Bicicleta'){alert("Bicicleta não desliga!");return;} if(this.ligado){this.ligado=false;this.velocidade=0;tocarDesligar();if(typeof this.desativarTurbo === 'function')this.desativarTurbo(false);console.log(`${this.modelo}(${this.idVeiculo}) desligado.`);this.atualizarTela();salvarGaragem();}else{alert(`${this.modelo} já desligado!`);}}
    acelerar(){if(!this.ligado&&this.tipoVeiculo!=='Bicicleta'){alert(`${this.modelo}(${this.idVeiculo}) precisa estar ligado!`);return;} this._executarAceleracao();}
    _executarAceleracao(){const i=5, vA=this.velocidade; if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade); if(this.velocidade!==vA){if(this.tipoVeiculo!=='Bicicleta')tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert(`${this.modelo} na vel. máxima!`);}}
    frear(){if(this.velocidade>0){const vA=this.velocidade;this.velocidade=Math.max(0,this.velocidade-this.getFreioIncremento());if(this.velocidade<=5&&this.tipoVeiculo!=='Bicicleta')this.velocidade=0; if(this.velocidade!==vA){tocarFrear();this.atualizarTela();salvarGaragem();}}else{alert(`${this.modelo} já parado!`);}}
    getFreioIncremento(){return 10;}
    mudarCor(){if(this.cores&&this.cores.length>1){this.indiceCorAtual=(this.indiceCorAtual+1)%this.cores.length;this.cor=this.cores[this.indiceCorAtual];alert(`Cor do ${this.tipoVeiculo}(${this.modelo}) mudou para ${this.cor}`);this.atualizarTela();salvarGaragem();}else{alert("Não há outras cores.");}}
    buzinar(){tocarBuzina(); console.log(`${this.modelo}(${this.idVeiculo}): Buzina!`);}
    adicionarManutencao(manutencaoObj) { console.log(`[${this.idVeiculo}] Iniciando adicionarManutencao...`); if (!(manutencaoObj instanceof Manutencao)) { console.error(`[${this.idVeiculo}] Tentativa de adicionar objeto inválido.`); alert("Erro interno: O objeto de manutenção é inválido."); return false; } if (!manutencaoObj.validar(true)) { console.error(`[${this.idVeiculo}] Falha na validação da manutenção.`); alert("Erro: Dados de manutenção inválidos. Verifique o console."); return false; } try { this.historicoManutencao.push(manutencaoObj); this.historicoManutencao.sort((a, b) => (a.data?.getTime() || Infinity) - (b.data?.getTime() || Infinity)); console.log(`[${this.idVeiculo}] Manutenção ${manutencaoObj.id} adicionada e histórico ordenado.`); salvarGaragem(); verificarAgendamentosProximos(); if (currentView === 'detalhes' && currentVehicleId === this.idVeiculo) { this.atualizarDisplayManutencao(); } return true; } catch(e) { console.error(`[${this.idVeiculo}] Erro ao adicionar/ordenar/salvar manutenção:`, e); alert("Erro interno ao processar a manutenção."); return false; } }
    removerManutencao(idManutencao){const i=this.historicoManutencao.findIndex(m=>m.id===idManutencao);if(i>-1){const r=this.historicoManutencao.splice(i,1)[0];console.log(`Manut. removida p/ ${this.idVeiculo}: ID ${r.id}, Tipo ${r.tipo}`);if(currentView === 'detalhes' && currentVehicleId === this.idVeiculo){this.atualizarDisplayManutencao();}salvarGaragem();return true;}console.warn(`Manut. ${idManutencao} não encontrada em ${this.idVeiculo}.`);return false;}
    marcarManutencaoComo(idManutencao, novoStatus){const m=this.historicoManutencao.find(m=>m.id===idManutencao);if(!m){console.warn(`Manut. ${idManutencao} não encontrada em ${this.idVeiculo}.`);return false;}const sV=['Agendada','Realizada','Cancelada'];if(!sV.includes(novoStatus)){console.error(`Status inválido: ${novoStatus}`);alert(`Status inválido: ${novoStatus}`);return false;}m.status=novoStatus;console.log(`Status manut. ${idManutencao}(${m.tipo}) alterado p/ ${novoStatus} em ${this.idVeiculo}`);if(currentView === 'detalhes' && currentVehicleId === this.idVeiculo){this.atualizarDisplayManutencao();}salvarGaragem();if(novoStatus!=='Agendada')verificarAgendamentosProximos();return true;}
    getHistoricoManutencao(apenasFuturas=false, apenasAgendadas=false){const agora=new Date();agora.setHours(0,0,0,0);const umDia=24*60*60*1000;return this.historicoManutencao.filter(m=>{if(!m||!(m.data instanceof Date)||isNaN(m.data.getTime()))return false;const dS=new Date(m.data);dS.setHours(0,0,0,0);const fH=dS>=agora;const a=m.status==='Agendada';if(apenasAgendadas&&!a)return false;if(apenasFuturas&&!fH)return false;return true;});}
    atualizarTela(){ if(currentView!=='detalhes'||currentVehicleId!==this.idVeiculo)return; const c=document.getElementById(`vehicle-detail-${this.idVeiculo}`); if(!c){console.error(`Container #vehicle-detail-${this.idVeiculo} não encontrado.`);return;} const cE=c.querySelector('.info-cor');if(cE)cE.textContent=`Cor: ${this.cor}`; if(this.tipoVeiculo!=='Bicicleta'){const sE=c.querySelector('.status-ligado');if(sE){sE.textContent=this.ligado?`${this.tipoVeiculo} ligado`:`${this.tipoVeiculo} desligado`;sE.className=`status-ligado ${this.ligado?"ligado":"desligado"}`;}} const vE=c.querySelector('.status-velocidade');if(vE)vE.textContent=`Velocidade: ${this.velocidade} km/h`; const pB=c.querySelector('.velocidade-progress-bar'); const pC=c.querySelector('.velocidade-progress'); if(pB&&this.maxVelocidade>0){ const p=Math.min((this.velocidade/this.maxVelocidade)*100,100); pB.style.width=`${p}%`; pB.style.backgroundColor='#3498db'; if(pC)pC.title=`${this.velocidade} km/h / ${this.maxVelocidade} km/h`; }else if(pB){ pB.style.width="0%"; pB.style.backgroundColor='#3498db'; if(pC)pC.title=`0 km/h`; } if(typeof this.atualizarTelaTurbo === 'function')this.atualizarTelaTurbo(c); if(typeof this.atualizarTelaCarga === 'function')this.atualizarTelaCarga(c); this.atualizarDisplayManutencao(c); }
    atualizarDisplayManutencao(containerElement = null) { if (!containerElement && currentView === 'detalhes' && currentVehicleId === this.idVeiculo) { containerElement = document.getElementById(`vehicle-detail-${this.idVeiculo}`); } if (!containerElement) return; console.log(`[${this.idVeiculo}] Atualizando display de manutenção na view de detalhes.`); const agendamentosDiv = containerElement.querySelector('.manutencao-agendamentos'); const historicoDiv = containerElement.querySelector('.manutencao-historico'); if (!agendamentosDiv || !historicoDiv) { console.error(`[${this.idVeiculo}] Erro: Divs de manutenção não encontradas.`); return; } try { agendamentosDiv.innerHTML = this._getHistoricoManutencaoHTML(true, true); historicoDiv.innerHTML = this._getHistoricoManutencaoHTML(false, false); } catch(e) { console.error(`[${this.idVeiculo}] Erro ao atualizar display de manutenção:`, e); } }
    _getHistoricoManutencaoHTML(apenasFuturas, apenasAgendadas) { const historicoFiltrado = this.getHistoricoManutencao(apenasFuturas, apenasAgendadas); let titulo = ""; let msgVazio = ""; if (apenasFuturas && apenasAgendadas) {titulo="<h4>Agendamentos Futuros</h4>"; msgVazio="<p>Nenhum agendamento futuro ativo.</p>";} else if (!apenasFuturas && !apenasAgendadas) {titulo="<h4>Histórico Completo</h4>"; msgVazio="<p>Nenhum registro encontrado.</p>";} else {titulo="<h4>Registros Filtrados</h4>"; msgVazio="<p>Nenhum registro encontrado.</p>";} if (historicoFiltrado.length === 0) return titulo + msgVazio; let html = titulo + '<ul>'; try { historicoFiltrado.forEach(m => { let botoesAcao = ''; if (m.status === 'Agendada') { botoesAcao += `<button class="btn-manutencao-status" data-action="marcar-status" data-manutencao-id="${m.id}" data-novo-status="Realizada" title="Marcar como Realizada">✅</button>`; botoesAcao += `<button class="btn-manutencao-status" data-action="marcar-status" data-manutencao-id="${m.id}" data-novo-status="Cancelada" title="Cancelar Agendamento">❌</button>`;} botoesAcao += `<button class="btn-manutencao-remover" data-action="remover-manutencao" data-manutencao-id="${m.id}" title="Remover Registro">🗑️</button>`; const itemFormatado = m.formatar(); const statusInfo = m.status !== 'Agendada' ? ` <span>(${m.status})</span>` : ''; html += `<li data-manutencao-id="${m.id}"><span class="manutencao-info">${itemFormatado}${statusInfo}</span><div class="manutencao-actions">${botoesAcao}</div></li>`; }); html += '</ul>'; return html; } catch (e) { console.error(`[${this.idVeiculo}] Erro ao gerar HTML da lista:`, e); return titulo + '<p style="color:red;">Erro ao gerar lista.</p>'; } }
    toPlainObject(){return{idVeiculo:this.idVeiculo,tipoVeiculo:this.tipoVeiculo,modelo:this.modelo,cor:this.cor,ligado:this.ligado,velocidade:this.velocidade,cores:this.cores,indiceCorAtual:this.indiceCorAtual,maxVelocidade:this.maxVelocidade,historicoManutencao:this.historicoManutencao.map(m=>m.toPlainObject())};}
}
class Carro extends Veiculo{static CORES_CARRO=["Prata","Branco","Preto","Cinza","Vermelho","Azul"];constructor(m,c,id){super(m,c,'Carro',id);this.maxVelocidade=180;this.cores=[...Carro.CORES_CARRO];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}_executarAceleracao(){const i=10,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert(`O ${this.modelo} atingiu vel. máx (${this.maxVelocidade} km/h)!`);}}buzinar(){tocarBuzina();alert(`${this.modelo}: Fom Fom!`);console.log(`${this.modelo}(${this.idVeiculo}): Buzina(Carro)`);}toPlainObject(){return super.toPlainObject();}}
class CarroEsportivo extends Carro{static CORES_ESPORTIVO=["Vermelha","Amarela","Azul Esportivo","Verde Limão","Preto Fosco"];constructor(m,c,id,idTS){super(m,c,id);this.tipoVeiculo='CarroEsportivo';this.maxVelocidadeNormal=250;this.maxVelocidadeTurbo=320;this.maxVelocidade=this.maxVelocidadeNormal;this.turboAtivado=false;this.idTurboStatusElement=idTS||`turbo-status-${id}`;this.cores=[...CarroEsportivo.CORES_ESPORTIVO];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}ativarTurbo(){if(!this.ligado){alert("Ligue o carro!");return;}if(!this.turboAtivado){this.turboAtivado=true;this.maxVelocidade=this.maxVelocidadeTurbo;console.log("Turbo Ativado!");alert("Turbo Ativado!");this.atualizarTela();salvarGaragem();}else{alert("Turbo já ativado!");}}desativarTurbo(a=true){if(this.turboAtivado){this.turboAtivado=false;this.maxVelocidade=this.maxVelocidadeNormal;if(this.velocidade>this.maxVelocidade)this.velocidade=this.maxVelocidade;console.log("Turbo Desativado!");if(a)alert("Turbo Desativado!");this.atualizarTela();salvarGaragem();}else if(a){alert("Turbo já desativado!");}}_executarAceleracao(){const i=this.turboAtivado?25:15,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelererar();this.atualizarTela();salvarGaragem();}}else{alert(`O ${this.modelo} na vel. máx (${this.maxVelocidade} km/h)!`);}}desligar(){super.desligar();}buzinar(){tocarBuzina();alert(`${this.modelo}: VRUUUUUM!`);console.log(`${this.modelo}(${this.idVeiculo}): Buzina(Esportivo)`);}atualizarTelaTurbo(c){if(!c)return;const tE=c.querySelector(`#${this.idTurboStatusElement}`);if(tE)tE.textContent=`Turbo: ${this.turboAtivado?"Ativado":"Desativado"}`;const pB=c.querySelector('.velocidade-progress-bar');if(pB)pB.style.backgroundColor=this.turboAtivado?'#e74c3c':'#3498db';}toPlainObject(){const p=super.toPlainObject();p.turboAtivado=this.turboAtivado;p.maxVelocidadeNormal=this.maxVelocidadeNormal;p.maxVelocidadeTurbo=this.maxVelocidadeTurbo;p.idTurboStatus=this.idTurboStatusElement;return p;}}
class Caminhao extends Carro{static CORES_CAMINHAO=["Azul Escuro","Laranja","Verde Musgo","Marrom","Branco Gelo"];constructor(m,c,id,cap,idC){super(m,c,id);this.tipoVeiculo='Caminhao';this.maxVelocidade=120;this.capacidadeCarga=cap>0?cap:10000;this.cargaAtual=0;this.idCargaAtualElement=idC||`carga-atual-${id}`;this.cores=[...Caminhao.CORES_CAMINHAO];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}carregar(inputId){const cI=document.getElementById(inputId);if(!cI){console.error(`Input #${inputId} não encontrado!`);alert("Erro: Campo carga não encontrado.");return;}const cV=cI.value;const cN=Number(cV);if(isNaN(cN)||cN<=0){alert("Insira carga válida.");return;}if(this.cargaAtual+cN<=this.capacidadeCarga){this.cargaAtual+=cN;console.log(`Caminhão ${this.idVeiculo} carregado: ${cN.toFixed(0)}kg. Total: ${this.cargaAtual.toFixed(0)}kg`);alert(`Carregado ${cN.toFixed(0)}kg. Total: ${this.cargaAtual.toFixed(0)}kg.`);cI.value='';this.atualizarTela();salvarGaragem();}else{const eL=this.capacidadeCarga-this.cargaAtual;alert(`Carga excessiva! Espaço: ${eL.toFixed(0)} kg.`);}}_executarAceleracao(){const fC=this.capacidadeCarga>0?Math.max(0.4,1-(this.cargaAtual/(this.capacidadeCarga*1.5))):1;const iB=8;const i=Math.round(iB*fC);const vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert(`O ${this.modelo} atingiu vel. máx!`);}}getFreioIncremento(){const fC=this.capacidadeCarga>0?1+(this.cargaAtual/this.capacidadeCarga)*0.5:1;const fB=10;return Math.max(4,Math.round(fB/fC));}buzinar(){tocarBuzina();alert(`${this.modelo}: PÓÓÓÓÓÓM!`);console.log(`${this.modelo}(${this.idVeiculo}): Buzina(Caminhao)`);}atualizarTelaCarga(c){if(!c)return;const cE=c.querySelector(`#${this.idCargaAtualElement}`);if(cE)cE.textContent=`Carga: ${this.cargaAtual.toFixed(0)} kg / ${this.capacidadeCarga.toFixed(0)} kg`;}toPlainObject(){const p=super.toPlainObject();p.capacidadeCarga=this.capacidadeCarga;p.cargaAtual=this.cargaAtual;p.idCargaAtual=this.idCargaAtualElement;return p;}}
class Moto extends Veiculo{static CORES_MOTO=["Preta","Vermelha","Azul Royal","Branca Pérola","Verde Kawasaki"];constructor(m,c,id){super(m,c,'Moto',id);this.maxVelocidade=200;this.cores=[...Moto.CORES_MOTO];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}_executarAceleracao(){const i=18,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert("Moto vel. máxima!");}}getFreioIncremento(){return 15;}buzinar(){tocarBuzina();alert(`${this.modelo}: Bip Bip!`);console.log(`${this.modelo}(${this.idVeiculo}): Buzina(Moto)`);}toPlainObject(){return super.toPlainObject();}}
class Bicicleta extends Veiculo{static CORES_BICICLETA=["Verde","Azul Claro","Vermelha","Preta","Amarela"];constructor(m,c,id){super(m,c,'Bicicleta',id);this.maxVelocidade=40;this.ligado=true;this.cores=[...Bicicleta.CORES_BICICLETA];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}ligar(){alert("Bike não liga!");}desligar(){alert("Bike não desliga!");}_executarAceleracao(){const i=5,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){this.atualizarTela();salvarGaragem();}}else{alert("Bike vel. máxima!");}}frear(){if(this.velocidade>0){const vA=this.velocidade;this.velocidade=Math.max(0,this.velocidade-this.getFreioIncremento());if(this.velocidade!==vA){this.atualizarTela();salvarGaragem();}}else{alert(`${this.modelo} parada!`);}}getFreioIncremento(){return 6;}buzinar(){console.log(`${this.modelo}: Trim Trim!`);alert("Trim Trim!");}toPlainObject(){return super.toPlainObject();}}

// --- PERSISTÊNCIA ---
function salvarGaragem(){const d={};for(const id in veiculos){if(veiculos.hasOwnProperty(id)){try{d[id]=veiculos[id].toPlainObject();}catch(e){console.error(`Erro ao serializar ${id}:`,e);}}}try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));console.log("Garagem salva.");}catch(e){console.error("Erro ao salvar no LS:",e);alert("ERRO: Não foi possível salvar!");}}
function carregarGaragem(){ console.log(`Carregando dados da garagem da chave: ${STORAGE_KEY}`); const jsonData = localStorage.getItem(STORAGE_KEY); veiculos = {}; if (!jsonData) { console.log("Nenhum dado salvo encontrado. Inicializando com veículos padrão."); inicializarVeiculosPadrao(); return; } try { const plainObjects = JSON.parse(jsonData); let veiculosCarregados = 0; let falhas = 0; for (const id in plainObjects) { if (plainObjects.hasOwnProperty(id)) { const obj = plainObjects[id]; let veiculoInstance = null; try { switch (obj.tipoVeiculo) { case 'Carro': veiculoInstance = new Carro(obj.modelo, obj.cor, obj.idVeiculo); break; case 'CarroEsportivo': const idTS = obj.idTurboStatus || `turbo-status-${obj.idVeiculo}`; veiculoInstance = new CarroEsportivo(obj.modelo, obj.cor, obj.idVeiculo, idTS); veiculoInstance.turboAtivado = obj.turboAtivado || false; veiculoInstance.maxVelocidadeNormal = obj.maxVelocidadeNormal || 250; veiculoInstance.maxVelocidadeTurbo = obj.maxVelocidadeTurbo || 320; veiculoInstance.maxVelocidade = veiculoInstance.turboAtivado ? veiculoInstance.maxVelocidadeTurbo : veiculoInstance.maxVelocidadeNormal; break; case 'Caminhao': const cap = obj.capacidadeCarga || 10000; const idC = obj.idCargaAtual || `carga-atual-${obj.idVeiculo}`; veiculoInstance = new Caminhao(obj.modelo, obj.cor, obj.idVeiculo, cap, idC); veiculoInstance.cargaAtual = obj.cargaAtual || 0; break; case 'Moto': veiculoInstance = new Moto(obj.modelo, obj.cor, obj.idVeiculo); break; case 'Bicicleta': veiculoInstance = new Bicicleta(obj.modelo, obj.cor, obj.idVeiculo); break; default: console.warn(`Tipo de veículo desconhecido: ${obj.tipoVeiculo} (ID: ${id}). Ignorando.`); falhas++; continue; } if (veiculoInstance) { veiculoInstance.ligado = obj.ligado || false; veiculoInstance.velocidade = obj.velocidade || 0; if (Array.isArray(obj.cores)) veiculoInstance.cores = obj.cores; if (typeof obj.indiceCorAtual === 'number') veiculoInstance.indiceCorAtual = obj.indiceCorAtual; if(veiculoInstance.indiceCorAtual >= 0 && veiculoInstance.indiceCorAtual < veiculoInstance.cores.length) { veiculoInstance.cor = veiculoInstance.cores[veiculoInstance.indiceCorAtual]; } else { console.warn(`[${id}] Índice de cor inválido (${obj.indiceCorAtual}). Resetando.`); veiculoInstance.indiceCorAtual = 0; veiculoInstance.cor = veiculoInstance.cores[0]; } if (!(veiculoInstance instanceof CarroEsportivo) && typeof obj.maxVelocidade === 'number') { veiculoInstance.maxVelocidade = obj.maxVelocidade; } veiculoInstance.historicoManutencao = (Array.isArray(obj.historicoManutencao) ? obj.historicoManutencao : []) .map(mPlain => Manutencao.fromPlainObject(mPlain)) .filter(m => m !== null && m.validar(false)); veiculoInstance.historicoManutencao.sort((a, b) => (a.data?.getTime() || Infinity) - (b.data?.getTime() || Infinity)); veiculos[id] = veiculoInstance; veiculosCarregados++; } } catch (error) { console.error(`Erro ao recriar instância do veículo ID ${id}:`, error, obj); falhas++; } } } console.log(`Garagem carregada: ${veiculosCarregados} sucesso, ${falhas} falhas.`); verificarAgendamentosProximos(); } catch (e) { console.error("Erro ao parsear JSON ou processar veículos:", e); alert("ERRO ao carregar garagem. Redefinindo para o padrão."); localStorage.removeItem(STORAGE_KEY); inicializarVeiculosPadrao(); } }
function inicializarVeiculosPadrao(){veiculos={};console.log("Inicializando padrão...");try{const idC='c-jstorm',idS='s-ferrari',idT='t-scania',idM='m-esport',idB='b-mtb';veiculos[idC]=new Carro('Jackson Storm','Preto',idC);veiculos[idS]=new CarroEsportivo('Ferrari','Vermelha',idS,`turbo-${idS}`);veiculos[idT]=new Caminhao('Scania','Azul Escuro',idT,10000,`carga-${idT}`);veiculos[idM]=new Moto('Esportiva','Vermelha',idM);veiculos[idB]=new Bicicleta('Mountain Bike','Verde',idB);console.log("Padrão criado:",Object.keys(veiculos));salvarGaragem();}catch(e){console.error("Erro crítico ao instanciar padrão:",e);alert("ERRO GRAVE inicialização.");veiculos={};}}

// --- RENDERIZAÇÃO DAS VIEWS ---
const mainContentElement = document.getElementById('main-content');
const planejadorContainerElement = document.getElementById('planejador-viagem-container');

function renderApp() {
    if (!mainContentElement || !planejadorContainerElement){console.error("Erro: Elemento #main-content ou #planejador-viagem-container não encontrado!");return;}
    console.log(`Renderizando view: ${currentView}`+(currentVehicleId?` (${currentVehicleId})`:''));

    if (currentView === 'planejar') {
        mainContentElement.innerHTML = ''; 
         mainContentElement.style.display = 'none'; 
         planejadorContainerElement.style.display = 'block'; 
    } else {
         planejadorContainerElement.style.display = 'none'; 
         mainContentElement.style.display = 'block'; 
        mainContentElement.innerHTML = '<p>Carregando...</p>'; 
    }

    updateNavButtons();

    try {
        switch (currentView) {
            case 'garagem': renderGarageView(); break;
            case 'detalhes': if (currentVehicleId && veiculos[currentVehicleId]) { renderVehicleDetailView(veiculos[currentVehicleId]); } else { console.error(`Erro render detalhes: ID inválido ${currentVehicleId}`); alert("Erro: Veículo não encontrado."); navigateToView('garagem'); } break;
            case 'agendar': renderAgendarView(); break;
            case 'planejar': console.log("Exibindo a seção Planejar Viagem."); break; 
            default: console.warn(`View desconhecida: ${currentView}. Voltando p/ garagem.`); navigateToView('garagem');
        }
    } catch (error) {
        console.error(`Erro renderizando view '${currentView}':`, error);
         if (currentView !== 'planejar') { mainContentElement.innerHTML = `<h2>Erro ao Renderizar</h2><p>Ocorreu um erro.</p><p style="color:red; font-size:0.8em;">${error.message}</p>`; }
    }
    setupDynamicEventListeners(); 
}

// ▼▼▼ FUNÇÃO renderGarageView MODIFICADA PARA SELEÇÃO DE IMAGEM ▼▼▼
function renderGarageView() {
    mainContentElement.innerHTML = '<h2>Minha Garagem</h2>';
    const container = document.createElement('div');
    container.className = 'garage-view';
    const ids = Object.keys(veiculos);
    if (ids.length === 0) {
        container.innerHTML = '<p>Sua garagem está vazia.</p>';
    } else {
        ids.forEach(id => {
            const v = veiculos[id];
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.dataset.vehicleId = id;
            card.setAttribute('role', 'button');
            card.tabIndex = 0;

            // --- Lógica de seleção de imagem (Alterada aqui) ---
            let img = 'carrodomal.png'; // Imagem padrão/fallback

            if (v.modelo === 'Jackson Storm') {
                img = 'JacksonStormCars3Artwork.webp'; // Imagem específica para Jackson Storm
            } else if (v.modelo === 'Ferrari') {
                img = 'ferrari.png'; // Imagem específica para Ferrari
            } else if (v.modelo === 'Scania') {
                img = 'scania.png'; // Imagem específica para Scania
            } else if (v.modelo === 'Mountain Bike') { // Assumindo que 'bilecerta.webp' é para a Mountain Bike
                img = 'bilecerta.webp'; // Imagem específica para Mountain Bike (verificar nome do arquivo)
            } else if (v.tipoVeiculo === 'CarroEsportivo') {
                img = 'carroesportivo.png'; // Genérica para outros Esportivos
            } else if (v.tipoVeiculo === 'Caminhao') {
                img = 'caminhao.png'; // Genérica para outros Caminhões
            } else if (v.tipoVeiculo === 'Moto') {
                img = 'moto.png'; // Genérica para todas as Motos (já era 'moto.png')
            } else if (v.tipoVeiculo === 'Bicicleta') {
                img = 'bicicleta.png'; // Genérica para outras Bicicletas
            } else if (v.tipoVeiculo === 'Carro') { 
                img = 'carro.png'; // Genérica para outros Carros
            }
             // --- Fim da lógica de seleção de imagem ---


            card.innerHTML = `<img src="imagens/${img}" alt="${v.tipoVeiculo} ${v.modelo}"><h3>${v.modelo}</h3><p>Tipo: ${v.tipoVeiculo}</p><p class="info-cor">Cor: ${v.cor}</p>`;
            container.appendChild(card);
        });
    }
    mainContentElement.appendChild(container);
}
// ▲▲▲ FIM da função renderGarageView MODIFICADA ▲▲▲

// ▼▼▼ FUNÇÃO renderVehicleDetailView MODIFICADA PARA SELEÇÃO DE IMAGEM ▼▼▼
function renderVehicleDetailView(veiculo) {
    if (!veiculo) return;
    const container = document.createElement('div');
    container.className = 'vehicle vehicle-detail-view';
    container.id = `vehicle-detail-${veiculo.idVeiculo}`;

    // --- Lógica de seleção de imagem (Alterada aqui - igual à renderGarageView para consistência) ---
    let img = 'carrodomal.png'; // Imagem padrão/fallback

     if (veiculo.modelo === 'Jackson Storm') {
        img = 'JacksonStormCars3Artwork.webp'; // Imagem específica para Jackson Storm
    } else if (veiculo.modelo === 'Ferrari') {
        img = 'ferrari.png'; // Imagem específica para Ferrari
    } else if (veiculo.modelo === 'Scania') {
        img = 'scania.png'; // Imagem específica para Scania
    } else if (veiculo.modelo === 'Mountain Bike') { // Assumindo que 'bilecerta.webp' é para a Mountain Bike
        img = 'bilecerta.webp'; // Imagem específica para Mountain Bike (verificar nome do arquivo)
    } else if (veiculo.tipoVeiculo === 'CarroEsportivo') {
        img = 'carroesportivo.png'; // Genérica para outros Esportivos
    } else if (veiculo.tipoVeiculo === 'Caminhao') {
        img = 'caminhao.png'; // Genérica para outros Caminhões
    } else if (veiculo.tipoVeiculo === 'Moto') {
        img = 'moto.png'; // Genérica para todas as Motos (já era 'moto.png')
    } else if (veiculo.tipoVeiculo === 'Bicicleta') {
        img = 'bicicleta.png'; // Genérica para outras Bicicletas
    } else if (veiculo.tipoVeiculo === 'Carro') { 
        img = 'carro.png'; // Genérica para outros Carros
    }
    // --- Fim da lógica de seleção de imagem ---

    let header = `<h2>${veiculo.modelo} <span style="font-weight:normal; font-size: 0.8em; color: #555;">(${veiculo.tipoVeiculo})</span></h2><img src="imagens/${img}" id="imagem-${veiculo.idVeiculo}" alt="${veiculo.tipoVeiculo} ${veiculo.modelo}">`;
    let info = `<div class="info"><p>Modelo: ${veiculo.modelo}</p><p class="info-cor">Cor: ${veiculo.cor}</p>${(veiculo instanceof Caminhao)?`<p>Capacidade: ${veiculo.capacidadeCarga.toFixed(0)} kg</p>`:''}</div>`;
    let controls = '<div class="controls">';
    if (veiculo.tipoVeiculo !== 'Bicicleta') {
        controls += `<button data-action="ligar" data-vehicle-id="${veiculo.idVeiculo}">Ligar</button><button data-action="desligar" data-vehicle-id="${veiculo.idVeiculo}">Desligar</button>`;
    }
    controls += `<button data-action="acelerar" data-vehicle-id="${veiculo.idVeiculo}">Acelerar</button><button data-action="frear" data-vehicle-id="${veiculo.idVeiculo}">Frear</button><button data-action="buzinar" data-vehicle-id="${veiculo.idVeiculo}">Buzinar</button>`;
    if (veiculo.cores && veiculo.cores.length > 1) controls += `<button data-action="mudarCor" data-vehicle-id="${veiculo.idVeiculo}">Mudar Cor</button>`;
    if (veiculo instanceof CarroEsportivo) controls += `<button data-action="ativarTurbo" data-vehicle-id="${veiculo.idVeiculo}">Ativar Turbo</button><button data-action="desativarTurbo" data-vehicle-id="${veiculo.idVeiculo}">Desativar Turbo</button>`;
    if (veiculo instanceof Caminhao) {
        const cId = `carga-input-${veiculo.idVeiculo}`;
        controls += `<div><label for="${cId}">Carga (kg):</label><input type="number" id="${cId}" min="0" placeholder="0" step="100"><button data-action="carregar" data-vehicle-id="${veiculo.idVeiculo}" data-input-id="${cId}">Carregar</button></div>`;
    }
    controls += '</div>';
    let status = '<div class="status">';
    if (veiculo.tipoVeiculo !== 'Bicicleta') status += `<p class="status-ligado ${veiculo.ligado?'ligado':'desligado'}">${veiculo.ligado?veiculo.tipoVeiculo+' ligado':veiculo.tipoVeiculo+' desligado'}</p>`;
    if (veiculo instanceof CarroEsportivo) status += `<p id="${veiculo.idTurboStatusElement}">Turbo: ${veiculo.turboAtivado?"Ativado":"Desativado"}</p>`;
    status += `<p class="status-velocidade">Velocidade: ${veiculo.velocidade} km/h</p>`;
    if (veiculo instanceof Caminhao) status += `<p id="${veiculo.idCargaAtualElement}">Carga: ${veiculo.cargaAtual.toFixed(0)} kg / ${veiculo.capacidadeCarga.toFixed(0)} kg</p>`;
    if (veiculo.maxVelocidade > 0) {
        const p = Math.min((veiculo.velocidade / veiculo.maxVelocidade) * 100, 100);
        const bC = (veiculo instanceof CarroEsportivo && veiculo.turboAtivado) ? '#e74c3c' : '#3498db';
        status += `<div class="velocidade-progress" title="${veiculo.velocidade} km/h / ${veiculo.maxVelocidade} km/h"><div class="velocidade-progress-bar" style="width: ${p}%; background-color: ${bC};"></div></div>`;
    }
    status += '</div>';
    const agendamentosContainerClass = `manutencao-agendamentos`;
    const historicoContainerClass = `manutencao-historico`;
    let manutencaoHTML = `<div class="manutencao-section"><h3>Histórico e Agendamentos</h3><div class="${agendamentosContainerClass}">${veiculo._getHistoricoManutencaoHTML(true, true)}</div><div class="${historicoContainerClass}">${veiculo._getHistoricoManutencaoHTML(false, false)}</div></div>`;
    let detalhesApiHTML = `<div class="detalhes-api-section"><h4>Detalhes Adicionais (Simulado)</h4><button class="btn-buscar-api" data-action="buscar-detalhes-api" data-vehicle-id="${veiculo.idVeiculo}">Ver Detalhes Extras</button><div id="resultado-api-${veiculo.idVeiculo}" class="resultado-api" style="display: none;"></div></div>`;
    container.innerHTML = header + info + controls + status + manutencaoHTML + detalhesApiHTML;
    mainContentElement.innerHTML = '';
    mainContentElement.appendChild(container);
    veiculo.atualizarTela();
}
// ▲▲▲ FIM da função renderVehicleDetailView MODIFICADA ▲▲▲


function renderAgendarView() { const container = document.createElement('div'); container.className = 'agendar-view'; container.innerHTML = '<h2>Agendar Nova Manutenção</h2>'; const selectorDiv = document.createElement('div'); selectorDiv.className = 'vehicle-selector'; let selectorHTML = `<label for="vehicle-select-schedule">Selecione o Veículo:</label><select id="vehicle-select-schedule" name="vehicleId"><option value="">-- Selecione --</option>`; const vehicleIds = Object.keys(veiculos); if (vehicleIds.length > 0) { vehicleIds.forEach(id => { selectorHTML += `<option value="${id}">${veiculos[id].modelo} (${veiculos[id].tipoVeiculo})</option>`; }); } else { selectorHTML += `<option value="" disabled>Nenhum veículo</option>`; } selectorHTML += `</select>`; selectorDiv.innerHTML = selectorHTML; container.appendChild(selectorDiv); const formContainer = document.createElement('div'); formContainer.id = 'agendar-maintenance-form-container'; formContainer.className = 'hidden'; formContainer.innerHTML = `<p id="select-vehicle-message">Selecione um veículo.</p>`; container.appendChild(formContainer); mainContentElement.innerHTML = ''; mainContentElement.appendChild(container); const vehicleSelect = document.getElementById('vehicle-select-schedule'); if (vehicleSelect) { vehicleSelect.addEventListener('change', handleVehicleSelectionChange); } else { console.error("Erro: Select #vehicle-select-schedule não encontrado."); } }

// --- FUNÇÕES API SIMULADA (para detalhes do veículo) ---
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) { const apiUrl = './dados_veiculos_api.json'; console.log(`[API SIMULADA] Buscando: ${identificadorVeiculo}`); try { const response = await fetch(apiUrl); if (!response.ok) { throw new Error(`Erro HTTP: ${response.status}`); } const dadosTodosVeiculos = await response.json(); const detalhesVeiculo = dadosTodosVeiculos.find(v => v.idVeiculo === identificadorVeiculo); if (detalhesVeiculo) { console.log(`[API SIMULADA] Encontrado:`, detalhesVeiculo); return detalhesVeiculo; } else { console.log(`[API SIMULADA] Não encontrado.`); return null; } } catch (error) { console.error("[API SIMULADA] Falha:", error); return null; } }
async function exibirDetalhesVeiculoAPI(vehicleId) { const resultadoDiv = document.getElementById(`resultado-api-${vehicleId}`); if (!resultadoDiv) { console.error(`Div #resultado-api-${vehicleId} não encontrada.`); return; } resultadoDiv.innerHTML = '<p class="loading-message">Carregando...</p>'; resultadoDiv.style.display = 'block'; const detalhes = await buscarDetalhesVeiculoAPI(vehicleId); if (detalhes) { let htmlResultado = `<p><strong>Valor FIPE:</strong> ${detalhes.valorFIPE || 'N/D'}</p>`; htmlResultado += `<p><strong>Recall:</strong> ${detalhes.ultimoRecall || 'N/D'}</p>`; htmlResultado += `<p><strong>Dica:</strong> ${detalhes.dicaManutencao || 'N/D'}</p>`; htmlResultado += `<p><strong>Consumo:</strong> ${detalhes.consumoMedio || 'N/D'}</p>`; resultadoDiv.innerHTML = htmlResultado; } else { resultadoDiv.innerHTML = '<p class="error-message">Detalhes não encontrados ou erro.</p>'; } }


// --- FUNÇÕES API REAL (OpenWeatherMap via Backend) ---
async function buscarPrevisaoDetalhada(nomeCidade) {
    // A URL agora aponta para o seu servidor backend
    // Atenção à porta! Deve ser a porta do seu server.js (padrão 3001)
    const apiUrl = `http://localhost:3001/api/previsao/${encodeURIComponent(nomeCidade)}`;
    
    console.log(`[Frontend] Buscando previsão para: ${nomeCidade} via backend (${apiUrl})`);

    try {
        const response = await fetch(apiUrl);

        // Tenta pegar a mensagem de erro do JSON retornado pelo backend, mesmo que !response.ok
        const errorData = await response.json().catch(() => ({ message: `Erro ${response.status} ao contatar o servidor.` })); 

        if (!response.ok) {
            const errorMessage = errorData.error || errorData.message || `Erro ${response.status} ao buscar previsão no servidor.`;
            console.error(`[Frontend] Erro ${response.status} ao buscar previsão:`, errorMessage, errorData);
            throw new Error(errorMessage);
        }

        // 'errorData' aqui seria o 'data' da OpenWeatherMap se response.ok for true
        const data = errorData; 
        console.log("[Frontend] Dados da previsão recebidos do backend:", data);

        // Verifica se a resposta do backend, que é o 'data' da OpenWeatherMap,
        // contém um 'cod' que não seja '200', indicando erro da OpenWeatherMap.
        if (data.cod && String(data.cod) !== "200" && data.message) {
            console.error(`[Frontend] Erro da API OpenWeatherMap (via backend): ${data.message} (cod: ${data.cod})`);
            // Retorna um objeto de erro para ser tratado pelo handleVerificarClimaClick
            return { error: true, message: data.message };
        }
        
        return data; // Retorna os dados da previsão (o objeto JSON completo da OpenWeatherMap)
    } catch (error) {
        console.error("[Frontend] Falha na requisição ou processamento da previsão:", error);
        // Retorna um objeto de erro compatível com a lógica existente no handleVerificarClimaClick
        return { error: true, message: error.message || "Não foi possível buscar a previsão detalhada." };
    }
}

function processarDadosForecast(dataApi) {
    // Esta função recebe diretamente os dados da OpenWeatherMap (repassados pelo backend)
    // Não precisa de alterações, pois o formato dos dados não mudou.
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
        let previsaoRepresentativa = diaData.entradas.find(e => e.hora === "12:00" || e.hora === "15:00") || diaData.entradas.find(e => e.hora === "12:00") || diaData.entradas.find(e => e.hora === "09:00") || diaData.entradas[0];
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

function formatarDataParaExibicao(dataStr) {
    if (!dataStr || typeof dataStr !== 'string') return "Data inválida";
    try {
        const [year, month, day] = dataStr.split('-');
        const dataObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (isNaN(dataObj.getTime())) { throw new Error("Data inválida após parse."); }
        return dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) { console.error("Erro ao formatar data:", dataStr, e); return "Data inválida"; }
}

function exibirPrevisaoDetalhada(previsaoDiariaProcessada, nomeCidade) {
    dadosPrevisaoAtual = previsaoDiariaProcessada; // Armazena para o clique nos detalhes

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
            detalhesButton.addEventListener('click', handleCardDiaClick);
        }
    });
}

function handleCardDiaClick(event) {
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

        const isVisible = detalhesDiv.style.display === 'block';
        
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

// --- NAVEGAÇÃO E EVENTOS ---
function updateNavButtons() { const b=document.querySelectorAll('.sidebar-nav .nav-button'); b.forEach(btn=>{ if(btn.dataset.view===currentView)btn.classList.add('active'); else btn.classList.remove('active'); }); }
function navigateToDetails(vId){if(vId&&veiculos[vId]){console.log(`Nav detalhes: ${vId}`);currentVehicleId=vId;currentView='detalhes';renderApp();}else{console.error(`Erro nav detalhes: ID inválido ${vId}`);alert("Erro: Veículo não encontrado.");}}
function navigateToView(vName){ const vV=['garagem','detalhes','agendar', 'planejar']; if(!vV.includes(vName)){console.warn(`Nav view inválida: ${vName}`);return;} console.log(`Nav view: ${vName}`); currentView=vName; if(currentView!=='detalhes') currentVehicleId=null; renderApp(); }
function setupEventListeners() { console.log("Configurando listeners globais..."); mainContentElement.removeEventListener('click', handleMainContentClick); mainContentElement.addEventListener('click', handleMainContentClick); mainContentElement.removeEventListener('keydown', handleMainContentKeydown); mainContentElement.addEventListener('keydown', handleMainContentKeydown); const navButtons = document.querySelectorAll('.sidebar-nav .nav-button'); navButtons.forEach(button => { const viewName = button.dataset.view; if (viewName) { const newButton = button.cloneNode(true); button.parentNode.replaceChild(newButton, button); newButton.addEventListener('click', () => navigateToView(viewName)); } }); const verificarClimaBtn = document.getElementById('verificar-clima-btn'); if (verificarClimaBtn) { const newClimaBtn = verificarClimaBtn.cloneNode(true); verificarClimaBtn.parentNode.replaceChild(newClimaBtn, verificarClimaBtn); newClimaBtn.addEventListener('click', handleVerificarClimaClick); } else { console.warn("Botão #verificar-clima-btn não encontrado."); } console.log("Listeners configurados."); }
function setupDynamicEventListeners() { if (currentView === 'agendar') { const vehicleSelect = document.getElementById('vehicle-select-schedule'); if (vehicleSelect) { vehicleSelect.removeEventListener('change', handleVehicleSelectionChange); vehicleSelect.addEventListener('change', handleVehicleSelectionChange); } } }
function handleMainContentClick(event) { const target = event.target; const vehicleCard = target.closest('.vehicle-card'); if (vehicleCard && vehicleCard.dataset.vehicleId) { event.preventDefault(); navigateToDetails(vehicleCard.dataset.vehicleId); return; } const button = target.closest('button[data-action]'); if (button) { const action = button.dataset.action; const vehicleId = button.dataset.vehicleId || target.closest('.vehicle-detail-view')?.id.replace('vehicle-detail-',''); const manutencaoId = button.dataset.manutencaoId; console.log(`Click Action: ${action}`, { vehicleId, manutencaoId }); if (vehicleId && veiculos[vehicleId]) { const v = veiculos[vehicleId]; try{ switch(action){ case 'ligar': v.ligar(); break; case 'desligar': v.desligar(); break; case 'acelerar': v.acelerar(); break; case 'frear': v.frear(); break; case 'mudarCor': v.mudarCor(); break; case 'ativarTurbo': if(v.ativarTurbo)v.ativarTurbo(); else alert("Sem turbo."); break; case 'desativarTurbo': if(v.desativarTurbo)v.desativarTurbo(); else alert("Sem turbo."); break; case 'carregar': if(v.carregar&&button.dataset.inputId)v.carregar(button.dataset.inputId); else if(v.carregar)console.error("Botão carregar s/ data-input-id."); else alert("Não carrega."); break; case 'buzinar': v.buzinar(); break; case 'buscar-detalhes-api': exibirDetalhesVeiculoAPI(vehicleId); break; default: console.warn(`Ação de botão desconhecida: ${action}`); } }catch(e){console.error(`Erro ação '${action}' veículo ${vehicleId}:`,e);alert(`Erro ação '${action}'.`);} } else if (action === 'marcar-status' && manutencaoId) { const nS = button.dataset.novoStatus; const vIdContext = target.closest('.vehicle-detail-view')?.id.replace('vehicle-detail-',''); if (vIdContext && veiculos[vIdContext] && nS) { const v=veiculos[vIdContext];const m=v.historicoManutencao.find(m=>m.id===manutencaoId); if(m&&confirm(`Marcar "${m.tipo}" como "${nS}"?`))v.marcarManutencaoComo(manutencaoId,nS); } else console.error("Dados incompletos marcar status:",{vIdContext,manutencaoId,nS}); } else if (action === 'remover-manutencao' && manutencaoId) { const vIdContext = target.closest('.vehicle-detail-view')?.id.replace('vehicle-detail-',''); if (vIdContext && veiculos[vIdContext]) { const v=veiculos[vIdContext]; const m=v.historicoManutencao.find(m=>m.id===manutencaoId); if(m&&confirm(`REMOVER registro "${m.tipo}" de ${m.getFormattedDate()}?`))v.removerManutencao(manutencaoId); } else console.error("Dados incompletos remover manut:",{vIdContext,manutencaoId}); } else if (action === 'cancelar-form') { handleCancelForm(button); } } const formAgendamento = target.closest('form.form-agendamento'); if (formAgendamento && event.type === 'submit') { handleFormSubmit(event); } }
function handleMainContentKeydown(event) { if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('vehicle-card')){ const vId=event.target.dataset.vehicleId; if(vId){event.preventDefault();navigateToDetails(vId);} } }

async function handleVerificarClimaClick() {
    const destinoInput = document.getElementById('destino-viagem');
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    if (!destinoInput || !resultadoDiv) { console.error("Elementos do DOM para clima não encontrados."); alert("Erro interno na página (elementos clima)."); return; }
    
    const nomeCidade = destinoInput.value.trim();
    if (!nomeCidade) { 
        alert("Por favor, digite o nome da cidade."); 
        resultadoDiv.innerHTML = '<p class="error-message">Digite uma cidade.</p>'; 
        destinoInput.focus(); 
        return; 
    }
    
    resultadoDiv.innerHTML = '<p class="loading-message">Buscando previsão...</p>';
    
    // dadosApi será o objeto JSON da OpenWeatherMap ou um objeto de erro { error: true, message: "..." }
    const dadosApi = await buscarPrevisaoDetalhada(nomeCidade); 
    
    if (dadosApi && !dadosApi.error) {
        // 'dadosApi' aqui já é o objeto JSON da OpenWeatherMap.
        // A verificação de erro da OpenWeatherMap (data.cod !== "200") já foi feita dentro de buscarPrevisaoDetalhada
        // e, se houve erro lá, dadosApi já seria { error: true, message: "..." }.
        // Então, se chegamos aqui sem dadosApi.error, significa que a OpenWeatherMap retornou dados válidos.
        
        const previsaoProcessada = processarDadosForecast(dadosApi);
        if (previsaoProcessada && previsaoProcessada.length > 0) {
            exibirPrevisaoDetalhada(previsaoProcessada, nomeCidade);
        } else {
            resultadoDiv.innerHTML = '<p class="error-message">Não foi possível processar os dados da previsão. Verifique o console.</p>';
            console.warn("[Frontend] processarDadosForecast retornou nulo/vazio. API Response:", dadosApi);
        }
    } else {
        // Trata erros de rede, erros retornados pelo nosso backend (ex: chave API não configurada no servidor),
        // ou erros da API OpenWeatherMap já formatados por buscarPrevisaoDetalhada.
        resultadoDiv.innerHTML = `<p class="error-message">Falha: ${dadosApi?.message || 'Não foi possível obter a previsão.'}</p>`;
    }
}

// --- FUNÇÕES DE FORMULÁRIO DE MANUTENÇÃO ---
function handleVehicleSelectionChange(event) { const selectedVehicleId = event.target.value; const formContainer = document.getElementById('agendar-maintenance-form-container'); if (!formContainer) { console.error("Container do formulário não encontrado!"); return; } if (selectedVehicleId && veiculos[selectedVehicleId]) { console.log(`Veículo selecionado: ${selectedVehicleId}`); formContainer.innerHTML = getMaintenanceFormHTML(selectedVehicleId); formContainer.classList.remove('hidden'); formContainer.style.display = 'block'; const formElement = formContainer.querySelector('form.form-agendamento'); if (formElement) { setupFormSubmitListener(formElement); } else { console.error("Erro: Formulário não encontrado."); } } else { console.log("Nenhum veículo selecionado."); formContainer.innerHTML = `<p id="select-vehicle-message">Selecione um veículo.</p>`; formContainer.classList.add('hidden'); formContainer.style.display = 'none'; } }
function getMaintenanceFormHTML(vehicleId) { const formId = `form-agendamento-agendarview-${vehicleId}`; return `<form id="${formId}" class="form-agendamento"><h4>Agendar para: ${veiculos[vehicleId].modelo} (${veiculos[vehicleId].tipoVeiculo})</h4><label for="data-man-${formId}">Data:*</label><input type="date" id="data-man-${formId}" name="data" required><label for="hora-man-${formId}">Hora:</label><input type="time" id="hora-man-${formId}" name="hora"><label for="tipo-man-${formId}">Tipo Serviço:*</label><input type="text" id="tipo-man-${formId}" name="tipo" required placeholder="Ex: Troca de Óleo..."><label for="custo-man-${formId}">Custo (R$):</label><input type="number" id="custo-man-${formId}" name="custo" min="0" step="0.01" placeholder="0.00"><label for="desc-man-${formId}">Descrição:</label><textarea id="desc-man-${formId}" name="descricao" rows="2" placeholder="Detalhes..."></textarea><div><button type="submit" data-action="salvar-agendamento" data-vehicle-id-target="${vehicleId}">Salvar</button><button type="button" class="btn-cancelar-form" data-action="cancelar-form">Cancelar</button></div></form>`; }
function setupFormSubmitListener(formElement) { if (formElement) { formElement.removeEventListener('submit', handleFormSubmit); formElement.addEventListener('submit', handleFormSubmit); console.log(`Listener submit adicionado: #${formElement.id}`); } else { console.error("setupFormSubmitListener: formElement inválido."); } }
function handleFormSubmit(event) { event.preventDefault(); event.stopPropagation(); const form = event.target; console.log("Form submetido:", form.id); const submitButton = form.querySelector('button[type="submit"]'); let veiculoId = submitButton?.dataset.vehicleIdTarget; if (!veiculoId) { const selectElement = document.getElementById('vehicle-select-schedule'); if (selectElement) { veiculoId = selectElement.value; } } if (!veiculoId || !veiculos[veiculoId]) { console.error(`handleFormSubmit: ID veículo inválido ('${veiculoId}')`); alert("Erro: Selecione veículo."); return; } const veiculo = veiculos[veiculoId]; console.log(`Agendando para: ${veiculo.modelo}`); const formData = new FormData(form); const dataStr = formData.get('data'); const horaStr = formData.get('hora') || '00:00'; const tipo = formData.get('tipo')?.trim(); const custoStr = formData.get('custo'); const descricao = formData.get('descricao')?.trim(); if (!dataStr || !tipo) { alert("Erro: Data e Tipo obrigatórios!"); return; } const custo = parseFloat(custoStr) || 0; if (isNaN(custo) || custo < 0) { alert("Erro: Custo inválido."); return; } let dataCompleta; try { const dataIsoString = `${dataStr}T${horaStr}`; dataCompleta = new Date(dataIsoString); if (isNaN(dataCompleta.getTime())) throw new Error("Formato data/hora inválido."); const [year, month, day] = dataStr.split('-').map(Number); if (dataCompleta.getFullYear() !== year || dataCompleta.getMonth() !== month - 1 || dataCompleta.getDate() !== day) { throw new Error("Data inválida p/ mês."); } console.log("Data/Hora criada:", dataCompleta); } catch (e) { alert(`Erro Data/Hora: ${e.message}`); console.error("Erro criando Date:", e); return; } const novaManutencao = new Manutencao(null, dataCompleta, tipo, custo, descricao, 'Agendada'); console.log("Manutencao criada:", novaManutencao); const success = veiculo.adicionarManutencao(novaManutencao); if (success) { alert(`Manutenção "${tipo}" agendada p/ ${veiculo.modelo} em ${novaManutencao.getFormattedDate()}!`); form.reset(); const formContainer = document.getElementById('agendar-maintenance-form-container'); if(formContainer) { formContainer.innerHTML = `<p style="color: green; text-align: center; font-weight: bold;">Salvo!</p><p id="select-vehicle-message">Selecione outro veículo.</p>`; } console.log(`Manutenção ${novaManutencao.id} adicionada a ${veiculoId}.`); } else { console.error(`Falha ao adicionar manutenção a ${veiculoId}.`); } }
function handleCancelForm(button) { const form = button.closest('form.form-agendamento'); const formContainer = document.getElementById('agendar-maintenance-form-container'); const selectElement = document.getElementById('vehicle-select-schedule'); if (form) form.reset(); if(formContainer) { formContainer.innerHTML = `<p id="select-vehicle-message">Selecione um veículo.</p>`; formContainer.classList.add('hidden'); formContainer.style.display = 'none'; } if(selectElement) selectElement.value = ""; }
function verificarAgendamentosProximos(diasLimite = 3) {if(diasLimite<=0)return;const agora=new Date();agora.setHours(0,0,0,0);const umDia=24*60*60*1000;const dtLimite=new Date(agora.getTime()+umDia*(diasLimite+1));let alertas=[];for(const id in veiculos){if(veiculos.hasOwnProperty(id)){const v=veiculos[id];const ag=v.getHistoricoManutencao(true,true);ag.forEach(m=>{if(m.data&&m.data<dtLimite){alertas.push(`- ${v.modelo}(${v.tipoVeiculo}): ${m.tipo} em ${m.getFormattedDate()}`);}});}}if(alertas.length>0){setTimeout(()=>{alert(`🔔 LEMBRETE MANUT. PRÓXIMA (${diasLimite} dias) 🔔\n\n${alertas.join("\n")}\n\nAcesse detalhes p/ mais info.`);},500);}else{console.log(`Nenhum agendamento ativo nos próximos ${diasLimite} dias.`);}}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado. Inicializando Garagem v2.0 com APIs...");
    carregarGaragem();
    renderApp(); 
    setupEventListeners(); 
    console.log("Aplicação inicializada.");
});
// FIM DO SCRIPT