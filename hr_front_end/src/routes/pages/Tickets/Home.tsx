import { AuditOutlined } from "@ant-design/icons";
import { Card, Badge, Tabs, Tooltip, Progress } from "antd";
import { useQuery } from "react-query";
import { Complaints } from "../../../types";
import { transport } from "../../../util/Api";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Tab } from "rc-tabs/lib/interface";
import "../../../assets/style/styling.css";
import Complaint from "./Complaints/Complaint";
import { useEffect } from "react";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs().tz("Africa/Casablanca");

const Home = () => {
  const {
    data: Complaints,
    isLoading: isLoadingComplaint,
    refetch,
  } = useQuery<Complaints[]>(
    "Complaints",
    async () => await transport.get("/complaints").then((res) => res.data)
  );

  const totalMessages = Complaints?.length ?? 0;
  const totalSeenMessages =
    Complaints?.filter((complaint) => complaint.seen).length ?? 0;

  const seenMessagesPercentage =
    totalMessages > 0 ? (totalSeenMessages / totalMessages) * 100 : 0;

  const items: Tab[] = [
    {
      label: (
        <>
          <Badge
            count={Complaints?.length}
            style={{ backgroundColor: "#d9d9d9" }}
          >
            <AuditOutlined />
          </Badge>
          <span style={{ marginLeft: "1rem" }}>Complaints</span>
        </>
      ),
      key: "7",
      children: (
        <Complaint
          Complaints={Complaints}
          isLoading={isLoadingComplaint}
          refetch={refetch}
        />
      ),
    },
  ];

  useEffect(() => {
    refetch();
  }, [Complaints]);

  return (
    <div className="container-tickets">
      <Card
        title={
          <Tooltip title="Complaints has been seen">
            <Progress
              key={2}
              percent={Math.floor(seenMessagesPercentage)}
              style={{ width: "50%" }}
              status="active"
            />
          </Tooltip>
        }
      >
        <Tabs
          centered
          tabPosition="left"
          defaultActiveKey="2"
          type="card"
          size={"large"}
          items={items}
        />
      </Card>
    </div>
  );
};

export default Home;
