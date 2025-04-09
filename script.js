// === VARIÁVEIS GLOBAIS E CONSTANTES ===
let veiculos = {}; // Objeto para armazenar as instâncias dos veículos
const STORAGE_KEY = 'garagemInteligenteData_v2'; // Chave para localStorage
let currentView = 'garagem'; // Controla a visualização atual ('garagem', 'detalhes', 'agendar')
let currentVehicleId = null; // Guarda o ID do veículo sendo detalhado na view 'detalhes'
// Removido: let selectedVehicleIdForScheduling = null; // Não precisamos mais globalmente

// --- FUNÇÕES DE SOM --- (Mantidas)
function tocarSom(nomeArquivo) { try { new Audio(`${nomeArquivo}`).play(); } catch (e) { console.warn(`Erro ao tocar o som '${nomeArquivo}':`, e); } }
function tocarBuzina() { tocarSom('buzina.mp3'); }
function tocarAcelerar() { tocarSom('acelerar.mp3'); }
function tocarFrear() { tocarSom('frear.mp3'); }
function tocarLigar() { tocarSom('ligar.mp3'); }
function tocarDesligar() { tocarSom('desligar.mp3'); }

// === CLASSE MANUTENCAO === (Mantida como antes)
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
    static fromPlainObject(o) { if(!o)return null; const d=o.data?new Date(o.data):null; return new Manutencao(o.id, d, o.tipo, o.custo, o.descricao, o.status);}
}

