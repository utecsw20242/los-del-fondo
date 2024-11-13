const app = require('./app');

const server = app.listen(app.get('port'),()=>{
    console.log(`Server on port ${app.get('port')}`);
})

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down the server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Force closing server due to timeout');
        process.exit(1);    
    }, 5000);
});