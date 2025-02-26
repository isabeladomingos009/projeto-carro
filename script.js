class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0; 
        this.ligado = false;
    }

    ligar() {
        this.ligado = true;
        console.log("Carro ligado!");
    }

    desligar() {
        this.ligado = false;
        console.log("Carro desligado!");
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 10;
            console.log("Acelerando! Velocidade atual: " + this.velocidade + " km/h");
            this.atualizarVelocidadeNaTela(); 
        } else {
            console.log("O carro precisa estar ligado para acelerar!");
        }
    }

    atualizarVelocidadeNaTela() {
        const velocidadeElemento = document.getElementById("velocidade");
        velocidadeElemento.textContent = this.velocidade;
    }
    constcarroImagem = document.getElementById("carro-imagem");

   
    constvelocidadeMovimento = 20;
    
   
    constdistanciaMaxima = 500;
    
    
    functionacelerarCarroVisualmente() {
        if (meuCarro.ligado) {
       
            let posicaoAtual = parseInt(carroImagem.style.left) || 0; 
    
            
            let novaPosicao = posicaoAtual + velocidadeMovimento;
    
            
            if (novaPosicao > distanciaMaxima) {
                novaPosicao = distanciaMaxima;
            }
    
           
            carroImagem.style.left = novaPosicao + "px";
    
            console.log("Carro acelerando visualmente. Posição: " + novaPosicao + "px");
        } else {
            console.log("O carro precisa estar ligado para acelerar!");
        }
    }
    
   
    meuCarroacelerar = function() {
        if (this.ligado) {
            this.velocidade += 10; 
            console.log("Acelerando! Velocidade atual: " + this.velocidade + " km/h");
            this.atualizarVelocidadeNaTela(); 
            acelerarCarroVisualmente(); 
        } else {
            console.log("O carro precisa estar ligado para acelerar!");
        }
    }
}