// === CLASSE BASE VEICULO === (Método adicionarManutencao simplificado)
class Veiculo {
    constructor(modelo, cor, tipoVeiculo = 'Veiculo', idVeiculo) {
        if (!modelo || !cor || !idVeiculo) throw new Error("Modelo, cor e idVeiculo obrigatórios.");
        this.idVeiculo=idVeiculo; this.modelo=String(modelo); this.tipoVeiculo=String(tipoVeiculo);
        this.ligado=false; this.velocidade=0; this.historicoManutencao=[];
        this.cores=["Preto", "Branco", "Prata", "Cinza", "Vermelho", "Azul", "Verde"];
        this.indiceCorAtual = this.cores.indexOf(String(cor));
        if(this.indiceCorAtual===-1){console.warn(`Cor "${cor}" não encontrada para ${this.modelo}(${idVeiculo}). Usando ${this.cores[0]}.`); this.indiceCorAtual=0;}
        this.cor=this.cores[this.indiceCorAtual]; this.maxVelocidade=50;
    }
    ligar(){if(this.tipoVeiculo==='Bicicleta'){alert("Bicicleta não liga!");return;} if(!this.ligado){this.ligado=true;tocarLigar();console.log(`${this.modelo}(${this.idVeiculo}) ligado.`);this.atualizarTela();salvarGaragem();}else{alert(`${this.modelo} já ligado!`);}}
    desligar(){if(this.tipoVeiculo==='Bicicleta'){alert("Bicicleta não desliga!");return;} if(this.ligado){this.ligado=false;this.velocidade=0;tocarDesligar();if(this.desativarTurbo)this.desativarTurbo(false);console.log(`${this.modelo}(${this.idVeiculo}) desligado.`);this.atualizarTela();salvarGaragem();}else{alert(`${this.modelo} já desligado!`);}}
    acelerar(){if(!this.ligado&&this.tipoVeiculo!=='Bicicleta'){alert(`${this.modelo}(${this.idVeiculo}) precisa estar ligado!`);return;} this._executarAceleracao();}
    _executarAceleracao(){const i=5, vA=this.velocidade; if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade); if(this.velocidade!==vA){if(this.tipoVeiculo!=='Bicicleta')tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert(`${this.modelo} na vel. máxima!`);}}
    frear(){if(this.velocidade>0){const vA=this.velocidade;this.velocidade=Math.max(0,this.velocidade-this.getFreioIncremento());if(this.velocidade<=5&&this.tipoVeiculo!=='Bicicleta')this.velocidade=0; if(this.velocidade!==vA){tocarFrear();this.atualizarTela();salvarGaragem();}}else{alert(`${this.modelo} já parado!`);}}
    getFreioIncremento(){return 10;}
    mudarCor(){if(this.cores&&this.cores.length>1){this.indiceCorAtual=(this.indiceCorAtual+1)%this.cores.length;this.cor=this.cores[this.indiceCorAtual];alert(`Cor do ${this.tipoVeiculo}(${this.modelo}) mudou para ${this.cor}`);this.atualizarTela();salvarGaragem();}else{alert("Não há outras cores.");}}
    buzinar(){tocarBuzina(); console.log(`${this.modelo}(${this.idVeiculo}): Buzina!`);}

    // ***** MÉTODO ADICIONARMANUTENCAO SIMPLIFICADO (sem chamada direta para UI) *****
    adicionarManutencao(manutencaoObj) {
        console.log(`[${this.idVeiculo}] Iniciando adicionarManutencao...`);
        if (!(manutencaoObj instanceof Manutencao)) {
             console.error(`[${this.idVeiculo}] Tentativa de adicionar objeto inválido.`);
             alert("Erro interno: O objeto de manutenção é inválido.");
             return false;
        }
        if (!manutencaoObj.validar(true)) { // Valida e loga erros
            console.error(`[${this.idVeiculo}] Falha na validação da manutenção.`);
            alert("Erro: Dados de manutenção inválidos. Verifique o console.");
            return false;
        }
        try {
             this.historicoManutencao.push(manutencaoObj);
             this.historicoManutencao.sort((a, b) => (a.data?.getTime() || 0) - (b.data?.getTime() || 0));
             console.log(`[${this.idVeiculo}] Manutenção ${manutencaoObj.id} adicionada e histórico ordenado.`);
             salvarGaragem(); // Salva o estado
             verificarAgendamentosProximos(); // Verifica alertas
             // A atualização da UI acontecerá quando a view de detalhes for renderizada novamente
             return true;
         } catch(e) {
             console.error(`[${this.idVeiculo}] Erro ao adicionar/ordenar/salvar manutenção:`, e);
             alert("Erro interno ao processar a manutenção.");
             return false;
         }
    }
    // ***** FIM DO MÉTODO ADICIONARMANUTENCAO SIMPLIFICADO *****

    removerManutencao(idManutencao){const i=this.historicoManutencao.findIndex(m=>m.id===idManutencao);if(i>-1){const r=this.historicoManutencao.splice(i,1)[0];console.log(`Manut. removida p/ ${this.idVeiculo}: ID ${r.id}, Tipo ${r.tipo}`);this.atualizarDisplayManutencao();salvarGaragem();return true;}console.warn(`Manut. ${idManutencao} não encontrada em ${this.idVeiculo}.`);return false;}
    marcarManutencaoComo(idManutencao, novoStatus){const m=this.historicoManutencao.find(m=>m.id===idManutencao);if(!m){console.warn(`Manut. ${idManutencao} não encontrada em ${this.idVeiculo}.`);return false;}const sV=['Agendada','Realizada','Cancelada'];if(!sV.includes(novoStatus)){console.error(`Status inválido: ${novoStatus}`);alert(`Status inválido: ${novoStatus}`);return false;}m.status=novoStatus;console.log(`Status manut. ${idManutencao}(${m.tipo}) alterado p/ ${novoStatus} em ${this.idVeiculo}`);this.atualizarDisplayManutencao();salvarGaragem();if(novoStatus!=='Agendada')verificarAgendamentosProximos();return true;}
    getHistoricoManutencao(apenasFuturas=false, apenasAgendadas=false){const agora=new Date();agora.setHours(0,0,0,0);return this.historicoManutencao.filter(m=>{if(!m||!m.data)return false;const dV=m.data instanceof Date&&!isNaN(m.data.getTime());if(!dV)return false;const dS=new Date(m.data);dS.setHours(0,0,0,0);const fH=dS>=agora;const a=m.status==='Agendada';if(apenasAgendadas&&!a)return false;if(apenasFuturas&&!fH)return false;return true;});}

    atualizarTela(){if(currentView!=='detalhes'||currentVehicleId!==this.idVeiculo)return;const c=document.getElementById(`vehicle-detail-${this.idVeiculo}`);if(!c){console.error(`Container #vehicle-detail-${this.idVeiculo} não encontrado.`);return;}const cE=c.querySelector('.info-cor');if(cE)cE.textContent=`Cor: ${this.cor}`;if(this.tipoVeiculo!=='Bicicleta'){const sE=c.querySelector('.status-ligado');if(sE){sE.textContent=this.ligado?`${this.tipoVeiculo} ligado`:`${this.tipoVeiculo} desligado`;sE.className=`status-ligado ${this.ligado?"ligado":"desligado"}`;}}const vE=c.querySelector('.status-velocidade');if(vE)vE.textContent=`Velocidade: ${this.velocidade} km/h`;const pB=c.querySelector('.velocidade-progress-bar');if(pB&&this.maxVelocidade>0){const p=Math.min((this.velocidade/this.maxVelocidade)*100,100);pB.style.width=`${p}%`;if(this instanceof CarroEsportivo)pB.style.backgroundColor=this.turboAtivado?'#e74c3c':'#3498db';else pB.style.backgroundColor='#3498db';const pC=c.querySelector('.velocidade-progress');if(pC)pC.title=`${this.velocidade} km/h / ${this.maxVelocidade} km/h`;}else if(pB){pB.style.width="0%";pB.style.backgroundColor='#3498db';const pC=c.querySelector('.velocidade-progress');if(pC)pC.title=`0 km/h`;}if(this instanceof CarroEsportivo)this.atualizarTelaTurbo(c);if(this instanceof Caminhao)this.atualizarTelaCarga(c);this.atualizarDisplayManutencao(c);}

    // ***** MÉTODO ATUALIZARDISPLAYMANUTENCAO ATUALIZADO COM LOGS DETALHADOS *****
    // Agora só é chamado na view de detalhes
    atualizarDisplayManutencao(containerElement = null) {
        if (!containerElement && currentView === 'detalhes' && currentVehicleId === this.idVeiculo) {
            containerElement = document.getElementById(`vehicle-detail-${this.idVeiculo}`);
        }
        if (!containerElement) {
             // console.warn(`[${this.idVeiculo}] atualizarDisplayManutencao: Container não encontrado/view incorreta.`);
             return; // Normal sair aqui se não estiver na view de detalhes
        }
        console.log(`[${this.idVeiculo}] Atualizando display de manutenção DENTRO DA VIEW DE DETALHES:`, containerElement.id);
        const agendamentosDiv = containerElement.querySelector('.manutencao-agendamentos');
        const historicoDiv = containerElement.querySelector('.manutencao-historico');
        if (!agendamentosDiv) console.error(`[${this.idVeiculo}] Erro: Div .manutencao-agendamentos NÃO encontrada.`);
        if (!historicoDiv) console.error(`[${this.idVeiculo}] Erro: Div .manutencao-historico NÃO encontrada.`);
        try {
            if (agendamentosDiv) {
                 const htmlAgendamentos = this._getHistoricoManutencaoHTML(true, true);
                 agendamentosDiv.innerHTML = htmlAgendamentos;
            }
            if (historicoDiv) {
                 const htmlHistorico = this._getHistoricoManutencaoHTML(false, false);
                 historicoDiv.innerHTML = htmlHistorico;
            }
            console.log(`[${this.idVeiculo}] Display de manutenção na view de detalhes atualizado.`);
         } catch(e) {
             console.error(`[${this.idVeiculo}] Erro ao atualizar display de manutenção:`, e);
         }
    }
    // ***** FIM DO MÉTODO ATUALIZARDISPLAYMANUTENCAO ATUALIZADO *****

    // ***** MÉTODO _GETHISTORICOMANUTENCAOHTML ATUALIZADO COM LOGS DETALHADOS *****
    _getHistoricoManutencaoHTML(apenasFuturas, apenasAgendadas) {
         // console.log(`[${this.idVeiculo}] _getHistoricoManutencaoHTML: Futuras=${apenasFuturas}, Agendadas=${apenasAgendadas}`); // Log menos verboso
        const historicoFiltrado = this.getHistoricoManutencao(apenasFuturas, apenasAgendadas);
        // console.log(`[${this.idVeiculo}] Itens filtrados (${historicoFiltrado.length}):`, historicoFiltrado.map(m => ({id: m.id, tipo: m.tipo, data: m.data, status: m.status})) );
        let titulo = ""; let msgVazio = "";
        if (apenasFuturas && apenasAgendadas) {titulo="<h4>Agendamentos Futuros</h4>"; msgVazio="<p>Nenhum agendamento futuro ativo.</p>";}
        else if (!apenasFuturas && !apenasAgendadas) {titulo="<h4>Histórico Completo</h4>"; msgVazio="<p>Nenhum registro encontrado.</p>";}
        else {titulo="<h4>Registros Filtrados</h4>"; msgVazio="<p>Nenhum registro encontrado.</p>";}
        if (historicoFiltrado.length === 0) return titulo + msgVazio;
        let html = titulo + '<ul>';
        try {
            historicoFiltrado.forEach(m => {
                 let botoesAcao = '';
                if (m.status === 'Agendada') { botoesAcao += `<button class="btn-manutencao-status" data-action="marcar-status" data-manutencao-id="${m.id}" data-novo-status="Realizada" title="Marcar como Realizada">✅</button>`; botoesAcao += `<button class="btn-manutencao-status" data-action="marcar-status" data-manutencao-id="${m.id}" data-novo-status="Cancelada" title="Cancelar Agendamento">❌</button>`;}
                botoesAcao += `<button class="btn-manutencao-remover" data-action="remover-manutencao" data-manutencao-id="${m.id}" title="Remover Registro">🗑️</button>`;
                const itemFormatado = m.formatar(); const statusInfo = m.status !== 'Agendada' ? ` <span>(${m.status})</span>` : '';
                html += `<li data-manutencao-id="${m.id}"><span class="manutencao-info">${itemFormatado}${statusInfo}</span><div class="manutencao-actions">${botoesAcao}</div></li>`;
            }); html += '</ul>'; return html;
        } catch (e) { console.error(`[${this.idVeiculo}] Erro ao gerar HTML da lista:`, e); return titulo + '<p style="color:red;">Erro ao gerar lista.</p>'; }
    }
     // ***** FIM DO MÉTODO _GETHISTORICOMANUTENCAOHTML ATUALIZADO *****

    toPlainObject(){return{idVeiculo:this.idVeiculo,tipoVeiculo:this.tipoVeiculo,modelo:this.modelo,cor:this.cor,ligado:this.ligado,velocidade:this.velocidade,cores:this.cores,indiceCorAtual:this.indiceCorAtual,maxVelocidade:this.maxVelocidade,historicoManutencao:this.historicoManutencao.map(m=>m.toPlainObject())};}
    static fromPlainObject(o){if(!o||!o.idVeiculo||!o.tipoVeiculo||!o.modelo||!o.cor){console.warn("Objeto inválido p/ veículo:",o);return null;}let vI=null;try{switch(o.tipoVeiculo){case 'Carro':vI=new Carro(o.modelo,o.cor,o.idVeiculo);break;case 'CarroEsportivo':const idTS=o.idTurboStatus||`turbo-status-${o.idVeiculo}`;vI=new CarroEsportivo(o.modelo,o.cor,o.idVeiculo,idTS);vI.turboAtivado=o.turboAtivado||false;vI.maxVelocidadeNormal=o.maxVelocidadeNormal||250;vI.maxVelocidadeTurbo=o.maxVelocidadeTurbo||320;vI.maxVelocidade=vI.turboAtivado?vI.maxVelocidadeTurbo:vI.maxVelocidadeNormal;break;case 'Caminhao':const cap=o.capacidadeCarga||10000;const idC=o.idCargaAtual||`carga-atual-${o.idVeiculo}`;vI=new Caminhao(o.modelo,o.cor,o.idVeiculo,cap,idC);vI.cargaAtual=o.cargaAtual||0;break;case 'Moto':vI=new Moto(o.modelo,o.cor,o.idVeiculo);break;case 'Bicicleta':vI=new Bicicleta(o.modelo,o.cor,o.idVeiculo);break;default:console.warn(`Tipo desconhecido: ${o.tipoVeiculo}`);return null;}}catch(e){console.error(`Erro ao instanciar ${o.tipoVeiculo}(${o.idVeiculo}):`,e);return null;}vI.ligado=o.ligado||false;vI.velocidade=o.velocidade||0;if(Array.isArray(o.cores))vI.cores=o.cores;if(typeof o.indiceCorAtual==='number')vI.indiceCorAtual=o.indiceCorAtual;if(vI.indiceCorAtual>=0&&vI.indiceCorAtual<vI.cores.length)vI.cor=vI.cores[vI.indiceCorAtual];else{console.warn(`[${vI.idVeiculo}] Índice cor (${o.indiceCorAtual}) inválido. Resetando.`);vI.indiceCorAtual=0;vI.cor=vI.cores[0];}if(typeof o.maxVelocidade==='number'&&!(vI instanceof CarroEsportivo))vI.maxVelocidade=o.maxVelocidade;else if(!(vI instanceof CarroEsportivo)&&typeof vI.maxVelocidade==='undefined')vI.maxVelocidade=50;vI.historicoManutencao=(Array.isArray(o.historicoManutencao)?o.historicoManutencao:[]).map(mP=>Manutencao.fromPlainObject(mP)).filter(m=>m!==null);vI.historicoManutencao.sort((a,b)=>(a.data?.getTime()||0)-(b.data?.getTime()||0));return vI;}
}

