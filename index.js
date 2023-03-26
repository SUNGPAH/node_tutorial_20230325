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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { EmptyResultError } = require('sequelize');


app.use(express.json())
app.use(cors())
app.use(compression())

app.get('/api/questions', async (req, res) => {
  const questions = await Questions.findAll({
    include: [
      { model: Answers }
    ]
  })

  res.json({ questions: questions })
})

app.post('/api/questions', async (req, res) => {
  const question = await Questions.create({ content: req.body.content })
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

  res.json({ question: question, data: txt, answer: answer })
})

app.get('/api/questions/:id', async (req, res) => {
  const question = await Questions.findOne({ where: { id: req.params.id } })

  if (!question) {
    res.json({ success: false, message: "data not found" })
  }

  const answers = await question.getAnswers()
  const question_using_include = await Questions.findOne({
    where: { id: req.params.id },
    include: [
      { model: Answers }
    ]
  })

  res.json({ question: question, answers: answers, question_using_include: question_using_include })
})

app.put('/api/questions/:id', async (req, res) => {
  const question = await Questions.findOne({ where: { id: req.params.id } })
  await question.update({
    content: req.body.content
  })
  await question.save()

  res.json({ updated: true })
})

app.get('/api/users', async (req, res) => {
  //if token is not here.. then..
  const users = await Users.findAll({})
  res.json({ users: users })
})

app.get('/api/usersWithToken', async (req, res) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    res.json({ success: false })
    return
  }
  const token = authHeader.split(" ")[1]
  
  try{
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)  
    // const now = Date.now() / 1000; // Convert to seconds
    // if (decoded.exp < now) {
    //   res.json({ success: false, message: "Token has expired" })
    //   return
    // }
    // jwt library will handle this for us. So, comment these lines out.
  }catch(e){
    res.json({ success: false, message: e.message })    
    return
  }

  const users = await Users.findAll({})
  res.json({ users: users })
})

app.post('/api/users', async (req, res) => {
  const saltRounds = 8

  const hash = await bcrypt.hash(req.body.password, saltRounds)
  console.log(hash)

  const userExist = await Users.findOne({ where: { email: req.body.email } })
  if (userExist) {
    res.json({ success: false, message: "user exist" })
  }

  const newUser = await Users.create({
    email: req.body.email,
    password: hash,
    username: req.body.username
  })

  res.json({ success: true, newUser: newUser })
})

app.post('/api/users/login', async (req, res) => {
  const user = await Users.findOne({ where: { email: req.body.email } })

  if (!user) {
    res.json({ success: false, message: "user not found" })
    return //this should exist!
  }

  try {
    const matched = await bcrypt.compare(req.body.password, user.password)
    if (matched) {

      const payload = { email: user.email };
      // const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 60 });

      res.json({ success: true, message: 'user found', jwtToken: jwtToken })
    } else {
      res.json({ success: false, message: "password is wrong" })
    }
  } catch (e) {
    res.json({ success: false, message: "password is wrong" })
  }
})

app.get('/api/answers/:id', async (req, res) => {
  const answer = await Answers.findOne({ where: { id: req.params.id } })
  res.json({ success: true, answer: answer })
})

app.listen(3000, () => {
  console.log('Server started on port 3000');
});


