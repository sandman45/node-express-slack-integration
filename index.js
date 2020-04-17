require('dotenv').config();
const express = require('express');
const favicon = require('express-favicon');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const app = express();
const slackUtils = require('./services/slack/slackUtils');
const awsUtil = require('./services/aws/awsUtil');
const groupTable = require('./modules/groupTable');
const slackTable = require('./modules/slackTable');
const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');

app.use(express.static('app'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(favicon(`${__dirname}/public/favicons/favicon.ico`));

awsUtil.init();

app.get('/', (req, res, next) => {
   res.send('server is running');
});

app.get('/sub/:groupId', async (req, res) => {
   const results = await slackTable.getSlackSubscription(req.params.groupId);
   res.send(results);
});

function validateSlackRequest(body, headers) {
    const signingSecret = process.env.SLACK_EDCONNECT_SIGNING_SECRET;
    const timestamp = headers['x-slack-request-timestamp'];
    const incomingSignature = headers['x-slack-signature'];
    const version = "v0";
    let sigBase;
    let signature;
    if (Math.abs(moment().unix() - timestamp) > 60 * 5) {
        return false;
    }
    console.log(`incoming signature: ${incomingSignature}`);
    sigBase = `${version}:${moment().unix()}:${qs.stringify(body, {format: 'RFC1738'})}`;
    console.log(`base signature: ${sigBase}`);
    signature = `${version}=${crypto.createHmac('sha256', signingSecret).update(sigBase, 'utf8').digest('hex')}`;
    console.log(`generated signature: ${signature}`);

    return signature === incomingSignature;

}

app.post('/slack/test', async (req, res) => {
    if (!validateSlackRequest(req.body, req.headers)) {
        res.status(400).send('Ignore this request.');
    } else {
        res.send('test complete');
    }
});

// subscribe your group
app.post('/slack/subscribe', async (req, res, next) => {
    console.log(`Team ID: ${JSON.stringify(req.body)}`);
    if(!validateSlackRequest(req.body)) {
        res.sendStatus(300);
    }
    const slackRecord = await slackTable.getSlackRecord(req.body.team_id, req.body.channel_id);
    const groupRecord = await groupTable.getGroup(req.body.text);
    let message = "";
    if (groupRecord.Items.length > 0){
        const { id, name } = groupRecord.Items[0];
        const payload = { ...req.body, webhooks: slackRecord.Items[0].data.incoming_webhook };
        const subRecord = await slackTable.saveSlackSubscription(req.body.team_id, req.body.channel_id, id, payload);
        message = `You have Subscribed to the Group: ${name}`;
    } else {
        message = `Group: ${req.body.text} not found`;
    }

    await slackUtils.sendMessage(message, req.body.response_url);
    res.sendStatus(200);
});



app.get('/oauth', async (req, res) => {
    if(!req.query.code) {
        const message = "Looks like we're not getting code.";
        console.log(message);
        res.status(500);

        res.send({
            "Error":message
        });
    } else {
        // call
        let results;
        console.log(`code: ${req.query.code}`);
        try {
            results = await slackUtils.oathAccess('https://slack.com/api/oauth.v2.access', {
                code: req.query.code,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET
            });
            console.log(results.data);
        } catch (e) {
            console.error(e);
        }

        if(results.data.ok){
            try {
                const stuff = await slackTable.saveSlackRecord(results.data);
            } catch (e) {
                console.log(e);
            }
            res.send("success");
        } else {
            res.send(results.data.error);
        }
    }
});

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.error(`error - ${err}`);
    }
    console.log(`server running on port: ${process.env.PORT}`);
});
