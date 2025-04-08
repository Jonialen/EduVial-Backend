// EduVial-Backend/src/database/models/user.model.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here if needed later
      // e.g., User.hasMany(models.Post, { foreignKey: 'userId' });
    }

    // Método para excluir la contraseña al convertir a JSON (útil para respuestas API)
    toJSON() {
        const values = { ...this.get() };
        delete values.password;
        return values;
    }
  }

  User.init({
    // user_id: lo define Sequelize automáticamente como 'id' si es PK y auto-incremental
    // Si quieres llamarlo 'user_id', configúralo explícitamente:
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false // Aunque autoIncrement lo implica
    },
    name: {
      type: DataTypes.STRING(100), // VARCHAR(100)
      allowNull: false,
      validate: {
        notNull: { msg: 'Name is required' },
        notEmpty: { msg: 'Name cannot be empty' }
      }
    },
    email: {
      type: DataTypes.STRING(100), // VARCHAR(100)
      allowNull: false,
      unique: true, // Constraint UNIQUE
      validate: {
        notNull: { msg: 'Email is required' },
        notEmpty: { msg: 'Email cannot be empty' },
        isEmail: { msg: 'Must be a valid email address' }
      }
    },
    password: {
      type: DataTypes.CHAR(60), // CHAR(60) para hashes bcrypt
      allowNull: false,
      validate: {
        notNull: { msg: 'Password is required' },
        notEmpty: { msg: 'Password cannot be empty' },
        // Podrías añadir validación de longitud mínima aquí, aunque se hará con bcrypt
      }
    },
    role: {
      // Define el tipo ENUM directamente
      type: DataTypes.ENUM('admin', 'principiante', 'avanzado'),
      allowNull: false,
      defaultValue: 'principiante', // Valor por defecto
      validate: {
        notNull: { msg: 'Role is required' },
        isIn: {
            args: [['admin', 'principiante', 'avanzado']],
            msg: "Role must be one of: admin, principiante, avanzado"
        }
      }
    }
  }, {
    sequelize, // Instancia de Sequelize pasada
    modelName: 'User', // Nombre del modelo en singular
    tableName: '"USER"', // Nombre EXACTO de la tabla en la BD (con comillas por ser palabra reservada)
    timestamps: false, // Deshabilita createdAt y updatedAt si no existen en tu tabla
    // Si tuvieras createdAt/updatedAt, podrías renombrarlos:
    // createdAt: 'creation_date',
    // updatedAt: 'last_update'
    underscored: true, // Si tus nombres de columna usan snake_case (user_id ya lo hemos definido explícitamente)
    // Hooks (ejemplo para hashear contraseña antes de guardar)
    hooks: {
      // No vamos a hashear aquí directamente, lo haremos en el servicio para más control
      // beforeCreate: async (user, options) => { /* hash password */ },
      // beforeUpdate: async (user, options) => { /* hash password if changed */ }
    }
  });

  return User;
};
