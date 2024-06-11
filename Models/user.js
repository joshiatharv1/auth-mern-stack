import { DataTypes } from 'sequelize';

const User = (sequelize) => {
  const UserModel = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_created: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      account_updated: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      emailSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verificationCompletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isEmailAddressVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    },
    {
      timestamps: false,
    }
  );

  return UserModel;
};

export default User;
