import React, { useState } from "react";
import { Button, Table, notification, Spin, Form, DatePicker } from "antd";
import axios from "axios";
import config from "../config";
import moment from "moment";

interface RankData {
  userName: string;
  con: number;
}

const RankSystem: React.FC = () => {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [rankData, setRankData] = useState<RankData[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDateToDisplay = (date: string) => {
    if (!date) return "";
    return moment(date, "YYYY-MM-DD").format("MM-DD-YY");
  };

  const handleStartTimeChange = (date: moment.Moment | null) => {
    if (date) {
      setStartTime(date.format("YYYY-MM-DD"));
    } else {
      setStartTime("");
    }
  };

  const handleEndTimeChange = (date: moment.Moment | null) => {
    if (date) {
      setEndTime(date.format("YYYY-MM-DD"));
    } else {
      setEndTime("");
    }
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
      <h3>volunteer participates in the most tasks in the selected time period</h3>
      <Form layout="inline">
        <Form.Item label="Start Time">
          <DatePicker
            value={startTime ? moment(startTime, "YYYY-MM-DD") : null}
            format="MM-DD-YY"
            onChange={handleStartTimeChange}
            placeholder="MM-DD-YY"
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item label="End Time">
          <DatePicker
            value={endTime ? moment(endTime, "YYYY-MM-DD") : null}
            format="MM-DD-YY"
            onChange={handleEndTimeChange}
            placeholder="MM-DD-YY"
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
           pagination={{ pageSize: 5 }}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
};

export default RankSystem;









