// models/Wishlist.js
module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true,  // Creates `createdAt` and `updatedAt` columns
  });

  // Relationships
  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.User, { foreignKey: 'user_id' });
    Wishlist.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', });
  };

  return Wishlist;
};
