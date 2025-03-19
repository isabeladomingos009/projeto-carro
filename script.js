// Classe Base Veiculo
class Veiculo {
  constructor(modelo, cor) {
      this.modelo = modelo;
      this.cor = cor;
      this.ligado = false;
      this.velocidade = 0;
  }

  ligar() {
      this.ligado = true;
      this.atualizarTela();
  }

  desligar() {
      this.ligado = false;
      this.velocidade = 0;
      this.atualizarTela();
  }

  frear() {
      if (this.velocidade > 0) {
          this.velocidade = Math.max(0, this.velocidade - 10);
          this.atualizarTela();
      }
  }

  mudarCor() {
      console.log("Mudar cor não implementado para este veículo.");
  }

  buzinar() {
      console.log("Bi Bi! (Som genérico de veículo)");
  }

  exibirInformacoes() {
      return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
  }

  atualizarTela() {
      // Este método será sobrescrito nas classes filhas
  }
}

// Classe Carro (Herdando de Veiculo)
class Carro extends Veiculo {
  constructor(modelo, cor, idVelocidade, statusCarroElement) {
      super(modelo, cor);
      this.idVelocidade = idVelocidade;
      this.statusCarroElement = document.getElementById(statusCarroElement);
      this.cores = ["Prata", "Branco", "Preto", "Cinza"];
      this.indiceCorAtual = 0;
  }

  acelerar() {
      if (this.ligado) {
          this.velocidade += 10;
          this.atualizarTela();
      } else {
          alert(`${this.modelo} precisa estar ligado para acelerar!`);
      }
  }

  mudarCor() {
      this.indiceCorAtual = (this.indiceCorAtual + 1) % this.cores.length;
      this.cor = this.cores[this.indiceCorAtual];
      alert(`Cor do carro mudou para ${this.cor}`);
  }

  exibirInformacoes() {
      return `${super.exibirInformacoes()}`;
  }

  atualizarTela() {
      const velocidadeElement = document.getElementById(this.idVelocidade);
      this.statusCarroElement.textContent = this.ligado ? "Carro ligado" : "Carro desligado";
      velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h";
  }

  buzinar() {
      console.log("Fom Fom! (Som de Carro)");
  }
}

// Classe CarroEsportivo (Herdando de Carro)
class CarroEsportivo extends Carro {
  constructor(modelo, cor, idVelocidade, idTurboStatus) {
      super(modelo, cor, idVelocidade, "statusCarroEsportivo");
      this.turboAtivado = false;
      this.idTurboStatus = idTurboStatus;
      this.velocidadeElement = document.getElementById(idVelocidade);
      this.turboStatusElement = document.getElementById(idTurboStatus);
      this.cores = ["Vermelha", "Amarela", "Azul", "Verde"];
      this.indiceCorAtual = 0;
  }

  ativarTurbo() {
      if (!this.turboAtivado) {
          this.turboAtivado = true;
          this.velocidade += 50;
          this.atualizarTela();
      }
  }

  desativarTurbo() {
      if (this.turboAtivado) {
          this.turboAtivado = false;
          this.velocidade -= 50;
          this.atualizarTela();
      }
  }

  mudarCor() {
      this.indiceCorAtual = (this.indiceCorAtual + 1) % this.cores.length;
      this.cor = this.cores[this.indiceCorAtual];
      alert(`Cor do carro esportivo mudou para ${this.cor}`);
  }

