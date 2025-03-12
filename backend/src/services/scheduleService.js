const prisma = require("../../prisma/prismaClient");

async function createTrip(userId,title,destinations,startDate,endDate,theme,companionType){
    
    const trip = await prisma.trip.create({
        data:{
            user_id:userId,
            title,
            destinations,
            start_date:new Date(startDate),
            end_date:new Date(endDate),
            theme,
            companion_type:companionType,
            is_shared: "PRIVATE",
        }
    });
    return trip;
}

module.exports = {createTrip};