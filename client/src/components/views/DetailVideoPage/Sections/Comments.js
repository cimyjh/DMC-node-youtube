import React, { useState } from "react";
import { Button, Input } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import SingleComment from "./SingleComment";
import ReplyComment from "./ReplyComment";
const { TextArea } = Input;

function Comments(props) {
  //로그인시 저장이된 로컬스토리지 정보에서 Redux에서 정보를 가져온다.
  const user = useSelector((state) => state.user);

  const [Comment, setComment] = useState("");

  //글 작성을 할 수 있게 된다.
  //onChange에 대한 것
  const handleChange = (event) => {
    //Target안에 있는 value = Comment로 set되는 것인가
    setComment(event.currentTarget.value);
  };

  const onSubmit = (event) => {
    //작성 즉시 페이지가 새로고침되지 않도록 한다.
    event.preventDefault();

    //넘길 객체에 대한 저장
    const variables = {
      content: Comment,

      //redux에서 정보를 가져온다.
      writer: user.userData._id,

      //DetailVideoPage에서 URL에서 가져온 VideoID를 postID로 저장했었다.
      postId: props.postId,
    };

    axios.post("/api/comment/saveComment", variables).then((response) => {
      if (response.data.success) {
        setComment("");
        props.refreshFunction(response.data.result);
      } else {
        alert("Failed to save Comment");
      }
    });
  };

  return (
    <div>
      <br />
      <p> replies</p>
      <hr />
      {/* Comment Lists  */}
      {console.log(props.CommentLists)}

      {props.CommentLists &&
        props.CommentLists.map(
          (comment, index) =>
            !comment.responseTo && (
              <React.Fragment>
                <SingleComment
                  comment={comment}
                  postId={props.postId}
                  refreshFunction={props.refreshFunction}
                />
                <ReplyComment
                  CommentLists={props.CommentLists}
                  postId={props.postId}
                  parentCommentId={comment._id}
                  refreshFunction={props.refreshFunction}
                />
              </React.Fragment>
            )
        )}

      {/* Root Comment Form */}
      <form style={{ display: "flex" }} onSubmit={onSubmit}>
        <TextArea
          style={{ width: "100%", borderRadius: "5px" }}
          onChange={handleChange}
          value={Comment}
          placeholder="write some comments"
        />
        <br />
        <Button style={{ width: "20%", height: "52px" }} onClick={onSubmit}>
          Submit
        </Button>
      </form>
    </div>
  );
}

export default Comments;
