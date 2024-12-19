module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define('Cart', {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,  // Default to 1 item
      },
    }, {
      timestamps: true,  // Creates `createdAt` and `updatedAt` columns
    });
  
    // Relationships
    Cart.associate = (models) => {
      Cart.belongsTo(models.User, { foreignKey: 'user_id' });
      Cart.belongsTo(models.Product, { foreignKey: 'product_id' });
    };
  
    return Cart;
  };
  