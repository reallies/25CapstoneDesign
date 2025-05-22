import { useCallback, useState, useEffect } from "react";

export const useSchedule = (trip_id) => {
    const [trip, setTrip] = useState(null);
    const [days, setDays] = useState([]);
    const [activeDay, setActiveDay] = useState("ALL");
  
    // 여행 정보 불러오기
    const fetchTrip = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:8080/schedule/${trip_id}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok && data.trip) {
                setTrip(data.trip);

                const convertedDays = data.trip.days
                .sort((a, b) => a.day_order - b.day_order)
                .map((day, index) => {
                    const tripStartDate = new Date(data.trip.start_date);
                    const calculatedDate = new Date(tripStartDate);
                    calculatedDate.setDate(tripStartDate.getDate() + (day.day_order - 1));

                    return {
                    id: `day-${day.day_id}`,
                    date: `| ${calculatedDate.getFullYear()}.${String(calculatedDate.getMonth() + 1).padStart(2, "0")}.${String(calculatedDate.getDate()).padStart(2, "0")}` +
                        ` - ${calculatedDate.toLocaleDateString("ko-KR", { weekday: "short" })}`,
                    color: ["red", "orange", "purple"][index % 3],
                    items: day.places
                        .sort((a, b) => a.dayplace_order - b.dayplace_order)
                        .map((p) => ({
                        id: `item-${p.dayplace_id}`,
                        dayPlaceId: p.dayplace_id,
                        type: "place",
                        placeType: p.place_type || "관광명소",
                        name: p.place.place_name,
                        latitude: p.place.place_latitude,    
                        longitude: p.place.place_longitude,  
                        })),
                    };
                });
                setDays(convertedDays);
            }
        } catch (err) {
            console.error("여행 정보를 불러오지 못함:", err);
        }
    }, [trip_id]);

    //장소 추가
    const handlePlaceSelect = async (dayIndex, place, setIsModalOpen) => {

        const day = days[dayIndex];
        const dayId = Number(day.id.replace("day-", ""));

        try {
            const res = await fetch(`http://localhost:8080/schedule/${trip_id}/day/${dayId}/place`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                kakao_place_id: place.kakao_place_id,
                place_name: place.place_name,
                place_address: place.place_address,
                place_latitude: place.latitude,
                place_longitude: place.longitude,
                place_image_url: place.image_url || "",
                place_star: place.place_star,
                place_call_num: place.call,
                }),
            });

            const data = await res.json();

            if (res.ok && data.data) {
                const newDays = [...days];
                newDays[dayIndex].items.push({
                id: `item-${data.data.dayPlace.dayplace_id}`,
                dayPlaceId: data.data.dayPlace.dayplace_id,
                type: "place",
                name: data.data.place.place_name,
                placeType: "관광명소",
                ...data.data.place,
                });
                setDays(newDays);
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error("장소 추가 실패:", err);
        }
    };

    //날짜 드래그
    const handleDayDragEnd = async (result) => {
        const { source, destination } = result;
        const newDays = [...days];
        const [movedDay] = newDays.splice(source.index, 1);
        newDays.splice(destination.index, 0, movedDay);
        setDays(newDays);

        try {
            await fetch(`http://localhost:8080/schedule/${trip_id}/reorderDay`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                previous: source.index,
                present: destination.index,
                }),
            });
            await fetchTrip();
        } catch (error) {
            console.error("DAY 순서 변경 실패:", error);
        }
    };

    const extractDayId = (id) => id.replace(/-place|-memo/, "");

    //장소 드래그
    const handlePlaceDragEnd = async (result) => {
        const { source, destination } = result;
        const sourceDayIndex = days.findIndex((d) => d.id === extractDayId(source.droppableId));
        const destDayIndex = days.findIndex((d) => d.id === extractDayId(destination.droppableId));

        const newDays = [...days];
        const [movedItem] = newDays[sourceDayIndex].items.splice(source.index, 1);
        newDays[destDayIndex].items.splice(destination.index, 0, movedItem);
        setDays(newDays);

        try {
            await fetch(`http://localhost:8080/schedule/${trip_id}/reorderPlace`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                previous: {
                    day_id: Number(days[sourceDayIndex].id.replace("day-", "")),
                    dayplace_id: movedItem.dayPlaceId,
                },
                present: {
                    day_id: Number(days[destDayIndex].id.replace("day-", "")),
                    dayplace_order: destination.index + 1,
                },
                }),
            });
            await fetchTrip();
        } catch (error) {
            console.error("PLACE 순서 변경 실패:", error);
        }
    };

    const onDragEnd = (result) => {
        const { type, destination } = result;
        if (!destination) return;

        switch (type) {
        case "DAY":
            handleDayDragEnd(result);
            break;
        case "PLACE":
            handlePlaceDragEnd(result);
            break;
        default:
            break;
        }
    };

    //장소 삭제
    const handleDeletePlace = async (dayId,dayPlaceId) => {
        const numericDayId = Number(dayId.replace("day-", ""));

        setDays((prevDays) => {
            return prevDays.map((day) => {
              if (day.id === dayId) {
                return {
                  ...day,
                  items: day.items.filter((item) => item.dayPlaceId  !== dayPlaceId),
                };
              }
              return day;
            });
        });

        try {
            await fetch(`http://localhost:8080/schedule/${trip_id}/day/${numericDayId}/dayplace/${dayPlaceId}`, {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("PLACE 삭제 실패:", error);
        }
    };

    const handleUpdateTitle = async (newTitle) => {
        try {
            const res = await fetch(`http://localhost:8080/schedule/${trip_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title: newTitle }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTrip((prevTrip) => ({ ...prevTrip, title: newTitle }));
            } else {
                console.error("Failed to update title:", data.message);
            }
        } catch (error) {
            console.error("Error updating title:", error);
        }
    };

    useEffect(() => {
        if (trip_id) fetchTrip();
    }, [trip_id, fetchTrip]);

    return {
        trip,
        days,
        setDays,
        activeDay,
        setActiveDay,
        fetchTrip,
        handlePlaceSelect,
        handleDayDragEnd,
        handlePlaceDragEnd,
        onDragEnd,
        handleDeletePlace,
        handleUpdateTitle
    }
};