// components/PlaceSearchModal.js

import searchIcon from "../../assets/images/search2.svg";
import backIcon from "../../assets/images/back.svg";

import React, { useState } from "react";
import axios from "axios";

const PlaceSearchModal = ({ isOpen, onClose, onSelect }) => {
    const [searchText, setSearchText] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);



    const handleSearch = async () => {
        if (!searchText.trim()) return;

        const kakao_restapi_key = process.env.REACT_APP_KAKAO_REST_API_KEY; 

        setHasSearched(true);
        try {
            setLoading(true);
            const res = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
                params: {
                    query: searchText,
                    size: 10,
                },
                headers: {
                    Authorization: `KakaoAK ${kakao_restapi_key}`,
                },
            });
            setResults(res.data.documents || []);
        } catch (err) {
            console.error("Kakao API Error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const getCityName = (address) => {
        if (!address) return "";
        const parts = address.split(" ");
        const cityCandidates = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
            "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

        for (const part of parts) {
            if (cityCandidates.some((city) => part.startsWith(city))) {
                return part;
            }
        }

        return parts[0]; // fallback
    };

    if (!isOpen) return null;

    return (
        <div>
            <div className="place-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <img src={backIcon} alt="뒤로가기" className="back" onClick={onClose} />
                    <div className="search-container">
                        <input
                            type="text"
                            className="modal-search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="장소 검색"
                        />
                        <img src={searchIcon} alt="검색" className="search-icon" onClick={handleSearch} />
                    </div>
                </div>

                <div className="place-list">
                    {loading ? (
                        <div className="loading">검색 중...</div>
                    ) : results.length > 0 ? (
                        results.map((place) => (
                            <div className="place-item" key={place.id}>
                                <div className="place-info">
                                    <div className="place-name">{place.place_name}</div>
                                    <div className="place-address">{getCityName(place.address_name)}</div>
                                </div>
                                <button className="select-btn" onClick={() => {
                                    onSelect(convertToPlace(place))
                                }}
                                >
                                    선택
                                </button>
                            </div>
                        ))
                    ) : hasSearched ? (
                        <div className="empty">검색 결과가 없습니다.</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

const convertToPlace = (p) => {
    console.log("원본 place 객체:", p);
    return { 
    kakao_place_id: p.id,
    place_name: p.place_name,
    place_address: p.road_address_name || p.address_name,
    latitude: parseFloat(p.y),
    longitude: parseFloat(p.x),
    image_url: "",
    place_star: null,
    call: p.phone || null,
    };
};

export default PlaceSearchModal;