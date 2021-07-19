import mongoose, { ConnectOptions } from "mongoose";
import ENV from "./env-config";
import App from "./App";

const mongoString = ENV.APP_DB_URI;
const mongoOptions: ConnectOptions = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

/**
 * single connection for now
 * looks like we might have to extend Document on models if we use
 * Connection.model instead of Mongoose.model
 */
mongoose
  .connect(mongoString, mongoOptions)
  .then(() => {
    const myApp = App.getInstance();
    myApp.listen(ENV.APP_PORT);
  })
  .catch((error) => {
    console.log("error", `Error in index.ts: ${error}`);
  });

mongoose.Promise = global.Promise;
