const express = require('express');
const app = express();
const storage = require('node-persist');
const PORT = process.env.PORT || 9333;

app.all('/', (req, res) => res.send(`
    You have to zoom in or zoom out and then <s>refresh the page.</s>
    <sup>it should refresh itself!</sup>
    <script>
        window.onload = () => {
            let getSignature = () => {
                let orientation = screen.orientation ? screen.orientation.angle :
                    window.orientation;
                let screenHeight = Math.abs(orientation) !== 90 ? screen.height : screen.width;
                return window.devicePixelRatio + screenHeight / window.innerHeight;
            };
            let signature = getSignature();
            switch(location.hash.slice(1)) {
                case '':
                    location.replace('https://z00mdetect.herokuapp.com');
                    break;
                case signature.toString():
                    break;
                default:
                    !location.pathname.startsWith('/signature/') &&
                        location.replace('/signature/' + signature);
            }
            window.onresize = () => {
                if (getSignature() !== signature)
                    location.replace('');
            };
            history.pushState(null, null, '/');
        };
    </script>
`));

app.all('/signature/:signature([\\w.]+)', (req , res) => {
    let id, signatureId;
    let signature = req.params.signature;

    storage.initSync();
    id = storage.getItemSync('id') || 1;
    id += 1;
    storage.setItemSync('id', id);
    signatureId = storage.getItemSync(signature);

    if (!signatureId) {
        storage.setItemSync(signature, id);
        res.send(`
            You don't appear to have visited this site before!<br>
            id = ${id}<br>
            signature = ${signature}
        `);
    } else {
        res.send(`
            Looks like you have visited this site before!<br>
            Your id was #${signatureId}.<br>
            P.S. Your signature will get automatically erased from our servers after 
            30 minutes, because we <s>take your privacy very seriously</s> are running 
            on a free Heroku dyno!
        `);
    }
});

app.listen(PORT);
