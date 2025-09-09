// middleware/errorHandler.js (arquivo completo)
const errorHandler = (err, req, res, next) => {
    console.error(`[ErrorHandler] Erro: ${err.message}`);
    // console.error(err.stack); // Para mais detalhes do stack trace em desenvolvimento

    const statusCode = err.statusCode || 500; // Se o erro tem statusCode, usa ele, senão 500

    res.status(statusCode).json({
        success: false,
        error: err.message || 'Erro de Servidor Interno',
        details: err.stack // Inclui stack trace apenas em desenvolvimento para depuração
    });
};

export default errorHandler;