// --- CLASSES FILHAS --- (Mantidas compactadas)
class Carro extends Veiculo{constructor(m,c,id){super(m,c,'Carro',id);this.maxVelocidade=180;this.cores=["Prata","Branco","Preto","Cinza","Vermelho","Azul"];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}_executarAceleracao(){const i=10,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert(`O ${this.modelo} atingiu vel. máx (${this.maxVelocidade} km/h)!`);}}buzinar(){tocarBuzina();alert(`${this.modelo}: Fom Fom!`);}}
class CarroEsportivo extends Carro{constructor(m,c,id,idTS){super(m,c,id);this.tipoVeiculo='CarroEsportivo';this.maxVelocidadeNormal=250;this.maxVelocidadeTurbo=320;this.maxVelocidade=this.maxVelocidadeNormal;this.turboAtivado=false;this.idTurboStatusElement=idTS;this.cores=["Vermelha","Amarela","Azul Esportivo","Verde Limão","Preto Fosco"];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}ativarTurbo(){if(!this.ligado){alert("Ligue o carro!");return;}if(!this.turboAtivado){this.turboAtivado=true;this.maxVelocidade=this.maxVelocidadeTurbo;console.log("Turbo Ativado!");alert("Turbo Ativado!");this.atualizarTela();salvarGaragem();}else{alert("Turbo já ativado!");}}desativarTurbo(a=true){if(this.turboAtivado){this.turboAtivado=false;this.maxVelocidade=this.maxVelocidadeNormal;if(this.velocidade>this.maxVelocidade)this.velocidade=this.maxVelocidade;console.log("Turbo Desativado!");if(a)alert("Turbo Desativado!");this.atualizarTela();salvarGaragem();}else if(a){alert("Turbo já desativado!");}}_executarAceleracao(){const i=this.turboAtivado?25:15,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert(`O ${this.modelo} na vel. máx (${this.maxVelocidade} km/h)!`);}}buzinar(){tocarBuzina();alert(`${this.modelo}: VRUUUUUM!`);}atualizarTelaTurbo(c){const tE=c?.querySelector(`#${this.idTurboStatusElement}`);if(tE)tE.textContent=`Turbo: ${this.turboAtivado?"Ativado":"Desativado"}`;}toPlainObject(){const p=super.toPlainObject();p.turboAtivado=this.turboAtivado;p.maxVelocidadeNormal=this.maxVelocidadeNormal;p.maxVelocidadeTurbo=this.maxVelocidadeTurbo;p.idTurboStatus=this.idTurboStatusElement;return p;}}
class Caminhao extends Carro{constructor(m,c,id,cap,idC){super(m,c,id);this.tipoVeiculo='Caminhao';this.maxVelocidade=120;this.capacidadeCarga=cap>0?cap:10000;this.cargaAtual=0;this.idCargaAtualElement=idC;this.cores=["Azul Escuro","Laranja","Verde Musgo","Marrom","Branco Gelo"];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}carregar(cId){const cI=document.getElementById(cId);if(!cI){console.error(`Input #${cId} não encontrado!`);alert("Erro: Campo carga não encontrado.");return;}const cV=cI.value;const cN=Number(cV);if(isNaN(cN)||cN<=0){alert("Insira carga válida.");return;}if(this.cargaAtual+cN<=this.capacidadeCarga){this.cargaAtual+=cN;console.log(`Caminhão ${this.idVeiculo} carregado: ${cN.toFixed(0)}kg. Total: ${this.cargaAtual.toFixed(0)}kg`);alert(`Carregado ${cN.toFixed(0)}kg. Total: ${this.cargaAtual.toFixed(0)}kg.`);cI.value='';this.atualizarTela();salvarGaragem();}else{const eL=this.capacidadeCarga-this.cargaAtual;alert(`Carga excessiva! Espaço: ${eL.toFixed(0)} kg.`);}}_executarAceleracao(){const fC=Math.max(0.4,1-(this.cargaAtual/(this.capacidadeCarga*1.5)));const iB=8;const i=Math.round(iB*fC);const vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert(`O ${this.modelo} atingiu vel. máx!`);}}getFreioIncremento(){const fC=1+(this.cargaAtual/this.capacidadeCarga)*0.5;const fB=10;return Math.max(4,Math.round(fB/fC));}buzinar(){tocarBuzina();alert(`${this.modelo}: PÓÓÓÓÓÓM!`);}atualizarTelaCarga(c){const cE=c?.querySelector(`#${this.idCargaAtualElement}`);if(cE)cE.textContent=`Carga: ${this.cargaAtual.toFixed(0)} kg / ${this.capacidadeCarga.toFixed(0)} kg`;}toPlainObject(){const p=super.toPlainObject();p.capacidadeCarga=this.capacidadeCarga;p.cargaAtual=this.cargaAtual;p.idCargaAtual=this.idCargaAtualElement;return p;}}
class Moto extends Veiculo{constructor(m,c,id){super(m,c,'Moto',id);this.maxVelocidade=200;this.cores=["Preta","Vermelha","Azul Royal","Branca Pérola","Verde Kawasaki"];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}_executarAceleracao(){const i=18,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){tocarAcelerar();this.atualizarTela();salvarGaragem();}}else{alert("Moto vel. máxima!");}}getFreioIncremento(){return 15;}buzinar(){tocarBuzina();alert(`${this.modelo}: Bip Bip!`);}}
class Bicicleta extends Veiculo{constructor(m,c,id){super(m,c,'Bicicleta',id);this.maxVelocidade=40;this.ligado=true;this.cores=["Verde","Azul Claro","Vermelha","Preta","Amarela"];this.indiceCorAtual=this.cores.indexOf(this.cor);if(this.indiceCorAtual===-1){this.indiceCorAtual=0;this.cor=this.cores[0];}}ligar(){alert("Bike não liga!");}desligar(){alert("Bike não desliga!");}_executarAceleracao(){const i=5,vA=this.velocidade;if(this.velocidade<this.maxVelocidade){this.velocidade=Math.min(this.velocidade+i,this.maxVelocidade);if(this.velocidade!==vA){this.atualizarTela();salvarGaragem();}}else{alert("Bike vel. máxima!");}}frear(){if(this.velocidade>0){const vA=this.velocidade;this.velocidade=Math.max(0,this.velocidade-this.getFreioIncremento());if(this.velocidade!==vA){this.atualizarTela();salvarGaragem();}}else{alert(`${this.modelo} parada!`);}}getFreioIncremento(){return 6;}buzinar(){console.log(`${this.modelo}: Trim Trim!`);alert("Trim Trim!");}}

