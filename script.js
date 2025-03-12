
// Classe Carro (base)
class Carro {
    constructor(modelo, cor) {
      this.modelo = modelo;
      this.cor = cor;
      this.ligado = false;
      this.velocidade = 0;
    }
  
    // Método para ligar o carro
    ligar() {
      this.ligado = true;
      this.atualizarTela();
    }
  
    // Método para desligar o carro
    desligar() {
      this.ligado = false;
      this.velocidade = 0;
      this.atualizarTela();
    }
  
    // Método para acelerar o carro
    acelerar() {
      if (this.ligado) {
        this.velocidade += 10;
        this.atualizarTela();
      } else {
        alert(`${this.modelo} precisa estar ligado para acelerar!`);
      }
    }
  
    // Método para atualizar a tela
    atualizarTela() {
      const statusCarro = document.getElementById("statusCarro");
      const velocidade = document.getElementById("velocidade");
      
      // Exibe se o carro está ligado ou desligado
      statusCarro.textContent = this.ligado ? "Carro ligado" : "Carro desligado";
      // Atualiza a velocidade na tela
      velocidade.textContent = "Velocidade: " + this.velocidade + " km/h";
    }
  }
  
  // Classe CarroEsportivo (herda de Carro)
  class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
      super(modelo, cor);
      this.turboAtivado = false;
    }
  
    // Método para ativar o turbo
    ativarTurbo() {
      if (this.turboAtivado) {
        console.log(`${this.modelo} já tem o turbo ativado!`);
      } else {
        this.turboAtivado = true;
        this.velocidade += 30;
        console.log(`${this.modelo} ativou o turbo. Velocidade: ${this.velocidade} km/h`);
        this.atualizarTela();
      }
    }
  }
  
  // Classe Caminhao (herda de Carro)
  class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
      super(modelo, cor);
      this.capacidadeCarga = capacidadeCarga;
      this.cargaAtual = 0;
    }
  
    // Método para carregar o caminhão
    carregar(carga) {
      if (this.cargaAtual + carga <= this.capacidadeCarga) {
        this.cargaAtual += carga;
        console.log(`${this.modelo} carregou ${carga} kg. Carga total: ${this.cargaAtual} kg`);
      } else {
        console.log(`${this.modelo} não pode carregar mais do que ${this.capacidadeCarga} kg!`);
      }
    }
  }
  
  // Criando objetos do carro esportivo e caminhão
  let carroEsportivo = new CarroEsportivo("Ferrari", "Vermelha");
  let caminhao = new Caminhao("Scania", "Azul", 10000); // capacidade de carga de 10.000 kg
  
  // Funções para interagir com o Carro Esportivo
  document.getElementById("ligar-esportivo").onclick = function() {
    carroEsportivo.ligar();
  };
  
  document.getElementById("acelerar-esportivo").onclick = function() {
    carroEsportivo.acelerar();
    document.getElementById("velocidade-esportivo").innerText = carroEsportivo.velocidade;
  };
  
  document.getElementById("ativar-turbo").onclick = function() {
    carroEsportivo.ativarTurbo();
    document.getElementById("velocidade-esportivo").innerText = carroEsportivo.velocidade;
  };
  
  // Funções para interagir com o Caminhão
  document.getElementById("ligar-caminhao").onclick = function() {
    caminhao.ligar();
  };
  
  document.getElementById("acelerar-caminhao").onclick = function() {
    caminhao.acelerar();
    document.getElementById("velocidade-caminhao").innerText = caminhao.velocidade;
  };
  
  document.getElementById("carregar-caminhao").onclick = function() {
    let carga = prompt("Digite o peso da carga (kg):");
    caminhao.carregar(Number(carga));
    document.getElementById("carga-atual").innerText = caminhao.cargaAtual;
  };
  