const balanceSchema = {
  id: String, // Unique identifier
  user_id: String, // User ID
  balances: [
    {
      // Array of balances with other users
      with_user: String, // User ID of the other user
      amount: Number, // Positive: owes money, Negative: owed money
    },
  ],
  updated_at: Date, // Last update timestamp
};