// --- PERSISTÊNCIA --- (Mantida)
function salvarGaragem(){const d={};for(const id in veiculos){if(veiculos.hasOwnProperty(id)){try{d[id]=veiculos[id].toPlainObject();}catch(e){console.error(`Erro ao serializar ${id}:`,e);}}}try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));console.log("Garagem salva.");}catch(e){console.error("Erro ao salvar no LS:",e);alert("ERRO: Não foi possível salvar!");}}
function carregarGaragem(){console.log(`Carregando de ${STORAGE_KEY}`);const j=localStorage.getItem(STORAGE_KEY);veiculos={};if(!j){console.log("Nenhum dado. Inicializando padrão.");inicializarVeiculosPadrao();return;}try{const p=JSON.parse(j);let cS=0,cF=0;for(const id in p){if(p.hasOwnProperty(id)){const vP=p[id];const vI=Veiculo.fromPlainObject(vP);if(vI){veiculos[id]=vI;cS++;}else{console.warn(`Falha ao carregar ${id}:`,vP);cF++;}}}console.log(`Garagem carregada: ${cS} sucesso, ${cF} falhas.`);verificarAgendamentosProximos();}catch(e){console.error("Erro ao carregar/processar dados:",e);alert("ERRO ao carregar. Redefinindo p/ padrão.");localStorage.removeItem(STORAGE_KEY);inicializarVeiculosPadrao();}}
function inicializarVeiculosPadrao(){veiculos={};console.log("Inicializando padrão...");try{const idC='c-jstorm',idS='s-ferrari',idT='t-scania',idM='m-esport',idB='b-mtb';veiculos[idC]=new Carro('Jackson Storm','Preto',idC);veiculos[idS]=new CarroEsportivo('Ferrari','Vermelha',idS,`turbo-${idS}`);veiculos[idT]=new Caminhao('Scania','Azul Escuro',idT,10000,`carga-${idT}`);veiculos[idM]=new Moto('Esportiva','Vermelha',idM);veiculos[idB]=new Bicicleta('Mountain Bike','Verde',idB);console.log("Padrão criado:",Object.keys(veiculos));salvarGaragem();}catch(e){console.error("Erro crítico ao instanciar padrão:",e);alert("ERRO GRAVE inicialização.");veiculos={};}}

