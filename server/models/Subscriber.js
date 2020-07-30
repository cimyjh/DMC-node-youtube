const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//데이터를 User에서 가져오는 것이다.
const subscriberSchema = mongoose.Schema(
  {
    userTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userFrom: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = { Subscriber };
