'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // if we just hasMany -> then default foreignKey is QuestionId. This will be added when we call instance
      Questions.hasMany(models.Answers, {foreignKey: 'questionId'})
    }
  }
  Questions.init({
    content: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Questions',
  });
  return Questions;
};