// --- RENDERIZAÇÃO DAS VIEWS ---
const mainContentElement = document.getElementById('main-content');

function renderApp() {
    if (!mainContentElement){console.error("Erro: #main-content não encontrado!");return;}
    console.log(`Renderizando view: ${currentView}`+(currentVehicleId?` (${currentVehicleId})`:''));
    mainContentElement.innerHTML = ''; // Limpa antes de renderizar
    updateNavButtons();
    try {
        switch (currentView) {
            case 'garagem': renderGarageView(); break;
            case 'detalhes':
                if (currentVehicleId && veiculos[currentVehicleId]) renderVehicleDetailView(veiculos[currentVehicleId]);
                else { console.error(`Erro render detalhes: ID inválido ${currentVehicleId}`); alert("Erro: Veículo não encontrado."); navigateToView('garagem');}
                break;
            case 'agendar': // NOVO CASE
                renderAgendarView();
                break;
            default:
                console.warn(`View desconhecida: ${currentView}. Voltando p/ garagem.`);
                navigateToView('garagem'); // Volta para a garagem se a view for inválida
        }
    } catch (error) {
        console.error(`Erro renderizando view '${currentView}':`, error);
        mainContentElement.innerHTML = `<h2>Erro ao Renderizar</h2><p>Tente recarregar.</p>`;
    }
    setupEventListeners(); // Reconfigura listeners após renderizar
}

function renderGarageView() {
    mainContentElement.innerHTML = '<h2>Minha Garagem</h2>';
    const container = document.createElement('div'); container.className = 'garage-view';
    const ids = Object.keys(veiculos);
    if (ids.length === 0) container.innerHTML = '<p>Garagem vazia.</p>';
    else {
        ids.forEach(id => {
            const v = veiculos[id]; const card = document.createElement('div');
            card.className = 'vehicle-card'; card.dataset.vehicleId = id;
            card.setAttribute('role', 'button'); card.tabIndex = 0;
            let img='carrodomal.png';
            if(v.tipoVeiculo==='CarroEsportivo')img='carroesportivo.png';else if(v.tipoVeiculo==='Caminhao')img='caminhao.png';else if(v.tipoVeiculo==='Moto')img='moto.png';else if(v.tipoVeiculo==='Bicicleta')img='bicicleta.png';
            card.innerHTML = `<img src="imagens/${img}" alt="${v.tipoVeiculo} ${v.modelo}"><h3>${v.modelo}</h3><p>Tipo: ${v.tipoVeiculo}</p><p class="info-cor">Cor: ${v.cor}</p>`;
            container.appendChild(card);
        });
    } mainContentElement.appendChild(container);
}

// ***** FUNÇÃO renderVehicleDetailView ATUALIZADA (SEM FORM DE AGENDAMENTO) *****
function renderVehicleDetailView(veiculo) {
    if (!veiculo) return;
    const container = document.createElement('div');
    container.className = 'vehicle vehicle-detail-view';
    container.id = `vehicle-detail-${veiculo.idVeiculo}`;

    let img='carrodomal.png'; if(veiculo.tipoVeiculo==='CarroEsportivo')img='carroesportivo.png';else if(veiculo.tipoVeiculo==='Caminhao')img='caminhao.png';else if(veiculo.tipoVeiculo==='Moto')img='moto.png';else if(veiculo.tipoVeiculo==='Bicicleta')img='bicicleta.png';
    let header = `<h2>${veiculo.modelo} <span style="font-weight:normal; font-size: 0.8em; color: #555;">(${veiculo.tipoVeiculo})</span></h2><img src="imagens/${img}" id="imagem-${veiculo.idVeiculo}" alt="${veiculo.tipoVeiculo} ${veiculo.modelo}">`;
    let info = `<div class="info"><p>Modelo: ${veiculo.modelo}</p><p class="info-cor">Cor: ${veiculo.cor}</p>${(veiculo instanceof Caminhao)?`<p>Capacidade: ${veiculo.capacidadeCarga.toFixed(0)} kg</p>`:''}</div>`;
    let controls = '<div class="controls">';
    if(veiculo.tipoVeiculo!=='Bicicleta'){controls+=`<button data-action="ligar" data-vehicle-id="${veiculo.idVeiculo}">Ligar</button><button data-action="desligar" data-vehicle-id="${veiculo.idVeiculo}">Desligar</button>`;}
    controls+=`<button data-action="acelerar" data-vehicle-id="${veiculo.idVeiculo}">Acelerar</button><button data-action="frear" data-vehicle-id="${veiculo.idVeiculo}">Frear</button><button data-action="buzinar" data-vehicle-id="${veiculo.idVeiculo}">Buzinar</button>`;
    if(veiculo.cores&&veiculo.cores.length>1)controls+=`<button data-action="mudarCor" data-vehicle-id="${veiculo.idVeiculo}">Mudar Cor</button>`;
    if(veiculo instanceof CarroEsportivo)controls+=`<button data-action="ativarTurbo" data-vehicle-id="${veiculo.idVeiculo}">Ativar Turbo</button><button data-action="desativarTurbo" data-vehicle-id="${veiculo.idVeiculo}">Desativar Turbo</button>`;
    if(veiculo instanceof Caminhao){const cId=`carga-input-${veiculo.idVeiculo}`;controls+=`<div><label for="${cId}">Carga (kg):</label><input type="number" id="${cId}" min="0" placeholder="0" step="100"><button data-action="carregar" data-vehicle-id="${veiculo.idVeiculo}" data-input-id="${cId}">Carregar</button></div>`;}
    controls+='</div>';
    let status = '<div class="status">';
    if(veiculo.tipoVeiculo!=='Bicicleta')status+=`<p class="status-ligado ${veiculo.ligado?'ligado':'desligado'}">${veiculo.ligado?veiculo.tipoVeiculo+' ligado':veiculo.tipoVeiculo+' desligado'}</p>`;
    if(veiculo instanceof CarroEsportivo)status+=`<p id="${veiculo.idTurboStatusElement}">Turbo: ${veiculo.turboAtivado?"Ativado":"Desativado"}</p>`;
    status+=`<p class="status-velocidade">Velocidade: ${veiculo.velocidade} km/h</p>`;
    if(veiculo instanceof Caminhao)status+=`<p id="${veiculo.idCargaAtualElement}">Carga: ${veiculo.cargaAtual.toFixed(0)} kg / ${veiculo.capacidadeCarga.toFixed(0)} kg</p>`;
    if(veiculo.maxVelocidade>0){const p=Math.min((veiculo.velocidade/veiculo.maxVelocidade)*100,100);const bC=(veiculo instanceof CarroEsportivo&&veiculo.turboAtivado)?'#e74c3c':'#3498db';status+=`<div class="velocidade-progress" title="${veiculo.velocidade} km/h / ${veiculo.maxVelocidade} km/h"><div class="velocidade-progress-bar" style="width: ${p}%; background-color: ${bC};"></div></div>`;}
    status+='</div>';

    // --- SEÇÃO DE MANUTENÇÃO (AGORA SÓ MOSTRA LISTAS, NÃO O FORM) ---
    const agendamentosContainerClass = `manutencao-agendamentos`;
    const historicoContainerClass = `manutencao-historico`;
    let manutencaoHTML = `
        <div class="manutencao-section">
            <h3>Histórico e Agendamentos</h3>
            <div class="${agendamentosContainerClass}">
                ${veiculo._getHistoricoManutencaoHTML(true, true)} {/* Futuros/Agendados */}
            </div>
            <div class="${historicoContainerClass}">
                ${veiculo._getHistoricoManutencaoHTML(false, false)} {/* Histórico Completo */}
            </div>
        </div>`;
    // --- FIM SEÇÃO DE MANUTENÇÃO ---

    container.innerHTML = header + info + controls + status + manutencaoHTML;
    mainContentElement.innerHTML = '';
    mainContentElement.appendChild(container);
    // Não chama mais setupFormEventListeners aqui
    veiculo.atualizarTela(); // Garante estado inicial correto
}
// ***** FIM renderVehicleDetailView ATUALIZADA *****


