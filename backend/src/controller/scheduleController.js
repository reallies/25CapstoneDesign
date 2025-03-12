//여행&일정추가

//여행
const tripService = require("../services/scheduleService");
async function createTrip(req,res){
    try {
        const {userId,destinations,startDate,endDate,theme,companionType} = req.body;

        const newTrip = await tripService.createTrip(userId,destinations,startDate,endDate,theme,companionType);
        res.status(201).json(newTrip);
    } catch (error){
        res.status(500).json({message: "여행 만들기 실패", error});
    }
}

module.exports = {createTrip};