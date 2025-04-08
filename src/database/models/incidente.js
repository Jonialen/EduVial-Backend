module.exports = (sequelize, DataTypes) => {
  const Incidente = sequelize.define('Incidente', {
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'incidentes',
  });

  return Incidente;
};