// ***** NOVA FUNÇÃO renderAgendarView *****
function renderAgendarView() {
    const container = document.createElement('div');
    container.className = 'agendar-view';

    // 1. Título da View
    container.innerHTML = '<h2>Agendar Nova Manutenção</h2>';

    // 2. Seletor de Veículos
    const selectorDiv = document.createElement('div');
    selectorDiv.className = 'vehicle-selector';
    let selectorHTML = `<label for="vehicle-select-schedule">Selecione o Veículo:</label>
                        <select id="vehicle-select-schedule" name="vehicleId">
                            <option value="">-- Selecione --</option>`; // Opção default
    const vehicleIds = Object.keys(veiculos);
    if (vehicleIds.length > 0) {
        vehicleIds.forEach(id => {
            selectorHTML += `<option value="${id}">${veiculos[id].modelo} (${veiculos[id].tipoVeiculo})</option>`;
        });
    } else {
        selectorHTML += `<option value="" disabled>Nenhum veículo na garagem</option>`;
    }
    selectorHTML += `</select>`;
    selectorDiv.innerHTML = selectorHTML;
    container.appendChild(selectorDiv);

    // 3. Container para o Formulário (inicialmente oculto/vazio)
    const formContainer = document.createElement('div');
    formContainer.id = 'agendar-maintenance-form-container';
    formContainer.className = 'hidden'; // Classe para esconder inicialmente
    formContainer.innerHTML = `<p id="select-vehicle-message">Selecione um veículo acima para ver o formulário.</p>`; // Mensagem inicial
    container.appendChild(formContainer);

    // Adiciona tudo ao main content
    mainContentElement.innerHTML = ''; // Limpa
    mainContentElement.appendChild(container);

    // Adiciona o listener para o <select> DEPOIS de adicioná-lo ao DOM
    const vehicleSelect = document.getElementById('vehicle-select-schedule');
    if (vehicleSelect) {
        vehicleSelect.addEventListener('change', handleVehicleSelectionChange);
    } else {
        console.error("Erro: Elemento <select> #vehicle-select-schedule não encontrado após renderização.");
    }
}
// ***** FIM renderAgendarView *****


// --- NAVEGAÇÃO E MANIPULAÇÃO DE EVENTOS ---
function updateNavButtons() { const b=document.querySelectorAll('.sidebar-nav .nav-button'); b.forEach(btn=>{if(btn.dataset.view===currentView)btn.classList.add('active');else btn.classList.remove('active');});}
function navigateToDetails(vId){if(vId&&veiculos[vId]){console.log(`Nav detalhes: ${vId}`);currentVehicleId=vId;currentView='detalhes';renderApp();}else{console.error(`Erro nav detalhes: ID inválido ${vId}`);alert("Erro: Veículo não encontrado.");}}
function navigateToView(vName){const vV=['garagem','detalhes','agendar'];if(!vV.includes(vName)){console.warn(`Nav view inválida: ${vName}`);return;}console.log(`Nav view: ${vName}`);currentView=vName;if(currentView!=='detalhes')currentVehicleId=null;renderApp();}

function setupEventListeners() {
    console.log("Configurando listeners...");
    mainContentElement.removeEventListener('click', handleMainContentClick); // Previne duplicatas
    mainContentElement.addEventListener('click', handleMainContentClick);
    mainContentElement.removeEventListener('keydown', handleMainContentKeydown); // Previne duplicatas
    mainContentElement.addEventListener('keydown', handleMainContentKeydown);

    const navButtons = document.querySelectorAll('.sidebar-nav .nav-button');
    navButtons.forEach(button => {
        const viewName = button.dataset.view;
        const handler = () => navigateToView(viewName);
        // Remove listener antigo por segurança (clonando o nó é mais robusto)
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', handler);
    });
     console.log("Listeners configurados.");
}

