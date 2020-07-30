import React, { useEffect, useState } from "react";
import { List, Avatar, Row, Col } from "antd";
import axios from "axios";
import SideVideo from "./Sections/SideVideo";
import Subscriber from "./Sections/Subscriber";
import Comments from "./Sections/Comments";
import LikeDislikes from "./Sections/LikeDislikes";

function DetailVideoPage(props) {
  //URL에서 비디오 아이디 가져오기
  const videoId = props.match.params.videoId;
  const videoVariable = {
    videoId: videoId,
  };

  //배열로 선언
  const [Video, setVideo] = useState([]);
  const [CommentLists, setCommentLists] = useState([]);

  //DOM 실행
  useEffect(() => {
    axios.post("/api/video/getVideoDetail", videoVariable).then((response) => {
      if (response.data.success) {
        console.log(response.data.video);
        setVideo(response.data.video);
      } else {
        alert("Failed to get video Info");
      }
    });

    axios.post("/api/comment/getComments", videoVariable).then((response) => {
      if (response.data.success) {
        console.log("response.data.comments", response.data.comments);
        setCommentLists(response.data.comments);
      } else {
        alert("Failed to get video Info");
      }
    });
  }, []);

  const updateComment = (newComment) => {
    setCommentLists(CommentLists.concat(newComment));
  };

  //Video 객체가 있으면 실행 되도록 return을 if문으로 감싼다.
  if (Video.writer) {
    // 자기를 자기가 구독할 수 없게
    // const subscribeButton = VideoDetail.writer._id !== localStorage.getItem('userId') && <Subscribe userTo={VideoDetail.writer._id} userFrom{localStorage.getItem('userId')} />

    return (
      <Row>
        <Col lg={18} xs={24}>
          <div
            className="postPage"
            style={{ width: "100%", padding: "3rem 4em" }}
          >
            <video
              style={{ width: "100%" }}
              src={`http://localhost:5000/${Video.filePath}`}
              controls
            ></video>

            <List.Item
              actions={[
                <LikeDislikes
                  video
                  videoId={videoId}
                  userId={localStorage.getItem("userId")}
                />,
                <Subscriber
                  //props로 넘긴다.
                  //URL로 저장된 것
                  userTo={Video.writer._id}
                  //세션으로 받는다.
                  userFrom={localStorage.getItem("userId")}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={Video.writer && Video.writer.image} />}
                title={<a href="https://ant.design">{Video.title}</a>}
                description={Video.description}
              />
              <div></div>
            </List.Item>

            <Comments
              CommentLists={CommentLists}
              postId={Video._id}
              refreshFunction={updateComment}
            />
          </div>
        </Col>
        <Col lg={6} xs={24}>
          <SideVideo />
        </Col>
      </Row>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default DetailVideoPage;
