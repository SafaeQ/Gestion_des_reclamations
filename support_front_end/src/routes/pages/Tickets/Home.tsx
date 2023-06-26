import { AuditOutlined, DiffOutlined } from "@ant-design/icons";
import { Button, Card, Badge, Tabs, Progress, Tooltip } from "antd";
import { useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { Complaints, ROLE, User } from "../../../types";
import { transport } from "../../../util/Api";
import dayjs from "dayjs";
import { RootState } from "../../../appRedux/store";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Tab } from "rc-tabs/lib/interface";
import Complaint from "./Complaints/Complaint";
import CreateComplaint from "./Complaints/Create";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs().tz("Africa/Casablanca");

const Home = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const [openModel, setOpenModel] = useState(false);
  // const [unseen, setUnseen] = useState(0);

  const {
    data: Complaints,
    isLoading: isLoadingData,
    refetch: refetchData,
  } = useQuery<Complaints[]>(
    "Complaints-by-entity",
    async () =>
      await transport
        .post("/complaints/chef", { id: user?.id })
        .then((res) => res.data)
  );

  // const totalSeenMessages = Complaints?.filter(
  //   (complaint) => complaint.seen
  // ).length;
  // const totalUseenMessages = Complaints?.filter(
  //   (complaint) => !complaint.seen
  // ).length;
  // console.log(totalUseenMessages);

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
        <Complaint Complaints={Complaints} isLoadingData={isLoadingData} />
      ),
    },
  ];

  return (
    <div>
      <Card
        extra={[
          <div key={1}>
            {user?.role !== ROLE.CHEF && (
              <Button
                key={0}
                icon={<DiffOutlined />}
                type="primary"
                onClick={() => setOpenModel(true)}
              >
                Create Complaint
              </Button>
            )}
          </div>,
        ]}
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
        {openModel && (
          <CreateComplaint
            refetch={refetchData}
            isOpen={openModel}
            setIsOpen={setOpenModel}
          />
        )}
        <Tabs
          centered
          tabPosition="left"
          defaultActiveKey="2"
          type="card"
          size={"large"}
          items={items}
          animated={true}
        />
      </Card>
    </div>
  );
};

export default Home;