function handleMainContentClick(event) {
    const target = event.target;
    const vehicleCard = target.closest('.vehicle-card');
    if (vehicleCard) { const vId=vehicleCard.dataset.vehicleId; if(vId){event.preventDefault();navigateToDetails(vId);} return; }
    const button = target.closest('button[data-action]');
    if (button) {
        const action = button.dataset.action;
        const vehicleId = button.dataset.vehicleId || target.closest('.vehicle-detail-view')?.id.replace('vehicle-detail-','');
        const manutencaoId = button.dataset.manutencaoId;
        console.log(`Click Action: ${action}`, { vehicleId, manutencaoId });
        if (vehicleId && veiculos[vehicleId]) {
            const v=veiculos[vehicleId]; try{switch(action){case 'ligar':v.ligar();break;case 'desligar':v.desligar();break;case 'acelerar':v.acelerar();break;case 'frear':v.frear();break;case 'mudarCor':v.mudarCor();break;case 'ativarTurbo':if(v.ativarTurbo)v.ativarTurbo();else alert("Sem turbo.");break;case 'desativarTurbo':if(v.desativarTurbo)v.desativarTurbo();else alert("Sem turbo.");break;case 'carregar':if(v.carregar&&button.dataset.inputId)v.carregar(button.dataset.inputId);else if(v.carregar)console.error("Botão carregar s/ data-input-id.");else alert("Não carrega.");break;case 'buzinar':v.buzinar();break;}}catch(e){console.error(`Erro ação '${action}' veículo ${vehicleId}:`,e);alert(`Erro ação '${action}'.`);}
        } else if (action === 'marcar-status' && manutencaoId) {
            const nS = button.dataset.novoStatus; const vIdC = target.closest('.vehicle-detail-view')?.id.replace('vehicle-detail-','');
            if (vIdC && veiculos[vIdC] && nS) {const v=veiculos[vIdC];const m=v.historicoManutencao.find(m=>m.id===manutencaoId);if(m&&confirm(`Marcar "${m.tipo}" como "${nS}"?`))v.marcarManutencaoComo(manutencaoId,nS);} else console.error("Dados incompletos marcar status:",{vIdC,manutencaoId,nS});
        } else if (action === 'remover-manutencao' && manutencaoId) {
            const vIdC = target.closest('.vehicle-detail-view')?.id.replace('vehicle-detail-','');
            if (vIdC && veiculos[vIdC]) {const v=veiculos[vIdC];const m=v.historicoManutencao.find(m=>m.id===manutencaoId);if(m&&confirm(`REMOVER registro "${m.tipo}" de ${m.getFormattedDate()}?`))v.removerManutencao(manutencaoId);} else console.error("Dados incompletos remover manut:",{vIdC,manutencaoId});
        } else if (action === 'toggle-form') { // Este ainda pode existir na view de detalhes (se você readicionar) ou na view 'agendar'
            // handleToggleForm(button); // A lógica do toggle foi removida da view de detalhes
             console.warn("Ação 'toggle-form' clicada, mas não implementada nesta view.");
        } else if (action === 'cancelar-form') { // O cancelar da view 'agendar'
             handleCancelForm(button);
        }
    }
}

function handleMainContentKeydown(event) { if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('vehicle-card')){const vId=event.target.dataset.vehicleId;if(vId){event.preventDefault();navigateToDetails(vId);}}}


// ***** NOVA FUNÇÃO: Handler para mudança no seletor de veículos na view 'agendar' *****
function handleVehicleSelectionChange(event) {
    const selectedVehicleId = event.target.value; // Pega o ID do <option> selecionado
    const formContainer = document.getElementById('agendar-maintenance-form-container');

    if (!formContainer) {
        console.error("Container do formulário #agendar-maintenance-form-container não encontrado!");
        return;
    }

    if (selectedVehicleId && veiculos[selectedVehicleId]) {
        console.log(`Veículo selecionado para agendamento: ${selectedVehicleId}`);
        // Renderiza o formulário dentro do container
        formContainer.innerHTML = getMaintenanceFormHTML(selectedVehicleId); // Usa uma função auxiliar para gerar o HTML
        formContainer.classList.remove('hidden'); // Mostra o container
        // Adiciona o listener de submit AO FORMULÁRIO específico recém-criado
        const formElement = formContainer.querySelector('form');
        if (formElement) {
             setupFormSubmitListener(formElement); // Função adaptada para pegar o form diretamente
        } else {
             console.error("Erro: Formulário não encontrado após renderização em handleVehicleSelectionChange.");
        }
    } else {
        console.log("Nenhum veículo selecionado.");
        // Esconde ou limpa o container do formulário
        formContainer.innerHTML = `<p id="select-vehicle-message">Selecione um veículo acima para ver o formulário.</p>`;
        formContainer.classList.add('hidden');
        // selectedVehicleIdForScheduling = null; // Reset global não é mais necessário
    }
}
// ***** FIM handleVehicleSelectionChange *****


// ***** NOVA FUNÇÃO AUXILIAR: Gera o HTML do formulário de manutenção *****
function getMaintenanceFormHTML(vehicleId) {
    // Gera um ID único para o formulário baseado no veículo (embora não estritamente necessário agora)
    const formId = `form-agendamento-agendarview-${vehicleId}`;
    // Note que passamos o vehicleId via data attribute no botão submit agora
    return `
        <form id="${formId}" class="form-agendamento">
            <h4>Agendar para: ${veiculos[vehicleId].modelo}</h4>
            <label for="data-man-${formId}">Data:*</label>
            <input type="date" id="data-man-${formId}" name="data" required>

            <label for="hora-man-${formId}">Hora:</label>
            <input type="time" id="hora-man-${formId}" name="hora">

            <label for="tipo-man-${formId}">Tipo Serviço:*</label>
            <input type="text" id="tipo-man-${formId}" name="tipo" required placeholder="Ex: Troca de Óleo...">

            <label for="custo-man-${formId}">Custo (R$):</label>
            <input type="number" id="custo-man-${formId}" name="custo" min="0" step="0.01" placeholder="0.00">

            <label for="desc-man-${formId}">Descrição:</label>
            <textarea id="desc-man-${formId}" name="descricao" rows="2" placeholder="Detalhes..."></textarea>

            <div>
                <button type="submit" data-action="salvar-agendamento" data-vehicle-id-target="${vehicleId}">Salvar Agendamento</button>
                <button type="button" class="btn-cancelar-form" data-action="cancelar-form">Cancelar</button>
            </div>
        </form>
    `;
}
// ***** FIM getMaintenanceFormHTML *****


// ***** FUNÇÃO setupFormEventListeners ADAPTADA *****
// Agora adiciona listener a um formulário específico passado como argumento
function setupFormSubmitListener(formElement) {
    if (formElement) {
        formElement.removeEventListener('submit', handleFormSubmit); // Remove antigo se houver
        formElement.addEventListener('submit', handleFormSubmit);
        console.log(`Listener de submit ADICIONADO ao formulário #${formElement.id}`);
    } else {
        console.error("setupFormSubmitListener chamado com formElement inválido.");
    }
}
// ***** FIM setupFormEventListeners ADAPTADA *****


