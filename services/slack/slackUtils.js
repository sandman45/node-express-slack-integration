
const axios = require('axios');

module.exports = {
    sendMessage: (message, responseUrl) => {
        return axios.post(responseUrl,{
            text: message
        });
    },
    oathAccess: (url, payload) => {
        return axios.get(url,{
            params: payload
        });
    }
};
