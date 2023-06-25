import { AuditOutlined } from "@ant-design/icons";
import { Badge, Button, Tag } from "antd";
import { useState } from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { Complaints, USER_STATUS, User } from "../types";
import { transport } from "../util/Api";
import { useHistory } from "react-router-dom";
import { socket } from "../context/socket.provider";
import { setCurrentUser } from "../appRedux/actions/auth";

const { CheckableTag } = Tag;

export const AwayButton = () => {
  const [online, setOnline] = useState(true);
  const [user, setUser] = useState<User | undefined>(undefined);
  const dispatch = useDispatch();

  useQuery<{ user: User }>(
    "user",
    async () =>
      await transport.get("/auth/users/hr/me").then((res) => res.data),
    {
      onSuccess: (data) => {
        setUser(data.user);
        dispatch(setCurrentUser(data.user));
      },
      refetchInterval: 3000,
    }
  );

  return (
    <>
      <CheckableTag
        checked={online}
        style={{
          backgroundColor:
            user?.activity === USER_STATUS.ONLINE
              ? "green"
              : user?.activity === USER_STATUS.AWAY
              ? "orange"
              : "red",
        }}
        onChange={(checked) => {
          setOnline(checked);
          if (checked) {
            console.log("checked");

            socket.emit("user-online", {
              userId: user?.id,
              activity: USER_STATUS.ONLINE,
              type: "click",
            });
          } else {
            socket.emit("user-online", {
              userId: user?.id,
              activity: USER_STATUS.AWAY,
              type: "click",
            });
          }
        }}
      >
        {user?.activity}
      </CheckableTag>
    </>
  );
};

export const ComplaintItem = () => {
  const { data } = useQuery<Complaints[]>(
    "Complaints",
    async () => await transport.get("/complaints").then((res) => res.data)
  );
  const history = useHistory();

  const unseen = data?.filter((com) => com.seen === false);
  return (
    <Badge key={"tags"} count={unseen?.length} size="small">
      <Button shape="circle" onClick={() => history.push("tickets")}>
        <AuditOutlined />
      </Button>
    </Badge>
  );
};