// ***** FUNÇÃO handleFormSubmit ATUALIZADA para pegar ID do botão/seletor *****
function handleFormSubmit(event) {
    event.preventDefault(); event.stopPropagation();
    // Removido Alerta de Debug inicial
    // alert("DEBUG: handleFormSubmit iniciado!");

    const form = event.target;
    console.log("Formulário de manutenção submetido:", form.id);

    // 1. Identifica o Veículo (AGORA PEGA DO BOTÃO OU DO SELETOR)
    // Tenta pegar do botão submit (se adicionarmos lá) ou do select que está fora do form
    const submitButton = form.querySelector('button[type="submit"]');
    let veiculoId = submitButton?.dataset.vehicleIdTarget; // Pega do botão primeiro

    if (!veiculoId) { // Se não achou no botão, tenta pegar do <select> na mesma view
         const selectElement = document.getElementById('vehicle-select-schedule');
         if (selectElement) {
             veiculoId = selectElement.value;
         }
    }

    if (!veiculoId || !veiculos[veiculoId]) {
        console.error(`handleFormSubmit: ID do veículo inválido ou não encontrado ('${veiculoId}')`);
        alert("Erro: Não foi possível identificar para qual veículo agendar. Selecione um veículo.");
        return;
    }
    const veiculo = veiculos[veiculoId];
    console.log(`Agendando para o veículo: ${veiculo.modelo} (ID: ${veiculoId})`);

    // 2. Coleta Dados do Formulário (igual antes)
    const formData = new FormData(form);
    const dataStr = formData.get('data'); const horaStr = formData.get('hora') || '00:00';
    const tipo = formData.get('tipo')?.trim(); const custoStr = formData.get('custo');
    const descricao = formData.get('descricao')?.trim();
    console.log("Dados crus:", { dataStr, horaStr, tipo, custoStr, descricao });

    // 3. Validação Básica (igual antes)
    if (!dataStr || !tipo) { alert("Erro: Data e Tipo são obrigatórios!"); return; }
    const custo = parseFloat(custoStr) || 0;
    if (isNaN(custo) || custo < 0) { alert("Erro: Custo inválido."); return; }

    // 4. Criação e Validação do Objeto Date (método manual mantido)
    let dataCompleta;
    try {
        const [year, month, day] = dataStr.split('-').map(Number); const [hour, minute] = horaStr.split(':').map(Number);
        if (!year || !month || !day || year < 1900 || month < 1 || month > 12 || day < 1 || day > 31 ) throw new Error("Data inválida.");
        const vH = !isNaN(hour) && hour >= 0 && hour <= 23; const vM = !isNaN(minute) && minute >= 0 && minute <= 59;
        const fH = vH ? hour : 0; const fM = vM ? minute : 0; if (!vH || !vM) console.warn("Hora inválida, usando 00:00.");
        dataCompleta = new Date(year, month - 1, day, fH, fM);
        if (isNaN(dataCompleta.getTime()) || dataCompleta.getFullYear() !== year || dataCompleta.getMonth() !== month - 1 || dataCompleta.getDate() !== day) throw new Error("Data inválida para o mês.");
        console.log("Data/Hora criada:", dataCompleta);
    } catch (e) { alert(`Erro Data/Hora: ${e.message}`); console.error("Erro criando Date:", e); return; }

    // 5. Criação da Instância de Manutencao (igual antes)
    const novaManutencao = new Manutencao(null, dataCompleta, tipo, custo, descricao, 'Agendada');
    console.log("Objeto Manutencao criado:", novaManutencao);

    // 6. Adição ao Veículo (igual antes, método já loga e valida)
    console.log(`Tentando chamar veiculo.adicionarManutencao para ${veiculoId}...`);
    const success = veiculo.adicionarManutencao(novaManutencao);
    console.log("Resultado de adicionarManutencao:", success);

    if (success) {
        alert(`Manutenção "${tipo}" agendada com sucesso para ${veiculo.modelo} em ${novaManutencao.getFormattedDate()}!`);
        form.reset(); // Limpa o formulário da view 'agendar'
        // Opcional: Poderia esconder o form ou mostrar mensagem de sucesso permanente
        // Esconder o container do form:
         const formContainer = document.getElementById('agendar-maintenance-form-container');
         if(formContainer) {
             formContainer.innerHTML = `<p style="color: green; text-align: center; font-weight: bold;">Agendamento salvo com sucesso!</p> <p id="select-vehicle-message">Selecione outro veículo ou navegue para outra seção.</p>`;
             // formContainer.classList.add('hidden'); // Ou apenas esconder
         }
         // Opcional: Resetar o select para "-- Selecione --"
         // const selectElement = document.getElementById('vehicle-select-schedule');
         // if (selectElement) selectElement.value = "";

        console.log(`Manutenção ${novaManutencao.id} adicionada com sucesso a ${veiculoId}.`);
    } else {
        console.error(`Falha ao adicionar manutenção a ${veiculoId}.`);
        // Alerta já foi dado por adicionarManutencao se falhou na validação
    }
}
// ***** FIM handleFormSubmit ATUALIZADA *****


// Handler para o botão 'Cancelar' dentro do formulário de agendamento (na view 'agendar')
function handleCancelForm(button) {
    const form = button.closest('form.form-agendamento');
    const formContainer = document.getElementById('agendar-maintenance-form-container');
    const selectElement = document.getElementById('vehicle-select-schedule');

    if (form) form.reset(); // Limpa o formulário

    // Volta para o estado inicial (mensagem para selecionar veículo)
    if(formContainer) {
        formContainer.innerHTML = `<p id="select-vehicle-message">Selecione um veículo acima para ver o formulário.</p>`;
        formContainer.classList.add('hidden');
    }
    // Reseta o select
    if(selectElement) selectElement.value = "";

}
// --- FIM NAVEGAÇÃO E EVENTOS ---


// --- VERIFICAÇÃO AGENDAMENTOS PRÓXIMOS --- (Mantida)
function verificarAgendamentosProximos(diasLimite = 3) {if(diasLimite<=0)return;const agora=new Date();agora.setHours(0,0,0,0);const umDia=24*60*60*1000;const dtLimite=new Date(agora.getTime()+umDia*(diasLimite+1));let alertas=[];for(const id in veiculos){if(veiculos.hasOwnProperty(id)){const v=veiculos[id];const ag=v.getHistoricoManutencao(true,true);ag.forEach(m=>{if(m.data&&m.data<dtLimite){alertas.push(`- ${v.modelo}(${v.tipoVeiculo}): ${m.tipo} em ${m.getFormattedDate()}`);}});}}if(alertas.length>0){setTimeout(()=>{alert(`🔔 LEMBRETE MANUT. PRÓXIMA (${diasLimite} dias) 🔔\n\n${alertas.join("\n")}\n\nAcesse detalhes p/ mais info.`);},500);}else{console.log(`Nenhum agendamento ativo nos próximos ${diasLimite} dias.`);}}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado. Inicializando Garagem v2.0...");
    carregarGaragem();
    renderApp(); // Renderiza a view inicial ('garagem')
    console.log("Aplicação inicializada.");
});

//=================================================//
//                 FIM DO SCRIPT                   //
//=================================================//