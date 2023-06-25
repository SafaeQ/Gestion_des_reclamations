import { AuditOutlined } from "@ant-design/icons";
import { Card, Badge, Tabs } from "antd";
import { useQuery } from "react-query";
import { Complaints } from "../../../types";
import { transport } from "../../../util/Api";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Tab } from "rc-tabs/lib/interface";
import "../../../assets/style/styling.css";
import Complaint from "./Complaints/Complaint";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs().tz("Africa/Casablanca");

const Home = () => {
  const { data: Complaints, isLoading: isLoadingComplaint } = useQuery<
    Complaints[]
  >(
    "Complaints",
    async () => await transport.get("/complaints").then((res) => res.data)
  );

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
        <Complaint Complaints={Complaints} isLoading={isLoadingComplaint} />
      ),
    },
  ];

  return (
    <div className="container-tickets">
      <Card>
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
