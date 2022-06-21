const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    // route validation

    handler: async (req, res) => {
        
        try {
            
            let id = req.params.id;
            if(!id){
                const data4createResponseObject = {
                    req: req,
                    result: -1,
                    message: messages.INVALID_PARAMETERS,
                    payload: {},
                    logPayload: false
                };
                res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
                return;
            }
            const Propertys = await global.models.GLOBAL.RESPONSE.findOne({_id:id});
            let loq=[];
            console.log("length of ListofQA", Propertys.ListofQA.length)
            for(i=0 ;i<Propertys.ListofQA.length;i++){
                let testans=[]
                for(j=0;j<Propertys.ListofQA[i].Option.length;j++){
                    console.log("tttttt",Propertys.ListofQA[i].Option[j].istrue)
                   if(Propertys.ListofQA[i].Option[j].istrue==true){
                       testans.push(Propertys.ListofQA[i].Option[j].no)
                   }
                }
                // console.log("true ans",testans);
                if(testans.sort().join(',')=== Propertys.ListofQA[i].Answer.sort().join(',')){
                    console.log("true vishvans",{...Propertys.ListofQA[i]._doc,isRight:true});
                   loq.push({...Propertys.ListofQA[i]._doc,isRight:true})
                }else
                {
                    console.log("true vishvans",{...Propertys.ListofQA[i]._doc,isRight:false});
                     loq.push({...Propertys.ListofQA[i]._doc,isRight:false})

                }
            }
            let all={...Propertys._doc,loq}  
            if(!Propertys){
                const data4createResponseObject = {
                    req: req,
                    result: -400,
                    message: messages.NOT_FOUND,
                    payload: {},
                    logPayload: false
                };
                res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
                return;
            }
            delete all.ListofQA
            // const nearProperty=await global.models.GLOBAL.RESPONSE.find({_id:{$ne:id}, });
            const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.SUCCESS,
                payload: { all: all },
                logPayload: false
            };
            res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
        } catch (error) {
            logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.GENERAL,
                payload: {},
                logPayload: false
            };
            res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
        }
    }
};

