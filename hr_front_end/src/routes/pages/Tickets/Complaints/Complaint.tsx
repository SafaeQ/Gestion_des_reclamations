import { Button, Popover, Table } from "antd";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation,
} from "react-query";
import { Complaints } from "../../../../types";
import { transport } from "../../../../util/Api";
import { ColumnProps } from "antd/es/table";
import dayjs from "dayjs";
import { CommentOutlined } from "@ant-design/icons";
import { socket } from "../../../../context/socket.provider";
import { useEffect } from "react";

const Complaint = ({
  Complaints,
  isLoading,
  refetch,
}: {
  Complaints: Complaints[] | undefined;
  isLoading: boolean;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Complaints[], unknown>>;
}) => {
  const markComplaintAsSeen = useMutation<any, Complaints, number>(
    async (id) => {
      return await transport.put(`/complaints/seen/${id}`, { seen: true });
    },
    {
      onSuccess: (data) => {
        socket.emit("complainAdminsSeen", {
          complaintId: data.data.id,
          userId: data.data.user.id,
        });
      },
    }
  );

  const columns: Array<ColumnProps<Complaints>> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "user",
      key: "user",
      render: (_, record) => record.user?.name,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (_, record) => record.subject,
    },
    {
      title: "Date",
      key: "createAt",
      dataIndex: "createAt",
      render: (_, record) =>
        dayjs(record.createdAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: "Updates",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (_, record) =>
        dayjs(record.updatedAt).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      responsive: ["xxl"],
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (_, record) => {
        return (
          <Popover content={record.message} trigger="click">
            <Button
              shape="circle"
              icon={<CommentOutlined />}
              style={{
                backgroundColor: record.seen ? "greenyellow" : "",
              }}
              onClick={() => {
                markComplaintAsSeen.mutate(record.id);
              }}
            />
          </Popover>
        );
      },
    },
  ];

  useEffect(() => {
    refetch();
  }, [Complaints]);

  return (
    <div>
      <Table
        loading={isLoading}
        bordered={true}
        rowKey="id"
        pagination={{ pageSize: 9 }}
        columns={columns}
        dataSource={Complaints}
      />
    </div>
  );
};

export default Complaint;
