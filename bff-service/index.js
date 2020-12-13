require('dotenv').config();

const express = require('express'),
    axios = require('axios').default,
    PORT = process.env.PORT || 3001,
    app = express();

app.use(express.json());

app.all('/*', (req, res) => {
    const {originalUrl, method, body} = req,
        target = req.originalUrl.split('/')[1],
        targetUrl = process.env[target];

    console.log('Original Url', originalUrl);
    console.log('method', method);
    console.log('body', body);
    console.log('targetUrl', targetUrl);

    if (!targetUrl) {
        res.status(502).json({error: 'Cannot process request'});
    }

    const axiosConfig = {
        method,
        url: `${targetUrl}${originalUrl}`,
        ...(Object.keys(body || {}).length > 0 && {data: body})
    };

    axios(axiosConfig).then(response => {
        console.log('response', response);
        res.json(response.data);
    }).catch(e => {
        console.log('in catch block');
        if (e.response) {
            res.status(e.response.status).json(e.response.data)
        } else {
            res.status(500).json({error: e.message})
        }
    });
});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
});