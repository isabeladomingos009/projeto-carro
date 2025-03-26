// Função para tocar o som da buzina
function tocarBuzina() {
    const audio = new Audio('buzina.mp3');
    audio.play();
}

// Função para tocar o som de acelerar
function tocarAcelerar() {
    const audio = new Audio('acelerar.mp3');
    audio.play();
}

// Função para tocar o som de frear
function tocarFrear() {
    const audio = new Audio('frear.mp3');
    audio.play();
}

// Função para tocar o som de ligar
function tocarLigar() {
    const audio = new Audio('ligar.mp3');
    audio.play();
}

// Função para tocar o som de desligar
function tocarDesligar() {
    const audio = new Audio('desligar.mp3');
    audio.play();
}

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
        } else {
            alert("O veículo já está parado!");
        }
    }

    mudarCor() {
        console.log("Mudar cor não implementado para este veículo.");
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
        this.velocidadeElement = document.getElementById(idVelocidade);
        this.velocidadeProgressBar = document.getElementById("velocidade-progress-carro");
        this.cores = ["Prata", "Branco", "Preto", "Cinza"];
        this.indiceCorAtual = 0;
    }

    acelerar() {
        if (this.ligado) {
            if (this.velocidade < 180) {
                this.velocidade += 10;
                this.atualizarTela();
                tocarAcelerar();
            } else {
                alert("O carro atingiu a velocidade máxima!");
            }
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
        this.statusCarroElement.textContent = this.ligado ? "Carro ligado" : "Carro desligado";
        this.statusCarroElement.className = this.ligado ? "ligado" : "desligado";
        this.velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h";
        const porcentagemVelocidade = Math.min(this.velocidade / 180, 1) * 100;
        this.velocidadeProgressBar.style.width = porcentagemVelocidade + "%";
    }

    buzinar() {
        tocarBuzina();
        console.log("Fom Fom! (Som de Carro)");
    }

    frear() {
        if (this.velocidade > 0) {
            super.frear();
            tocarFrear();
        } else {
            alert("O carro já está parado!");
        }
    }

    ligar() {
        if (!this.ligado) {
            super.ligar();
            tocarLigar();
            this.statusCarroElement.className = "ligado"; // Atualiza a classe para a cor correta
        } else {
            alert("O carro já está ligado!");
        }
    }

    desligar() {
        if (this.ligado) {
            super.desligar();
            tocarDesligar();
            this.statusCarroElement.className = "desligado"; // Atualiza a classe para a cor correta
        } else {
            alert("O carro já está desligado!");
        }
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
        this.velocidadeProgressBar = document.getElementById("velocidade-progress-carroEsportivo");
        this.cores = ["Vermelha", "Amarela", "Azul", "Verde"];
        this.indiceCorAtual = 0;
    }

    ativarTurbo() {
        if (!this.turboAtivado) {
            if (this.ligado) {
                this.turboAtivado = true;
                this.velocidade += 50;
                this.atualizarTela();
            } else {
                alert("O carro esportivo precisa estar ligado para ativar o turbo!");
            }
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
        this.turboStatusElement.textContent = `Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`;
        this.statusCarroElement.textContent = this.ligado ? "Carro ligado" : "Carro desligado";
        this.statusCarroElement.className = this.ligado ? "ligado" : "desligado";
        this.velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h";
        const porcentagemVelocidade = Math.min(this.velocidade / 250, 1) * 100;
        this.velocidadeProgressBar.style.width = porcentagemVelocidade + "%";
    }

    buzinar() {
        tocarBuzina();
        console.log("VRUUUUUM! (Som de Carro Esportivo)");
    }

    acelerar() {
        if (this.ligado) {
            if (this.velocidade < 250) {
                this.velocidade += 10;
                this.atualizarTela();
                tocarAcelerar();
            } else {
                alert("O carro atingiu a velocidade máxima!");
            }
        } else {
            alert(`${this.modelo} precisa estar ligado para acelerar!`);
        }
    }

    frear() {
        if (this.velocidade > 0) {
            super.frear();
            tocarFrear();
        } else {
            alert("O carro já está parado!");
        }
    }

    ligar() {
        if (!this.ligado) {
            super.ligar();
            tocarLigar();
            this.statusCarroElement.className = "ligado"; // Atualiza a classe para a cor correta
        } else {
            alert("O carro já está ligado!");
        }
    }

    desligar() {
        if (this.ligado) {
            super.desligar();
            tocarDesligar();
            this.statusCarroElement.className = "desligado"; // Atualiza a classe para a cor correta
        } else {
            alert("O carro já está desligado!");
        }
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
        this.velocidadeProgressBar = document.getElementById("velocidade-progress-caminhao");
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
        this.statusCarroCaminhaoElement.textContent = this.ligado ? "Carro ligado" : "Carro desligado";
        this.statusCarroCaminhaoElement.className = this.ligado ? "ligado" : "desligado";
        this.velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h";
        this.cargaAtualElement.textContent = "Carga Atual: " + this.cargaAtual + " kg";
        const porcentagemVelocidade = Math.min(this.velocidade / 120, 1) * 100;
        this.velocidadeProgressBar.style.width = porcentagemVelocidade + "%";
    }

    buzinar() {
        tocarBuzina();
        console.log("POOOOOOM! (Som de Caminhão)");
    }

    acelerar() {
        if (this.ligado) {
            if (this.velocidade < 120) {
                this.velocidade += 10;
                this.atualizarTela();
                tocarAcelerar();
            } else {
                alert("O caminhão atingiu a velocidade máxima!");
            }
        } else {
            alert(`${this.modelo} precisa estar ligado para acelerar!`);
        }
    }

    frear() {
        if (this.velocidade > 0) {
            super.frear();
            tocarFrear();
        } else {
            alert("O caminhão já está parado!");
        }
    }

    ligar() {
        if (!this.ligado) {
            super.ligar();
            tocarLigar();
            this.statusCarroCaminhaoElement.className = "ligado"; // Atualiza a classe para a cor correta
        } else {
            alert("O caminhão já está ligado!");
        }
    }

    desligar() {
        if (this.ligado) {
            super.desligar();
            tocarDesligar();
            this.statusCarroCaminhaoElement.className = "desligado"; // Atualiza a classe para a cor correta
        } else {
            alert("O caminhão já está desligado!");
        }
    }
}

// Classe Moto (Herdando de Veiculo)
class Moto extends Veiculo {
    constructor(modelo, cor, idVelocidade, statusMotoElement) {
        super(modelo, cor);
        this.idVelocidade = idVelocidade;
        this.statusMotoElement = document.getElementById(statusMotoElement);
        this.velocidadeElement = document.getElementById(idVelocidade);
        this.velocidadeProgressBar = document.getElementById("velocidade-progress-moto");
        this.cores = ["Preta", "Vermelha", "Azul", "Branca"];
        this.indiceCorAtual = 0;
    }

    acelerar() {
        if (this.ligado) {
            if (this.velocidade < 200) {
                this.velocidade += 15;
                this.atualizarTela();
                tocarAcelerar();
            } else {
                alert("A moto atingiu a velocidade máxima!");
            }
        } else {
            alert(`${this.modelo} precisa estar ligada para acelerar!`);
        }
    }

    mudarCor() {
        this.indiceCorAtual = (this.indiceCorAtual + 1) % this.cores.length;
        this.cor = this.cores[this.indiceCorAtual];
        alert(`Cor da moto mudou para ${this.cor}`);
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}`;
    }

    atualizarTela() {
        this.statusMotoElement.textContent = this.ligado ? "Moto ligada" : "Moto desligada";
        this.statusMotoElement.className = this.ligado ? "ligado" : "desligado";
        this.velocidadeElement.textContent = "Velocidade: " + this.velocidade + " km/h";
        const porcentagemVelocidade = Math.min(this.velocidade / 200, 1) * 100;
        this.velocidadeProgressBar.style.width = porcentagemVelocidade + "%";
    }

    buzinar() {
        tocarBuzina();
        console.log("Bip Bip! (Som de Moto)");
    }

    frear() {
        if (this.velocidade > 0) {
            super.frear();
            tocarFrear();
        } else {
            alert("A moto já está parada!");
        }
    }

    ligar() {
        if (!this.ligado) {
            super.ligar();
            tocarLigar();
            this.statusMotoElement.className = "ligado"; // Atualiza a classe para a cor correta
        } else {
            alert("A moto já está ligada!");
        }
    }

    desligar() {
        if (this.ligado) {
            super.desligar();
            tocarDesligar();
            this.statusMotoElement.className = "desligado"; // Atualiza a classe para a cor correta
        } else {
            alert("A moto já está desligada!");
        }
    }
}

// Classe Bicicleta (Herdando de Veiculo)
class Bicicleta extends Veiculo {
    constructor(modelo, cor, idVelocidade) {
        super(modelo, cor);
        this.idVelocidade = idVelocidade;
        this.velocidadeElement = document.getElementById(idVelocidade);
    }

    acelerar() {
        if (this.velocidade < 40) { // Velocidade máxima de uma bicicleta
            this.velocidade += 5;
            this.atualizarTela();
        } else {
            alert("A bicicleta atingiu a velocidade máxima!");
        }
    }

    frear() {
        if (this.velocidade > 0) {
            this.velocidade = Math.max(0, this.velocidade - 5);
            this.atualizarTela();
        } else {
            alert("A bicicleta já está parada!");
        }
    }

    buzinar() {
        console.log("Trim Trim! (Som de Bicicleta)");
    }

    exibirInformacoes() {
        return `${super.exibirInformacoes()}`;
    }

    atualizarTela() {
        this.velocidadeElement.textContent = "Veloc