import React, { useEffect, useState } from 'react';
import {
  List, message, Spin, Table
} from 'antd';
import ReactJson from 'react-json-view';
import axios from 'axios';
import moment from 'moment';
import { API_RESOURCE } from '../../Configurations/url';
import ButtonActionGroup from './ButtonActionGroup';

const DeadLetterListPage = () => {
  const [deadLetters, setDeadLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeadLetters = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(API_RESOURCE.DEAD_LETTERS);
      setDeadLetters(data);
    } catch (error) {
      message.error('Something went wrong when try to fetch dead letters');
    } finally {
      setIsLoading(false);
    }
  };

  const messageAction = {
    DELETE: 'delete',
    SEND_TO_ORIGIN_TOPIC: 're-orchestrate'
  };

  const onHandleMessageAction = async (deadLetterId, deleteAction) => {
    try {
      setIsLoading(true);
      const requestBody = {
        deleteAction
      };
      await axios.delete(`${API_RESOURCE.DEAD_LETTERS}/${deadLetterId}`, {
        data: requestBody
      });
      const newDeadLetters = deadLetters.filter((deadLetter) => deadLetter.id !== deadLetterId);
      setDeadLetters(newDeadLetters);
      message.success(`Success to ${messageAction[deleteAction]} message with id ${deadLetterId}`);
    } catch (error) {
      message.error(`Failed to take an action on message ${deadLetterId}, please try again!`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadLetters();
  }, []);

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
      render: (createdDate) => moment(createdDate).format('MMM Do YYYY, H:mm:ss'),
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
      <Spin spinning={isLoading}>
        <Table rowKey="id" columns={columns} dataSource={deadLetters} />
      </Spin>
    </div>
  );
};

export default DeadLetterListPage;
