import React, { useEffect, useState } from "react";
import axios from "axios";

//useEffect와 onClick Event가 다르다.
//useEffect는 페이지 로드시 미리 가져온 데이터이다.
//onClick Event는 이벤트 실행시 작동하는 하는 것이다.

function Subscriber(props) {
  //props로 받은 것 정의
  const userTo = props.userTo;
  const userFrom = props.userFrom;

  const [SubscribeNumber, setSubscribeNumber] = useState(0);

  //Boolean 생략
  const [Subscribed, setSubscribed] = useState(false);

  //
  //메소드 안에 객체가져오기, axios 2건 있다.
  const onSubscribe = () => {
    let subscribeVariables = {
      userTo: userTo,
      userFrom: userFrom,
    };

    if (Subscribed) {
      //when we are already subscribed
      axios
        .post("/api/subscribe/unSubscribe", subscribeVariables)
        .then((response) => {
          if (response.data.success) {
            setSubscribeNumber(SubscribeNumber - 1);
            setSubscribed(!Subscribed);
          } else {
            alert("Failed to unsubscribe");
          }
        });
    } else {
      // when we are not subscribed yet

      axios
        .post("/api/subscribe/subscribe", subscribeVariables)
        .then((response) => {
          if (response.data.success) {
            setSubscribeNumber(SubscribeNumber + 1);
            setSubscribed(!Subscribed);
          } else {
            alert("Failed to subscribe");
          }
        });
    }
  };

  // 두 가지의 기능이니깐 하나의 useEffect에 담아서 전송한다.
  useEffect(() => {
    // subscribeNumberVariables를 백엔드로 전송한다.
    const subscribeNumberVariables = { userTo: userTo, userFrom: userFrom };
    axios
      .post("/api/subscribe/subscribeNumber", subscribeNumberVariables)
      .then((response) => {
        if (response.data.success) {
          setSubscribeNumber(response.data.subscribeNumber);
        } else {
          alert("Failed to get subscriber Number");
        }
      });

    axios
      .post("/api/subscribe/subscribed", subscribeNumberVariables)
      .then((response) => {
        if (response.data.success) {
          setSubscribed(response.data.subcribed);
        } else {
          alert("Failed to get Subscribed Information");
        }
      });
  }, []);

  return (
    <div>
      <button
        //메소드 onClick 추가
        onClick={onSubscribe}
        style={{
          backgroundColor: `${Subscribed ? "#AAAAAA" : "#CC0000"}`,
          borderRadius: "4px",
          color: "white",
          padding: "10px 16px",
          fontWeight: "500",
          fontSize: "1rem",
          textTransform: "uppercase",
        }}
      >
        {SubscribeNumber} {Subscribed ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  );
}

export default Subscriber;
