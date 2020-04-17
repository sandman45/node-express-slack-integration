# Node Express Slack integration


Need help setting up your Slack App integration?

follow the steps below.

#### SETUP

- `git clone` this repo

- `npm install`

- create your env file

    `touch .env`
    
    ```javascript 1.8
    PORT=3000
    CLIENT_ID="*********.************" // Slack Client ID 
    CLIENT_SECRET="*******************" // Slack Client Secret
    AWS_ACCESS_KEY="**************" // your AWS ACCESS KEY
    AWS_ACCESS_SECRET="**********************" // your AWS ACCESS SECRET 
    SLACK_SIGNING_SECRET="******************" // Slack Signing Secret
    ENV="DEV"
    ```

- run it

    `npm run index.js`
    
