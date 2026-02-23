module.exports = {
    apps: [
        {
            name: 'codearena-backend',
            script: './index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        }
    ]
};
