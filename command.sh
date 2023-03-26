npm install --save sequelize
npm install --save sequelize-cli
npx sequelize-cli init
npm install --save mysql2

#you need to run this to create database inside 'managed service'
npx sequelize-cli db:create

npx sequelize model:generate --name Questions --attributes content:string,userId:integer
npx sequelize-cli db:migrate

npx sequelize-cli migration:generate --name migration-skeleton

curl -X POST http://localhost:3000/api/questions -H "Content-Type: application/json" -d '{"content": "what is the weather like"}'
curl -X POST -H "Content-Type: application/json" -d '{"content":"our first question", "key2":"value2"}' http://localhost:3000/api/questions
curl -X PUT -H "Content-Type: application/json" -d '{"content": "i am very good"}' http://localhost:3000/api/questions/1

curl https://api.openai.com/v1/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer yourkey" \
  -d '{
    "model": "text-davinci-003",
    "prompt": "Say this is a test",
    "max_tokens": 7,
    "temperature": 0
  }'


curl -X POST -H "Content-Type: application/json" -d '{"email":"-", "password": "-", "username": "handsome"}' http://localhost:3000/api/users
curl -X POST -H "Content-Type: application/json" -d '{"email":"-", "password": "-"}' http://localhost:3000/api/users/login

curl -H "Authorization: Bearer sometoken" http://localhost:3000/api/usersWithToken
curl  http://localhost:3000/api/usersWithToken
