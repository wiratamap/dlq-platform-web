import React, { useEffect, useState } from 'react';
import { List, Table } from 'antd';
import ReactJson from 'react-json-view';
import axios from 'axios';
import moment from 'moment';
import { API_RESOURCE } from '../../Configurations/url';
import ButtonActionGroup from './ButtonActionGroup';

const DeadLetterListPage = () => {
  const [deadLetters, setDeadLetters] = useState([]);

  const fetchDeadLetters = async () => {
    const { data } = await axios.get(API_RESOURCE.DEAD_LETTERS);
    setDeadLetters(data);
  };

  const onHandleMessageAction = async (deadLetterId, deleteAction) => {
    const requestBody = {
      deleteAction
    };
    await axios.delete(`${API_RESOURCE.DEAD_LETTERS}/${deadLetterId}`, {
      data: requestBody
    });
  };

  useEffect(() => {
    fetchDeadLetters();
  }, [onHandleMessageAction]);

  const columns = [
    {
      title: 'Origin Topics',
      dataIndex: 'originTopics',
      key: 'originTopics',
      render: (originTopics) => (
        <List
          size="large"
          bordered
          dataSource={originTopics}
          renderItem={(originTopic) => (
            <List.Item key={originTopic.name}>{originTopic.name}</List.Item>
          )}
        />
      )
    },
    {
      title: 'Message',
      dataIndex: 'originalMessage',
      key: 'originalMessage',
      render: (originalMessage) => {
        const { eventId } = JSON.parse(originalMessage);
        return (
          <div data-testid={`original-message-${eventId}`}>
            <ReactJson
              name="originalMessage"
              src={JSON.parse(originalMessage)}
            />
          </div>
        );
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason'
    },
    {
      title: 'Thrown At',
      dataIndex: 'createdDate',
      key: 'thrownAt',
      render: (createdDate) => moment(createdDate).format('MMMM Do YYYY, h:mm:ss a'),
      defaultSortOrder: 'descend',
      sorter: (a, b) => moment(a.createdDate).unix() - moment(b.createdDate).unix()
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'id',
      render: (deadLetterId) => (
        <ButtonActionGroup
          deadLetterId={deadLetterId}
          onHandleMessageAction={onHandleMessageAction}
        />
      )
    }
  ];

  return (
    <div data-testid="dead-letter-list-page">
      <Table rowKey="id" columns={columns} dataSource={deadLetters} />
    </div>
  );
};

export default DeadLetterListPage;