  exibirInformacoes() {
      return `${super.exibirInformacoes()}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
  }

  atualizarTela() {
      const velocidadeElement = document.getElementById(this.idVelocidade);
      velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h";
      this.turboStatusElement.textContent = `Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`;
  }

  buzinar() {
      console.log("VRUUUUUM! (Som de Carro Esportivo)");
  }
}

// Classe Caminhao (Herdando de Carro)
class Caminhao extends Carro {
  constructor(modelo, cor, capacidadeCarga, idVelocidade, idCarga, statusCarroElement) {
      super(modelo, cor, idVelocidade, statusCarroElement);
      this.capacidadeCarga = capacidadeCarga;
      this.cargaAtual = 0;
      this.idCarga = idCarga;
      this.statusCarroCaminhaoElement = document.getElementById(statusCarroElement);
      this.velocidadeElement = document.getElementById(idVelocidade);
      this.cargaAtualElement = document.getElementById(idCarga);
      this.cores = ["Azul", "Laranja", "Verde", "Marrom"];
      this.indiceCorAtual = 0;
  }

  carregar(carga) {
      const cargaNum = Number(carga);
      if (!isNaN(cargaNum)) {
          if (this.cargaAtual + cargaNum <= this.capacidadeCarga) {
              this.cargaAtual += cargaNum;
              this.atualizarTela();
              console.log(`Carga adicionada. Carga atual: ${this.cargaAtual}`);
          } else {
              alert("Carga excede a capacidade!");
          }
      } else {
          alert("Por favor, insira um valor numérico para a carga.");
      }
  }

  mudarCor() {
      this.indiceCorAtual = (this.indiceCorAtual + 1) % this.cores.length;
      this.cor = this.cores[this.indiceCorAtual];
      alert(`Cor do caminhão mudou para ${this.cor}`);
  }

  exibirInformacoes() {
      return `${super.exibirInformacoes()}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
  }

  atualizarTela() {
      super.atualizarTela(); // Atualiza o status do carro
      this.velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h";
      this.cargaAtualElement.textContent = "Carga Atual: " + this.cargaAtual + " kg";
  }

  buzinar() {
      console.log("POOOOOOM! (Som de Caminhão)");
  }
}

// Criando objetos
const carro = new Carro("Sedan", "Prata", "velocidade", "statusCarro");
const carroEsportivo = new CarroEsportivo("Ferrari", "Vermelha", "velocidade-esportivo", "turbo-status");
const caminhao = new Caminhao(
  "Scania",
  "Azul",
  10000,
  "velocidade-caminhao",
  "carga-atual",
  "statusCarroCaminhao"
);

let veiculoSelecionado = carro; // Defina um veículo padrão

// Função para selecionar o veículo na garagem
function selecionarVeiculo(tipo) {
  switch (tipo) {
      case "carro":
          veiculoSelecionado = carro;
          break;
      case "carroEsportivo":
          veiculoSelecionado = carroEsportivo;
          break;
      case "caminhao":
          veiculoSelecionado = caminhao;
          break;
      default:
          console.log("Tipo de veículo inválido.");
          return;
  }
  exibirInformacoesVeiculo();
}

// Função para exibir as informações do veículo na garagem
function exibirInformacoesVeiculo() {
  const informacoesVeiculoElement = document.getElementById("informacoesVeiculo");
  informacoesVeiculoElement.textContent = veiculoSelecionado.exibirInformacoes();
}

// Função para interagir com o veículo diretamente
function interagirVeiculo(veiculoId, acao) {
  let veiculo;
  switch (veiculoId) {
      case "carro":
          veiculo = carro;
          break;
      case "carroEsportivo":
          veiculo = carroEsportivo;
          break;
      case "caminhao":
          veiculo = caminhao;
          break;
      default:
          console.log("ID de veículo inválido.");
          return;
  }

  switch (acao) {
      case "ligar":
          veiculo.ligar();
          break;
      case "desligar":
          veiculo.desligar();
          break;
      case "acelerar":
          veiculo.acelerar();
          break;
      case "frear":
          veiculo.frear();
          break;
      case "buzinar":
          veiculo.buzinar();
          break;
      case "ativarTurbo":
          if (veiculo instanceof CarroEsportivo) {
              veiculo.ativarTurbo();
          } else {
              alert("Turbo não disponível para este veículo.");
          }
          break;
      case "desativarTurbo":
        if (veiculo instanceof CarroEsportivo) {
            veiculo.desativarTurbo();
        } else {
            alert("Turbo não disponível para este veículo.");
        }
        break;
      case "carregar":
          if (veiculo instanceof Caminhao) {
              const carga = document.getElementById("carga").value;
              veiculo.carregar(carga);
          } else {
              alert("Carregar não disponível para este veículo.");
          }
          break;
      case "mudarCor":
          veiculo.mudarCor();
          break;
      default:
          alert("Ação inválida.");
  }
  exibirInformacoesVeiculo(); // Atualiza as informações após a interação
}

// Exibir informações do veículo padrão ao carregar a página
exibirInformacoesVeiculo();