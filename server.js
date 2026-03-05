const express = require('express');
const server = express();
server.all('/',(req,res)=>{
  res.send("카카오톡 봇 온라인");
})
function keepAlive() {
  server.listen(8080, '0.0.0.0', () => {
    console.log(`서버가 8080번 포트에서 돌아가고 있습니다 (0.0.0.0)`);
  });
}
module.exports = keepAlive;