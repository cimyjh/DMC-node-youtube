import React, { useState } from "react";
import { Comment, Avatar, Button, Input } from "antd";
import Axios from "axios";
import { useSelector } from "react-redux";
import LikeDislikes from "./LikeDislikes";
const { TextArea } = Input;
function SingleComment(props) {
  const user = useSelector((state) => state.user);
  const [CommentValue, setCommentValue] = useState("");

  //Reply to가 열리고 닫히는 것
  //이벤트에 대한 핸들링이므로 useState를 사용한다.
  const [OpenReply, setOpenReply] = useState(false);

  //Text area에 데이터를 적을 수 있도록 하는 이벤트 핸들러이다.
  const handleChange = (e) => {
    setCommentValue(e.currentTarget.value);
  };

  //열리고 닫히는 메소드
  const openReply = () => {
    setOpenReply(!OpenReply);
  };

  //데이터 전송에 대한 이벤트 핸들러
  const onSubmit = (e) => {
    e.preventDefault();

    const variables = {
      writer: user.userData._id,
      postId: props.postId,

      //댓글에 대한 답글
      responseTo: props.comment._id,
      content: CommentValue,
    };

    Axios.post("/api/comment/saveComment", variables).then((response) => {
      if (response.data.success) {
        setCommentValue("");
        setOpenReply(!OpenReply);
        props.refreshFunction(response.data.result);
      } else {
        alert("Failed to save Comment");
      }
    });
  };

  const actions = [
    //댓글에 대한 좋아요 싫어요 기능
    <LikeDislikes
      comment
      commentId={props.comment._id}
      userId={localStorage.getItem("userId")}
    />,

    //openReply시 열리고 닫히고 하는 span
    <span onClick={openReply} key="comment-basic-reply-to">
      Reply to{" "}
    </span>,
  ];

  return (
    <div>
      <Comment
        actions={actions}
        author={props.comment.writer.name}
        avatar={<Avatar src={props.comment.writer.image} alt="image" />}
        content={<p>{props.comment.content}</p>}
      ></Comment>

      {/* openReply가 true일 때만 작동한다. */}
      {OpenReply && (
        <form style={{ display: "flex" }} onSubmit={onSubmit}>
          <TextArea
            style={{ width: "100%", borderRadius: "5px" }}
            onChange={handleChange}
            value={CommentValue}
            placeholder="write some comments"
          />
          <br />
          <Button style={{ width: "20%", height: "52px" }} onClick={onSubmit}>
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}

export default SingleComment;
