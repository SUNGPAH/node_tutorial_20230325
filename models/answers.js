'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answers extends Model {
    static associate(models) {
      Answers.belongsTo(models.Questions, {foreignKey: 'questionId'})
    }
  }
  Answers.init({
    content: DataTypes.STRING,
    questionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Answers',
  });
  return Answers;
};