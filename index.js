const express = require('express');
const app = express();
var cors = require('cors')

var compression = require('compression')
const dotenv = require('dotenv');
dotenv.config()

const db = require('./models')
const Questions = db.Questions
const Answers = db.Answers
const Users = db.Users

const axios = require('axios')

app.use(express.json())
app.use(cors())
app.use(compression())

app.get('/api/questions', async (req,res) => {
  const questions = await Questions.findAll({
    include: [
      {model: Answers}
    ]
  })

  res.json({questions: questions})
})

app.post('/api/questions', async (req,res) => {
  const question = await Questions.create({content: req.body.content})
  const openaiKey = process.env.OPENAI_KEY
  

  const endPoint = "https://api.openai.com/v1/completions"

  const _res = await axios.post(endPoint, {
    model: "text-davinci-003",
    prompt: `${question.content} in 50 tokens`,
    max_tokens: 50,
    temperature: 1.0,
  }, {
    headers: {
      "Authorization": `Bearer ${openaiKey}`
    }
  })

  const data = _res.data 
  const txt = data.choices[0].text.replace("\n", "")

  const answer = await Answers.create({
    questionId: question.id, 
    content: txt
  })
  
  res.json({question: question, data: txt, answer: answer})
})

app.get('/api/questions/:id', async (req,res) => {

  console.log(req.params.id)
  const question = await Questions.findOne({where: {id: req.params.id}})
  const answers = await question.getAnswers()
  res.json({question:question, answers:answers})

})

app.put('/api/questions/:id', async (req,res) => {
  const question = await Questions.findOne({where:{id:req.params.id}})
  await question.update({
    content: req.body.content
  })
  await question.save()

  res.json({updated: true})
})

app.get('/api/users', async (req,res) => {

  res.json({})
})

app.post('/api/users', async (req,res) => {
  
  //email, password -> bycrypt
  //pass

  // awant Users.create({
  //   email: ~~
  //   password: bycyipt(~~)
  // })

  //bearer

})

app.post('/api/users/login', async (req,res) => {
  const user = await Users.findOne({where:{email: req.body.email}})
  if(!user){
    res.json({sucess: false, mesage: 'not foudn'})
    return
  }
})

app.listen(3000, () => {
  console.log('Server started on port 3000');
 });
 

