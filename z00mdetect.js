const express = require('express');
const app = express();
const PORT = process.env.PORT || 9333;

app.all('/', (req, res) => res.send(`
    Calculating your default signature....
    <script>
        window.onload = () => {
            let orientation = screen.orientation ? screen.orientation.angle :
                window.orientation;
            let screenHeight = Math.abs(orientation) !== 90 ? screen.height : screen.width;
            let signature = window.devicePixelRatio + screenHeight / window.innerHeight;
            location.href = '//z00mtrack.herokuapp.com/#' + signature;
        };
    </script>
`));

app.listen(PORT);
