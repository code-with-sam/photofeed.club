let config = {
    port: 3000,
    db: {
        user: process.env.PHOTOFEED_DB_USER,
        password: process.env.PHOTOFEED_DB_PASSWORD,
    },
    session: {
        secret: process.env.SESSION_SECRET
    }
};

module.exports = config;
