const express = require("express");
const router = express.Router();
router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});
module.exports = router;

router.post('/chat/newmessage', (req,res) => {
  
});