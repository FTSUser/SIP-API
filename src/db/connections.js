/**
 * MongoDB / Mongoose
 * Created by Bhargav Butani on 06.07.2021
 */
const mongoose = require("mongoose");
const logger = require("../logger");
const ConnectionFactory = require("./connection-factory");
const config = require("../../config.json");

module.exports = async () => {
  mongoose.pluralize(null); // So that mongoose doesn't try to pluralize the schema and map accordingly.
  let models;
  try {
    const connectionFactory = new ConnectionFactory(config);
    // GLOBAL Connections
    const connection_IN_SIP = await connectionFactory.getConnection(
      "GLOBAL",
      config.MONGODB.GLOBAL.DATABASE.SIP
    );

    const mongooseConnections = {
      GLOBAL: {
        SIP: connection_IN_SIP,
      },
    };

    /* All the (mongoose) models to be defined here */
    models = {
      GLOBAL: {
        ADMIN: require("../schema/admin/admin")(connection_IN_SIP),
        USER: require("../schema/user/user")(connection_IN_SIP),
        MENU: require("../schema/menu/menu")(connection_IN_SIP),
        SUBMENU: require("../schema/submenu/submenu")(connection_IN_SIP),
        QUESTION: require("../schema/Question/question")(connection_IN_SIP),
        QUESTIONSET: require("../schema/QuestionSet/questionset")(
          connection_IN_SIP
        ),
        RESPONSE: require("../schema/Response/response")(connection_IN_SIP),
        PAYMENT: require("../schema/payment/payment")(connection_IN_SIP),
        PAYMENTREFUND: require("../schema/payment-refund/paymentRefund")(
          connection_IN_SIP
        ),
        PURCHASEHISTORY: require("../schema/PurchaseHistory/purchasehistory")(
          connection_IN_SIP
        ),
        USERQUESTIONSET: require("../schema/userQuestionset/userQuestionset")(
          connection_IN_SIP
        ),
        THANKYOU: require("../schema/thankyou/thankyou")(connection_IN_SIP),
        INSTRUCTION: require("../schema/instruction/instruction")(
          connection_IN_SIP
        ),

        AMENITIES: require("../schema/amenities/amenities")(connection_IN_SIP),
        PROPERTY: require("../schema/property/property")(connection_IN_SIP),
        CONTACTUS: require("../schema/contactus/contactus")(connection_IN_SIP),
        INTERVIEWGUIDE: require("../schema/interviewGuide/interviewGuide")(
          connection_IN_SIP
        ),
        INTERVIEWCATEGORY:
          require("../schema/interviewCategory/interviewCategory")(
            connection_IN_SIP
          ),
        CONTACTUSADMIN: require("../schema/contactus/contactusadmin")(
          connection_IN_SIP
        ),
        NOTIFICATION: require("../schema/notification/notification")(
          connection_IN_SIP
        ),
        CODE_REGISTRATION: require("../schema/code/code-registration")(
          mongooseConnections.GLOBAL.SIP
        ),
        CODE_VERIFICATION: require("../schema/code/code-verification")(
          mongooseConnections.GLOBAL.SIP
        ),
        LOG: require("../schema/log/log")(mongooseConnections.GLOBAL.SIP),
        ROLE: require("../schema/role/role")(mongooseConnections.GLOBAL.SIP),
      },
    };

    return models;
  } catch (error) {
    logger.error(
      "Error encountered while trying to create database connections and models:\n" +
        error.stack
    );
    return null;
  }
};
