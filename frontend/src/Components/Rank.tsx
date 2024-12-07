import React, { useState } from "react";
import { Button, Input, Table, notification, Spin, Form } from "antd";
import axios from "axios";
import config from "../config";

interface RankData {
  userName: string;
  con: number;
}

const RankSystem: React.FC = () => {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [rankData, setRankData] = useState<RankData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  const fetchRankData = async () => {
    if (!startTime || !endTime) {
      notification.error({
        message: "Start time and End time are required",
        description: "Please provide both start time and end time.",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post<any[]>(
        `${config.apiUrl}/rank`,
        { start_time: startTime, end_time: endTime }
      );

      const formattedData = response.data.map((item: [string, number]) => ({
        userName: item[0],
        con: item[1],
      }));

      setRankData(formattedData);
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: "An error occurred while fetching rank data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Volunteer Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Count",
      dataIndex: "con",
      key: "con",
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Rank System</h2>
      <h3>volunteer participates in the most tasks
in the selected time period</h3>
      <Form layout="inline">
        <Form.Item label="Start Time">
          <Input
            type="date"
            value={startTime}
            onChange={handleStartTimeChange}
            placeholder="Enter Start Time"
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item label="End Time">
          <Input
            type="date"
            value={endTime}
            onChange={handleEndTimeChange}
            placeholder="Enter End Time"
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={fetchRankData} loading={loading}>
            Get Rank
          </Button>
        </Form.Item>
      </Form>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={rankData}
          rowKey={(record) => record.userName}
          pagination={false}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
};

export default RankSystem;





